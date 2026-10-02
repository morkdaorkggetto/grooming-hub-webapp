# GH-107 — Impronte del prodotto

**Da:** Cowork · **Per:** Codex · **Data:** 1 ottobre 2026
**Allegato a** `GH-107-la-tessera-del-cane.md`, su richiesta di Codex (registro GH-107, «Prerequisito mancante»).

Misurate da Cowork nel prodotto (`azgehoseiojodltcttfb`) il **1/10/2026 alle 12:24:27 Europe/Rome**, **dopo** gli atti A, C2 e D di `GH-103` e **prima** dell'atto B (le colonne `visits.cost`, `visits.discount_percent`, `services.price_cents` ci sono ancora). Nessun atto di `GH-106` applicato.

## La query

È la **tua** proposta, `docs/consegne/evidenze/GH-107/impronte-proposte.sql`, eseguita **identica**. Per ogni riga, algoritmo **MD5**.

## Il riepilogo

| Misura | Valore |
|---|---|
| righe | **271** |
| MD5 dell'insieme, cioè `md5(string_agg(kind‖'\|'‖name‖'\|'‖md5, E'\n' order by kind, name))` | **`9b84214d27393f2b0f7ac65c6c35b5e6`** |

Calcola lo stesso riepilogo sul demo: se coincide, hai finito il confronto. Se no, la tabella sotto ti dice dove. La tabella è stata ricavata dall'esito della query e ricontrollata: il suo MD5 dell'insieme, ricalcolato da Cowork fuori dal database, coincide con quello qui sopra.

**Differenze attese** che non devono fermarti, purché siano solo queste e tu le dichiari: oggetti che esistono solo nel demo per lavoro **non ancora applicato al prodotto** (per esempio una migrazione `GH-106` già applicata da te sul demo). Tutto il resto deve coincidere.

## Le righe del prodotto

| kind | name | md5 |
|---|---|---|
| column | `public.appointment_requests.alternatives_round` | `4c0a386170c02d37ac0404e0676d4c05` |
| column | `public.appointment_requests.appointment_id` | `d981342b282643b55296caa470fcd913` |
| column | `public.appointment_requests.chosen_date` | `26446d1fb66645457443e28672ac49e3` |
| column | `public.appointment_requests.chosen_time` | `48deb153d5a0dda485f4714c071f4d9b` |
| column | `public.appointment_requests.chosen_time_preference` | `d981342b282643b55296caa470fcd913` |
| column | `public.appointment_requests.coat_condition_codes` | `eff8cfd07beb2fc5b6fe5eb86d90adf2` |
| column | `public.appointment_requests.coat_condition_notes` | `d981342b282643b55296caa470fcd913` |
| column | `public.appointment_requests.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.appointment_requests.customer_responded_at` | `fa22a6ae33d0f0c2ec384edfd1123919` |
| column | `public.appointment_requests.customer_response` | `d981342b282643b55296caa470fcd913` |
| column | `public.appointment_requests.customer_user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.appointment_requests.declared_pet_age` | `d981342b282643b55296caa470fcd913` |
| column | `public.appointment_requests.desired_date` | `2643102f3d40eed1b66f2500fdc70521` |
| column | `public.appointment_requests.id` | `e09d053a722ca4a86f4d5d638f272508` |
| column | `public.appointment_requests.pet_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.appointment_requests.proposed_alternatives` | `59db0dee0dfb429b164d1337855e3f50` |
| column | `public.appointment_requests.service_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.appointment_requests.staff_responded_at` | `fa22a6ae33d0f0c2ec384edfd1123919` |
| column | `public.appointment_requests.status` | `12a50a601ccb7a690026a196842963a4` |
| column | `public.appointment_requests.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.appointment_requests.time_preference` | `d981342b282643b55296caa470fcd913` |
| column | `public.appointment_requests.updated_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.appointment_requests.withdrawn_at` | `fa22a6ae33d0f0c2ec384edfd1123919` |
| column | `public.appointments.appointment_source` | `66ecf358f121f12a731c3b666a6f58c5` |
| column | `public.appointments.approval_status` | `8a1bb409b60682225637c38a4b6845ef` |
| column | `public.appointments.created_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| column | `public.appointments.duration_minutes` | `343207c9c19c6ba446038daafb43afc2` |
| column | `public.appointments.external_calendar` | `d981342b282643b55296caa470fcd913` |
| column | `public.appointments.id` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.appointments.notes` | `d981342b282643b55296caa470fcd913` |
| column | `public.appointments.pet_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.appointments.requested_by_customer_id` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.appointments.scheduled_at` | `c221c558ba71b507168c2069baebeadc` |
| column | `public.appointments.service_id` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.appointments.status` | `03b69d6ef65966218bcebbb15e96194b` |
| column | `public.appointments.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.appointments.updated_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| column | `public.appointments.user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.contacts.created_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| column | `public.contacts.id` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.contacts.linked_pet_id` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.contacts.notes` | `d981342b282643b55296caa470fcd913` |
| column | `public.contacts.owner_name` | `d981342b282643b55296caa470fcd913` |
| column | `public.contacts.pet_name` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.contacts.phone` | `d981342b282643b55296caa470fcd913` |
| column | `public.contacts.source` | `de164afa43dc87b10d19e83979dc8022` |
| column | `public.contacts.status` | `45a0d5b9350d9536d48f5c2b786fc9f8` |
| column | `public.contacts.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.contacts.updated_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| column | `public.contacts.user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customer_account_unlink_audit.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.customer_account_unlink_audit.customer_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customer_account_unlink_audit.customer_label` | `d981342b282643b55296caa470fcd913` |
| column | `public.customer_account_unlink_audit.customer_phone` | `d981342b282643b55296caa470fcd913` |
| column | `public.customer_account_unlink_audit.disconnected_user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customer_account_unlink_audit.id` | `e09d053a722ca4a86f4d5d638f272508` |
| column | `public.customer_account_unlink_audit.performed_by_user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customer_account_unlink_audit.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customer_invitations.accepted_at` | `fa22a6ae33d0f0c2ec384edfd1123919` |
| column | `public.customer_invitations.accepted_by` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.customer_invitations.created_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| column | `public.customer_invitations.customer_email` | `d981342b282643b55296caa470fcd913` |
| column | `public.customer_invitations.expires_at` | `420c4ecc32153f0d2fec27bd31fc7110` |
| column | `public.customer_invitations.first_name` | `d981342b282643b55296caa470fcd913` |
| column | `public.customer_invitations.id` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.customer_invitations.last_name` | `d981342b282643b55296caa470fcd913` |
| column | `public.customer_invitations.operator_user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customer_invitations.pet_id` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.customer_invitations.phone` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.customer_invitations.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customer_invitations.token` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.customer_staff_notes.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.customer_staff_notes.customer_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customer_staff_notes.notes` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.customer_staff_notes.updated_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.customers.acquisition_source` | `de164afa43dc87b10d19e83979dc8022` |
| column | `public.customers.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.customers.email` | `d981342b282643b55296caa470fcd913` |
| column | `public.customers.first_name` | `d981342b282643b55296caa470fcd913` |
| column | `public.customers.id` | `e09d053a722ca4a86f4d5d638f272508` |
| column | `public.customers.last_name` | `d981342b282643b55296caa470fcd913` |
| column | `public.customers.marketing_opt_in` | `f851016bae2801b0acf7af24e16293c0` |
| column | `public.customers.phone` | `d981342b282643b55296caa470fcd913` |
| column | `public.customers.relationship_status` | `6ef21f3e098a99ccb1ae3300a6559a3d` |
| column | `public.customers.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.customers.updated_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.customers.user_id` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.gh78_customer_phone_backup.backed_up_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.gh78_customer_phone_backup.customer_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.gh78_customer_phone_backup.normalized_phone` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.gh78_customer_phone_backup.original_phone` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.gh78_customer_phone_backup.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.gh95_customer_name_backup.backed_up_at` | `fa22a6ae33d0f0c2ec384edfd1123919` |
| column | `public.gh95_customer_name_backup.first_name` | `d981342b282643b55296caa470fcd913` |
| column | `public.gh95_customer_name_backup.id` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.gh95_customer_name_backup.last_name` | `d981342b282643b55296caa470fcd913` |
| column | `public.gh95_customer_name_backup.phone` | `d981342b282643b55296caa470fcd913` |
| column | `public.pet_staff_notes.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.pet_staff_notes.notes` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.pet_staff_notes.pet_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.pet_staff_notes.updated_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.pets.awarded_fidelity_tier` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.birth_date` | `26446d1fb66645457443e28672ac49e3` |
| column | `public.pets.breed` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.coat_preferences` | `752a639dff54950bfeefb49b636566f0` |
| column | `public.pets.color` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.pets.customer_id` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.pets.id` | `e09d053a722ca4a86f4d5d638f272508` |
| column | `public.pets.is_blacklisted` | `f851016bae2801b0acf7af24e16293c0` |
| column | `public.pets.microchip` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.name` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.pets.neutered` | `c25c602f077cf4a941e0f79b34341b8f` |
| column | `public.pets.no_show_score` | `e80b0de65dc37cb80af88edaaece6545` |
| column | `public.pets.owner_notes` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.owner_photo_url` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.owner_user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.pets.photo_url` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.qr_token` | `28cabd5a185e37289688406b86c640f4` |
| column | `public.pets.sex` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.species` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.pets.updated_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.pets.weight_kg` | `b32701034430e2c907d363a6fd81d5e6` |
| column | `public.pets_breed_backup_gh70.breed_originale` | `d981342b282643b55296caa470fcd913` |
| column | `public.pets_breed_backup_gh70.pet_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.pets_breed_backup_gh70.salvato_il` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.profiles.business_name` | `d981342b282643b55296caa470fcd913` |
| column | `public.profiles.created_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| column | `public.profiles.id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.profiles.role` | `66ecf358f121f12a731c3b666a6f58c5` |
| column | `public.promotions.body` | `d981342b282643b55296caa470fcd913` |
| column | `public.promotions.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.promotions.cta_label` | `d981342b282643b55296caa470fcd913` |
| column | `public.promotions.cta_url` | `d981342b282643b55296caa470fcd913` |
| column | `public.promotions.display_order` | `e80b0de65dc37cb80af88edaaece6545` |
| column | `public.promotions.id` | `e09d053a722ca4a86f4d5d638f272508` |
| column | `public.promotions.image_url` | `d981342b282643b55296caa470fcd913` |
| column | `public.promotions.is_active` | `c33acfe2d3597c8de2b5edf5c09355f4` |
| column | `public.promotions.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.promotions.title` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.promotions.valid_from` | `fa22a6ae33d0f0c2ec384edfd1123919` |
| column | `public.promotions.valid_to` | `fa22a6ae33d0f0c2ec384edfd1123919` |
| column | `public.reward_points.created_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| column | `public.reward_points.id` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.reward_points.note` | `d981342b282643b55296caa470fcd913` |
| column | `public.reward_points.pet_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.reward_points.points` | `3b45aee833ce7b00c5116f796c848246` |
| column | `public.reward_points.reason` | `de164afa43dc87b10d19e83979dc8022` |
| column | `public.reward_points.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.reward_points.user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.service_financials.price_cents` | `3b45aee833ce7b00c5116f796c848246` |
| column | `public.service_financials.service_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.services.category` | `d981342b282643b55296caa470fcd913` |
| column | `public.services.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.services.description` | `d981342b282643b55296caa470fcd913` |
| column | `public.services.display_order` | `e80b0de65dc37cb80af88edaaece6545` |
| column | `public.services.duration_minutes` | `3b45aee833ce7b00c5116f796c848246` |
| column | `public.services.id` | `e09d053a722ca4a86f4d5d638f272508` |
| column | `public.services.is_active` | `c33acfe2d3597c8de2b5edf5c09355f4` |
| column | `public.services.name` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.services.price_cents` | `3b45aee833ce7b00c5116f796c848246` |
| column | `public.services.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.services.updated_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.tenant_memberships.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.tenant_memberships.id` | `e09d053a722ca4a86f4d5d638f272508` |
| column | `public.tenant_memberships.role` | `87a71ae91687b2cea865060e596d2f65` |
| column | `public.tenant_memberships.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.tenant_memberships.user_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.tenants.created_at` | `0cc7b4e4e9016fa6dd48aa4441dc5de2` |
| column | `public.tenants.id` | `e09d053a722ca4a86f4d5d638f272508` |
| column | `public.tenants.locale` | `6f1ad43015d64443eed1867d0b5341ba` |
| column | `public.tenants.name` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.tenants.settings` | `115ecced23949ab9f5a9f069010097db` |
| column | `public.tenants.slug` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.tenants.timezone` | `3940aa86b062e12a83b1686d268ca4d2` |
| column | `public.visit_financials.cost` | `6a8be3eb6d44a1cb2ec049918cabf32b` |
| column | `public.visit_financials.discount_percent` | `47f9c5e6c22536b3047e4fa299723c44` |
| column | `public.visit_financials.visit_id` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.visits.appointment_id` | `d981342b282643b55296caa470fcd913` |
| column | `public.visits.cost` | `6a8be3eb6d44a1cb2ec049918cabf32b` |
| column | `public.visits.created_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| column | `public.visits.date` | `2643102f3d40eed1b66f2500fdc70521` |
| column | `public.visits.discount_percent` | `47f9c5e6c22536b3047e4fa299723c44` |
| column | `public.visits.id` | `a5df5d9758ea418f9ae2f3fe351f6065` |
| column | `public.visits.issues` | `d981342b282643b55296caa470fcd913` |
| column | `public.visits.pet_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.visits.photo_url` | `d981342b282643b55296caa470fcd913` |
| column | `public.visits.service_id` | `cda5af75a62b616d07fefb4abf8c6e3a` |
| column | `public.visits.tenant_id` | `ef9a73da94819c894171c7834d1d9a72` |
| column | `public.visits.treatments` | `d981342b282643b55296caa470fcd913` |
| column | `public.visits.updated_at` | `2b98eed0518bace0dc6c41bd423565a1` |
| function | `public.accept_customer_invite(p_token text)` | `fcfe2fc99dc56851d5e6f6d308c193fa` |
| function | `public.add_customer_with_pet(p_tenant_id uuid, p_customer_first_name text, p_customer_phone text, p_pet_name text, p_customer_last_name text, p_customer_email text, p_customer_marketing_opt_in boolean, p_customer_operator_notes text, p_pet_species text, p_pet_breed text, p_pet_birth_date date, p_pet_sex text, p_pet_microchip text, p_pet_weight_kg numeric, p_pet_neutered boolean, p_pet_color text, p_pet_coat_preferences jsonb, p_pet_owner_notes text, p_pet_internal_notes text, p_pet_photo_url text)` | `f4acaf7ebc0a7e1a23a4dbce267315d3` |
| function | `public.complete_appointment_with_visit(p_appointment_id text, p_date date, p_treatments text, p_issues text, p_cost numeric, p_service_id uuid)` | `848d3557add8cfc69b1e367dc161ca67` |
| function | `public.create_calendar_customer_pet(p_tenant_id uuid, p_customer_first_name text, p_pet_name text, p_customer_phone text, p_phone_not_provided boolean, p_customer_last_name text, p_pet_species text, p_pet_breed text, p_pet_sex text)` | `87a247fc8d91b03ee5eb543c6ed2cef9` |
| function | `public.create_staff_visit(p_pet_id uuid, p_date date, p_cost numeric, p_treatments text, p_issues text, p_discount_percent numeric, p_service_id uuid, p_appointment_id text)` | `9d87519547e553d211bba15a3845a003` |
| function | `public.current_tenant_ids_for_role(required_role tenant_role)` | `f88fcbe7b8e6ccd61e65ec01c14a2a92` |
| function | `public.delete_staff_appointment(p_appointment_id text)` | `9cafa4463f44b813fa01c79f3255eba1` |
| function | `public.enforce_appointment_workstation_capacity()` | `ee50b77d740c925114c6b7709e057e8b` |
| function | `public.enforce_customer_directory_fields_staff_only()` | `c7779877e5c9f2b5ce2c25e40931a681` |
| function | `public.enforce_pets_customer_update_whitelist()` | `3a098454689e2d8f94cf077aa4f5933f` |
| function | `public.ensure_pet_qr_token()` | `28ab7a0698f87edface4faaf43173c3d` |
| function | `public.get_public_pet_card(p_qr_token text)` | `70e28d87d90e92494814862f8fde11b4` |
| function | `public.get_public_salon_identity(p_tenant_slug text)` | `88d5d31b0c2bc08822937608acbb4451` |
| function | `public.gh103_finance_bridge()` | `bc62652be087008365c615bee911012d` |
| function | `public.guard_tenant_workstation_capacity()` | `6deb1b403625c829c95b2bae3c165da9` |
| function | `public.handle_new_auth_user()` | `317cdd8595d064b7df3387dc293b197d` |
| function | `public.has_tenant_access(tenant_uuid uuid, required_role tenant_role)` | `577c426b0504d6c0cb0ee5295487d2b3` |
| function | `public.has_tenant_any_staff_access(tenant_uuid uuid)` | `8c96f9e573261d0a92424b6728e956bb` |
| function | `public.is_valid_fidelity_tiers(p_tiers jsonb)` | `8b1911ba59baa91a87f504b7f3092799` |
| function | `public.normalize_phone_it(p_phone text)` | `9b9b704586429cd82f9190aadf4b349e` |
| function | `public.prevent_duplicate_pending_appointment_request()` | `03dd50bd37e8945b0eba4c689517fc0e` |
| function | `public.propose_appointment_request_alternatives(p_request_id uuid, p_alternatives jsonb)` | `c69f733a3810b56bef39b81656ffb3b0` |
| function | `public.reorder_promotions(p_ids uuid[])` | `8a360741832f18c0c093caaab23659ad` |
| function | `public.resolve_appointment_request(p_request_id uuid, p_decision text, p_scheduled_at timestamp with time zone)` | `48bd63fae5fdde7164120fd1c1b2856e` |
| function | `public.resolve_appointment_request_local(p_request_id uuid, p_decision text, p_scheduled_date date, p_scheduled_time time without time zone, p_duration_minutes integer)` | `16381d63661a8cde5f123904a70a6be6` |
| function | `public.resolve_appointment_request_with_duration(p_request_id uuid, p_decision text, p_scheduled_at timestamp with time zone, p_duration_minutes integer)` | `4f1e5558c343cdef15d14510bd9f80f5` |
| function | `public.respond_appointment_request_slot(p_request_id uuid, p_response text, p_date date, p_time time without time zone, p_time_preference text, p_new_desired_date date, p_new_time_preference text)` | `1143698888aecdc72b8bf6263f660334` |
| function | `public.set_customer_invitation_expiry()` | `19f3358fa389dacac8689dc7e4eb6614` |
| function | `public.set_staff_appointment_status(p_appointment_id text, p_status text)` | `47946d65580eda6691340f0b0ba3deec` |
| function | `public.submit_appointment_request(p_tenant_id uuid, p_pet_id uuid, p_service_id uuid, p_desired_date date, p_time_preference text, p_coat_condition_codes text[], p_coat_condition_notes text, p_declared_pet_age text)` | `edb274701917905b13ee951f78ca4dbe` |
| function | `public.sync_customers_email_from_auth()` | `c611444359206a733215aeda4c24b0d6` |
| function | `public.unlink_customer_account(p_customer_id uuid)` | `80ecaae4feb41612a88bbcdd7a025545` |
| function | `public.update_timestamp()` | `96815233733b365400f3230e2651e9ef` |
| function | `public.upsert_customer_lead(p_tenant_id uuid, p_first_name text, p_phone text, p_last_name text, p_operator_notes text, p_acquisition_source text, p_relationship_status text)` | `f5192c065870e65e4672bd9a9e32e935` |
| function | `public.withdraw_appointment_request(p_request_id uuid)` | `84586c4957dade6cd05fc48df36a8f53` |
| policy | `public.appointment_requests.appointment_requests_customer_insert` | `efb4e465816ec8fff6e86706f307f912` |
| policy | `public.appointment_requests.appointment_requests_customer_select` | `75d5739106e9d129ca14d077e5dfd452` |
| policy | `public.appointment_requests.appointment_requests_staff_all` | `b8b0d850fe1d758a3334efc8dcafc4b9` |
| policy | `public.appointments.appointments_customer_select` | `bdbb3ba01c969004c130c298081959df` |
| policy | `public.appointments.appointments_staff_insert` | `3eb32a26ef4832f50a195fd2bda2ff43` |
| policy | `public.appointments.appointments_staff_select` | `5118087ec604b6afe57fd8bb07871479` |
| policy | `public.appointments.appointments_staff_update` | `de3fe2dc5665ade2301edeaec8b8a0c6` |
| policy | `public.contacts.contacts_staff_all` | `f22e8e89a7e9ea0a49553d131775b1d8` |
| policy | `public.customer_account_unlink_audit.customer_account_unlink_audit_staff_select` | `af321a5f5090152eae92a04c3d500813` |
| policy | `public.customer_invitations.customer_invitations_staff_all` | `f22e8e89a7e9ea0a49553d131775b1d8` |
| policy | `public.customer_staff_notes.customer_staff_notes_staff_all` | `1b570db7514b51ac9f08d175b1e2e7dd` |
| policy | `public.customers.customers_self_select` | `aa8be18585331a6caa731efc1453cad4` |
| policy | `public.customers.customers_self_update` | `d213d8c826302a763e4f0baa2644a5e4` |
| policy | `public.customers.customers_staff_all` | `f22e8e89a7e9ea0a49553d131775b1d8` |
| policy | `public.pet_staff_notes.pet_staff_notes_staff_all` | `06cd6a0bdd545bcc87a3f37afc0bea47` |
| policy | `public.pets.pets_customer_select` | `7f31cde06a4e5cadc1f5f8765377f97a` |
| policy | `public.pets.pets_customer_update` | `64d6e4becceacec62126d9dbe11b48cc` |
| policy | `public.pets.pets_staff_all` | `f22e8e89a7e9ea0a49553d131775b1d8` |
| policy | `public.profiles.profiles_self_insert` | `f516dfdf2a1255a55928b286ac8bc438` |
| policy | `public.profiles.profiles_self_select` | `0b96ee4c3d5b2f3c749ee19118376285` |
| policy | `public.profiles.profiles_self_update` | `09657c4651fc49b5890a2109e9b65b29` |
| policy | `public.profiles.profiles_tenant_members_select` | `49127e34bcbff79cd2c6d212d33c7b3f` |
| policy | `public.promotions.promotions_customer_select_active` | `5d1818f7a23c5c2a2febd002046a3312` |
| policy | `public.promotions.promotions_staff_all` | `f22e8e89a7e9ea0a49553d131775b1d8` |
| policy | `public.reward_points.reward_points_customer_select` | `af92981c5658c72b9fee98a442590d76` |
| policy | `public.reward_points.reward_points_staff_all` | `f22e8e89a7e9ea0a49553d131775b1d8` |
| policy | `public.service_financials.service_financials_staff_all` | `e9da88ad97efb7d48b0f3f58c0fa21ef` |
| policy | `public.services.services_customer_select_active` | `41be4ea419ef42c7cd515d3d1a0b1ac2` |
| policy | `public.services.services_staff_all` | `f22e8e89a7e9ea0a49553d131775b1d8` |
| policy | `public.tenant_memberships.tenant_memberships_own_select` | `aa8be18585331a6caa731efc1453cad4` |
| policy | `public.tenant_memberships.tenant_memberships_staff_select` | `5118087ec604b6afe57fd8bb07871479` |
| policy | `public.tenants.tenants_members_select` | `38b0adccb9d281f33e58485b28fdd652` |
| policy | `public.visit_financials.visit_financials_staff_all` | `1743e0f8b422f59900b1c3bc8953e2da` |
| policy | `public.visits.visits_customer_select` | `b9f450044a2d4402aad011f6b47d2f69` |
| policy | `public.visits.visits_staff_all` | `f22e8e89a7e9ea0a49553d131775b1d8` |
| policy | `storage.objects.Client photos staff delete` | `ea57d5590c35d8c532db5385c0093b6f` |
| policy | `storage.objects.Client photos staff insert` | `442eee4c5b27ac452ee398d71ba374ac` |
| policy | `storage.objects.Client photos staff select` | `cf5919a1f287788ba35b703ea765f501` |
| policy | `storage.objects.Client photos staff update` | `8597df8c32e0419ef62a71657ea6cbb5` |
| policy | `storage.objects.Pet avatars customer delete` | `93d31b6b7dcbb7e5538c1b75a3b90c45` |
| policy | `storage.objects.Pet avatars customer insert` | `1ca99929cef5a22286f94d675a6efc17` |
| policy | `storage.objects.Pet avatars customer select own` | `29a7f8b39795103366428bfa2d5985bb` |
| policy | `storage.objects.Pet avatars customer update` | `13f7769771f689b5ae9f18c24877e9ad` |
| policy | `storage.objects.Pet avatars staff all` | `c61492b64270f2ae0007225237da13cf` |
