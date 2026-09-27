-- GH-103, DOPO il deploy e la verifica delle firme batch nell'app.
-- PRIMA chiamare Storage updateBucket('client-photos', { public: false }):
-- il passaggio API public->private invalida la CDN; il solo SQL non lo fa.
-- Vedi registro GH-103 per verifica degli URL gia in cache e ordine degli atti.
-- Fonte: mandato Luigi 27/9/2026, punto 1. Nessun oggetto viene spostato o eliminato.
BEGIN;
ALTER POLICY "Client photos staff select" ON storage.objects TO authenticated
USING (
 bucket_id='client-photos' AND (
  ((storage.foldername(name))[1]=(SELECT auth.uid())::text AND EXISTS (
   SELECT 1 FROM public.tenant_memberships tm WHERE tm.user_id=(SELECT auth.uid())
    AND tm.role IN ('owner','staff')
  )) OR EXISTS (
   SELECT 1 FROM public.pets p WHERE public.has_tenant_any_staff_access(p.tenant_id)
    AND split_part(p.photo_url,'/storage/v1/object/public/client-photos/',2)=storage.objects.name
  )
 )
);
UPDATE storage.buckets SET public=false WHERE id='client-photos';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id='client-photos' AND NOT public)
 THEN RAISE EXCEPTION 'GH103 recognition bucket not private'; END IF;
END $$;
COMMIT;
