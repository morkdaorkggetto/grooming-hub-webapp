-- GH-12 Atto 2: rimozione delle schede legacy non recuperabili.
-- Fonte: docs/incarichi/GH-12-chiusura-prova-generale.md.
-- Decisione Luigi + Roby del 24/08/2026.
--
-- Storage e escluso: due oggetti client-photos resteranno orfani e dovranno
-- essere rimossi con un gesto separato via Storage API. Una terza foto e un
-- data URL incorporato nella riga pet e viene eliminata con la riga stessa.
--
-- L'atto ammette solo lo stato iniziale misurato o lo stato finale atteso.
-- Ogni stato intermedio/divergente blocca atomicamente la transazione.

BEGIN;

CREATE TEMPORARY TABLE gh12_unreachable_customers ON COMMIT DROP AS
WITH missing_phone_customers AS (
  SELECT c.id
  FROM public.customers c
  WHERE (c.phone IS NULL OR btrim(c.phone) = '')
    AND EXISTS (
      SELECT 1
      FROM public.pets p
      WHERE p.customer_id = c.id
        AND p.owner_user_id = 'cb7f316e-65b0-4419-a6df-56367a3d3c0a'::uuid
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.pets p
      WHERE p.customer_id = c.id
        AND p.owner_user_id IS DISTINCT FROM
          'cb7f316e-65b0-4419-a6df-56367a3d3c0a'::uuid
    )
),
conflicting_customer AS (
  SELECT c.id
  FROM public.customers c
  WHERE c.id = '674521d8-b4a9-4543-8377-6a50308073e3'::uuid
)
SELECT id, 'missing_phone'::text AS reason FROM missing_phone_customers
UNION ALL
SELECT id, 'conflict'::text AS reason FROM conflicting_customer;

CREATE TEMPORARY TABLE gh12_unreachable_pets ON COMMIT DROP AS
SELECT p.*, c.reason
FROM public.pets p
JOIN gh12_unreachable_customers c ON c.id = p.customer_id;

CREATE TEMPORARY TABLE gh12_unreachable_contacts ON COMMIT DROP AS
SELECT c.id
FROM public.contacts c
WHERE c.linked_pet_id IN (SELECT id FROM gh12_unreachable_pets)
   OR c.id = 'ff68e870-19af-4233-ac6f-dc9ba83f4eeb';

DO $$
DECLARE
  v_customers integer;
  v_pets integer;
  v_visits integer;
  v_contacts integer;
  v_missing_phone integer;
  v_a_customers integer;
  v_a_pets integer;
  v_a_visits integer;
  v_a_contacts integer;
  v_a_appointments integer;
  v_a_rewards integer;
  v_a_photos integer;
  v_b_customers integer;
  v_b_expected_pet integer;
  v_b_customer_pets integer;
  v_b_visits integer;
  v_b_contact integer;
  v_b_appointments integer;
  v_b_rewards integer;
  v_b_photos integer;
  v_target_auth_links integer;
  v_protected_in_scope integer;
  v_protected_pets integer;
  v_protected_visits integer;
  v_is_before boolean;
  v_is_after boolean;
BEGIN
  SELECT count(*) INTO v_customers FROM public.customers;
  SELECT count(*) INTO v_pets FROM public.pets;
  SELECT count(*) INTO v_visits FROM public.visits;
  SELECT count(*) INTO v_contacts FROM public.contacts;
  SELECT count(*) INTO v_missing_phone
  FROM public.customers WHERE phone IS NULL OR btrim(phone) = '';

  SELECT count(*) INTO v_a_customers
  FROM gh12_unreachable_customers WHERE reason = 'missing_phone';
  SELECT count(*) INTO v_a_pets
  FROM gh12_unreachable_pets WHERE reason = 'missing_phone';
  SELECT count(*) INTO v_a_visits
  FROM public.visits
  WHERE pet_id IN (
    SELECT id FROM gh12_unreachable_pets WHERE reason = 'missing_phone'
  );
  SELECT count(*) INTO v_a_contacts
  FROM public.contacts
  WHERE linked_pet_id IN (
    SELECT id FROM gh12_unreachable_pets WHERE reason = 'missing_phone'
  );
  SELECT count(*) INTO v_a_appointments
  FROM public.appointments
  WHERE pet_id IN (
    SELECT id FROM gh12_unreachable_pets WHERE reason = 'missing_phone'
  );
  SELECT count(*) INTO v_a_rewards
  FROM public.reward_points
  WHERE pet_id IN (
    SELECT id FROM gh12_unreachable_pets WHERE reason = 'missing_phone'
  );
  SELECT count(*) INTO v_a_photos
  FROM gh12_unreachable_pets
  WHERE reason = 'missing_phone'
    AND NULLIF(btrim(photo_url), '') IS NOT NULL;

  SELECT count(*) INTO v_b_customers
  FROM gh12_unreachable_customers WHERE reason = 'conflict';
  SELECT count(*) INTO v_b_expected_pet
  FROM gh12_unreachable_pets
  WHERE id = 'c3614527-8945-4db8-bb13-f683b92ad001'::uuid;
  SELECT count(*) INTO v_b_customer_pets
  FROM gh12_unreachable_pets WHERE reason = 'conflict';
  SELECT count(*) INTO v_b_visits
  FROM public.visits
  WHERE pet_id = 'c3614527-8945-4db8-bb13-f683b92ad001'::uuid;
  SELECT count(*) INTO v_b_contact
  FROM gh12_unreachable_contacts
  WHERE id = 'ff68e870-19af-4233-ac6f-dc9ba83f4eeb';
  SELECT count(*) INTO v_b_appointments
  FROM public.appointments
  WHERE pet_id = 'c3614527-8945-4db8-bb13-f683b92ad001'::uuid;
  SELECT count(*) INTO v_b_rewards
  FROM public.reward_points
  WHERE pet_id = 'c3614527-8945-4db8-bb13-f683b92ad001'::uuid;
  SELECT count(*) INTO v_b_photos
  FROM gh12_unreachable_pets
  WHERE id = 'c3614527-8945-4db8-bb13-f683b92ad001'::uuid
    AND NULLIF(btrim(photo_url), '') IS NOT NULL;

  SELECT count(*) INTO v_target_auth_links
  FROM public.customers
  WHERE id IN (SELECT id FROM gh12_unreachable_customers)
    AND user_id IS NOT NULL;

  SELECT count(*) INTO v_protected_in_scope
  FROM gh12_unreachable_customers
  WHERE id = '70097dcd-e5aa-4ceb-a15e-3fef04d09960'::uuid;
  SELECT count(*) INTO v_protected_pets
  FROM public.pets
  WHERE customer_id = '70097dcd-e5aa-4ceb-a15e-3fef04d09960'::uuid;
  SELECT count(*) INTO v_protected_visits
  FROM public.visits v
  JOIN public.pets p ON p.id = v.pet_id
  WHERE p.customer_id = '70097dcd-e5aa-4ceb-a15e-3fef04d09960'::uuid;

  IF v_protected_in_scope <> 0 THEN
    RAISE EXCEPTION 'GH-12 protected customer entered deletion scope';
  END IF;

  IF v_protected_pets <> 1 OR v_protected_visits <> 4 THEN
    RAISE EXCEPTION
      'GH-12 protected customer guard failed: pets %, visits %',
      v_protected_pets,
      v_protected_visits;
  END IF;

  v_is_before :=
    ROW(v_customers, v_pets, v_visits, v_contacts, v_missing_phone)
      = ROW(268, 290, 462, 295, 7)
    AND ROW(
      v_a_customers,
      v_a_pets,
      v_a_visits,
      v_a_contacts,
      v_a_appointments,
      v_a_rewards,
      v_a_photos
    ) = ROW(7, 7, 9, 7, 0, 0, 3)
    AND ROW(
      v_b_customers,
      v_b_expected_pet,
      v_b_customer_pets,
      v_b_visits,
      v_b_contact,
      v_b_appointments,
      v_b_rewards,
      v_b_photos,
      v_target_auth_links
    ) = ROW(1, 1, 1, 1, 1, 0, 0, 0, 0);

  v_is_after :=
    ROW(v_customers, v_pets, v_visits, v_contacts, v_missing_phone)
      = ROW(260, 282, 452, 287, 0)
    AND ROW(
      v_a_customers,
      v_a_pets,
      v_a_visits,
      v_a_contacts,
      v_a_appointments,
      v_a_rewards,
      v_a_photos,
      v_b_customers,
      v_b_expected_pet,
      v_b_customer_pets,
      v_b_visits,
      v_b_contact,
      v_b_appointments,
      v_b_rewards,
      v_b_photos,
      v_target_auth_links
    ) = ROW(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  IF NOT v_is_before AND NOT v_is_after THEN
    RAISE EXCEPTION
      'GH-12 unreachable-record guard failed: global %/%/%/% missing %, A %/%/%/%, B %/%/%',
      v_customers,
      v_pets,
      v_visits,
      v_contacts,
      v_missing_phone,
      v_a_customers,
      v_a_pets,
      v_a_visits,
      v_a_contacts,
      v_b_customers,
      v_b_expected_pet,
      v_b_contact;
  END IF;
END $$;

DELETE FROM public.contacts
WHERE id IN (SELECT id FROM gh12_unreachable_contacts);

DELETE FROM public.reward_points
WHERE pet_id IN (SELECT id FROM gh12_unreachable_pets);

DELETE FROM public.appointments
WHERE pet_id IN (SELECT id FROM gh12_unreachable_pets);

DELETE FROM public.visits
WHERE pet_id IN (SELECT id FROM gh12_unreachable_pets);

DELETE FROM public.pets
WHERE id IN (SELECT id FROM gh12_unreachable_pets);

DELETE FROM public.customers
WHERE id IN (SELECT id FROM gh12_unreachable_customers);

DO $$
DECLARE
  v_protected_pets integer;
  v_protected_visits integer;
BEGIN
  IF ROW(
    (SELECT count(*) FROM public.customers),
    (SELECT count(*) FROM public.pets),
    (SELECT count(*) FROM public.visits),
    (SELECT count(*) FROM public.contacts),
    (SELECT count(*) FROM public.customers WHERE phone IS NULL OR btrim(phone) = '')
  ) <> ROW(260, 282, 452, 287, 0) THEN
    RAISE EXCEPTION 'GH-12 post-condition cardinalities failed';
  END IF;

  SELECT count(*) INTO v_protected_pets
  FROM public.pets
  WHERE customer_id = '70097dcd-e5aa-4ceb-a15e-3fef04d09960'::uuid;
  SELECT count(*) INTO v_protected_visits
  FROM public.visits v
  JOIN public.pets p ON p.id = v.pet_id
  WHERE p.customer_id = '70097dcd-e5aa-4ceb-a15e-3fef04d09960'::uuid;

  IF v_protected_pets <> 1 OR v_protected_visits <> 4 THEN
    RAISE EXCEPTION 'GH-12 protected customer changed during deletion';
  END IF;
END $$;

COMMIT;
