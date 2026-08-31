-- GH-50, decisione Luigi 31/8/2026.
-- Separa le tre fotografie: riconoscimento salone (pets.photo_url), ritratto
-- proprietario (pets.owner_photo_url) e album lavorazioni (visits.photo_url).
-- I customer possono scrivere solo nello spazio owner del proprio pet.

BEGIN;

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS owner_photo_url text;

ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS photo_url text;

COMMENT ON COLUMN public.pets.owner_photo_url IS
  'GH-50 portrait chosen by the pet owner; customer-writable through the pet whitelist.';

COMMENT ON COLUMN public.visits.photo_url IS
  'GH-50 optional salon photo for the visit album; one photo per visit.';

CREATE OR REPLACE FUNCTION public.enforce_pets_customer_update_whitelist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_owner_notes       text  := NEW.owner_notes;
  v_coat_preferences  jsonb := NEW.coat_preferences;
  v_owner_photo_url   text  := NEW.owner_photo_url;
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_tenant_any_staff_access(NEW.tenant_id) THEN
    NEW := OLD;
    NEW.owner_notes := v_owner_notes;
    NEW.coat_preferences := v_coat_preferences;
    NEW.owner_photo_url := v_owner_photo_url;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_pets_customer_update_whitelist() IS
  'GH-50 whitelist for authenticated non-staff customers: only owner_notes, coat_preferences and owner_photo_url are writable; staff and privileged maintenance remain unchanged.';

REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_pets_customer_update_whitelist() FROM authenticated;

DROP POLICY IF EXISTS "Pet avatars customer insert" ON storage.objects;
CREATE POLICY "Pet avatars customer insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pet-avatars'
    AND (storage.foldername(storage.objects.name))[3] = 'owner'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text = (storage.foldername(storage.objects.name))[2]
        AND p.tenant_id::text = (storage.foldername(storage.objects.name))[1]
        AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Pet avatars customer update" ON storage.objects;
CREATE POLICY "Pet avatars customer update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'pet-avatars'
    AND (storage.foldername(storage.objects.name))[3] = 'owner'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text = (storage.foldername(storage.objects.name))[2]
        AND p.tenant_id::text = (storage.foldername(storage.objects.name))[1]
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'pet-avatars'
    AND (storage.foldername(storage.objects.name))[3] = 'owner'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text = (storage.foldername(storage.objects.name))[2]
        AND p.tenant_id::text = (storage.foldername(storage.objects.name))[1]
        AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Pet avatars customer delete" ON storage.objects;
CREATE POLICY "Pet avatars customer delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'pet-avatars'
    AND (storage.foldername(storage.objects.name))[3] = 'owner'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text = (storage.foldername(storage.objects.name))[2]
        AND p.tenant_id::text = (storage.foldername(storage.objects.name))[1]
        AND c.user_id = auth.uid()
    )
  );

COMMIT;
