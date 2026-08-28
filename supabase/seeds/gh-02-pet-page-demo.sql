-- Fonte: GH-02 A4, incarico Luigi 18/8/2026.
-- Seed manuale idempotente destinato esclusivamente a `grooming-hub-demo`.
-- Tutti i testi inseriti sono marcati come demo per non sembrare dati reali.

DO $$
DECLARE
  v_tenant_id uuid;
  v_mario_id uuid;
  v_pepe_id uuid;
  v_luna_id uuid;
BEGIN
  SELECT id INTO v_tenant_id
  FROM public.tenants
  WHERE slug = 'grooming-hub';

  SELECT id INTO v_mario_id
  FROM auth.users
  WHERE email = 'mario.rossi@test.example';

  IF v_tenant_id IS NULL OR v_mario_id IS NULL THEN
    RAISE EXCEPTION 'GH-02 demo seed guard failed: demo tenant or Mario test user missing';
  END IF;

  SELECT id INTO v_pepe_id
  FROM public.pets
  WHERE tenant_id = v_tenant_id AND owner_user_id = v_mario_id AND name = 'Pepe';

  SELECT id INTO v_luna_id
  FROM public.pets
  WHERE tenant_id = v_tenant_id AND owner_user_id = v_mario_id AND name = 'Luna';

  IF v_pepe_id IS NULL OR v_luna_id IS NULL THEN
    RAISE EXCEPTION 'GH-02 demo seed guard failed: Pepe or Luna test pet missing';
  END IF;

  UPDATE public.pets
  SET
    coat_preferences = to_jsonb('[DEMO GH-02] Spazzolatura delicata; asciugatura tiepida e breve.'::text),
    owner_notes = '[DEMO GH-02] Pepe si tranquillizza se viene salutato prima del trattamento.'
  WHERE id = v_pepe_id;

  UPDATE public.pets
  SET
    coat_preferences = to_jsonb('[DEMO GH-02] Pettinatura accurata; evitare aria troppo calda sul muso.'::text),
    owner_notes = '[DEMO GH-02] Luna preferisce pause brevi durante l asciugatura.'
  WHERE id = v_luna_id;

  INSERT INTO public.visits (
    id, tenant_id, pet_id, date, treatments, issues, cost, discount_percent
  ) VALUES
    ('gh02-demo-pepe-20260808', v_tenant_id, v_pepe_id, '2026-08-08',
      '[DEMO] Bagno delicato', 'Dato dimostrativo GH-02: trattamento tranquillo.', 28.00, 0),
    ('gh02-demo-pepe-20260712', v_tenant_id, v_pepe_id, '2026-07-12',
      '[DEMO] Pulizia pieghe e unghie', 'Dato dimostrativo GH-02: nessuna criticita.', 22.00, 10),
    ('gh02-demo-luna-20260804', v_tenant_id, v_luna_id, '2026-08-04',
      '[DEMO] Bagno e spazzolatura', 'Dato dimostrativo GH-02: pausa durante l asciugatura.', 42.00, 0),
    ('gh02-demo-luna-20260710', v_tenant_id, v_luna_id, '2026-07-10',
      '[DEMO] Trattamento mantello', 'Dato dimostrativo GH-02: pelo in buone condizioni.', 48.00, 0),
    ('gh02-demo-luna-20260618', v_tenant_id, v_luna_id, '2026-06-18',
      '[DEMO] Bagno completo', 'Dato dimostrativo GH-02: visita storica fittizia.', 38.00, 0)
  ON CONFLICT (id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    pet_id = EXCLUDED.pet_id,
    date = EXCLUDED.date,
    treatments = EXCLUDED.treatments,
    issues = EXCLUDED.issues,
    cost = EXCLUDED.cost,
    discount_percent = EXCLUDED.discount_percent;
END $$;
