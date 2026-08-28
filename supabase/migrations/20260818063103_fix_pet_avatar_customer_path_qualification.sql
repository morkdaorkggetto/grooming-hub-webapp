-- Fonte: GH-02-ter, decisione Luigi 18/8/2026, a valle di consegna
-- GH-02-bis-interruzione.
-- Qualifica il path dell'oggetto per evitare che `name`, dentro le subquery,
-- venga risolto come `public.pets.name` anziche `storage.objects.name`.

BEGIN;

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
      WHERE p.id::text        = (storage.foldername(storage.objects.name))[2]
        AND p.tenant_id::text = (storage.foldername(storage.objects.name))[1]
        AND c.user_id         = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Pet avatars customer update" ON storage.objects;
CREATE POLICY "Pet avatars customer update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-avatars'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text        = (storage.foldername(storage.objects.name))[2]
        AND p.tenant_id::text = (storage.foldername(storage.objects.name))[1]
        AND c.user_id         = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'pet-avatars'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text        = (storage.foldername(storage.objects.name))[2]
        AND p.tenant_id::text = (storage.foldername(storage.objects.name))[1]
        AND c.user_id         = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Pet avatars customer delete" ON storage.objects;
CREATE POLICY "Pet avatars customer delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-avatars'
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE p.id::text        = (storage.foldername(storage.objects.name))[2]
        AND p.tenant_id::text = (storage.foldername(storage.objects.name))[1]
        AND c.user_id         = auth.uid()
    )
  );

COMMIT;
