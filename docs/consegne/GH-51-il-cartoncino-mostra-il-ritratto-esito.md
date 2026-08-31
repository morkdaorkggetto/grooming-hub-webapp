# Consegna GH-51 - Il cartoncino mostra il ritratto

## Base e perimetro

- Root dichiarata: `/Users/luigimaisto/Desktop/grooming-hub-web/`.
- Worktree: `/Users/luigimaisto/Desktop/grooming-hub-web/webapp/`.
- Branch: `main`.
- Base: `e321fc9`.
- Database letto e scritto: solo demo `grooming-hub-demo`
  (`qttpinkslhenxrsbhhhg`), verificato `ACTIVE_HEALTHY`.
- Produzione `azgehoseiojodltcttfb`: non letta e non scritta.
- Nessun push, merge, deploy o modifica frontend.

## Esito

`get_public_pet_card(text)` restituisce ora come `photo` il primo valore
disponibile tra `pets.owner_photo_url` e `pets.photo_url`. Il cartoncino
pubblico mostra quindi il ritratto del proprietario, usa la foto di
riconoscimento del salone come ripiego e lascia al componente esistente il
medaglione illustrato quando entrambe mancano.

Firma, tipo di ritorno, proprietario, `SECURITY DEFINER`, `search_path` e ACL
sono invariati. La funzione resta volutamente eseguibile da `anon` e
`authenticated`; Luigi ha confermato esplicitamente che il ritratto puo essere
visto senza login da chi possiede il QR.

## File esaustivi

| File | Atto | Motivo |
| --- | --- | --- |
| `supabase/migrations/20260831125227_gh51_public_card_owner_portrait.sql` | aggiunto | Preferenza ritratto proprietario nella proiezione pubblica, con fallback salone. |
| `docs/consegne/GH-51-il-cartoncino-mostra-il-ritratto-esito.md` | aggiunto | Registro unico del giro. |

Nessun altro file appartiene alla consegna. La suite RLS e il frontend non
sono stati modificati.

## Migration e sicurezza

Migration applicata una sola volta sul demo e registrata dal servizio come:

`20260831125227_gh51_public_card_owner_portrait`

Il file locale e stato allineato alla stessa versione. Prima e dopo risultano:

- firma `get_public_pet_card(p_qr_token text)` e ritorno `jsonb`;
- proprietario `postgres`, `SECURITY DEFINER` e
  `search_path=pg_catalog, public, auth`;
- `EXECUTE` disponibile a `anon` e `authenticated`;
- ACL `{postgres, service_role, anon, authenticated}` invariata.

Advisor post-migration:

- sicurezza: 9 warning preesistenti; i due warning sulla funzione pubblica
  sono intenzionali per contratto GH-51;
- prestazioni: 90 warning e 14 info preesistenti, nessuno generato da una
  nuova tabella, colonna, policy o indice GH-51.

Riferimenti Advisor:

- https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Controprove demo

La fixture usa-e-getta ha impiegato Luna di Mario e due oggetti temporanei nel
bucket pubblico `pet-avatars`.

| Prova | Misura | Esito |
| --- | --- | --- |
| Solo foto salone | RPC anonima: `photo` uguale a `pets.photo_url` | PASS |
| Ritratto aggiunto da Mario | RPC anonima: `photo` uguale a `owner_photo_url` | PASS |
| Conservazione foto salone | rilettura staff: `photo_url` identica prima/dopo l'update customer | PASS |
| Nessuna foto | RPC anonima: `photo = null` | PASS |
| Medaglione illustrato | pagina anonima: 0 immagini, 1 icona nel medaglione visibile | PASS |
| Accesso senza login | `/client-card/<qr_token>` renderizzata e RPC anonima riuscita | PASS |
| Testo alternativo | ramo immagine esistente: `Ritratto di <nome>` | PASS |
| Suite RLS invariata | nessuna differenza in `scripts/rls-tests/` e `supabase/docs/rls-tests.md` | PASS |

La misura delle 42 foto appartiene alla produzione ed e ricevuta dal mandato:
non e stata riletta per rispettare il divieto assoluto di accesso al prod. Sul
demo la misura disponibile era 0 foto salone e 0 ritratti prima, e resta 0 e 0
dopo il teardown.

## Verifiche tecniche

| Verifica | Misura | Esito |
| --- | --- | --- |
| Build finale | Vite 5.4.21, 157 moduli, JS 696.21 kB (gzip 196.46 kB) | PASS |
| `git diff --check` | nessun errore | PASS |
| Suite RLS | file invariati | PASS |
| Lint | `eslint` non presente nelle dipendenze (`command not found`) | NON ESEGUIBILE |

Warning build non bloccanti: dati Browserslist datati e chunk principale oltre
500 kB.

## Teardown

| Oggetto demo | Prima | Dopo | Residui GH-51 |
| --- | ---: | ---: | ---: |
| pet totali | 7 | 7 | 0 |
| `pets.photo_url IS NOT NULL` | 0 | 0 | 0 |
| `pets.owner_photo_url IS NOT NULL` | 0 | 0 | 0 |
| oggetti Storage nel percorso GH-51 | 0 | 0 | 0 |
| sonda auth GH-04 | 0 | 0 | 0 |
| profilo e membership sonda GH-04 | 0 | 0 | 0 |

## Eccezioni e fuori istruzione

- La prima esecuzione della prova API e stata bloccata dalla rete del sandbox;
  la prova e stata ripetuta con autorizzazione nativa, guardia sul ref demo e
  senza stampare segreti.
- Il browser locale conteneva un refresh token scaduto e ha registrato il
  relativo errore Auth; la pagina pubblica e la RPC anonima si sono comunque
  caricate correttamente. Nessuna autenticazione era necessaria alla prova.
- Nessuna modifica fuori istruzione.

## Controllo finale di Luigi

Resta da inquadrare con il telefono il QR di un pet dal gestionale e verificare
che la pagina mostri il ritratto, oppure la foto salone se il ritratto non
esiste. Nessun cartoncino e ancora stato stampato o consegnato; la stampa
appartiene alla futura campagna inviti.

## Commit

Commit locale previsto con messaggio `fix: prefer owner portrait on public pet card`.
L'hash e riportato nella risposta finale. Nessun push eseguito.
