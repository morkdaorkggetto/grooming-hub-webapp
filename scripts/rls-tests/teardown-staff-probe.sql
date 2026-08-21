-- Fonte: GH-06, decisione Luigi 21/8/2026; chiusura della sonda GH-04.
-- Atto di dato idempotente destinato esclusivamente a `grooming-hub-demo`.

DO $$
DECLARE
  v_probe_email constant text := 'staff.sonda@test.example';
  v_probe_id constant uuid := '0b33da67-01cd-43f5-8f6b-301084c0c001';
  v_email_user_id uuid;
  v_id_user_email text;
  v_email_exists boolean;
  v_id_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = lower(v_probe_email)
  ) INTO v_email_exists;

  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = v_probe_id
  ) INTO v_id_exists;

  IF NOT v_email_exists AND NOT v_id_exists THEN
    RAISE NOTICE 'GH-06 teardown: probe already absent';
  ELSE
    SELECT id INTO v_email_user_id
    FROM auth.users
    WHERE lower(email) = lower(v_probe_email);

    SELECT email INTO v_id_user_email
    FROM auth.users
    WHERE id = v_probe_id;

    IF NOT v_email_exists
       OR NOT v_id_exists
       OR v_email_user_id IS DISTINCT FROM v_probe_id
       OR lower(v_id_user_email) IS DISTINCT FROM lower(v_probe_email) THEN
      RAISE EXCEPTION
        'GH-06 teardown guard failed: probe email/UUID mismatch';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.customers WHERE user_id = v_probe_id
    ) THEN
      RAISE EXCEPTION
        'GH-06 teardown guard failed: probe unexpectedly linked to customers';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.pets WHERE owner_user_id = v_probe_id
    ) THEN
      RAISE EXCEPTION
        'GH-06 teardown guard failed: probe unexpectedly owns pets';
    END IF;

    DELETE FROM auth.users
    WHERE id = v_probe_id
      AND lower(email) = lower(v_probe_email);

    IF NOT FOUND THEN
      RAISE EXCEPTION 'GH-06 teardown failed: guarded delete removed 0 users';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_probe_id)
     OR EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_probe_id)
     OR EXISTS (SELECT 1 FROM public.profiles WHERE id = v_probe_id)
     OR EXISTS (
       SELECT 1 FROM public.tenant_memberships WHERE user_id = v_probe_id
     )
     OR EXISTS (SELECT 1 FROM public.customers WHERE user_id = v_probe_id) THEN
    RAISE EXCEPTION 'GH-06 teardown failed: residual probe rows detected';
  END IF;
END $$;

