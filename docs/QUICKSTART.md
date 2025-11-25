# AI Factory v2.6 クイックスタートガイド

このガイドでは、AI Factory v2.6 のワークフローと具体的な入力例を紹介します。

## 目次

- [推奨ワークフロー](#推奨ワークフロー)
- [実例: Task Tracker アプリの開発](#実例-task-tracker-アプリの開発)
- [コマンド別プロンプト例](#コマンド別プロンプト例)
- [よくあるシナリオ](#よくあるシナリオ)

---

## 推奨ワークフロー

AI Factory v2.6 は **2ステップ** でプロジェクトを完成させます:

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: /prepare                                               │
│  ┌─────────┐    ┌───────────┐    ┌─────────────┐               │
│  │ /spec   │───▶│ /critique │───▶│ /breakdown  │               │
│  │ 仕様作成 │    │ レビュー   │    │ Issue分解   │               │
│  └─────────┘    └───────────┘    └─────────────┘               │
│       ▲              │                   │                      │
│       └──────────────┘                   ▼                      │
│     REQUEST_CHANGES              GitHub Issues                  │
└─────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: /auto (または /run {id})                               │
│  ┌───────┐  ┌───────┐  ┌────────┐  ┌───────┐  ┌─────────┐     │
│  │ /test │─▶│ /impl │─▶│ /review│─▶│ /sync │─▶│ /kaizen │     │
│  │テスト  │  │ 実装  │  │ 監査   │  │ 同期  │  │ 改善    │     │
│  └───────┘  └───────┘  └────────┘  └───────┘  └─────────┘     │
│                 │                                    │          │
│                 ▼                                    ▼          │
│            pytest実行                           PR作成          │
└─────────────────────────────────────────────────────────────────┘
```

### 基本コマンド

```bash
# 1. 企画フェーズ（対話 → 仕様 → レビュー → Issue作成）
/prepare

# 2. 実装フェーズ（全Issueを自動処理）
/auto

# または、特定のIssueのみ処理
/run 1
```

---

## 実例: Task Tracker アプリの開発

ここでは「タスク管理アプリ」を例に、AI Factory の使い方を説明します。

### ステップ1: /prepare でプロジェクト準備

```bash
/prepare
```

**ヒアリングフェーズ（対話あり）:**

`/prepare` は最初にしっかりヒアリングを行い、要件を明確にしてから自動実行に進みます。

```
🤖 Claude: こんにちは！何を作りたいですか？

👤 ユーザー: シンプルなタスク管理CLIアプリを作りたいです。
   タスクの追加、一覧表示、完了マーク、削除ができるようにしたいです。

🤖 Claude: タスク管理CLIアプリですね。要件を明確にするためにいくつか確認させてください。

   【入力仕様】
   タスク追加時のデータはコマンドライン引数で受け取りますか？
   例: `task add "買い物に行く"` のような形式でしょうか？

👤 ユーザー: はい、その形式でお願いします。

🤖 Claude: 了解しました。
   【出力仕様】
   データの保存形式は JSON / SQLite / インメモリ のどれを希望しますか？

👤 ユーザー: JSONファイルで永続化したいです。

🤖 Claude: JSONファイルですね。保存先は `~/.task-tracker/tasks.json` でよいですか？

👤 ユーザー: それで大丈夫です。

🤖 Claude: 【エラー処理】
   存在しないタスクIDを指定した場合はどうしますか？
   1. エラーメッセージを表示して終了
   2. 何もせず静かに終了

👤 ユーザー: 1のエラーメッセージを表示してください。

🤖 Claude: 了解しました。要件が明確になりました。

## 要件サマリー

### 概要
シンプルなタスク管理CLIアプリケーション

### 入力
- コマンドライン引数: `task <command> [args]`

### 出力
- JSONファイル: `~/.task-tracker/tasks.json`

### 主要機能
1. タスク追加 (add)
2. タスク一覧 (list)
3. タスク完了 (done)
4. タスク削除 (delete)

### エラー処理
- 存在しないIDはエラーメッセージを表示

### スコープ外（やらないこと）
- GUI、Web UI
- 複数ユーザー対応
- クラウド同期

### 成功基準
- 全コマンドが動作すること
- テストが通ること

この内容で仕様書を作成し、レビュー、Issue分解まで自動実行します。よろしいですか？

👤 ユーザー: はい、お願いします。
```

**自動実行フェーズ（確認なし）:**

承認後は、確認なしで自動実行されます。

```
🤖 Claude: 承認を受けました。自動実行を開始します。

   ✅ /spec 完了 - docs/specs/spec-task-tracker.md を生成しました
   ✅ /critique 完了 - APPROVED
   ✅ /breakdown 完了 - 以下のIssueを作成しました:

   Issue #1: タスクデータモデルの実装
   Issue #2: JSONストレージの実装
   Issue #3: タスク追加機能 (add コマンド)
   Issue #4: タスク一覧表示機能 (list コマンド)
   Issue #5: タスク完了機能 (done コマンド)
   Issue #6: タスク削除機能 (delete コマンド)
   Issue #7: CLIエントリーポイントの実装

   次のステップ: `/auto` で全Issue自動実装、または `/run 1` で個別実装
```

### ステップ2: /auto で全Issue自動処理

```bash
/auto
```

**自動処理の流れ:**

```
🔍 label:todo の未アサインIssueを検索中...
   → Issue #1 を発見

📋 Issue #1: タスクデータモデルの実装
   ├─ 🔒 楽観的ロックでアサイン取得
   ├─ 📁 Worktree作成: .claude/worktrees/task-1
   ├─ 🧪 /test: tests/test_task_model.py 生成
   ├─ 💻 /impl: src/models/task.py 実装
   ├─ ✅ pytest: 全テスト通過
   ├─ 🔍 /review: 静的解析OK、変異テストOK
   ├─ 📚 /sync: ドキュメント更新
   ├─ 🚀 PR #8 作成
   ├─ 📝 /kaizen: 学びを記録
   └─ 🧹 Worktreeクリーンアップ

🔍 次のIssueを検索中...
   → Issue #2 を発見

📋 Issue #2: JSONストレージの実装
   ... (同様の処理)

... (Issue #7 まで繰り返し)

✅ 全Issue処理完了!

   📊 処理結果:
   ├─ 成功: 7件 (Issue #1-#7)
   ├─ 失敗: 0件
   └─ 作成されたPR: #8, #9, #10, #11, #12, #13, #14
```

### 生成される仕様書の例

`docs/specs/spec-task-tracker.md`:

```markdown
# Task Tracker CLI 仕様書

## 1. 概要

シンプルなタスク管理CLIアプリケーション。
開発者向けに、コマンドラインからタスクの追加・一覧・完了・削除を行う。

## 2. 機能要件

### 2.1 タスク追加 (add)
- コマンド: `task add "タスク名"`
- 動作: 新しいタスクを追加し、IDを表示
- 出力例: `✓ Task #1 added: "READMEを書く"`

### 2.2 タスク一覧 (list)
- コマンド: `task list`
- 動作: 全タスクを一覧表示
- 出力例:
  ```
  ID  Status  Title           Created
  1   [ ]     READMEを書く     2025-01-25
  2   [x]     テスト追加       2025-01-24
  ```

### 2.3 タスク完了 (done)
- コマンド: `task done <id>`
- 動作: 指定IDのタスクを完了にマーク
- 出力例: `✓ Task #1 marked as done`

### 2.4 タスク削除 (delete)
- コマンド: `task delete <id>`
- 動作: 指定IDのタスクを削除
- 出力例: `✓ Task #1 deleted`

## 3. データモデル

```python
@dataclass
class Task:
    id: int
    title: str
    done: bool = False
    created_at: datetime = field(default_factory=datetime.now)
```

## 4. ストレージ

- 形式: JSON
- パス: `~/.task-tracker/tasks.json`
- 構造:
  ```json
  {
    "tasks": [
      {"id": 1, "title": "...", "done": false, "created_at": "..."}
    ],
    "next_id": 2
  }
  ```

## 5. エッジケース

- 存在しないIDを指定 → エラーメッセージを表示
- 空のタスク名 → エラーメッセージを表示
- データファイルが存在しない → 自動作成
```

### 生成されるコードの例

`src/models/task.py`:

```python
"""タスクデータモデル。"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Task:
    """タスクを表すデータクラス。

    Attributes:
        id: タスクの一意識別子
        title: タスクのタイトル
        done: 完了フラグ
        created_at: 作成日時
    """
    id: int
    title: str
    done: bool = False
    created_at: datetime = field(default_factory=datetime.now)

    def mark_done(self) -> None:
        """タスクを完了にマークする。"""
        self.done = True

    def to_dict(self) -> dict:
        """辞書形式に変換する。

        Returns:
            タスク情報の辞書
        """
        return {
            "id": self.id,
            "title": self.title,
            "done": self.done,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Task":
        """辞書からTaskインスタンスを作成する。

        Args:
            data: タスク情報の辞書

        Returns:
            Taskインスタンス
        """
        return cls(
            id=data["id"],
            title=data["title"],
            done=data.get("done", False),
            created_at=datetime.fromisoformat(data["created_at"])
        )
```

`tests/test_task_model.py`:

```python
"""タスクモデルのテスト。"""
import pytest
from datetime import datetime
from src.models.task import Task


class TestTask:
    """Taskクラスのテスト。"""

    def test_タスク作成_正常系(self):
        """タスクが正しく作成されることを確認。"""
        task = Task(id=1, title="テストタスク")

        assert task.id == 1
        assert task.title == "テストタスク"
        assert task.done is False
        assert isinstance(task.created_at, datetime)

    def test_完了マーク(self):
        """mark_done()でdoneがTrueになることを確認。"""
        task = Task(id=1, title="テストタスク")
        task.mark_done()

        assert task.done is True

    def test_辞書変換_往復(self):
        """to_dict/from_dictの往復変換が正しく動作することを確認。"""
        original = Task(id=1, title="テストタスク", done=True)
        data = original.to_dict()
        restored = Task.from_dict(data)

        assert restored.id == original.id
        assert restored.title == original.title
        assert restored.done == original.done
```

---

## コマンド別プロンプト例

### /prepare - 企画フェーズ

**入力例1: Webアプリ**
```
/prepare

👤: ブログシステムを作りたいです。
    - 記事の投稿・編集・削除
    - Markdownサポート
    - タグ機能
    - FastAPI + SQLite
```

**入力例2: CLIツール**
```
/prepare

👤: Git commitメッセージを自動生成するCLIツールを作りたいです。
    - git diffを解析
    - Conventional Commits形式で出力
    - --dry-run オプション
```

**入力例3: ライブラリ**
```
/prepare

👤: 日本語テキストの形態素解析ライブラリを作りたいです。
    - MeCabのラッパー
    - 品詞フィルタリング機能
    - バッチ処理対応
```

### /run - 単一Issue処理

**基本形式:**
```bash
/run {Issue番号}
```

**例:**
```bash
# Issue #5 を処理
/run 5

# Issue #12 を処理
/run 12
```

### /auto - 全Issue自動処理

**基本形式:**
```bash
/auto
```

**並列実行（複数ターミナルで実行可能）:**
```bash
# ターミナル1
claude -p "/auto"

# ターミナル2（同時実行OK、楽観的ロックで競合回避）
claude -p "/auto"
```

### /spec - 仕様書作成（単体実行）

```bash
/spec

👤: ユーザー認証機能を追加したいです。
    - メールアドレス + パスワード認証
    - JWTトークン発行
    - リフレッシュトークン対応
```

### /critique - 仕様レビュー（単体実行）

```bash
/critique
```

**出力例:**
```
📋 仕様書レビュー結果

✅ 良い点:
- データモデルが明確に定義されている
- エッジケースが網羅されている

⚠️ 改善点:
- セキュリティ: パスワードのハッシュ化方式が未定義
- パフォーマンス: 大量データ時のページネーションが未考慮

判定: REQUEST_CHANGES
```

### /breakdown - Issue分解（単体実行）

```bash
/breakdown
```

**出力例:**
```
📋 Issue分解結果

仕様書を分析し、以下のIssueを作成しました:

Issue #1: [基盤] データベーススキーマ定義
Issue #2: [基盤] ユーザーモデル実装
Issue #3: [機能] 新規登録API
Issue #4: [機能] ログインAPI
Issue #5: [機能] トークンリフレッシュAPI
Issue #6: [テスト] E2Eテスト追加
```

---

## よくあるシナリオ

### シナリオ1: 新規プロジェクト開発

```bash
# 1. プロジェクト初期化
git init my-project
cd my-project

# 2. AI Factory セットアップ
# (テンプレートからコピーまたは手動設定)

# 3. 企画フェーズ
/prepare

# 4. 実装フェーズ（全自動）
/auto

# 5. PRをレビュー・マージ
gh pr list
gh pr merge 1 --squash
```

### シナリオ2: 既存プロジェクトへの機能追加

```bash
# 1. 新機能の企画
/prepare

👤: 既存の認証システムに2FAを追加したいです。
    - TOTP (Google Authenticator互換)
    - バックアップコード
    - 設定画面

# 2. Issueが作成されたら実装
/auto
```

### シナリオ3: バグ修正

```bash
# 1. 手動でIssueを作成（GitHubで）
# Title: [Bug] ログイン時にエラーが発生する
# Label: todo

# 2. 自動処理
/run 42
```

### シナリオ4: 特定のIssueだけ処理したい

```bash
# Issue #5 のみを処理
/run 5

# /auto は他のIssueも処理するので注意
```

### シナリオ5: 処理を中断したい

```bash
# Ctrl+C で中断可能
# 中断後、Worktreeが残っている場合はクリーンアップ

# Worktree一覧を確認
git worktree list

# 手動でクリーンアップ
git worktree remove .claude/worktrees/task-5 --force
git worktree prune
```

---

## Slack通知のセットアップ

AI Factory は Slack Webhook を使って進捗を通知できます。

### 設定方法

1. Slack Webhook URL を取得（[Slack API](https://api.slack.com/messaging/webhooks) から作成）

2. 環境変数を設定:
```bash
export AI_FACTORY_WEBHOOK="<your-slack-webhook-url>"
```

### 通知タイミング

| イベント | メッセージ | レベル |
|---------|-----------|--------|
| タスク開始 | 🎯 タスク開始 #1 | info |
| PR作成完了 | 🚀 PR作成完了 #1 | success |
| 実装失敗 | ❌ 実装失敗 #1 | error |
| 自動処理開始 | 🏭 自動処理開始 | info |
| 自動処理完了 | 📊 自動処理完了: 成功 N件 | success |

### 手動通知

```bash
# 通知スクリプトを直接使用
python .claude/factory/notify.py "メッセージ" --level success

# オプション
#   --title "タイトル"
#   --level info|success|warning|error
#   --color "#ff0000"
```

---

## Tips

### 良いプロンプトの書き方

**良い例:**
```
タスク管理CLIアプリを作りたいです。

要件:
- タスクの追加・一覧・完了・削除
- JSONファイルで永続化
- Python 3.12、型ヒント必須

想定ユーザー: 開発者
```

**悪い例:**
```
タスク管理アプリ作って
```

### Issueの書き方

**良いIssue:**
```markdown
## 概要
ユーザープロフィール取得APIを実装する

## 仕様
- エンドポイント: GET /api/users/{id}
- レスポンス: { name, email, created_at }
- 認証: Bearer token必須

## 受け入れ条件
- [ ] 200 OK でユーザー情報を返す
- [ ] 404 Not Found で存在しないユーザー
- [ ] 401 Unauthorized で未認証
```

### デバッグ

```bash
# 処理中のIssueを確認
gh issue list --assignee @me

# 失敗したIssueを確認
gh issue list --label failed

# Worktreeの状態を確認
git worktree list
```

---

## 次のステップ

- [COMMANDS.md](COMMANDS.md) - 11個のコマンドの完全リファレンス
- [AGENTS.md](AGENTS.md) - 8つのAIエージェントの詳細
- [WORKFLOW.md](WORKFLOW.md) - ワークフローの内部動作

---

**AI Factory v2.6 クイックスタートガイド** - 実践的なワークフローと入力例
