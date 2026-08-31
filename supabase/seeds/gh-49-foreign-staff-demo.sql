-- Fonte: GH-49, decisione Luigi 30/8/2026.
-- Sonda staff e tenant usa-e-getta destinati esclusivamente al demo.
-- La password e pubblica: nessuno dei due oggetti deve sopravvivere al giro.

DO $$
DECLARE
  v_email constant text := 'staff.gh49.foreign@test.example';
  v_password constant text := 'demo-gh49-foreign-staff-2026';
  v_user_id constant uuid := '0b33da67-01cd-43f5-8f6b-301084c0c049';
  v_tenant_id constant uuid := '49000000-0000-4000-8000-000000000049';
  v_tenant_slug constant text := 'gh-49-foreign-tenant-demo';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tenants
    WHERE (id = v_tenant_id OR slug = v_tenant_slug)
      AND (id <> v_tenant_id OR slug <> v_tenant_slug)
  ) THEN
    RAISE EXCEPTION 'GH-49 seed guard failed: foreign tenant id/slug mismatch';
  END IF;

  INSERT INTO public.tenants (id, slug, name, settings)
  VALUES (
    v_tenant_id,
    v_tenant_slug,
    '[DEMO GH-49] Tenant estraneo',
    '{
      "fidelity_tiers": {
        "bronze": {"visits_required": 6, "months_window": 12, "points_required": 100},
        "silver": {"visits_required": 12, "months_window": 24, "points_required": 250},
        "gold": {"visits_required": 36, "months_window": 36, "points_required": 500}
      }
    }'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    slug = excluded.slug,
    name = excluded.name;

  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE (id = v_user_id OR lower(email) = lower(v_email))
      AND (id <> v_user_id OR lower(email) <> lower(v_email))
  ) THEN
    RAISE EXCEPTION 'GH-49 seed guard failed: foreign staff email/UUID mismatch';
  END IF;

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
    v_user_id, 'authenticated', 'authenticated', v_email,
    crypt(v_password, gen_salt('bf')), now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"[DEMO GH-49] Staff tenant estraneo"}'::jsonb,
    now(), now(), '', '', '', 0, '', false, false
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt(v_password, gen_salt('bf')),
    email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
    banned_until = null,
    deleted_at = null,
    updated_at = now(),
    is_sso_user = false,
    is_anonymous = false;

  INSERT INTO auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_email, v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false,
      'display_name', '[DEMO GH-49] Staff tenant estraneo'
    ),
    'email', now(), now(), now()
  )
  ON CONFLICT (provider_id, provider) DO UPDATE SET
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

  INSERT INTO public.profiles (id, business_name, role)
  VALUES (v_user_id, '[DEMO GH-49] Staff tenant estraneo', 'operator')
  ON CONFLICT (id) DO UPDATE SET
    business_name = excluded.business_name,
    role = excluded.role;

  DELETE FROM public.tenant_memberships
  WHERE user_id = v_user_id
    AND (tenant_id <> v_tenant_id OR role <> 'staff');

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (v_tenant_id, v_user_id, 'staff')
  ON CONFLICT (tenant_id, user_id, role) DO NOTHING;
END
$$;
