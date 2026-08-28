-- ============================================================================
-- Gate 2 · Fase C — Funzioni helper usate dalle policy RLS
-- ----------------------------------------------------------------------------
-- `has_tenant_access(t, role)` — boolean
-- `has_tenant_any_staff_access(t)` — boolean (role = owner OR staff)
-- `current_tenant_ids_for_role(role)` — setof uuid
--
-- SECURITY DEFINER + search_path pinnato per evitare injection via search_path.
-- STABLE permette il caching per riga all'interno di una query (performance).
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.has_tenant_access(
  tenant_uuid uuid,
  required_role public.tenant_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = auth.uid()
      AND tenant_id = tenant_uuid
      AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_any_staff_access(tenant_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = auth.uid()
      AND tenant_id = tenant_uuid
      AND role IN ('owner','staff')
  );
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_ids_for_role(
  required_role public.tenant_role
)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id FROM public.tenant_memberships
  WHERE user_id = auth.uid() AND role = required_role;
$$;

-- GRANT execute agli ruoli applicativi
GRANT EXECUTE ON FUNCTION public.has_tenant_access(uuid, public.tenant_role)       TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.has_tenant_any_staff_access(uuid)                 TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.current_tenant_ids_for_role(public.tenant_role)   TO authenticated, anon, service_role;

-- Documentazione visibile in pgAdmin / Supabase Studio (SECURITY DEFINER /
-- search_path pinnato / STABLE sono riportati come nota tecnica su ciascuna).

COMMENT ON FUNCTION public.has_tenant_access(uuid, public.tenant_role) IS
$$Ritorna true se l'utente corrente (auth.uid()) ha una membership con il ruolo
esatto specificato nel tenant indicato.

Uso previsto: mattone primario delle policy RLS in Fase E per distinguere
staff da customer (es. `has_tenant_access(pets.tenant_id, 'customer')`).

Nota tecnica: SECURITY DEFINER con search_path='public' e STABLE. Il
DEFINER serve a bypassare RLS su tenant_memberships durante la valutazione
delle policy di altre tabelle; STABLE permette il caching per riga entro
la stessa query.$$;

COMMENT ON FUNCTION public.has_tenant_any_staff_access(uuid) IS
$$Ritorna true se l'utente corrente ha ruolo owner OR staff nel tenant
indicato. Shortcut di `has_tenant_access(t, 'owner') OR has_tenant_access(t, 'staff')`.

Uso previsto: policy "staff ALL" nella Fase E — tutte le tabelle di dominio
permettono lettura/scrittura completa allo staff/owner del tenant.

Nota tecnica: SECURITY DEFINER, search_path='public', STABLE.$$;

COMMENT ON FUNCTION public.current_tenant_ids_for_role(public.tenant_role) IS
$$Ritorna l'insieme dei tenant_id in cui l'utente corrente ha il ruolo
specificato.

API riservata per uso futuro: non referenziata dalle policy di Gate 2.
Prevista per scenari cross-tenant come dashboard multi-tenant, picker di
contesto ("scegli in quale salone entrare"), aggregazioni su più tenant di
un utente con più membership. Mantenuta qui per allineamento con `02-database.md`
e `03-auth-e-rls.md` del design handoff.

Nota tecnica: SECURITY DEFINER, search_path='public', STABLE.$$;

COMMIT;
