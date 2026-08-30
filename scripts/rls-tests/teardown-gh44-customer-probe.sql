-- GH-44: teardown custodito della sonda customer usa-e-getta sul solo demo.

DO $$
DECLARE
  v_probe_email constant text := 'customer.gh44@test.example';
  v_probe_id constant uuid := '0b33da67-01cd-43f5-8f6b-301084c0c044';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_probe_id)
     AND NOT EXISTS (
       SELECT 1 FROM auth.users WHERE lower(email) = lower(v_probe_email)
     ) THEN
    RAISE NOTICE 'GH-44 teardown: customer probe already absent';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = v_probe_id AND lower(email) = lower(v_probe_email)
  ) THEN
    RAISE EXCEPTION 'GH-44 teardown guard failed: probe email/UUID mismatch';
  END IF;

  IF EXISTS (SELECT 1 FROM public.customers WHERE user_id = v_probe_id)
     OR EXISTS (SELECT 1 FROM public.tenant_memberships WHERE user_id = v_probe_id)
     OR EXISTS (SELECT 1 FROM public.customer_invitations WHERE accepted_by = v_probe_id)
     OR EXISTS (
       SELECT 1 FROM public.customer_account_unlink_audit
       WHERE disconnected_user_id = v_probe_id
     ) THEN
    RAISE EXCEPTION 'GH-44 teardown guard failed: residual probe data';
  END IF;

  DELETE FROM auth.users
  WHERE id = v_probe_id AND lower(email) = lower(v_probe_email);

  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_probe_id)
     OR EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_probe_id)
     OR EXISTS (SELECT 1 FROM public.profiles WHERE id = v_probe_id) THEN
    RAISE EXCEPTION 'GH-44 teardown failed: residual identity rows';
  END IF;
END
$$;
