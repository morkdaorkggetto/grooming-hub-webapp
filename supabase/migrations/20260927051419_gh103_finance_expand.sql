-- GH-103, atto A PRIMA del deploy. Fonte: mandato Luigi 27/9/2026.
-- Le colonne legacy restano valide; il bridge e bidirezionale e transazionale.
BEGIN;
LOCK TABLE public.visits, public.services IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE public.visit_financials (
  visit_id text PRIMARY KEY REFERENCES public.visits(id) ON DELETE CASCADE,
  cost numeric(10,2) NOT NULL,
  discount_percent numeric(5,2) DEFAULT 0
);
CREATE TABLE public.service_financials (
  service_id uuid PRIMARY KEY REFERENCES public.services(id) ON DELETE CASCADE,
  price_cents integer NOT NULL CHECK (price_cents >= 0)
);
ALTER TABLE public.visit_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_financials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.visit_financials, public.service_financials FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visit_financials, public.service_financials TO authenticated, service_role;
CREATE POLICY visit_financials_staff_all ON public.visit_financials FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.visits v WHERE v.id=visit_id AND public.has_tenant_any_staff_access(v.tenant_id)))
 WITH CHECK (EXISTS (SELECT 1 FROM public.visits v WHERE v.id=visit_id AND public.has_tenant_any_staff_access(v.tenant_id)));
CREATE POLICY service_financials_staff_all ON public.service_financials FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id=service_id AND public.has_tenant_any_staff_access(s.tenant_id)))
 WITH CHECK (EXISTS (SELECT 1 FROM public.services s WHERE s.id=service_id AND public.has_tenant_any_staff_access(s.tenant_id)));

INSERT INTO public.visit_financials SELECT id,cost,discount_percent FROM public.visits;
INSERT INTO public.service_financials SELECT id,price_cents FROM public.services;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.visits v FULL JOIN public.visit_financials f ON f.visit_id=v.id
   WHERE v.id IS NULL OR f.visit_id IS NULL OR v.cost IS DISTINCT FROM f.cost OR v.discount_percent IS DISTINCT FROM f.discount_percent)
 OR EXISTS (SELECT 1 FROM public.services s FULL JOIN public.service_financials f ON f.service_id=s.id
   WHERE s.id IS NULL OR f.service_id IS NULL OR s.price_cents IS DISTINCT FROM f.price_cents)
 THEN RAISE EXCEPTION 'GH103 finance copy mismatch'; END IF;
END $$;

CREATE FUNCTION public.gh103_finance_bridge() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF pg_trigger_depth()>1 THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='visits' THEN
  INSERT INTO public.visit_financials VALUES (NEW.id,NEW.cost,NEW.discount_percent)
  ON CONFLICT (visit_id) DO UPDATE SET cost=EXCLUDED.cost,discount_percent=EXCLUDED.discount_percent;
 ELSIF TG_TABLE_NAME='services' THEN
  INSERT INTO public.service_financials VALUES (NEW.id,NEW.price_cents)
  ON CONFLICT (service_id) DO UPDATE SET price_cents=EXCLUDED.price_cents;
 ELSIF TG_TABLE_NAME='visit_financials' THEN
  UPDATE public.visits SET cost=NEW.cost,discount_percent=NEW.discount_percent WHERE id=NEW.visit_id
   AND (cost IS DISTINCT FROM NEW.cost OR discount_percent IS DISTINCT FROM NEW.discount_percent);
 ELSIF TG_TABLE_NAME='service_financials' THEN
  UPDATE public.services SET price_cents=NEW.price_cents WHERE id=NEW.service_id AND price_cents IS DISTINCT FROM NEW.price_cents;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.gh103_finance_bridge() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER gh103_visits_finance AFTER INSERT OR UPDATE OF cost,discount_percent ON public.visits
 FOR EACH ROW EXECUTE FUNCTION public.gh103_finance_bridge();
CREATE TRIGGER gh103_services_finance AFTER INSERT OR UPDATE OF price_cents ON public.services
 FOR EACH ROW EXECUTE FUNCTION public.gh103_finance_bridge();
CREATE TRIGGER gh103_visit_financials_legacy AFTER INSERT OR UPDATE ON public.visit_financials
 FOR EACH ROW EXECUTE FUNCTION public.gh103_finance_bridge();
CREATE TRIGGER gh103_service_financials_legacy AFTER INSERT OR UPDATE ON public.service_financials
 FOR EACH ROW EXECUTE FUNCTION public.gh103_finance_bridge();

CREATE FUNCTION public.create_staff_visit(
 p_pet_id uuid,p_date date,p_cost numeric,p_treatments text DEFAULT NULL,
 p_issues text DEFAULT NULL,p_discount_percent numeric DEFAULT 0,
 p_service_id uuid DEFAULT NULL,p_appointment_id text DEFAULT NULL
) RETURNS public.visits LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_tenant uuid; v_result public.visits;
BEGIN
 SELECT tenant_id INTO v_tenant FROM public.pets WHERE id=p_pet_id;
 IF auth.uid() IS NULL OR v_tenant IS NULL OR NOT public.has_tenant_any_staff_access(v_tenant) THEN
  RAISE EXCEPTION 'Staff access required' USING ERRCODE='42501';
 END IF;
 IF p_date IS NULL OR p_cost IS NULL OR p_cost<=0 THEN
  RAISE EXCEPTION 'Visit date and positive cost required' USING ERRCODE='22023';
 END IF;
 IF p_service_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE id=p_service_id AND tenant_id=v_tenant) THEN
  RAISE EXCEPTION 'Service outside tenant' USING ERRCODE='42501';
 END IF;
 IF p_appointment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.appointments WHERE id=p_appointment_id AND pet_id=p_pet_id AND tenant_id=v_tenant) THEN
  RAISE EXCEPTION 'Appointment outside pet or tenant' USING ERRCODE='42501';
 END IF;
 IF EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='public.visits'::regclass AND attname='cost' AND NOT attisdropped) THEN
  EXECUTE 'INSERT INTO public.visits(id,pet_id,tenant_id,date,treatments,issues,service_id,appointment_id,cost,discount_percent)
   VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *'
   INTO v_result USING p_pet_id,v_tenant,p_date,p_treatments,p_issues,p_service_id,p_appointment_id,p_cost,p_discount_percent;
 ELSE
  INSERT INTO public.visits(id,pet_id,tenant_id,date,treatments,issues,service_id,appointment_id)
   VALUES (gen_random_uuid()::text,p_pet_id,v_tenant,p_date,p_treatments,p_issues,p_service_id,p_appointment_id)
   RETURNING * INTO v_result;
 END IF;
 INSERT INTO public.visit_financials VALUES (v_result.id,p_cost,p_discount_percent)
 ON CONFLICT (visit_id) DO UPDATE SET cost=EXCLUDED.cost,discount_percent=EXCLUDED.discount_percent;
 RETURN v_result;
END $$;
REVOKE ALL ON FUNCTION public.create_staff_visit(uuid,date,numeric,text,text,numeric,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_staff_visit(uuid,date,numeric,text,text,numeric,uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_appointment_with_visit(
 p_appointment_id text,p_date date,p_treatments text,p_issues text,p_cost numeric,p_service_id uuid DEFAULT NULL
) RETURNS public.visits LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_appointment public.appointments; v_visit public.visits;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 SELECT * INTO v_appointment FROM public.appointments WHERE id=p_appointment_id FOR UPDATE;
 IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_appointment.tenant_id) THEN
  RAISE EXCEPTION 'Appointment not available to current staff user' USING ERRCODE='42501';
 END IF;
 IF v_appointment.approval_status<>'approved' OR v_appointment.status IN ('cancelled','no_show') THEN
  RAISE EXCEPTION 'Appointment cannot be completed' USING ERRCODE='23514';
 END IF;
 IF p_date IS NULL OR p_cost IS NULL OR p_cost<=0 THEN
  RAISE EXCEPTION 'A visit date and positive cost are required' USING ERRCODE='22023';
 END IF;
 SELECT * INTO v_visit FROM public.visits WHERE appointment_id=v_appointment.id;
 IF FOUND THEN RETURN v_visit; END IF;
 SELECT * INTO v_visit FROM public.create_staff_visit(v_appointment.pet_id,p_date,p_cost,
  NULLIF(btrim(p_treatments),''),NULLIF(btrim(p_issues),''),0,p_service_id,v_appointment.id);
 UPDATE public.appointments SET status='completed',updated_at=now() WHERE id=v_appointment.id;
 RETURN v_visit;
END $$;
NOTIFY pgrst, 'reload schema';
COMMIT;
