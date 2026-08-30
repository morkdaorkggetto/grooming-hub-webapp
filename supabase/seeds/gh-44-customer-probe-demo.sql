-- Fonte: GH-44, autorizzazione Luigi 30/8/2026.
-- Account customer usa-e-getta destinato esclusivamente a grooming-hub-demo.
-- La password e pubblica: questa identita [DEMO] viene rimossa a fine prova.

DO $$
DECLARE
  v_email constant text := 'customer.gh44@test.example';
  v_password constant text := 'demo-gh44-customer-2026';
  v_fixed_user_id constant uuid := '0b33da67-01cd-43f5-8f6b-301084c0c044';
  v_user_id uuid;
  v_email_count integer;
BEGIN
  SELECT count(*) INTO v_email_count
  FROM auth.users
  WHERE lower(email) = lower(v_email);

  IF v_email_count > 1 THEN
    RAISE EXCEPTION 'GH-44 seed guard failed: duplicate customer probe users';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = v_fixed_user_id AND lower(email) <> lower(v_email)
    ) THEN
      RAISE EXCEPTION 'GH-44 seed guard failed: fixed probe id already in use';
    END IF;

    v_user_id := v_fixed_user_id;

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_token, recovery_token,
      email_change_token_new, email_change, raw_app_meta_data,
      raw_user_meta_data, created_at, updated_at, phone_change,
      phone_change_token, email_change_token_current,
      email_change_confirm_status, reauthentication_token,
      is_sso_user, is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(), '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"[DEMO GH-44] Customer probe"}'::jsonb,
      now(), now(), '', '', '', 0, '', false, false
    );
  ELSE
    IF v_user_id <> v_fixed_user_id THEN
      RAISE EXCEPTION 'GH-44 seed guard failed: probe email/UUID mismatch';
    END IF;

    UPDATE auth.users
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        banned_until = null,
        deleted_at = null,
        updated_at = now(),
        is_sso_user = false,
        is_anonymous = false
    WHERE id = v_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM public.customers WHERE user_id = v_user_id)
     OR EXISTS (SELECT 1 FROM public.tenant_memberships WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'GH-44 seed guard failed: probe still linked to demo data';
  END IF;

  INSERT INTO auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_email,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false,
      'display_name', '[DEMO GH-44] Customer probe'
    ),
    'email', now(), now(), now()
  )
  ON CONFLICT (provider_id, provider) DO UPDATE SET
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

  INSERT INTO public.profiles (id, business_name, role)
  VALUES (v_user_id, '[DEMO GH-44] Customer probe', 'customer')
  ON CONFLICT (id) DO UPDATE SET
    business_name = excluded.business_name,
    role = excluded.role;
END
$$;
