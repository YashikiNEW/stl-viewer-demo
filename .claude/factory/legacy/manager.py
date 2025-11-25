import sys
import time
import json
import subprocess
import shutil
import logging
import stat
import signal
import urllib.request
from pathlib import Path
from typing import Optional, List, Tuple
from logging.handlers import RotatingFileHandler
from dataclasses import dataclass
import yaml

# --- 設定 ---
ROOT_DIR = Path.cwd()
FACTORY_DIR = ROOT_DIR / ".claude" / "factory"
LOG_DIR = FACTORY_DIR / "logs"
WORKTREE_BASE = ROOT_DIR / ".claude" / "worktrees"
CONFIG_PATH = FACTORY_DIR / "config.yaml"

@dataclass
class Config:
    label: str
    max_retries: int
    log_max_bytes: int
    log_backup_count: int
    post_progress: bool
    webhook_url: Optional[str]
    enable_kaizen: bool

def load_config() -> Config:
    """設定ファイルを読み込み、Configオブジェクトを返す。

    config.yamlが存在する場合はその内容をデフォルト値にマージする。
    存在しない場合はデフォルト値のみを使用する。

    Returns:
        Config: 設定値を格納したConfigオブジェクト
    """
    import os  # 環境変数取得用
    defaults = {
        "factory": {"label": "todo", "max_retries": 3, "enable_kaizen": True},
        "logging": {"max_bytes": 5*1024*1024, "backup_count": 5},
        "notifications": {"post_progress": True, "webhook_url": os.environ.get("AI_FACTORY_WEBHOOK")}
    }
    if CONFIG_PATH.exists():
        with CONFIG_PATH.open("r", encoding="utf-8") as f:
            y = yaml.safe_load(f) or {}
            defaults["factory"].update(y.get("factory", {}))
            defaults["logging"].update(y.get("logging", {}))
            defaults["notifications"].update(y.get("notifications", {}))

    return Config(
        label=defaults["factory"]["label"],
        max_retries=defaults["factory"]["max_retries"],
        log_max_bytes=defaults["logging"]["max_bytes"],
        log_backup_count=defaults["logging"]["backup_count"],
        post_progress=defaults["notifications"]["post_progress"],
        webhook_url=defaults["notifications"]["webhook_url"],
        enable_kaizen=defaults["factory"]["enable_kaizen"]
    )

CFG = load_config()

# --- ロギング設定 ---
class Colors:
    """ANSIカラーコード定義クラス。

    ターミナル出力に色を付けるためのエスケープシーケンスを定義する。
    """
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"

class ColoredConsoleHandler(logging.StreamHandler):
    """カラー出力対応のコンソールハンドラ。

    ログレベルに応じて異なる色でメッセージを出力する。
    """

    def emit(self, record: logging.LogRecord) -> None:
        """ログレコードをフォーマットしてストリームに出力する。

        Args:
            record: 出力するログレコード
        """
        try:
            msg = self.format(record)
            if record.levelno == logging.ERROR:
                stream = self.stream
                stream.write(f"{Colors.FAIL}{msg}{Colors.ENDC}\n")
            elif record.levelno == logging.WARNING:
                stream = self.stream
                stream.write(f"{Colors.WARNING}{msg}{Colors.ENDC}\n")
            elif hasattr(record, 'color'):
                stream = self.stream
                stream.write(f"{record.color}{msg}{Colors.ENDC}\n")
            else:
                stream = self.stream
                stream.write(f"{msg}\n")
            self.flush()
        except Exception:
            self.handleError(record)

LOG_DIR.mkdir(parents=True, exist_ok=True)
logger = logging.getLogger("AI_Factory")
logger.setLevel(logging.INFO)

# ファイルハンドラ（プレーンテキスト）
file_handler = RotatingFileHandler(
    LOG_DIR / "manager.log",
    maxBytes=CFG.log_max_bytes,
    backupCount=CFG.log_backup_count,
    encoding='utf-8'
)
file_formatter = logging.Formatter('[%(asctime)s] %(levelname)s: %(message)s', datefmt='%H:%M:%S')
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

# コンソールハンドラ（カラー出力）
console_handler = ColoredConsoleHandler()
console_handler.setFormatter(file_formatter)
logger.addHandler(console_handler)

def log_msg(msg: str, color: Optional[str] = None, level: int = logging.INFO) -> None:
    """メッセージをロガーに出力する。

    Args:
        msg: 出力するメッセージ
        color: コンソール出力時の色（ANSIエスケープシーケンス）
        level: ログレベル（デフォルト: INFO）
    """
    extra = {'color': color} if color else {}
    logger.log(level, msg, extra=extra)

# --- Webhook通知 ---
def send_slack(msg: str, color: str = "#36a64f", title: str = "AI Factory Update") -> None:
    """Slack Webhookにメッセージを送信する。

    webhook_urlが設定されていない場合は何もしない。

    Args:
        msg: 送信するメッセージ本文
        color: メッセージのサイドバー色（16進数カラーコード）
        title: メッセージのタイトル
    """
    if not CFG.webhook_url:
        return
    try:
        payload = {
            "attachments": [{
                "fallback": msg,
                "color": color,
                "title": title,
                "text": msg,
                "footer": "AI Factory v2.5",
                "ts": int(time.time())
            }]
        }
        req = urllib.request.Request(
            CFG.webhook_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req) as res:
            pass
    except Exception as e:
        log_msg(f"Webhook送信失敗: {e}", Colors.WARNING, logging.WARNING)

# --- コアユーティリティ ---

# 定数定義
COMMAND_RETRY_DELAY = 2  # コマンド失敗時の待機秒数
WORKTREE_CLEANUP_DELAY = 1  # worktree削除リトライ待機秒数
WORKTREE_CLEANUP_RETRIES = 3  # worktree削除リトライ回数
ASSIGN_VERIFY_DELAY = 2  # アサイン確認待機秒数
AUTH_RETRY_DELAY = 60  # 認証失敗時の待機秒数
TEST_TIMEOUT = 300  # テストタイムアウト秒数
POLL_INTERVAL = 10  # Issue検索間隔秒数
ERROR_MSG_MAX_LEN = 500  # エラーメッセージ最大長
CRITICAL_ERROR_DELAY = 60  # クリティカルエラー待機秒数

@dataclass
class CommandResult:
    """コマンド実行結果を格納するデータクラス。

    Attributes:
        returncode: コマンドの終了コード
        stdout: 標準出力
        stderr: 標準エラー出力
    """
    returncode: int
    stdout: str
    stderr: str

def run_command(
    cmd_list: List[str],
    cwd: Optional[str] = None,
    stream: bool = False,
    log_file: Optional[str] = None
) -> CommandResult:
    """コマンドを実行し、設定されたリトライ回数まで再試行する。

    Args:
        cmd_list: 実行するコマンドとその引数のリスト
        cwd: コマンドを実行する作業ディレクトリ
        stream: Trueの場合、出力をリアルタイムで表示
        log_file: ログを書き込むファイルパス

    Returns:
        CommandResult: コマンドの実行結果
    """
    last_result = CommandResult(1, "", "")

    for attempt in range(CFG.max_retries):
        try:
            if stream:
                # ストリーミング実行
                stdout_lines = []
                with subprocess.Popen(
                    cmd_list, cwd=cwd,
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    text=True, bufsize=1, encoding='utf-8', errors='replace'
                ) as proc:
                    if log_file:
                        with open(log_file, 'a', encoding='utf-8') as lf:
                            for line in proc.stdout:
                                print(line, end='')
                                stdout_lines.append(line)
                                lf.write(line)
                                lf.flush()
                    else:
                        for line in proc.stdout:
                            print(line, end='')
                            stdout_lines.append(line)

                    proc.wait()
                    last_result = CommandResult(proc.returncode, "".join(stdout_lines), "")
            else:
                # 非ストリーミング実行
                res = subprocess.run(cmd_list, cwd=cwd, text=True, capture_output=True, check=False, encoding='utf-8', errors='replace')
                last_result = CommandResult(res.returncode, res.stdout, res.stderr)

            if last_result.returncode != 0:
                log_msg(f"コマンド失敗 (試行 {attempt+1}/{CFG.max_retries}): {' '.join(cmd_list)}", Colors.WARNING, logging.WARNING)
                if attempt < CFG.max_retries - 1:
                    time.sleep(COMMAND_RETRY_DELAY)
                    continue

            return last_result

        except Exception as e:
            log_msg(f"実行エラー: {e}", Colors.FAIL, logging.ERROR)
            last_result = CommandResult(1, "", str(e))

    return last_result

def force_remove_readonly(func, path, excinfo) -> None:
    """読み取り専用ファイルを強制削除するためのエラーハンドラ。

    shutil.rmtreeのonerrorコールバックとして使用する。
    Windowsでの読み取り専用ファイル削除問題を解決する。

    Args:
        func: 失敗した関数
        path: 対象のファイルパス
        excinfo: 例外情報
    """
    import os  # chmod用
    os.chmod(path, stat.S_IWRITE)
    func(path)

def clean_worktree(wt_path: str) -> None:
    """Git worktreeをクリーンアップする。

    worktreeを削除し、関連するGitの参照をプルーニングする。
    Windowsのファイルロック問題に対応するため、リトライを行う。

    Args:
        wt_path: 削除するworktreeのパス
    """
    wt_path_obj = Path(wt_path)
    if not wt_path_obj.exists():
        return
    subprocess.run(["git", "worktree", "remove", "--force", wt_path], capture_output=True)

    # Windowsファイルロック問題のリトライループ
    for _ in range(WORKTREE_CLEANUP_RETRIES):
        if not wt_path_obj.exists():
            break
        try:
            shutil.rmtree(wt_path, onerror=force_remove_readonly)
        except Exception:
            time.sleep(WORKTREE_CLEANUP_DELAY)

    subprocess.run(["git", "worktree", "prune"], capture_output=True)

def post_comment(iid: str, title: str, body: str) -> None:
    """GitHub Issueにコメントを投稿する。

    一時ファイルを作成してghコマンドでコメントを投稿する。
    post_progress設定がFalseの場合は何もしない。

    Args:
        iid: Issue ID
        title: コメントのタイトル
        body: コメント本文
    """
    if not CFG.post_progress:
        return
    tmp = FACTORY_DIR / f"tmp_comment_{iid}.md"
    try:
        tmp.write_text(f"## {title}\n\n{body}", encoding="utf-8")
        subprocess.run(["gh", "issue", "comment", iid, "--body-file", str(tmp)], check=False)
    finally:
        if tmp.exists():
            tmp.unlink()

# --- 機能実装 ---

def get_issue_body(iid: str) -> str:
    """GitHub Issueの本文を取得する。

    Args:
        iid: Issue ID

    Returns:
        str: Issueのタイトルと本文、取得失敗時は"No content"
    """
    res = subprocess.run(
        ["gh", "issue", "view", iid, "--json", "title,body", "--jq", r'"\(.title)\n\n\(.body)"'],
        text=True, capture_output=True, check=False, encoding='utf-8'
    )
    return res.stdout.strip() if res.returncode == 0 else "No content"

def try_assign_issue(iid: str) -> bool:
    """Issueに自分をアサインする（楽観的ロック方式）。

    既にアサインされている場合や、アサイン中に競合が発生した場合は
    ロールバックしてFalseを返す。

    Args:
        iid: Issue ID

    Returns:
        bool: アサイン成功時True、失敗時False
    """
    # 楽観的ロック: 既にアサインされているか確認
    res = subprocess.run(["gh", "issue", "view", iid, "--json", "assignees", "--jq", ".assignees | length"], text=True, capture_output=True)
    if res.stdout.strip() != "0":
        return False

    if subprocess.run(["gh", "issue", "edit", iid, "--add-assignee", "@me"], capture_output=True).returncode != 0:
        return False

    time.sleep(ASSIGN_VERIFY_DELAY)
    res = subprocess.run(["gh", "issue", "view", iid, "--json", "assignees", "--jq", ".assignees | length"], text=True, capture_output=True)
    if res.stdout.strip() == "1":
        return True

    # アサイン取り消し（競合発生時）
    subprocess.run(["gh", "issue", "edit", iid, "--remove-assignee", "@me"], capture_output=True)
    return False

def check_auth() -> bool:
    """GitHub CLI認証状態を確認する。

    認証が無効な場合はログを出力して待機後、Falseを返す。

    Returns:
        bool: 認証が有効な場合True、無効な場合False
    """
    if subprocess.run(["gh", "auth", "status"], capture_output=True).returncode != 0:
        log_msg("❌ 認証無効。待機中...", Colors.FAIL)
        time.sleep(AUTH_RETRY_DELAY)
        return False
    return True

def run_tests(wt_path: str) -> Tuple[bool, str]:
    """pytestを実行してテスト結果を返す。

    Args:
        wt_path: テストを実行するworktreeのパス

    Returns:
        Tuple[bool, str]: (成功フラグ, 出力内容)
    """
    log_msg("🧪 Pytest実行中...", Colors.OKBLUE)
    res = subprocess.run(
        ["uv", "run", "pytest", "-v", "--tb=short", "-q"],
        cwd=wt_path, capture_output=True, text=True, timeout=TEST_TIMEOUT, encoding='utf-8', errors='replace'
    )
    return (res.returncode == 0, res.stdout + "\n" + res.stderr)


def check_reject_status(iid: str) -> Tuple[bool, str]:
    """IssueにTech LeadからのRejectコメントがあるか確認する。

    Args:
        iid: Issue ID

    Returns:
        Tuple[bool, str]: (Rejectされた場合True, Reject理由)
    """
    res = subprocess.run(
        ["gh", "issue", "view", iid, "--json", "comments", "--jq", '.comments[] | select(.body | contains("🚨 [Reject]")) | .body'],
        text=True, capture_output=True, check=False, encoding='utf-8'
    )
    if res.returncode == 0 and res.stdout.strip():
        return (True, res.stdout.strip())
    return (False, "")

def rollback_task(iid: str, wt_path: str, br_name: str, reason: str) -> None:
    """タスクをロールバックする。

    worktreeとブランチを削除し、Issueのラベルを変更して失敗を通知する。

    Args:
        iid: Issue ID
        wt_path: worktreeのパス
        br_name: ブランチ名
        reason: ロールバックの理由
    """
    log_msg(f"🔄 ロールバック #{iid}: {reason}", Colors.WARNING, logging.WARNING)
    clean_worktree(wt_path)
    subprocess.run(["git", "branch", "-D", br_name], capture_output=True)

    subprocess.run(["gh", "issue", "edit", iid, "--remove-assignee", "@me", "--remove-label", CFG.label, "--add-label", "failed"], capture_output=True)
    post_comment(iid, "❌ タスク失敗", f"理由: {reason}\n\n`failed`ラベルを付与しました。")
    send_slack(f"❌ タスク #{iid} 失敗\n理由: {reason}", "#ff0000")

# --- メインロジック ---

class GracefulShutdown:
    """シグナルを受けてグレースフルシャットダウンを行うクラス。

    SIGINT/SIGTERMシグナルをキャッチして、メインループを安全に終了させる。

    Attributes:
        kill_now: シャットダウンが要求されたかどうか
    """
    kill_now = False

    def __init__(self) -> None:
        """シグナルハンドラを登録する。"""
        signal.signal(signal.SIGINT, self.exit_gracefully)
        signal.signal(signal.SIGTERM, self.exit_gracefully)

    def exit_gracefully(self, *args) -> None:
        """シャットダウン要求を処理する。

        Args:
            *args: シグナルハンドラに渡される引数（未使用）
        """
        self.kill_now = True
        log_msg("\n🛑 シャットダウン要求を受信...", Colors.WARNING)

def main() -> None:
    """メインエントリーポイント。

    GitHub Issueをポーリングし、検出したタスクを自動的に処理する。
    テスト生成、実装、レビュー、PR作成までの一連のワークフローを実行する。
    """
    killer = GracefulShutdown()
    log_msg(f"🏭 Factory v2.5 (Refined) 開始。ラベル: {CFG.label}", Colors.HEADER)

    if not check_auth():
        sys.exit(1)

    while not killer.kill_now:
        try:
            # 1. Issue検索
            res = subprocess.run(
                ["gh", "issue", "list", "--search", f"label:{CFG.label} no:assignee state:open sort:created-asc", "--limit", "1", "--json", "number", "--jq", ".[0].number"],
                text=True, capture_output=True, check=False
            )
            iid = res.stdout.strip()
            if not iid:
                time.sleep(POLL_INTERVAL)
                continue

            # 2. アサイン
            if not try_assign_issue(iid):
                log_msg(f"#{iid} をアサインできませんでした。リトライ中...", Colors.WARNING)
                continue

            log_msg(f"🎯 タスク開始 #{iid}", Colors.OKGREEN)
            send_slack(f"🎯 タスク開始 #{iid}", "#36a64f")

            br_name = f"feature/issue-{iid}"
            wt_path = str(WORKTREE_BASE / f"task-{iid}")

            clean_worktree(wt_path)
            subprocess.run(["git", "branch", "-D", br_name], capture_output=True)
            if subprocess.run(["git", "worktree", "add", wt_path, "-b", br_name]).returncode != 0:
                rollback_task(iid, wt_path, br_name, "Worktree作成失敗")
                continue

            # --- 実行フェーズ ---
            failed = False
            fail_reason = ""

            # フェーズA: テスト＆実装
            if not failed:
                log_msg("--- 💻 実装フェーズ ---", Colors.OKBLUE)

                # テスト作成
                if run_command(["claude", "-p", "/test", "--dangerously-skip-permissions", "--", iid], wt_path, True).returncode != 0:
                    failed = True
                    fail_reason = "テスト生成失敗"

                # 実装
                if not failed and run_command(["claude", "-p", "/impl", "--dangerously-skip-permissions", "--", iid], wt_path, True).returncode != 0:
                    failed = True
                    fail_reason = "実装失敗"

                # 検証
                if not failed:
                    passed, output = run_tests(wt_path)
                    if not passed:
                        log_msg("❌ テスト失敗。自動修正中...", Colors.FAIL)
                        # リトライ修正（自己修復）
                        if run_command(["claude", "-p", "/impl", "--dangerously-skip-permissions", "--", iid, "Fix test failures based on output"], wt_path, True).returncode == 0:
                            passed, output = run_tests(wt_path)

                    if not passed:
                        failed = True
                        fail_reason = f"テスト失敗:\n{output[-ERROR_MSG_MAX_LEN:]}"

            # フェーズB: レビュー
            if not failed:
                log_msg("--- 🔍 コードレビューフェーズ ---", Colors.OKBLUE)

                # レビューコマンド実行
                if run_command(["claude", "-p", "/review", "--dangerously-skip-permissions", "--", iid], wt_path, True).returncode != 0:
                    failed = True
                    fail_reason = "レビューコマンド失敗"

                # Rejectステータス確認
                if not failed:
                    rejected, reject_reason = check_reject_status(iid)
                    if rejected:
                        failed = True
                        fail_reason = f"コードレビュー却下:\n{reject_reason[:ERROR_MSG_MAX_LEN]}"

            # フェーズC: 同期＆PR
            if not failed:
                log_msg("--- ✅ 同期＆PR ---", Colors.OKGREEN)
                run_command(["claude", "-p", "/sync"], wt_path, True)

                # 安全のためforce-with-leaseを使用
                if subprocess.run(["git", "push", "origin", "HEAD", "--force-with-lease"], cwd=wt_path, check=False).returncode == 0:
                    subprocess.run(["gh", "pr", "create", "--title", f"feat: Resolve #{iid}", "--body", f"Closes #{iid}"], cwd=wt_path, check=False)
                    post_comment(iid, "🚀 完了", "PRを作成しました。")
                    log_msg(f"🚀 タスク #{iid} 完了！", Colors.OKGREEN)
                    send_slack(f"🚀 タスク #{iid} 完了！PRを作成しました。", "#36a64f")

                    # フェーズD: Kaizen（PR成功後に自動実行）
                    if CFG.enable_kaizen:
                        log_msg("--- 📚 Kaizenフェーズ ---", Colors.OKBLUE)
                        run_command(
                            ["claude", "-p", "/kaizen", "--dangerously-skip-permissions", "--", iid],
                            str(ROOT_DIR), True
                        )
                else:
                    rollback_task(iid, wt_path, br_name, "Push失敗（リモートが変更されています）")
            else:
                rollback_task(iid, wt_path, br_name, fail_reason)

            clean_worktree(wt_path)

        except Exception as e:
            log_msg(f"クリティカルエラー: {e}", Colors.FAIL, logging.ERROR)
            time.sleep(CRITICAL_ERROR_DELAY)

if __name__ == "__main__":
    main()
