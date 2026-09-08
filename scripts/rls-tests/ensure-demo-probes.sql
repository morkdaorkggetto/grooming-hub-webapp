-- GH-74: permanent probes required by scripts/rls-tests/run.mjs.
-- Demo only: grooming-hub-demo (qttpinkslhenxrsbhhhg).
--
-- The caller must provide the existing probe passwords as transaction-local
-- settings before this file is executed:
--   gh_rls.staff_password
--   gh_rls.gh44_password
--   gh_rls.foreign_staff_password
-- No password is stored in this file.

DO $$
DECLARE
  v_demo_tenant_id uuid;
  v_foreign_tenant_id constant uuid := '49000000-0000-4000-8000-000000000049';
  v_foreign_tenant_slug constant text := 'gh-49-foreign-tenant-demo';
  v_probe record;
  v_password text;
  v_user auth.users%ROWTYPE;
  v_user_exists boolean;
  v_app_metadata constant jsonb := '{"provider":"email","providers":["email"]}'::jsonb;
BEGIN
  SELECT id
  INTO v_demo_tenant_id
  FROM public.tenants
  WHERE slug = 'grooming-hub';

  IF v_demo_tenant_id IS NULL THEN
    RAISE EXCEPTION 'GH-74 guard failed: demo tenant missing';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.tenants
    WHERE (id = v_foreign_tenant_id OR slug = v_foreign_tenant_slug)
      AND (id <> v_foreign_tenant_id OR slug <> v_foreign_tenant_slug)
  ) THEN
    RAISE EXCEPTION 'GH-74 guard failed: foreign tenant id/slug mismatch';
  END IF;

  INSERT INTO public.tenants (id, slug, name, settings)
  VALUES (
    v_foreign_tenant_id,
    v_foreign_tenant_slug,
    '[DEMO GH-49] Tenant estraneo',
    '{
      "fidelity_tiers": {
        "bronze": {"visits_required": 6, "months_window": 12, "points_required": 100},
        "silver": {"visits_required": 12, "months_window": 24, "points_required": 250},
        "gold": {"visits_required": 36, "months_window": 36, "points_required": 500}
      }
    }'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  FOR v_probe IN
    SELECT *
    FROM (
      VALUES
        (
          'staff.sonda@test.example'::text,
          '0b33da67-01cd-43f5-8f6b-301084c0c001'::uuid,
          'gh_rls.staff_password'::text,
          '[DEMO] Sonda staff GH-04'::text,
          'operator'::text
        ),
        (
          'customer.gh44@test.example'::text,
          '0b33da67-01cd-43f5-8f6b-301084c0c044'::uuid,
          'gh_rls.gh44_password'::text,
          '[DEMO GH-44] Customer probe'::text,
          'customer'::text
        ),
        (
          'staff.gh49.foreign@test.example'::text,
          '0b33da67-01cd-43f5-8f6b-301084c0c049'::uuid,
          'gh_rls.foreign_staff_password'::text,
          '[DEMO GH-49] Staff tenant estraneo'::text,
          'operator'::text
        )
    ) AS probes(email, user_id, password_setting, display_name, profile_role)
  LOOP
    v_password := current_setting(v_probe.password_setting, true);
    IF v_password IS NULL OR btrim(v_password) = '' THEN
      RAISE EXCEPTION 'GH-74 guard failed: required password setting % is absent',
        v_probe.password_setting;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM auth.users
      WHERE (id = v_probe.user_id OR lower(email) = lower(v_probe.email))
        AND (id <> v_probe.user_id OR lower(email) <> lower(v_probe.email))
    ) THEN
      RAISE EXCEPTION 'GH-74 guard failed: probe email/UUID mismatch for %',
        v_probe.email;
    END IF;

    SELECT *
    INTO v_user
    FROM auth.users
    WHERE id = v_probe.user_id
      AND lower(email) = lower(v_probe.email);
    v_user_exists := FOUND;

    IF NOT v_user_exists THEN
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
        v_probe.user_id,
        'authenticated',
        'authenticated',
        v_probe.email,
        crypt(v_password, gen_salt('bf')),
        now(),
        '',
        '',
        '',
        '',
        v_app_metadata,
        jsonb_build_object('display_name', v_probe.display_name),
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
    ELSIF
      v_user.encrypted_password IS NULL
      OR v_user.encrypted_password <> crypt(v_password, v_user.encrypted_password)
      OR v_user.email_confirmed_at IS NULL
      OR v_user.raw_app_meta_data IS DISTINCT FROM v_app_metadata
      OR v_user.raw_user_meta_data IS DISTINCT FROM jsonb_build_object('display_name', v_probe.display_name)
      OR coalesce(v_user.confirmation_token, '') <> ''
      OR coalesce(v_user.recovery_token, '') <> ''
      OR coalesce(v_user.email_change_token_new, '') <> ''
      OR coalesce(v_user.email_change, '') <> ''
      OR coalesce(v_user.email_change_token_current, '') <> ''
      OR coalesce(v_user.email_change_confirm_status, 0) <> 0
      OR coalesce(v_user.reauthentication_token, '') <> ''
      OR v_user.banned_until IS NOT NULL
      OR v_user.deleted_at IS NOT NULL
      OR coalesce(v_user.is_sso_user, false)
      OR coalesce(v_user.is_anonymous, false)
    THEN
      UPDATE auth.users
      SET encrypted_password = crypt(v_password, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          raw_app_meta_data = v_app_metadata,
          raw_user_meta_data = jsonb_build_object('display_name', v_probe.display_name),
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
      WHERE id = v_probe.user_id;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM auth.identities
      WHERE provider_id = v_probe.email
        AND provider = 'email'
        AND user_id <> v_probe.user_id
    ) THEN
      RAISE EXCEPTION 'GH-74 guard failed: probe identity mismatch for %',
        v_probe.email;
    END IF;

    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    SELECT
      v_probe.email,
      v_probe.user_id,
      jsonb_build_object(
        'sub', v_probe.user_id::text,
        'email', v_probe.email,
        'email_verified', true,
        'phone_verified', false,
        'display_name', v_probe.display_name
      ),
      'email',
      now(),
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1
      FROM auth.identities
      WHERE provider_id = v_probe.email
        AND provider = 'email'
    );

    INSERT INTO public.profiles (id, business_name, role)
    VALUES (v_probe.user_id, v_probe.display_name, v_probe.profile_role)
    ON CONFLICT (id) DO NOTHING;

    UPDATE public.profiles
    SET business_name = v_probe.display_name,
        role = v_probe.profile_role
    WHERE id = v_probe.user_id
      AND (
        business_name IS DISTINCT FROM v_probe.display_name
        OR role IS DISTINCT FROM v_probe.profile_role
      );
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM public.customers
    WHERE user_id IN (
      '0b33da67-01cd-43f5-8f6b-301084c0c001'::uuid,
      '0b33da67-01cd-43f5-8f6b-301084c0c044'::uuid,
      '0b33da67-01cd-43f5-8f6b-301084c0c049'::uuid
    )
  ) THEN
    RAISE EXCEPTION 'GH-74 guard failed: a permanent probe is linked to customers';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.pets
    WHERE owner_user_id IN (
      '0b33da67-01cd-43f5-8f6b-301084c0c001'::uuid,
      '0b33da67-01cd-43f5-8f6b-301084c0c049'::uuid
    )
  ) THEN
    RAISE EXCEPTION 'GH-74 guard failed: a staff probe owns pets';
  END IF;

  DELETE FROM public.tenant_memberships
  WHERE user_id = '0b33da67-01cd-43f5-8f6b-301084c0c001'::uuid
    AND (tenant_id <> v_demo_tenant_id OR role <> 'staff');

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (
    v_demo_tenant_id,
    '0b33da67-01cd-43f5-8f6b-301084c0c001'::uuid,
    'staff'
  )
  ON CONFLICT (tenant_id, user_id, role) DO NOTHING;

  IF EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = '0b33da67-01cd-43f5-8f6b-301084c0c044'::uuid
  ) THEN
    RAISE EXCEPTION 'GH-74 guard failed: GH-44 customer probe has a membership';
  END IF;

  DELETE FROM public.tenant_memberships
  WHERE user_id = '0b33da67-01cd-43f5-8f6b-301084c0c049'::uuid
    AND (tenant_id <> v_foreign_tenant_id OR role <> 'staff');

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (
    v_foreign_tenant_id,
    '0b33da67-01cd-43f5-8f6b-301084c0c049'::uuid,
    'staff'
  )
  ON CONFLICT (tenant_id, user_id, role) DO NOTHING;
END
$$;
