-- GH-12 Atto 1: trascrizione versionata della pulizia relazionale/Auth
-- eseguita sul temporaneo il 24/08/2026 alle 10:24:42.
-- Fonte: docs/consegne/GH-11-registro-eseguito-24-08-2026.md, paragrafo 6.
--
-- Storage e intenzionalmente escluso: storage.protect_delete() richiede la
-- Storage API. Questo file non disabilita trigger e non forza cancellazioni.
--
-- Stati ammessi:
--   1. perimetro legacy completo e identico alla misura GH-11 -> pulizia;
--   2. pulizia gia applicata -> no-op idempotente.
-- Ogni stato parziale o divergente blocca atomicamente l'atto.

BEGIN;

CREATE TEMPORARY TABLE gh12_cleanup_users ON COMMIT DROP AS
SELECT id, email
FROM auth.users
WHERE email IN (
  'ggetto@gmail.com',
  'sofaj99831@izkat.com',
  'morkdaork@me.com',
  'morkdaork02@gmail.com'
);

CREATE TEMPORARY TABLE gh12_cleanup_clients ON COMMIT DROP AS
SELECT c.id, u.email
FROM public.clients c
JOIN gh12_cleanup_users u ON u.id = c.user_id
WHERE u.email IN ('ggetto@gmail.com', 'sofaj99831@izkat.com');

DO $$
DECLARE
  v_target_users integer;
  v_ggetto_clients integer;
  v_ggetto_visits integer;
  v_ggetto_contacts integer;
  v_sofaj_clients integer;
  v_sofaj_contacts integer;
  v_appointments integer;
  v_rewards integer;
  v_invites integer;
  v_links integer;
  v_is_before boolean;
  v_is_after boolean;
BEGIN
  SELECT count(*) INTO v_target_users FROM gh12_cleanup_users;
  SELECT count(*) INTO v_ggetto_clients
  FROM gh12_cleanup_clients WHERE email = 'ggetto@gmail.com';
  SELECT count(*) INTO v_ggetto_visits
  FROM public.visits
  WHERE client_id IN (
    SELECT id FROM gh12_cleanup_clients WHERE email = 'ggetto@gmail.com'
  );
  SELECT count(*) INTO v_ggetto_contacts
  FROM public.contacts
  WHERE user_id = (
    SELECT id FROM gh12_cleanup_users WHERE email = 'ggetto@gmail.com'
  );
  SELECT count(*) INTO v_sofaj_clients
  FROM gh12_cleanup_clients WHERE email = 'sofaj99831@izkat.com';
  SELECT count(*) INTO v_sofaj_contacts
  FROM public.contacts
  WHERE user_id = (
    SELECT id FROM gh12_cleanup_users WHERE email = 'sofaj99831@izkat.com'
  );
  SELECT count(*) INTO v_appointments
  FROM public.appointments
  WHERE client_id IN (SELECT id FROM gh12_cleanup_clients);
  SELECT count(*) INTO v_rewards
  FROM public.reward_points
  WHERE client_id IN (SELECT id FROM gh12_cleanup_clients);
  SELECT count(*) INTO v_invites
  FROM public.customer_invitations
  WHERE operator_user_id = (
    SELECT id FROM gh12_cleanup_users WHERE email = 'ggetto@gmail.com'
  );
  SELECT count(*) INTO v_links
  FROM public.customer_client_links
  WHERE operator_user_id = (
    SELECT id FROM gh12_cleanup_users WHERE email = 'ggetto@gmail.com'
  );

  v_is_before :=
    ROW(
      v_target_users,
      v_ggetto_clients,
      v_ggetto_visits,
      v_ggetto_contacts,
      v_sofaj_clients,
      v_sofaj_contacts,
      v_appointments,
      v_rewards,
      v_invites,
      v_links
    ) = ROW(4, 5, 2, 5, 1, 1, 12, 3, 4, 1);

  v_is_after :=
    ROW(
      v_target_users,
      v_ggetto_clients,
      v_ggetto_visits,
      v_ggetto_contacts,
      v_sofaj_clients,
      v_sofaj_contacts,
      v_appointments,
      v_rewards,
      v_invites,
      v_links
    ) = ROW(1, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    AND EXISTS (
      SELECT 1 FROM gh12_cleanup_users WHERE email = 'ggetto@gmail.com'
    );

  IF NOT v_is_before AND NOT v_is_after THEN
    RAISE EXCEPTION
      'GH-12 cleanup guard failed: observed users %, clients %/%, visits %, contacts %/%, appointments %, rewards %, invitations %, links %',
      v_target_users,
      v_ggetto_clients,
      v_sofaj_clients,
      v_ggetto_visits,
      v_ggetto_contacts,
      v_sofaj_contacts,
      v_appointments,
      v_rewards,
      v_invites,
      v_links;
  END IF;
END $$;

DELETE FROM public.customer_client_links
WHERE operator_user_id = (
  SELECT id FROM gh12_cleanup_users WHERE email = 'ggetto@gmail.com'
)
OR customer_user_id IN (
  SELECT id
  FROM gh12_cleanup_users
  WHERE email IN ('morkdaork@me.com', 'morkdaork02@gmail.com')
);

DELETE FROM public.customer_invitations
WHERE operator_user_id = (
  SELECT id FROM gh12_cleanup_users WHERE email = 'ggetto@gmail.com'
)
OR accepted_by IN (
  SELECT id
  FROM gh12_cleanup_users
  WHERE email IN (
    'sofaj99831@izkat.com',
    'morkdaork@me.com',
    'morkdaork02@gmail.com'
  )
)
OR lower(customer_email) IN (
  'sofaj99831@izkat.com',
  'morkdaork@me.com',
  'morkdaork02@gmail.com'
);

DELETE FROM public.contacts
WHERE user_id IN (
  SELECT id
  FROM gh12_cleanup_users
  WHERE email IN ('ggetto@gmail.com', 'sofaj99831@izkat.com')
)
OR linked_client_id IN (SELECT id FROM gh12_cleanup_clients);

DELETE FROM public.reward_points
WHERE client_id IN (SELECT id FROM gh12_cleanup_clients);

DELETE FROM public.appointments
WHERE client_id IN (SELECT id FROM gh12_cleanup_clients);

DELETE FROM public.visits
WHERE client_id IN (SELECT id FROM gh12_cleanup_clients);

DELETE FROM public.clients
WHERE id IN (SELECT id FROM gh12_cleanup_clients);

DELETE FROM public.profiles
WHERE id IN (
  SELECT id
  FROM gh12_cleanup_users
  WHERE email IN (
    'sofaj99831@izkat.com',
    'morkdaork@me.com',
    'morkdaork02@gmail.com'
  )
);

DELETE FROM auth.users
WHERE id IN (
  SELECT id
  FROM gh12_cleanup_users
  WHERE email IN (
    'sofaj99831@izkat.com',
    'morkdaork@me.com',
    'morkdaork02@gmail.com'
  )
);

COMMIT;
