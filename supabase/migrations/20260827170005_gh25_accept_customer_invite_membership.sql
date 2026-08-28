-- Fonte: GH-25, decisione Luigi 27/8/2026.
-- Ripara la regressione introdotta dal passaggio del ruolo a
-- tenant_memberships: l'accettazione dell'invito deve creare la membership
-- customer nella stessa transazione che adotta customer e pet.

CREATE OR REPLACE FUNCTION public.accept_customer_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'auth'
AS $function$
DECLARE
  v_invitation public.customer_invitations%ROWTYPE;
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_customer_id uuid;
  v_existing_user_id uuid;
  v_adopted boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'GH_INVITE_AUTH_REQUIRED: Devi effettuare l''accesso per accettare l''invito.';
  END IF;

  SELECT *
  INTO v_invitation
  FROM public.customer_invitations
  WHERE token = p_token
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'GH_INVITE_NOT_FOUND: Questo invito non esiste.';
  END IF;

  IF v_invitation.accepted_at IS NOT NULL THEN
    IF v_invitation.accepted_by = v_user_id THEN
      SELECT id
      INTO v_customer_id
      FROM public.customers
      WHERE tenant_id = v_invitation.tenant_id
        AND user_id = v_user_id
      ORDER BY created_at
      LIMIT 1;

      RETURN jsonb_build_object(
        'status', 'already_accepted',
        'customerId', v_customer_id,
        'petId', v_invitation.pet_id,
        'tenantId', v_invitation.tenant_id,
        'adopted', true
      );
    END IF;

    RAISE EXCEPTION 'GH_INVITE_ALREADY_USED: Questo invito è già stato utilizzato.';
  END IF;

  IF v_invitation.expires_at IS NOT NULL AND v_invitation.expires_at <= now() THEN
    RAISE EXCEPTION 'GH_INVITE_EXPIRED: Questo invito è scaduto.';
  END IF;

  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = v_user_id
      AND p.role = 'operator'
  ) OR EXISTS (
    SELECT 1
    FROM public.tenant_memberships tm
    WHERE tm.user_id = v_user_id
      AND tm.role IN ('owner', 'staff')
  ) THEN
    RAISE EXCEPTION 'GH_INVITE_STAFF_ACCOUNT: Usa o crea un account cliente separato.';
  END IF;

  INSERT INTO public.profiles (id, business_name, role)
  VALUES (
    v_user_id,
    COALESCE(split_part(v_user_email, '@', 1), 'Cliente'),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'customer';

  SELECT id, user_id
  INTO v_customer_id, v_existing_user_id
  FROM public.customers
  WHERE tenant_id = v_invitation.tenant_id
    AND phone = v_invitation.phone
  LIMIT 1;

  IF v_customer_id IS NOT NULL THEN
    IF v_existing_user_id IS NOT NULL AND v_existing_user_id <> v_user_id THEN
      RAISE EXCEPTION
        'Phone % già associato ad altro utente in questo tenant. Contatta il salone per riassegnare l''anagrafica.',
        v_invitation.phone;
    END IF;

    UPDATE public.customers
    SET user_id = v_user_id,
        email = v_user_email
    WHERE id = v_customer_id;

    v_adopted := true;
  ELSE
    INSERT INTO public.customers (
      tenant_id,
      user_id,
      first_name,
      last_name,
      email,
      phone
    )
    VALUES (
      v_invitation.tenant_id,
      v_user_id,
      v_invitation.first_name,
      v_invitation.last_name,
      v_user_email,
      v_invitation.phone
    )
    RETURNING id INTO v_customer_id;
  END IF;

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (v_invitation.tenant_id, v_user_id, 'customer')
  ON CONFLICT (tenant_id, user_id, role) DO NOTHING;

  IF v_invitation.pet_id IS NOT NULL THEN
    UPDATE public.pets
    SET customer_id = v_customer_id
    WHERE id = v_invitation.pet_id
      AND (customer_id IS NULL OR customer_id = v_customer_id);
  END IF;

  UPDATE public.customer_invitations
  SET accepted_by = v_user_id,
      accepted_at = now()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'status', 'accepted',
    'customerId', v_customer_id,
    'petId', v_invitation.pet_id,
    'tenantId', v_invitation.tenant_id,
    'adopted', v_adopted
  );
END;
$function$;

ALTER FUNCTION public.accept_customer_invite(text) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.accept_customer_invite(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_customer_invite(text) FROM anon;
REVOKE ALL ON FUNCTION public.accept_customer_invite(text) FROM authenticated;
REVOKE ALL ON FUNCTION public.accept_customer_invite(text) FROM service_role;

GRANT EXECUTE ON FUNCTION public.accept_customer_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_customer_invite(text) TO service_role;
