-- Fonte: GH-04, decisione Luigi 18/8/2026.
-- Atto di dato idempotente destinato esclusivamente a `grooming-hub-demo`.
-- La password e pubblica e usa-e-getta: questa identita esiste solo come sonda [DEMO].

DO $$
DECLARE
  v_email constant text := 'staff.sonda@test.example';
  v_password constant text := 'demo-gh04-staff-2026';
  v_fixed_user_id constant uuid := '0b33da67-01cd-43f5-8f6b-301084c0c001';
  v_tenant_id uuid;
  v_user_id uuid;
  v_email_count integer;
BEGIN
  SELECT id INTO v_tenant_id
  FROM public.tenants
  WHERE slug = 'grooming-hub';

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'GH-04 demo seed guard failed: demo tenant missing';
  END IF;

  SELECT count(*) INTO v_email_count
  FROM auth.users
  WHERE lower(email) = lower(v_email);

  IF v_email_count > 1 THEN
    RAISE EXCEPTION 'GH-04 demo seed guard failed: duplicate probe auth users';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = v_fixed_user_id AND lower(email) <> lower(v_email)
    ) THEN
      RAISE EXCEPTION 'GH-04 demo seed guard failed: fixed probe id already in use';
    END IF;

    v_user_id := v_fixed_user_id;

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      phone_change,
      phone_change_token,
      email_change_token_current,
      email_change_confirm_status,
      reauthentication_token,
      is_sso_user,
      is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"[DEMO] Sonda staff GH-04"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      0,
      '',
      false,
      false
    );
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = '{"display_name":"[DEMO] Sonda staff GH-04"}'::jsonb,
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change = '',
      email_change_token_current = '',
      email_change_confirm_status = 0,
      reauthentication_token = '',
      banned_until = null,
      deleted_at = null,
      updated_at = now(),
      is_sso_user = false,
      is_anonymous = false
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_email,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false,
      'display_name', '[DEMO] Sonda staff GH-04'
    ),
    'email',
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider_id, provider) DO UPDATE SET
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

  INSERT INTO public.profiles (id, business_name, role)
  VALUES (v_user_id, '[DEMO] Sonda staff GH-04', 'operator')
  ON CONFLICT (id) DO UPDATE SET
    business_name = excluded.business_name,
    role = excluded.role;

  DELETE FROM public.tenant_memberships
  WHERE tenant_id = v_tenant_id
    AND user_id = v_user_id
    AND role <> 'staff';

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (v_tenant_id, v_user_id, 'staff')
  ON CONFLICT (tenant_id, user_id, role) DO NOTHING;

  IF EXISTS (
    SELECT 1 FROM public.customers
    WHERE user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'GH-04 demo seed guard failed: probe unexpectedly linked to customers';
  END IF;
END $$;
