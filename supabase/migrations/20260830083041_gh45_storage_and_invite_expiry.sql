-- GH-45, fonte: docs/incarichi/GH-45-prima-del-primo-invito.md.
-- Versione registrata sul demo: 20260830083041.
-- Chiude le scritture customer sul bucket legacy e rende tenant-configurabile
-- la durata dei nuovi inviti senza modificare quelli gia emessi.

BEGIN;

UPDATE public.tenants
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{customer_invite_expiry_days}',
  '3'::jsonb,
  true
)
WHERE NOT (COALESCE(settings, '{}'::jsonb) ? 'customer_invite_expiry_days');

ALTER TABLE public.tenants
  DROP CONSTRAINT IF EXISTS tenants_customer_invite_expiry_days_valid;

ALTER TABLE public.tenants
  ADD CONSTRAINT tenants_customer_invite_expiry_days_valid CHECK (
    NOT (COALESCE(settings, '{}'::jsonb) ? 'customer_invite_expiry_days')
    OR CASE
      WHEN jsonb_typeof(settings -> 'customer_invite_expiry_days') = 'number'
        AND settings ->> 'customer_invite_expiry_days' ~ '^[1-9][0-9]*$'
      THEN (settings ->> 'customer_invite_expiry_days')::numeric <= 3650000
      ELSE false
    END
  );

ALTER TABLE public.customer_invitations
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '3 days');

CREATE OR REPLACE FUNCTION public.set_customer_invitation_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_expiry_days integer;
BEGIN
  SELECT COALESCE(
    (t.settings ->> 'customer_invite_expiry_days')::integer,
    3
  )
    INTO v_expiry_days
  FROM public.tenants t
  WHERE t.id = NEW.tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant non disponibile per l''invito'
      USING ERRCODE = '23503';
  END IF;

  NEW.expires_at := statement_timestamp() + make_interval(days => v_expiry_days);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_customer_invitation_expiry()
IS 'GH-45: assegna ai nuovi inviti la durata configurata nel tenant; non modifica inviti esistenti.';

REVOKE ALL ON FUNCTION public.set_customer_invitation_expiry()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS set_customer_invitation_expiry
  ON public.customer_invitations;
CREATE TRIGGER set_customer_invitation_expiry
  BEFORE INSERT ON public.customer_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_customer_invitation_expiry();

-- Policy generate dal Dashboard osservate in produzione.
DROP POLICY IF EXISTS "client_photos_auth_all 1jb8i4j_0" ON storage.objects;
DROP POLICY IF EXISTS "client_photos_auth_all 1jb8i4j_1" ON storage.objects;
DROP POLICY IF EXISTS "client_photos_auth_all 1jb8i4j_2" ON storage.objects;
DROP POLICY IF EXISTS "client_photos_auth_all 1jb8i4j_3" ON storage.objects;

-- Policy legacy presenti nel demo e nella storia locale.
DROP POLICY IF EXISTS "Authenticated users can upload own client photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own client photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own client photos" ON storage.objects;
DROP POLICY IF EXISTS "Client photos staff insert" ON storage.objects;
DROP POLICY IF EXISTS "Client photos staff update" ON storage.objects;
DROP POLICY IF EXISTS "Client photos staff delete" ON storage.objects;

CREATE POLICY "Client photos staff insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'client-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM public.tenant_memberships tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Client photos staff update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'client-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM public.tenant_memberships tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'staff')
    )
  )
  WITH CHECK (
    bucket_id = 'client-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM public.tenant_memberships tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Client photos staff delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'client-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1
      FROM public.tenant_memberships tm
      WHERE tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'staff')
    )
  );

-- "Public can view client photos" resta intenzionalmente invariata.

COMMIT;
