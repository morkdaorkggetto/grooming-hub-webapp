--
-- PostgreSQL database dump
--

-- \restrict vKRaDFfGC9J5u6rpWa0aaaFEXT4e5IeROUUseKJl8vxoDIWIv1l9vpbLpcSm6s6

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: accept_customer_invite("text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."accept_customer_invite"("p_token" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_invitation public.customer_invitations%ROWTYPE;
  v_user_id UUID := auth.uid();
  v_user_email TEXT;
  v_link_id TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Devi effettuare l''accesso per accettare l''invito.';
  END IF;

  SELECT *
  INTO v_invitation
  FROM public.customer_invitations
  WHERE token = p_token
    AND accepted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invito cliente non valido o scaduto.';
  END IF;

  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = v_user_id
      AND p.role = 'operator'
  ) THEN
    RAISE EXCEPTION 'Questo account e'' un account operatore. Usa o crea un account cliente separato.';
  END IF;

  INSERT INTO public.profiles (id, business_name, role)
  VALUES (v_user_id, COALESCE(split_part(v_user_email, '@', 1), 'Cliente'), 'customer')
  ON CONFLICT (id) DO UPDATE
    SET role = 'customer';

  v_link_id := 'ccl_' || replace(gen_random_uuid()::TEXT, '-', '');

  INSERT INTO public.customer_client_links (id, operator_user_id, customer_user_id, client_id)
  VALUES (v_link_id, v_invitation.operator_user_id, v_user_id, v_invitation.client_id)
  ON CONFLICT (customer_user_id, client_id) DO NOTHING;

  UPDATE public.customer_invitations
  SET accepted_by = v_user_id,
      accepted_at = NOW()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'clientId', v_invitation.client_id,
    'operatorUserId', v_invitation.operator_user_id,
    'customerUserId', v_user_id
  );
END;
$$;


ALTER FUNCTION "public"."accept_customer_invite"("p_token" "text") OWNER TO "postgres";

--
-- Name: get_public_pet_card("text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."get_public_pet_card"("p_qr_token" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_client RECORD;
  v_visits_total INTEGER := 0;
  v_visits_12 INTEGER := 0;
  v_visits_24 INTEGER := 0;
  v_visits_36 INTEGER := 0;
  v_reward_points INTEGER := 0;
  v_use_points BOOLEAN := FALSE;
  v_current_tier TEXT := 'base';
  v_next_tier TEXT := 'bronze';
  v_remaining_visits INTEGER := 12;
  v_remaining_points INTEGER := 100;
BEGIN
  IF p_qr_token IS NULL OR btrim(p_qr_token) = '' THEN
    RETURN NULL;
  END IF;

  SELECT
    c.id,
    c.qr_token,
    c.name,
    c.breed,
    c.photo,
    COALESCE(p.business_name, 'Grooming Hub') AS business_name
  INTO v_client
  FROM public.clients c
  LEFT JOIN public.profiles p ON p.id = c.user_id
  WHERE c.qr_token = p_qr_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (
      WHERE v.date >= (CURRENT_DATE - INTERVAL '12 months')::DATE
    )::INTEGER,
    COUNT(*) FILTER (
      WHERE v.date >= (CURRENT_DATE - INTERVAL '24 months')::DATE
    )::INTEGER,
    COUNT(*) FILTER (
      WHERE v.date >= (CURRENT_DATE - INTERVAL '36 months')::DATE
    )::INTEGER
  INTO
    v_visits_total,
    v_visits_12,
    v_visits_24,
    v_visits_36
  FROM public.visits v
  WHERE v.client_id = v_client.id;

  SELECT COALESCE(SUM(rp.points), 0)::INTEGER
  INTO v_reward_points
  FROM public.reward_points rp
  WHERE rp.client_id = v_client.id;

  v_use_points := v_reward_points > 0;

  IF v_use_points THEN
    IF v_reward_points >= 500 THEN
      v_current_tier := 'gold';
      v_next_tier := NULL;
      v_remaining_points := 0;
    ELSIF v_reward_points >= 250 THEN
      v_current_tier := 'silver';
      v_next_tier := 'gold';
      v_remaining_points := GREATEST(0, 500 - v_reward_points);
    ELSIF v_reward_points >= 100 THEN
      v_current_tier := 'bronze';
      v_next_tier := 'silver';
      v_remaining_points := GREATEST(0, 250 - v_reward_points);
    ELSE
      v_current_tier := 'base';
      v_next_tier := 'bronze';
      v_remaining_points := GREATEST(0, 100 - v_reward_points);
    END IF;

    v_remaining_visits := 0;
  ELSE
    IF v_visits_36 >= 36 THEN
      v_current_tier := 'gold';
      v_next_tier := NULL;
      v_remaining_visits := 0;
    ELSIF v_visits_24 >= 24 THEN
      v_current_tier := 'silver';
      v_next_tier := 'gold';
      v_remaining_visits := GREATEST(0, 36 - v_visits_36);
    ELSIF v_visits_12 >= 12 THEN
      v_current_tier := 'bronze';
      v_next_tier := 'silver';
      v_remaining_visits := GREATEST(0, 24 - v_visits_24);
    ELSE
      v_current_tier := 'base';
      v_next_tier := 'bronze';
      v_remaining_visits := GREATEST(0, 12 - v_visits_12);
    END IF;

    v_remaining_points := 0;
  END IF;

  RETURN jsonb_build_object(
    'id', v_client.id,
    'qrToken', v_client.qr_token,
    'name', v_client.name,
    'breed', v_client.breed,
    'photo', v_client.photo,
    'businessName', v_client.business_name,
    'visitsCount', v_visits_total,
    'visits12Months', v_visits_12,
    'visits24Months', v_visits_24,
    'visits36Months', v_visits_36,
    'rewardPointsTotal', v_reward_points,
    'fidelityMode', CASE WHEN v_use_points THEN 'points' ELSE 'visits' END,
    'fidelityTier', v_current_tier,
    'nextTier', v_next_tier,
    'remainingVisits', v_remaining_visits,
    'remainingPoints', v_remaining_points
  );
END;
$$;


ALTER FUNCTION "public"."get_public_pet_card"("p_qr_token" "text") OWNER TO "postgres";

--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "client_id" "text" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 60 NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "notes" "text",
    "external_calendar" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "appointment_source" "text" DEFAULT 'operator'::"text" NOT NULL,
    "approval_status" "text" DEFAULT 'approved'::"text" NOT NULL,
    "requested_by_customer_id" "uuid",
    CONSTRAINT "appointments_approval_status_valid" CHECK (("approval_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "appointments_duration_positive" CHECK ((("duration_minutes" > 0) AND ("duration_minutes" <= 480))),
    CONSTRAINT "appointments_external_calendar_valid" CHECK ((("external_calendar" IS NULL) OR ("external_calendar" = ANY (ARRAY['google'::"text", 'icloud'::"text"])))),
    CONSTRAINT "appointments_source_valid" CHECK (("appointment_source" = ANY (ARRAY['operator'::"text", 'customer'::"text"]))),
    CONSTRAINT "appointments_status_valid" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text", 'cancelled'::"text", 'no_show'::"text"])))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "breed" "text",
    "owner" "text" NOT NULL,
    "phone" "text",
    "notes" "text",
    "photo" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "no_show_score" integer DEFAULT 0 NOT NULL,
    "is_blacklisted" boolean DEFAULT false NOT NULL,
    "qr_token" "text" NOT NULL
);


ALTER TABLE "public"."clients" OWNER TO "postgres";

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "pet_name" "text" NOT NULL,
    "owner_name" "text",
    "phone" "text",
    "source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "notes" "text",
    "linked_client_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contacts_source_check" CHECK (("source" = ANY (ARRAY['manual'::"text", 'whatsapp'::"text", 'qr'::"text"]))),
    CONSTRAINT "contacts_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'converted'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";

--
-- Name: customer_client_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."customer_client_links" (
    "id" "text" NOT NULL,
    "operator_user_id" "uuid" NOT NULL,
    "customer_user_id" "uuid" NOT NULL,
    "client_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_client_links" OWNER TO "postgres";

--
-- Name: customer_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."customer_invitations" (
    "id" "text" NOT NULL,
    "token" "text" NOT NULL,
    "operator_user_id" "uuid" NOT NULL,
    "client_id" "text" NOT NULL,
    "customer_email" "text",
    "accepted_by" "uuid",
    "accepted_at" timestamp with time zone,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_invitations" OWNER TO "postgres";

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "business_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "role" "text" DEFAULT 'operator'::"text" NOT NULL,
    CONSTRAINT "profiles_role_valid" CHECK (("role" = ANY (ARRAY['operator'::"text", 'customer'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";

--
-- Name: reward_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."reward_points" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "client_id" "text" NOT NULL,
    "points" integer NOT NULL,
    "reason" "text" DEFAULT 'manual'::"text" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reward_points_points_check" CHECK (("points" <> 0)),
    CONSTRAINT "reward_points_reason_check" CHECK (("reason" = ANY (ARRAY['visit'::"text", 'manual'::"text", 'promotion'::"text", 'redeem'::"text", 'correction'::"text"])))
);


ALTER TABLE "public"."reward_points" OWNER TO "postgres";

--
-- Name: visits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."visits" (
    "id" "text" NOT NULL,
    "client_id" "text" NOT NULL,
    "date" "date" NOT NULL,
    "treatments" "text",
    "issues" "text",
    "cost" numeric(10,2) NOT NULL,
    "discount_percent" numeric(5,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."visits" OWNER TO "postgres";

--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");


--
-- Name: customer_client_links customer_client_links_customer_user_id_client_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_client_links"
    ADD CONSTRAINT "customer_client_links_customer_user_id_client_id_key" UNIQUE ("customer_user_id", "client_id");


--
-- Name: customer_client_links customer_client_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_client_links"
    ADD CONSTRAINT "customer_client_links_pkey" PRIMARY KEY ("id");


--
-- Name: customer_invitations customer_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_invitations"
    ADD CONSTRAINT "customer_invitations_pkey" PRIMARY KEY ("id");


--
-- Name: customer_invitations customer_invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_invitations"
    ADD CONSTRAINT "customer_invitations_token_key" UNIQUE ("token");


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");


--
-- Name: reward_points reward_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."reward_points"
    ADD CONSTRAINT "reward_points_pkey" PRIMARY KEY ("id");


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("id");


--
-- Name: idx_appointments_appointment_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_appointments_appointment_source" ON "public"."appointments" USING "btree" ("appointment_source");


--
-- Name: idx_appointments_approval_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_appointments_approval_status" ON "public"."appointments" USING "btree" ("approval_status");


--
-- Name: idx_appointments_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_appointments_client_id" ON "public"."appointments" USING "btree" ("client_id");


--
-- Name: idx_appointments_requested_by_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_appointments_requested_by_customer" ON "public"."appointments" USING "btree" ("requested_by_customer_id");


--
-- Name: idx_appointments_scheduled_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_appointments_scheduled_at" ON "public"."appointments" USING "btree" ("scheduled_at");


--
-- Name: idx_appointments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_appointments_user_id" ON "public"."appointments" USING "btree" ("user_id");


--
-- Name: idx_clients_blacklist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_clients_blacklist" ON "public"."clients" USING "btree" ("is_blacklisted", "no_show_score");


--
-- Name: idx_clients_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_clients_name" ON "public"."clients" USING "btree" ("name");


--
-- Name: idx_clients_qr_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "idx_clients_qr_token" ON "public"."clients" USING "btree" ("qr_token");


--
-- Name: idx_clients_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_clients_user_id" ON "public"."clients" USING "btree" ("user_id");


--
-- Name: idx_contacts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_contacts_created_at" ON "public"."contacts" USING "btree" ("created_at" DESC);


--
-- Name: idx_contacts_linked_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_contacts_linked_client_id" ON "public"."contacts" USING "btree" ("linked_client_id");


--
-- Name: idx_contacts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_contacts_status" ON "public"."contacts" USING "btree" ("status");


--
-- Name: idx_contacts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_contacts_user_id" ON "public"."contacts" USING "btree" ("user_id");


--
-- Name: idx_customer_client_links_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_customer_client_links_client" ON "public"."customer_client_links" USING "btree" ("client_id");


--
-- Name: idx_customer_client_links_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_customer_client_links_customer" ON "public"."customer_client_links" USING "btree" ("customer_user_id");


--
-- Name: idx_customer_client_links_operator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_customer_client_links_operator" ON "public"."customer_client_links" USING "btree" ("operator_user_id");


--
-- Name: idx_customer_invitations_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_customer_invitations_client" ON "public"."customer_invitations" USING "btree" ("client_id");


--
-- Name: idx_customer_invitations_operator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_customer_invitations_operator" ON "public"."customer_invitations" USING "btree" ("operator_user_id");


--
-- Name: idx_customer_invitations_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_customer_invitations_token" ON "public"."customer_invitations" USING "btree" ("token");


--
-- Name: idx_reward_points_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_reward_points_client_id" ON "public"."reward_points" USING "btree" ("client_id");


--
-- Name: idx_reward_points_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_reward_points_created_at" ON "public"."reward_points" USING "btree" ("created_at" DESC);


--
-- Name: idx_reward_points_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_reward_points_user_id" ON "public"."reward_points" USING "btree" ("user_id");


--
-- Name: idx_visits_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_visits_client_id" ON "public"."visits" USING "btree" ("client_id");


--
-- Name: idx_visits_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_visits_date" ON "public"."visits" USING "btree" ("date" DESC);


--
-- Name: appointments update_appointments_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_appointments_timestamp" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();


--
-- Name: clients update_clients_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_clients_timestamp" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();


--
-- Name: contacts update_contacts_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_contacts_timestamp" BEFORE UPDATE ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();


--
-- Name: visits update_visits_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_visits_timestamp" BEFORE UPDATE ON "public"."visits" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;


--
-- Name: appointments appointments_requested_by_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_requested_by_customer_id_fkey" FOREIGN KEY ("requested_by_customer_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;


--
-- Name: appointments appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: contacts contacts_linked_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_linked_client_id_fkey" FOREIGN KEY ("linked_client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;


--
-- Name: contacts contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: customer_client_links customer_client_links_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_client_links"
    ADD CONSTRAINT "customer_client_links_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;


--
-- Name: customer_client_links customer_client_links_customer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_client_links"
    ADD CONSTRAINT "customer_client_links_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: customer_client_links customer_client_links_operator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_client_links"
    ADD CONSTRAINT "customer_client_links_operator_user_id_fkey" FOREIGN KEY ("operator_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: customer_invitations customer_invitations_accepted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_invitations"
    ADD CONSTRAINT "customer_invitations_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;


--
-- Name: customer_invitations customer_invitations_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_invitations"
    ADD CONSTRAINT "customer_invitations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;


--
-- Name: customer_invitations customer_invitations_operator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."customer_invitations"
    ADD CONSTRAINT "customer_invitations_operator_user_id_fkey" FOREIGN KEY ("operator_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: reward_points reward_points_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."reward_points"
    ADD CONSTRAINT "reward_points_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;


--
-- Name: reward_points reward_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."reward_points"
    ADD CONSTRAINT "reward_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: visits visits_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;


--
-- Name: appointments Customers can request linked appointments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Customers can request linked appointments" ON "public"."appointments" FOR INSERT WITH CHECK ((("appointment_source" = 'customer'::"text") AND ("approval_status" = 'pending'::"text") AND ("status" = 'scheduled'::"text") AND ("requested_by_customer_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."customer_client_links" "ccl"
  WHERE (("ccl"."client_id" = "appointments"."client_id") AND ("ccl"."customer_user_id" = "auth"."uid"()) AND ("ccl"."operator_user_id" = "appointments"."user_id"))))));


--
-- Name: appointments Customers can view linked appointments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Customers can view linked appointments" ON "public"."appointments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."customer_client_links" "ccl"
  WHERE (("ccl"."client_id" = "appointments"."client_id") AND ("ccl"."customer_user_id" = "auth"."uid"())))));


--
-- Name: clients Customers can view linked clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Customers can view linked clients" ON "public"."clients" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."customer_client_links" "ccl"
  WHERE (("ccl"."client_id" = "clients"."id") AND ("ccl"."customer_user_id" = "auth"."uid"())))));


--
-- Name: reward_points Customers can view linked reward points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Customers can view linked reward points" ON "public"."reward_points" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."customer_client_links" "ccl"
  WHERE (("ccl"."client_id" = "reward_points"."client_id") AND ("ccl"."customer_user_id" = "auth"."uid"())))));


--
-- Name: visits Customers can view visits of linked clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Customers can view visits of linked clients" ON "public"."visits" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."customer_client_links" "ccl"
  WHERE (("ccl"."client_id" = "visits"."client_id") AND ("ccl"."customer_user_id" = "auth"."uid"())))));


--
-- Name: customer_client_links Operators and customers can remove client links; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Operators and customers can remove client links" ON "public"."customer_client_links" FOR DELETE USING ((("auth"."uid"() = "operator_user_id") OR ("auth"."uid"() = "customer_user_id")));


--
-- Name: customer_client_links Operators and customers can view client links; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Operators and customers can view client links" ON "public"."customer_client_links" FOR SELECT USING ((("auth"."uid"() = "operator_user_id") OR ("auth"."uid"() = "customer_user_id")));


--
-- Name: customer_client_links Operators can create client links; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Operators can create client links" ON "public"."customer_client_links" FOR INSERT WITH CHECK ((("auth"."uid"() = "operator_user_id") AND (EXISTS ( SELECT 1
   FROM "public"."clients" "c"
  WHERE (("c"."id" = "customer_client_links"."client_id") AND ("c"."user_id" = "auth"."uid"()))))));


--
-- Name: customer_invitations Operators can create customer invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Operators can create customer invitations" ON "public"."customer_invitations" FOR INSERT WITH CHECK ((("auth"."uid"() = "operator_user_id") AND (EXISTS ( SELECT 1
   FROM "public"."clients" "c"
  WHERE (("c"."id" = "customer_invitations"."client_id") AND ("c"."user_id" = "auth"."uid"()))))));


--
-- Name: customer_invitations Operators can delete their customer invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Operators can delete their customer invitations" ON "public"."customer_invitations" FOR DELETE USING (("auth"."uid"() = "operator_user_id"));


--
-- Name: customer_invitations Operators can view their customer invitations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Operators can view their customer invitations" ON "public"."customer_invitations" FOR SELECT USING (("auth"."uid"() = "operator_user_id"));


--
-- Name: appointments Users can delete their own appointments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own appointments" ON "public"."appointments" FOR DELETE USING (("auth"."uid"() = "user_id"));


--
-- Name: clients Users can delete their own clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own clients" ON "public"."clients" FOR DELETE USING (("auth"."uid"() = "user_id"));


--
-- Name: contacts Users can delete their own contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own contacts" ON "public"."contacts" FOR DELETE USING (("auth"."uid"() = "user_id"));


--
-- Name: reward_points Users can delete their own reward points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own reward points" ON "public"."reward_points" FOR DELETE USING (("auth"."uid"() = "user_id"));


--
-- Name: visits Users can delete visits of their clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete visits of their clients" ON "public"."visits" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."id" = "visits"."client_id") AND ("clients"."user_id" = "auth"."uid"())))));


--
-- Name: appointments Users can insert their own appointments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own appointments" ON "public"."appointments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: clients Users can insert their own clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own clients" ON "public"."clients" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: contacts Users can insert their own contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own contacts" ON "public"."contacts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: reward_points Users can insert their own reward points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own reward points" ON "public"."reward_points" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."clients" "c"
  WHERE (("c"."id" = "reward_points"."client_id") AND ("c"."user_id" = "auth"."uid"()))))));


--
-- Name: visits Users can insert visits to their clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert visits to their clients" ON "public"."visits" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."id" = "visits"."client_id") AND ("clients"."user_id" = "auth"."uid"())))));


--
-- Name: appointments Users can update their own appointments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own appointments" ON "public"."appointments" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: clients Users can update their own clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own clients" ON "public"."clients" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: contacts Users can update their own contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own contacts" ON "public"."contacts" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: visits Users can update visits of their clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update visits of their clients" ON "public"."visits" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."id" = "visits"."client_id") AND ("clients"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."id" = "visits"."client_id") AND ("clients"."user_id" = "auth"."uid"())))));


--
-- Name: appointments Users can view their own appointments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own appointments" ON "public"."appointments" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: clients Users can view their own clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own clients" ON "public"."clients" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: contacts Users can view their own contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own contacts" ON "public"."contacts" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));


--
-- Name: reward_points Users can view their own reward points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own reward points" ON "public"."reward_points" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: visits Users can view visits of their clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view visits of their clients" ON "public"."visits" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."id" = "visits"."client_id") AND ("clients"."user_id" = "auth"."uid"())))));


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;

--
-- Name: contacts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_client_links; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."customer_client_links" ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_invitations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."customer_invitations" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: reward_points; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."reward_points" ENABLE ROW LEVEL SECURITY;

--
-- Name: visits; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."visits" ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "accept_customer_invite"("p_token" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."accept_customer_invite"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_customer_invite"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_customer_invite"("p_token" "text") TO "service_role";


--
-- Name: FUNCTION "get_public_pet_card"("p_qr_token" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_public_pet_card"("p_qr_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_pet_card"("p_qr_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_pet_card"("p_qr_token" "text") TO "service_role";


--
-- Name: FUNCTION "update_timestamp"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "service_role";


--
-- Name: TABLE "appointments"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";


--
-- Name: TABLE "clients"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";


--
-- Name: TABLE "contacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";


--
-- Name: TABLE "customer_client_links"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."customer_client_links" TO "anon";
GRANT ALL ON TABLE "public"."customer_client_links" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_client_links" TO "service_role";


--
-- Name: TABLE "customer_invitations"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."customer_invitations" TO "anon";
GRANT ALL ON TABLE "public"."customer_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_invitations" TO "service_role";


--
-- Name: TABLE "profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";


--
-- Name: TABLE "reward_points"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."reward_points" TO "anon";
GRANT ALL ON TABLE "public"."reward_points" TO "authenticated";
GRANT ALL ON TABLE "public"."reward_points" TO "service_role";


--
-- Name: TABLE "visits"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."visits" TO "anon";
GRANT ALL ON TABLE "public"."visits" TO "authenticated";
GRANT ALL ON TABLE "public"."visits" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- PostgreSQL database dump complete
--

-- \unrestrict vKRaDFfGC9J5u6rpWa0aaaFEXT4e5IeROUUseKJl8vxoDIWIv1l9vpbLpcSm6s6

