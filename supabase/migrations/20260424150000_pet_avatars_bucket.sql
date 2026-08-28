-- ============================================================================
-- Gate 2 · Fase G — Bucket storage `pet-avatars`
-- ----------------------------------------------------------------------------
-- Separato da `client-photos` (che resta per le foto "operator-owned" legacy).
-- Path convention: `<tenant_id>/<pet_id>/<file>`. Write consentito solo al
-- customer proprietario del pet (via customers.user_id). Read pubblica.
--
-- Helper: `storage.foldername(name)` restituisce l'array dei folder segments.
-- - segments[1] = tenant_id
-- - segments[2] = pet_id
-- ============================================================================

BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-avatars',
  'pet-avatars',
  true,
  5242880,                                           -- 5 MiB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Read pubblica: le foto dei pet sono visibili via URL (come già per client-photos)
DROP POLICY IF EXISTS "Pet avatars public read" ON storage.objects;
CREATE POLICY "Pet avatars public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-avatars');

-- INSERT: solo il customer proprietario del pet di `<tenant_id>/<pet_id>/...`
DROP POLICY IF EXISTS "Pet avatars customer insert" ON storage.objects;
CREATE POLICY "Pet avatars customer insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-avatars'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND (storage.foldername(name))[2] IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text        = (storage.foldername(name))[2]
        AND p.tenant_id::text = (storage.foldername(name))[1]
        AND c.user_id         = auth.uid()
    )
  );

-- UPDATE: stessa logica di INSERT
DROP POLICY IF EXISTS "Pet avatars customer update" ON storage.objects;
CREATE POLICY "Pet avatars customer update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-avatars'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text        = (storage.foldername(name))[2]
        AND p.tenant_id::text = (storage.foldername(name))[1]
        AND c.user_id         = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'pet-avatars'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text        = (storage.foldername(name))[2]
        AND p.tenant_id::text = (storage.foldername(name))[1]
        AND c.user_id         = auth.uid()
    )
  );

-- DELETE: stessa logica
DROP POLICY IF EXISTS "Pet avatars customer delete" ON storage.objects;
CREATE POLICY "Pet avatars customer delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-avatars'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text        = (storage.foldername(name))[2]
        AND p.tenant_id::text = (storage.foldername(name))[1]
        AND c.user_id         = auth.uid()
    )
  );

-- Staff può fare tutto sui propri pet (nel proprio tenant)
DROP POLICY IF EXISTS "Pet avatars staff all" ON storage.objects;
CREATE POLICY "Pet avatars staff all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'pet-avatars'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND public.has_tenant_any_staff_access((storage.foldername(name))[1]::uuid)
  )
  WITH CHECK (
    bucket_id = 'pet-avatars'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND public.has_tenant_any_staff_access((storage.foldername(name))[1]::uuid)
  );

COMMIT;
