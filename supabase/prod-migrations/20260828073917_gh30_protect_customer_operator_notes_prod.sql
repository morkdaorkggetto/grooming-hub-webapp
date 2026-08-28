-- GH-30: completa la protezione prod di customers.operator_notes.
-- Fonte: docs/incarichi/GH-30-ricetta-g6-ripresa.md.

BEGIN;

DO $$
BEGIN
  IF pg_catalog.to_regprocedure(
    'public.enforce_customer_directory_fields_staff_only()'
  ) IS NULL THEN
    RAISE EXCEPTION
      'GH-30 prerequisite missing: enforce_customer_directory_fields_staff_only()';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attribute a
    WHERE a.attrelid = 'public.customers'::pg_catalog.regclass
      AND a.attname = 'operator_notes'
      AND NOT a.attisdropped
  ) THEN
    RAISE EXCEPTION 'GH-30 prerequisite missing: customers.operator_notes';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_customer_directory_fields_staff_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.has_tenant_any_staff_access(NEW.tenant_id) THEN
    NEW.acquisition_source := OLD.acquisition_source;
    NEW.relationship_status := OLD.relationship_status;
    NEW.operator_notes := OLD.operator_notes;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_customer_directory_fields_staff_only() IS
  'GH-30 prod-safe customer directory guard: non-staff cannot modify acquisition_source, relationship_status or operator_notes; row access remains governed by RLS.';

REVOKE ALL ON FUNCTION public.enforce_customer_directory_fields_staff_only()
  FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trg_customers_protect_directory_fields
  ON public.customers;
CREATE TRIGGER trg_customers_protect_directory_fields
  BEFORE UPDATE OF acquisition_source, relationship_status, operator_notes
  ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_customer_directory_fields_staff_only();

COMMIT;
