#!/usr/bin/env bash
# salva.sh - mostra cosa sta per entrare, chiede conferma, committa e pusha.
#
#   ./scripts/salva.sh "messaggio del commit"
#
# Il gesto resta di Luigi: lo script non decide, mostra e aspetta.

set -euo pipefail
cd "$(dirname "$0")/.."

msg="${1:-}"
if [ -z "$msg" ]; then
  echo "Serve un messaggio:  ./scripts/salva.sh \"cosa hai fatto\""
  exit 1
fi

# Un lock rimasto da una sessione andata male blocca tutto: meglio dirlo subito.
if [ -f .git/index.lock ]; then
  echo "ATTENZIONE: esiste .git/index.lock — una sessione precedente si e' interrotta."
  echo "Rimuovilo e riprova:  rm .git/index.lock"
  exit 1
fi

echo "── Ramo ────────────────────────────────────────────"
git rev-parse --abbrev-ref HEAD

echo
echo "── Commit locali non ancora pubblicati ─────────────"
git log --oneline @{u}..HEAD 2>/dev/null || echo "  (nessuno, oppure ramo senza remoto)"

echo
echo "── Modifiche che verranno incluse ──────────────────"
if [ -z "$(git status --porcelain)" ]; then
  echo "  (niente da committare: solo push dei commit qui sopra)"
  nothing_to_commit=1
else
  git status --short
  nothing_to_commit=0
fi

echo
read -r -p "Procedo? [s/N] " risposta
case "$risposta" in
  s|S|si|Si|SI|y|Y) ;;
  *) echo "Annullato. Niente e' stato toccato."; exit 0 ;;
esac

if [ "$nothing_to_commit" -eq 0 ]; then
  git add -A
  git commit -m "$msg"
fi

git push
echo
echo "Fatto."
