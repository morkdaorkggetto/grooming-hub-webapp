#!/usr/bin/env bash
# salva.sh - salva e pubblica i DOCUMENTI (diario, incarichi, consegne, design).
#
#   ./scripts/salva.sh "messaggio del commit"
#
# Il codice applicativo lo committa Codex nei suoi mandati: questo script
# non lo tocca, a meno che tu non lo autorizzi espressamente alla domanda.
#
# Nato dopo il 25/8, quando un "git add -A" ha inghiottito il lavoro in corso
# di Codex e una sua sonda temporanea dentro un commit che parlava d'altro.

set -euo pipefail
cd "$(dirname "$0")/.."

msg="${1:-}"
if [ -z "$msg" ]; then
  echo "Serve un messaggio:  ./scripts/salva.sh \"cosa hai fatto\""
  exit 1
fi

if [ -f .git/index.lock ]; then
  echo "ATTENZIONE: esiste .git/index.lock - una sessione precedente si e' interrotta."
  echo "Rimuovilo e riprova:  rm .git/index.lock"
  exit 1
fi

# Percorsi considerati "documentazione": sono l'output di Cowork.
DOCS=(docs design_handoff_customer_app design_handoff_staff_app)

echo "── Ramo ────────────────────────────────────────────"
git rev-parse --abbrev-ref HEAD

echo
echo "── Commit locali non ancora pubblicati ─────────────"
git log --oneline @{u}..HEAD 2>/dev/null || echo "  (nessuno)"

echo
echo "── Documenti che verranno inclusi ──────────────────"
doc_changes="$(git status --short -- "${DOCS[@]}" 2>/dev/null || true)"
if [ -z "$doc_changes" ]; then
  echo "  (nessuna modifica ai documenti)"
else
  echo "$doc_changes"
fi

# Tutto il resto: mostrato ma NON incluso senza un si' esplicito.
altro="$(git status --short | grep -vE "^(.{2}) ($(IFS='|'; echo "${DOCS[*]}"))/" || true)"
if [ -n "$altro" ]; then
  echo
  echo "── ATTENZIONE: modifiche FUORI dai documenti ───────"
  echo "$altro"
  echo
  echo "  Potrebbe essere lavoro in corso di Codex, o una sua sonda temporanea."
  echo "  Per impostazione predefinita NON vengono incluse."
fi

if [ -z "$doc_changes" ] && [ -z "$(git log --oneline @{u}..HEAD 2>/dev/null)" ]; then
  echo
  echo "Niente da salvare e niente da pubblicare."
  exit 0
fi

echo
read -r -p "Procedo con i soli documenti? [s/N] " risposta
case "$risposta" in
  s|S|si|Si|SI|y|Y) ;;
  *) echo "Annullato. Niente e' stato toccato."; exit 0 ;;
esac

if [ -n "$doc_changes" ]; then
  git add -- "${DOCS[@]}"
  git commit -m "$msg"
fi

git push
echo
echo "Fatto."

if [ -n "$altro" ]; then
  echo
  echo "Nota: le modifiche fuori dai documenti sono rimaste come le hai trovate."
  echo "Se erano tue e vanno salvate, aggiungile a mano e fai un commit dedicato."
fi
