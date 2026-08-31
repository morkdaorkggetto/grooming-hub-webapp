-- GH-49: teardown custodito di tenant e staff estranei usa-e-getta sul demo.

DO $$
DECLARE
  v_email constant text := 'staff.gh49.foreign@test.example';
  v_user_id constant uuid := '0b33da67-01cd-43f5-8f6b-301084c0c049';
  v_tenant_id constant uuid := '49000000-0000-4000-8000-000000000049';
  v_tenant_slug constant text := 'gh-49-foreign-tenant-demo';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.promotions WHERE tenant_id = v_tenant_id
  ) THEN
    RAISE EXCEPTION 'GH-49 teardown guard failed: foreign promotions remain';
  END IF;

  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE (id = v_user_id OR lower(email) = lower(v_email))
      AND (id <> v_user_id OR lower(email) <> lower(v_email))
  ) THEN
    RAISE EXCEPTION 'GH-49 teardown guard failed: foreign staff mismatch';
  END IF;

  DELETE FROM auth.users
  WHERE id = v_user_id AND lower(email) = lower(v_email);

  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id)
     OR EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id)
     OR EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id)
     OR EXISTS (SELECT 1 FROM public.tenant_memberships WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'GH-49 teardown failed: foreign staff residue';
  END IF;

  DELETE FROM public.tenants
  WHERE id = v_tenant_id AND slug = v_tenant_slug;

  IF EXISTS (
    SELECT 1 FROM public.tenants WHERE id = v_tenant_id OR slug = v_tenant_slug
  ) THEN
    RAISE EXCEPTION 'GH-49 teardown failed: foreign tenant residue';
  END IF;
END
$$;
