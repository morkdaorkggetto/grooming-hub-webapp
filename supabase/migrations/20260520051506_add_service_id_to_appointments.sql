-- Migration: aggiunge FK appointments.service_id → services.id
-- Date: 2026-05-20 (sessione Step 6 fast-track, applicata via MCP)
-- Registrata in schema_migrations come 20260520051506 (timestamp generato
-- da mcp__supabase__apply_migration al runtime; il filename qui lo replica).
--
-- Context: il bundle Design (02-database.md, 04-schermate.md §04.3) prevedeva
-- la FK appointments→services, ma al Gate 2 la tabella `services` è stata
-- creata (M16) senza che `appointments` venisse aggiornata col FK. Buco
-- chiuso ora — prerequisito per /u/home (next appointment renderizza nome
-- servizio) e Step 8 Booking (selezione servizio in fase di prenotazione).
--
-- ON DELETE SET NULL: se un service viene rimosso, gli appointment storici
-- ne preservano la traccia senza FK rotta. Niente backfill dei 7 appointment
-- legacy: restano con service_id NULL (il loro "servizio" era nel campo
-- text `notes`, pattern pre-Gate-2). Il frontend mostra il nome servizio
-- solo se service_id è popolato.

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS appointments_service_id_idx
  ON public.appointments (service_id)
  WHERE service_id IS NOT NULL;
