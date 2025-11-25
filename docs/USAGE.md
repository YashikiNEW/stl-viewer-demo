# AI Factory v2.6 ユーザーズガイド

このガイドでは、AI Factory v2.6 のセットアップ、使用方法、トラブルシューティングについて説明します。

## 目次

- [完全な使用例](#完全な使用例)
- [設定オプション詳細](#設定オプションオプション詳細)
- [高度な使い方](#高度な使い方)
- [トラブルシューティング](#トラブルシューティング)

---

## 完全な使用例

ここでは、AI Factory v2.6 を使用してプロジェクトを開発する例を示します。

### 新規プロジェクトの開発

#### ステップ1: /prepare でプロジェクト準備

```bash
/prepare
```

**ヒアリングフェーズ（対話あり）:**

```
🤖 Claude: こんにちは！何を作りたいですか？

👤 ユーザー: ユーザープロフィールを取得するAPIを作りたいです。

🤖 Claude: 要件を明確にするためにいくつか確認させてください。

   【入力仕様】
   ユーザーIDはどのような形式で受け取りますか？
   1. 関数引数（int型）
   2. HTTPリクエストパラメータ

👤 ユーザー: 関数引数でお願いします。

🤖 Claude: 【出力仕様】
   戻り値はどのような形式ですか？

👤 ユーザー: name, email, created_at を含む辞書形式で。

🤖 Claude: 【エラー処理】
   ユーザーが見つからない場合はどうしますか？

👤 ユーザー: UserNotFoundError を raise してください。

🤖 Claude: 了解しました。要件が明確になりました。

## 要件サマリー
...

この内容で仕様書を作成し、レビュー、Issue分解まで自動実行します。よろしいですか？

👤 ユーザー: はい、お願いします。
```

**自動実行フェーズ（確認なし）:**

```
🤖 Claude: 承認を受けました。自動実行を開始します。

   ✅ /spec 完了 - docs/specs/spec-user-profile.md を生成しました
   ✅ /critique 完了 - APPROVED
   ✅ /breakdown 完了 - 以下のIssueを作成しました:

   Issue #42: ユーザープロフィール表示機能の実装

   次のステップ: `/auto` で全Issue自動実装、または `/run 42` で個別実装
```

#### ステップ2: /auto で全Issue自動処理

```bash
/auto
```

**完全自動実行（確認なし）:**

```
🔍 label:todo の未アサインIssueを検索中...
   → Issue #42 を発見

📋 Issue #42: ユーザープロフィール表示機能の実装
   ├─ 🔒 楽観的ロックでアサイン取得
   ├─ 📁 Worktree作成: .claude/worktrees/task-42
   ├─ 🧪 /test: tests/test_user_profile.py 生成
   ├─ 💻 /impl: src/user_profile.py 実装
   ├─ ✅ pytest: 全テスト通過
   ├─ 🔍 /review: 静的解析OK、変異テストOK
   ├─ 📚 /sync: ドキュメント更新
   ├─ 🚀 PR #43 作成
   ├─ 📝 Issueに完了コメント投稿
   ├─ 📝 /kaizen: 学びを記録
   └─ 🧹 Worktreeクリーンアップ

✅ 全Issue処理完了!

   📊 処理結果:
   ├─ 成功: 1件 (Issue #42)
   ├─ 失敗: 0件
   └─ 作成されたPR: #43
```

### ステップ3: 生成されたファイルを確認

```bash
# Git Worktreeに移動
cd .claude/worktrees/task-42

# 生成されたファイルを確認
ls -la docs/specs/
ls -la tests/
ls -la src/
```

**期待される構成:**

```
.claude/worktrees/task-42/
├── docs/
│   ├── product/
│   │   └── issue-42.md                 # Issue内容
│   ├── specs/
│   │   └── feature-42.md               # 詳細設計書
│   └── architecture/
│       └── current_system.md           # 更新されたアーキテクチャ文書
├── tests/
│   └── test_feature_42.py              # テストコード
└── src/
    └── user_profile.py                 # 実装コード（例）
```

### ステップ4: 設計書を確認

```bash
cat docs/specs/feature-42.md
```

**期待される内容（例）:**

```markdown
# Feature #42: ユーザープロフィール表示機能

## 1. 概要
ユーザーIDを指定してプロフィール情報を取得する機能を実装します。

## 2. 仕様詳細

### 2.1 関数シグネチャ
```python
def get_user_profile(user_id: int) -> dict:
    """
    ユーザープロフィールを取得します。

    Args:
        user_id: ユーザーID（正の整数）

    Returns:
        ユーザー情報の辞書:
        - name (str): ユーザー名
        - email (str): メールアドレス
        - created_at (datetime): アカウント作成日時

    Raises:
        UserNotFoundError: 指定されたユーザーが存在しない場合
        ValueError: user_idが無効な場合（0以下）
    """
```

### 2.2 データ構造
```python
{
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": datetime(2025, 1, 15, 12, 0, 0)
}
```

## 3. エッジケース
- user_id が 0 以下 → ValueError
- ユーザーが存在しない → UserNotFoundError
- データベース接続エラー → DatabaseError（既存例外をそのまま伝播）

## 4. 実装計画
1. `src/user_profile.py` を新規作成
2. `UserNotFoundError` 例外クラスを定義
3. `get_user_profile()` 関数を実装
4. 既存の `db.py` モジュールを使用してDB接続
```

### ステップ5: テストコードを確認

```bash
cat tests/test_feature_42.py
```

**期待される内容（例）:**

```python
import pytest
from datetime import datetime
from unittest.mock import Mock, patch
from src.user_profile import get_user_profile, UserNotFoundError


def test_get_user_profile_success():
    """正常系: ユーザープロフィールを正しく取得できる"""
    # Arrange
    mock_db = Mock()
    mock_db.query.return_value = {
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": datetime(2025, 1, 15)
    }

    # Act
    with patch('src.user_profile.db', mock_db):
        result = get_user_profile(123)

    # Assert
    assert result["name"] == "John Doe"
    assert result["email"] == "john@example.com"
    assert isinstance(result["created_at"], datetime)


def test_get_user_profile_not_found():
    """異常系: ユーザーが存在しない場合"""
    mock_db = Mock()
    mock_db.query.return_value = None

    with patch('src.user_profile.db', mock_db):
        with pytest.raises(UserNotFoundError):
            get_user_profile(999)


def test_get_user_profile_invalid_id():
    """境界値: user_idが0以下の場合"""
    with pytest.raises(ValueError):
        get_user_profile(0)

    with pytest.raises(ValueError):
        get_user_profile(-1)
```

### ステップ6: 実装コードを確認

```bash
cat src/user_profile.py
```

**期待される内容（例）:**

```python
from datetime import datetime
from typing import Dict
from src.db import db  # 既存のDB接続モジュール


class UserNotFoundError(Exception):
    """ユーザーが見つからない場合の例外"""
    pass


def get_user_profile(user_id: int) -> Dict[str, any]:
    """
    ユーザープロフィールを取得します。

    Args:
        user_id: ユーザーID（正の整数）

    Returns:
        ユーザー情報の辞書

    Raises:
        UserNotFoundError: ユーザーが存在しない場合
        ValueError: user_idが無効な場合
    """
    if user_id <= 0:
        raise ValueError(f"Invalid user_id: {user_id}")

    result = db.query(f"SELECT * FROM users WHERE id = {user_id}")

    if result is None:
        raise UserNotFoundError(f"User with id {user_id} not found")

    return {
        "name": result["name"],
        "email": result["email"],
        "created_at": result["created_at"]
    }
```

### ステップ7: PRを確認してマージ

```bash
# PRのURLを確認
gh pr view --web
```

**期待される画面:**

```
Pull Request #43
Title: feat: Resolve #42
State: Open
Branches: feature/issue-42 → main

Body:
Closes #42

📋 変更内容:
- ユーザープロフィール表示機能を実装
- テストケース追加（正常系・異常系・境界値）
- ドキュメント更新

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

レビュー後、マージボタンをクリックしてマージします。

### ステップ8: Worktreeのクリーンアップ確認

```bash
# /run 完了後は自動的にworktreeがクリーンアップされます
ls .claude/worktrees/
```

**期待される出力:**

```
# タスク完了後はworktreeが削除されている
(empty)
```

---

## 設定オプション詳細

### config.yaml 完全リファレンス

ファイル: `.claude/factory/config.yaml`

```yaml
factory:
  label: "todo"                   # 【必須】監視するGitHub Issueラベル
  max_retries: 3                  # 【推奨】コマンド失敗時のリトライ回数（デフォルト: 3）
  critique_rounds: 3              # 【推奨】設計レビューのラウンド数（デフォルト: 3）
  stalemate_threshold: 0.99       # 【高度】停滞検出の類似度閾値（デフォルト: 0.99 = 99%）

logging:
  max_bytes: 5242880              # 【推奨】ログファイル最大サイズ（デフォルト: 5MB）
  backup_count: 5                 # 【推奨】ログバックアップ数（デフォルト: 5世代）

notifications:
  post_progress: true             # 【推奨】GitHub Issueへの進捗コメント投稿（デフォルト: true）
  # webhook_url は環境変数から読み込み（下記参照）
```

#### パラメータ詳細

##### `factory.label`
- **型**: 文字列
- **デフォルト**: `"todo"`
- **説明**: manager.pyが監視するGitHub Issueのラベル。このラベルが付いていて、未割り当て（no assignee）のIssueが自動処理されます。
- **例**: `"ai-factory"`, `"auto-impl"`

##### `factory.max_retries`
- **型**: 整数
- **デフォルト**: `3`
- **説明**: claude コマンドやシステムコマンドが失敗した時のリトライ回数。リトライ間隔は2秒固定。
- **推奨値**: 3-5（ネットワークが不安定な環境では5推奨）

##### `factory.critique_rounds`
- **型**: 整数
- **デフォルト**: `3`
- **説明**: Phase 2（設計フェーズ）で design/critique を繰り返す最大ラウンド数。
- **推奨値**: 2-3（1だとレビューが不十分、4以上は時間がかかりすぎる）

##### `factory.stalemate_threshold`
- **型**: 浮動小数点（0.0-1.0）
- **デフォルト**: `0.99`
- **説明**: 設計書の変更が停滞したと判定する類似度閾値。`difflib.SequenceMatcher` で前ラウンドと比較し、類似度がこの値以上なら停滞と判定。
- **推奨値**: 0.95-0.99（高いほど厳格）

##### `logging.max_bytes`
- **型**: 整数（バイト）
- **デフォルト**: `5242880`（5MB）
- **説明**: `logs/manager.log` の最大サイズ。この値を超えるとローテーション。
- **推奨値**: 5MB-10MB

##### `logging.backup_count`
- **型**: 整数
- **デフォルト**: `5`
- **説明**: ログファイルのバックアップ世代数。`manager.log.1`, `manager.log.2`, ... と保存。
- **Python 3.12+** (推奨: `uv` による管理)
- **uv** (高速なPythonパッケージマネージャー)

##### `notifications.post_progress`
- **型**: 真偽値
- **デフォルト**: `true`
- **説明**: GitHub Issueにタスク開始・完了・失敗時のコメントを自動投稿するかどうか。
- **推奨値**: `true`（進捗が可視化される）

### 環境変数

#### `AI_FACTORY_WEBHOOK`
- **説明**: Slack Webhook URL（通知用）
- **必須**: いいえ（任意）
- **設定方法**:
  ```bash
  export AI_FACTORY_WEBHOOK="https://hooks.slack.com/services/T00/B00/xxxx"
  ```
- **補足**: 未設定の場合はSlack通知なし（GitHub通知のみ）

#### `GITHUB_TOKEN`
- **説明**: GitHub Personal Access Token
- **必須**: いいえ（`gh auth` 使用時は不要）
- **設定方法**:
  ```bash
  export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
  ```
- **補足**: `gh auth login` で認証済みなら不要

---

## 高度な使い方

### 手動でコマンドを実行

自動実行ではなく、各フェーズを手動で実行することも可能です。

#### 企画フェーズを個別に実行

```bash
# 仕様書作成（対話形式）
/spec

# 仕様書をレビュー
/critique

# Issueに分解
/breakdown
```

#### 実装フェーズを個別に実行

```bash
# Git Worktreeを作成
git worktree add .claude/worktrees/task-42 -b feature/issue-42
cd .claude/worktrees/task-42

# テストコードを生成
/test 42

# 実装を作成
/impl 42

# コードレビュー
/review 42

# ドキュメントを同期
/sync

# 学びを記録
/kaizen 42

# クリーンアップ
cd ../..
git worktree remove .claude/worktrees/task-42
```

**メリット**:
- 各ステップを個別に確認・調整できる
- デバッグが容易

**デメリット**:
- 手動操作が必要
- ワークフロー全体の管理が複雑

### カスタムエージェントの追加

新しいエージェントを追加する手順:

#### 1. エージェント定義ファイルを作成

```bash
cat > .claude/agents/security_auditor.md <<EOF
---
name: Security Auditor
description: セキュリティ監査専門家
---
あなたはセキュリティ監査の専門家です。

**役割**:
- コードのセキュリティ脆弱性を検出
- OWASP Top 10 に基づいた監査
- 脆弱性レポートを作成

**監査項目**:
- SQLインジェクション
- XSS（クロスサイトスクリプティング）
- CSRF（クロスサイトリクエストフォージェリ）
- 認証・認可の不備
- 機密情報の漏洩
EOF
```

#### 2. コマンド定義ファイルを作成

```bash
cat > .claude/commands/audit.md <<EOF
---
description: Security audit
arguments:
  - name: id
---
@Security_Auditor セキュリティ監査
入力: src/
出力: docs/security/audit-{id}.md

**指示**:
実装コードをセキュリティ監査し、以下の項目を確認してください:
1. SQLインジェクションの有無
2. XSSの可能性
3. 認証・認可のチェック
4. 機密情報のハードコーディング

脆弱性が見つかった場合は、具体的な修正方法を提示してください。
EOF
```

#### 3. manager.pyに統合（オプション）

manager.pyの Phase 3（実装フェーズ）後に監査フェーズを追加:

```python
# Phase B: Impl & Test の後に追加
if not failed:
    log_msg("--- 🔒 Security Audit ---", Colors.OKBLUE)
    if run_command(["claude", "-p", "/audit", "--dangerously-skip-permissions", "--", iid], wt_path, True) != 0:
        log_msg("⚠️ Security audit warnings detected", Colors.WARNING)
        # 警告のみ、失敗扱いにはしない
```

#### 4. 手動で実行

```bash
cd .claude/worktrees/task-42
claude -p /audit -- 42
```

### カスタムコマンドの追加

既存のコマンド（/design, /critique, /test, /impl, /sync）以外に、独自のコマンドを追加できます。

#### 例: /benchmark コマンド

```bash
cat > .claude/commands/benchmark.md <<EOF
---
description: Run performance benchmarks
arguments:
  - name: id
---
@Performance_Engineer ベンチマーク実行
入力: src/
出力: docs/performance/benchmark-{id}.md

**指示**:
実装されたコードのパフォーマンスベンチマークを実行してください。

**ベンチマーク項目**:
1. 実行時間（平均・最小・最大）
2. メモリ使用量
3. スループット（1秒あたりの処理数）

**ツール**: pytest-benchmark を使用
**出力形式**: Markdown表形式
EOF
```

使用方法:

```bash
claude -p /benchmark -- 42
```

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. 認証エラー: `gh auth status` が失敗する

**症状:**
```
[12:34:56] ERROR: ❌ Auth Invalid. Waiting...
```

**原因**: GitHub CLI が認証されていない

**解決方法:**
```bash
# 認証状態を確認
gh auth status

# 再認証
gh auth login

# ブラウザで認証を完了
```

#### 2. テスト失敗: pytest が通らない

**症状:**
```
[12:34:56] ERROR: ❌ Tests Failed. Auto-fixing...
[12:35:20] ERROR: ❌ Tests failed:
FAILED tests/test_feature_42.py::test_get_user_profile_success
```

**原因**: 実装コードにバグがある、またはテストケースが厳しすぎる

**解決方法:**

```bash
# 該当のworktreeに移動
cd .claude/worktrees/task-42

# テストを手動で実行して詳細を確認
uv run pytest tests/test_feature_42.py -v --tb=short

# ログを確認
cat .claude/factory/logs/manager.log | grep "test_feature_42"

# 必要に応じて手動で修正
vi src/user_profile.py
uv run pytest tests/test_feature_42.py -v

# 修正後、コミット
git add .
git commit -m "fix: resolve test failures"
git push origin HEAD
```

#### 3. Push失敗: `--force-with-lease` が拒否される

**症状:**
```
[12:34:56] ERROR: 🔄 Rollback #42: Push Failed (Remote has changed)
```

**原因**: 他の開発者が同じブランチにpushした（リモートに変更がある）

**解決方法:**

```bash
# リモートの変更を確認
cd .claude/worktrees/task-42
git fetch origin
git log origin/feature/issue-42

# マージして再push
git merge origin/main
git push origin HEAD

# または、手動でPRを作成
gh pr create --title "feat: Resolve #42" --body "Closes #42"
```

#### 4. 処理状況を確認したい

**症状:** `/auto` や `/run` の処理状況を確認したい

**解決方法:**

```bash
# 処理中のIssueを確認
gh issue list --assignee @me

# 失敗したIssueを確認
gh issue list --label failed

# 残りのTODO Issueを確認
gh issue list --label todo --search "no:assignee"

# Worktreeの状態を確認
git worktree list
```

#### 5. Worktreeが削除されない

**症状:**
```bash
$ ls .claude/worktrees/
task-42  task-43  task-44
```

**原因**: タスク失敗時やmanager.pyの異常終了時にworktreeが残る場合がある

**解決方法:**

```bash
# 手動でworktreeを削除
git worktree remove .claude/worktrees/task-42 --force

# ブランチも削除
git branch -D feature/issue-42

# Git worktreeリストをクリーンアップ
git worktree prune
```

#### 6. Slack通知が届かない

**症状**: manager.pyは正常動作しているが、Slackに通知が来ない

**原因**: `AI_FACTORY_WEBHOOK` が未設定、または無効

**解決方法:**

```bash
# 環境変数を確認
echo $AI_FACTORY_WEBHOOK

# 未設定の場合は設定
export AI_FACTORY_WEBHOOK="https://hooks.slack.com/services/T00/B00/xxxx"

# worker.shを再起動
pkill -f worker.sh
bash worker.sh
```

#### 7. 停滞検出が誤作動する

**症状**: 設計書が実際には変更されているのに「Stalemate detected」と表示される

**原因**: `stalemate_threshold` が高すぎる（0.99 = 99%類似度）

**解決方法:**

```yaml
# config.yamlを編集
factory:
  stalemate_threshold: 0.95  # 99% → 95% に緩和
```

#### 8. コマンドがタイムアウトする

**症状**: 長時間実行されるコマンド（大規模な実装など）がタイムアウトする

**原因**: デフォルトのコマンドタイムアウトが短い

**解決方法:**

manager.pyの `run_command()` 関数にタイムアウトパラメータを追加:

```python
# Before
subprocess.run(cmd_list, cwd=cwd, ...)

# After
subprocess.run(cmd_list, cwd=cwd, timeout=600, ...)  # 10分に延長
```

---

### 処理状況の確認方法

#### Issueの状態を確認

```bash
# 処理中のIssue（自分にアサインされている）
gh issue list --assignee @me

# 失敗したIssue
gh issue list --label failed

# 残りのTODO Issue
gh issue list --label todo --search "no:assignee"
```

#### Issueのコメントを確認

`/run` は成功・失敗時にIssueにコメントを投稿します：

```bash
# Issue #42 のコメントを確認
gh issue view 42 --comments
```

#### Git Worktreeの状態を確認

```bash
# 現在のWorktree一覧
git worktree list

# 手動でクリーンアップ（必要な場合）
git worktree remove .claude/worktrees/task-42 --force
git worktree prune
```

---

### デバッグ方法

#### 1. 個別コマンドを手動で実行

問題が発生した場合、個別コマンドを手動で実行してデバッグできます：

```bash
# Git Worktreeを作成
git worktree add .claude/worktrees/task-42 -b feature/issue-42
cd .claude/worktrees/task-42

# 各コマンドを個別に実行
/test 42
/impl 42
/review 42
```

#### 2. テストを手動で実行

```bash
cd .claude/worktrees/task-42
uv run pytest -v
```

#### 3. 静的解析を手動で実行

```bash
cd .claude/worktrees/task-42
uv run ruff check src/
uv run mypy src/
```

---

## 次のステップ

- [AGENTS.md](AGENTS.md) - 7つのAIエージェントの詳細を学ぶ
- [COMMANDS.md](COMMANDS.md) - 9つのコマンドの完全リファレンスを確認
- [WORKFLOW.md](WORKFLOW.md) - ワークフローの内部動作を理解する

---

**AI Factory v2.6 使用ガイド** - 詳細な使用方法とトラブルシューティング
