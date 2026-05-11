-- Migration: enforce staff-only access to operator_notes and internal_notes
-- Date: 11 maggio 2026
-- Context: post terzo round con Davide e Roby + verifica schema demo.
--
-- Le RLS attuali (customers_self_update, pets_customer_update) permettono al
-- customer di modificare via UPDATE i campi pensati come staff-only:
-- customers.operator_notes e pets.internal_notes.
--
-- PostgreSQL non supporta RLS a livello colonna. Enforcement implementato via
-- trigger BEFORE UPDATE che, se l'attore corrente non ha staff access sul
-- tenant del record, ripristina il valore OLD dei campi protetti — anche se
-- il client ha tentato di scrivere un nuovo valore.
--
-- pets.owner_notes resta liberamente modificabile dal customer (è il senso
-- della distinzione owner/internal sui pet, vedi bundle Design 04-schermate.md
-- §04.2 e risposta salone 11 maggio 2026 sezione 8).
--
-- Helper utilizzato: public.has_tenant_any_staff_access(uuid) — già installato
-- in 20260424124000_helpers_has_tenant_access.sql.

BEGIN;

-- ============================================================================
-- customers.operator_notes — staff-only enforcement
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_customers_operator_notes_staff_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Se l'attore non ha staff access sul tenant del record, qualunque scrittura
  -- su operator_notes viene silenziosamente ignorata mantenendo il valore
  -- precedente. Lo staff (owner o staff) passa indisturbato.
  IF NOT public.has_tenant_any_staff_access(NEW.tenant_id) THEN
    NEW.operator_notes := OLD.operator_notes;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_customers_operator_notes_staff_only() IS
  'Column-level enforcement (BEFORE UPDATE on customers): customer cannot modify operator_notes. Reverts to OLD value when actor lacks staff access on the tenant. Staff users pass through unchanged.';

DROP TRIGGER IF EXISTS trg_customers_protect_operator_notes ON public.customers;
CREATE TRIGGER trg_customers_protect_operator_notes
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_customers_operator_notes_staff_only();

-- ============================================================================
-- pets.internal_notes — staff-only enforcement
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_pets_internal_notes_staff_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_tenant_any_staff_access(NEW.tenant_id) THEN
    NEW.internal_notes := OLD.internal_notes;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_pets_internal_notes_staff_only() IS
  'Column-level enforcement (BEFORE UPDATE on pets): customer cannot modify internal_notes. Reverts to OLD value when actor lacks staff access on the tenant. Staff users pass through unchanged. pets.owner_notes remains customer-editable.';

DROP TRIGGER IF EXISTS trg_pets_protect_internal_notes ON public.pets;
CREATE TRIGGER trg_pets_protect_internal_notes
  BEFORE UPDATE ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_pets_internal_notes_staff_only();

COMMIT;
