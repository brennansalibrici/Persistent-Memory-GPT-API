# ./smoke.sh
#!/usr/bin/env bash
set -euo pipefail
BASE="https://persistent-memory-custom-gpt-api.vercel.app"
KEY="actions-api-key"

echo "# health"
curl -sS "$BASE/health" | jq

echo "# dbping"
curl -sS "$BASE/dbping" | jq

echo "# insert"
curl -sS -i "$BASE/memory" -H "x-api-key: $KEY" -H "Content-Type: application/json" -H "Expect:" --http1.1 \
  --data '{"user_external_id":"demo-user","note":"smoke note","tags":["smoke"],"importance":1}' | tail -n +1

echo "# list"
curl -sS "$BASE/memory?user_external_id=demo-user&limit=3" -H "x-api-key: $KEY" --http1.1 | jq

echo "# rehydrate"
curl -sS "$BASE/rehydrate?user_external_id=demo-user&n=3" -H "x-api-key: $KEY" --http1.1 | jq
