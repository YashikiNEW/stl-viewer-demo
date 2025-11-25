#!/bin/bash
# Slack Webhook通知スクリプト（シェル版）
#
# Usage:
#   ./slack.sh "メッセージ"
#   ./slack.sh "メッセージ" "タイトル" "#36a64f"
#
# 環境変数:
#   AI_FACTORY_WEBHOOK: Slack Webhook URL

MESSAGE="${1:-}"
TITLE="${2:-AI Factory}"
COLOR="${3:-#36a64f}"

if [ -z "$AI_FACTORY_WEBHOOK" ]; then
    echo "Warning: AI_FACTORY_WEBHOOK is not set" >&2
    exit 0
fi

if [ -z "$MESSAGE" ]; then
    echo "Usage: slack.sh <message> [title] [color]" >&2
    exit 1
fi

TIMESTAMP=$(date +%s)

PAYLOAD=$(cat <<EOF
{
  "attachments": [{
    "fallback": "$MESSAGE",
    "color": "$COLOR",
    "title": "$TITLE",
    "text": "$MESSAGE",
    "footer": "AI Factory v2.6",
    "ts": $TIMESTAMP
  }]
}
EOF
)

curl -s -X POST -H 'Content-Type: application/json' \
    --data "$PAYLOAD" \
    "$AI_FACTORY_WEBHOOK" > /dev/null 2>&1

exit 0
