#!/usr/bin/env python3
"""Slack Webhook通知ユーティリティ。

AI Factoryのワークフロー進捗をSlackに通知する。
環境変数 AI_FACTORY_WEBHOOK にWebhook URLを設定して使用する。
.envファイルからも自動的に読み込む。

Usage:
    python notify.py "メッセージ" [--title "タイトル"] [--color "#36a64f"] [--level info|success|warning|error]

Examples:
    python notify.py "タスク開始 #42"
    python notify.py "PR作成完了" --level success
    python notify.py "テスト失敗" --level error --title "Issue #42"
"""
import argparse
import json
import os
import sys
import time
import urllib.request
from pathlib import Path
from typing import Optional


def load_dotenv() -> None:
    """プロジェクトルートの.envファイルから環境変数を読み込む。

    python-dotenvがインストールされていなくても動作するよう、
    シンプルな実装を提供する。
    """
    # カレントディレクトリから上位に向かって.envを探す
    current = Path.cwd()
    for parent in [current, *current.parents]:
        env_file = parent / ".env"
        if env_file.exists():
            with open(env_file, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    # コメントと空行をスキップ
                    if not line or line.startswith("#"):
                        continue
                    # KEY=VALUE形式をパース
                    if "=" in line:
                        key, _, value = line.partition("=")
                        key = key.strip()
                        value = value.strip()
                        # クォートを除去
                        if (value.startswith('"') and value.endswith('"')) or \
                           (value.startswith("'") and value.endswith("'")):
                            value = value[1:-1]
                        # 既存の環境変数は上書きしない
                        if key not in os.environ:
                            os.environ[key] = value
            break


# 起動時に.envを読み込む
load_dotenv()


# カラー定義
COLORS = {
    "info": "#36a64f",      # 緑
    "success": "#2eb886",   # 緑（明るめ）
    "warning": "#daa038",   # オレンジ
    "error": "#ff0000",     # 赤
}


def send_slack(
    message: str,
    title: Optional[str] = None,
    color: Optional[str] = None,
    level: str = "info",
    webhook_url: Optional[str] = None
) -> bool:
    """Slack Webhookにメッセージを送信する。

    Args:
        message: 送信するメッセージ本文
        title: メッセージのタイトル（オプション）
        color: メッセージのサイドバー色（16進数カラーコード）
        level: ログレベル（info, success, warning, error）
        webhook_url: Webhook URL（指定しない場合は環境変数から取得）

    Returns:
        bool: 送信成功時True、失敗時False
    """
    url = webhook_url or os.environ.get("AI_FACTORY_WEBHOOK")
    if not url:
        print("Warning: AI_FACTORY_WEBHOOK is not set", file=sys.stderr)
        return False

    # カラー決定
    if color is None:
        color = COLORS.get(level, COLORS["info"])

    # ペイロード構築
    attachment = {
        "fallback": message,
        "color": color,
        "text": message,
        "footer": "AI Factory v2.6",
        "ts": int(time.time())
    }

    if title:
        attachment["title"] = title

    payload = {"attachments": [attachment]}

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status == 200
    except Exception as e:
        print(f"Error sending Slack notification: {e}", file=sys.stderr)
        return False


def main() -> int:
    """メインエントリーポイント。

    Returns:
        int: 終了コード（0: 成功、1: 失敗）
    """
    parser = argparse.ArgumentParser(
        description="Send notifications to Slack via Webhook"
    )
    parser.add_argument("message", help="Message to send")
    parser.add_argument("--title", "-t", help="Message title")
    parser.add_argument("--color", "-c", help="Sidebar color (hex)")
    parser.add_argument(
        "--level", "-l",
        choices=["info", "success", "warning", "error"],
        default="info",
        help="Message level (default: info)"
    )

    args = parser.parse_args()

    success = send_slack(
        message=args.message,
        title=args.title,
        color=args.color,
        level=args.level
    )

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
