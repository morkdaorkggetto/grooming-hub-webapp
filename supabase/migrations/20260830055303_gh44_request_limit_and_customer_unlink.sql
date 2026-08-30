-- GH-44, fonte: docs/incarichi/GH-44-invito-tetto-e-scollegamento.md.
-- Versione registrata sul demo: 20260830055303.
-- Limita le richieste pending per cliente e introduce uno scollegamento staff
-- atomico, non distruttivo e tracciato.

BEGIN;

UPDATE public.tenants
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{open_appointment_request_limit}',
  '3'::jsonb,
  true
)
WHERE NOT (COALESCE(settings, '{}'::jsonb) ? 'open_appointment_request_limit');

ALTER TABLE public.tenants
  DROP CONSTRAINT IF EXISTS tenants_open_appointment_request_limit_valid;

ALTER TABLE public.tenants
  ADD CONSTRAINT tenants_open_appointment_request_limit_valid CHECK (
    NOT (settings ? 'open_appointment_request_limit')
    OR CASE
      WHEN jsonb_typeof(settings -> 'open_appointment_request_limit') = 'number'
        AND settings ->> 'open_appointment_request_limit' ~ '^[1-9][0-9]*$'
      THEN (settings ->> 'open_appointment_request_limit')::numeric <= 2147483647
      ELSE false
    END
  );

CREATE INDEX IF NOT EXISTS appointment_requests_customer_pending_idx
  ON public.appointment_requests (tenant_id, customer_user_id)
  WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.prevent_duplicate_pending_appointment_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_limit integer;
  v_open_requests integer;
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended(NEW.tenant_id::text || ':' || NEW.customer_user_id::text, 0)
    );

    IF EXISTS (
      SELECT 1
      FROM public.appointment_requests ar
      WHERE ar.tenant_id = NEW.tenant_id
        AND ar.customer_user_id = NEW.customer_user_id
        AND ar.pet_id = NEW.pet_id
        AND ar.status = 'pending'
    ) THEN
      RAISE EXCEPTION 'Esiste gia una richiesta in attesa per questo pet'
        USING ERRCODE = '23505';
    END IF;

    SELECT COALESCE(
      CASE
        WHEN t.settings ->> 'open_appointment_request_limit' ~ '^[1-9][0-9]*$'
          THEN (t.settings ->> 'open_appointment_request_limit')::integer
      END,
      3
    )
      INTO v_limit
    FROM public.tenants t
    WHERE t.id = NEW.tenant_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Tenant non disponibile per la richiesta'
        USING ERRCODE = '23503';
    END IF;

    SELECT count(*)::integer
      INTO v_open_requests
    FROM public.appointment_requests ar
    WHERE ar.tenant_id = NEW.tenant_id
      AND ar.customer_user_id = NEW.customer_user_id
      AND ar.status = 'pending';

    IF v_open_requests >= v_limit THEN
      RAISE EXCEPTION
        'Hai gia % richieste in attesa. Il salone ti rispondera prima di poterne inviare un''altra.',
        v_limit
        USING ERRCODE = '23514',
              DETAIL = 'GH44_OPEN_REQUEST_LIMIT';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_duplicate_pending_appointment_request()
IS 'GH-44: serialize pending request inserts per customer, reject duplicate pets and enforce the tenant open-request limit.';

CREATE TABLE IF NOT EXISTS public.customer_account_unlink_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  disconnected_user_id uuid NOT NULL,
  performed_by_user_id uuid NOT NULL,
  customer_label text,
  customer_phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_account_unlink_audit_tenant_customer_idx
  ON public.customer_account_unlink_audit (tenant_id, customer_id, created_at DESC);

ALTER TABLE public.customer_account_unlink_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_account_unlink_audit_staff_select
  ON public.customer_account_unlink_audit;
CREATE POLICY customer_account_unlink_audit_staff_select
  ON public.customer_account_unlink_audit FOR SELECT
  TO authenticated
  USING (public.has_tenant_any_staff_access(tenant_id));

REVOKE ALL ON TABLE public.customer_account_unlink_audit FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.customer_account_unlink_audit TO authenticated;
GRANT ALL ON TABLE public.customer_account_unlink_audit TO service_role;

CREATE OR REPLACE FUNCTION public.unlink_customer_account(p_customer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public, auth
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_customer public.customers%ROWTYPE;
  v_disconnected_user_id uuid;
  v_membership_removed boolean := false;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT *
    INTO v_customer
  FROM public.customers c
  WHERE c.id = p_customer_id
  FOR UPDATE;

  IF NOT FOUND OR NOT public.has_tenant_any_staff_access(v_customer.tenant_id) THEN
    RAISE EXCEPTION 'Customer not available to current staff user'
      USING ERRCODE = '42501';
  END IF;

  v_disconnected_user_id := v_customer.user_id;
  IF v_disconnected_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'already_unlinked',
      'customerId', v_customer.id,
      'tenantId', v_customer.tenant_id
    );
  END IF;

  UPDATE public.customers
     SET user_id = NULL
   WHERE id = v_customer.id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.tenant_id = v_customer.tenant_id
      AND c.user_id = v_disconnected_user_id
  ) THEN
    DELETE FROM public.tenant_memberships tm
    WHERE tm.tenant_id = v_customer.tenant_id
      AND tm.user_id = v_disconnected_user_id
      AND tm.role = 'customer';
    v_membership_removed := FOUND;
  END IF;

  INSERT INTO public.customer_account_unlink_audit (
    tenant_id,
    customer_id,
    disconnected_user_id,
    performed_by_user_id,
    customer_label,
    customer_phone
  ) VALUES (
    v_customer.tenant_id,
    v_customer.id,
    v_disconnected_user_id,
    v_actor_id,
    NULLIF(concat_ws(' ', v_customer.first_name, v_customer.last_name), ''),
    v_customer.phone
  );

  RETURN jsonb_build_object(
    'status', 'unlinked',
    'customerId', v_customer.id,
    'tenantId', v_customer.tenant_id,
    'disconnectedUserId', v_disconnected_user_id,
    'performedByUserId', v_actor_id,
    'membershipRemoved', v_membership_removed
  );
END;
$$;

COMMENT ON FUNCTION public.unlink_customer_account(uuid)
IS 'GH-44: staff-only account unlink with atomic customer update, membership cleanup and durable audit row.';

REVOKE ALL ON FUNCTION public.unlink_customer_account(uuid)
FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unlink_customer_account(uuid)
TO authenticated, service_role;

COMMIT;
