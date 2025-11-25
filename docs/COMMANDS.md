# AI Factory v2.6 コマンドリファレンス

このガイドでは、AI Factory v2.6 の11個のコマンドについて詳しく説明します。

## 目次

- [コマンド概要](#コマンド概要)
- [一気通貫コマンド](#一気通貫コマンド)
  - [/prepare - 企画フェーズ一気通貫](#prepare---企画フェーズ一気通貫)
  - [/run - 実装フェーズ一気通貫](#run---実装フェーズ一気通貫)
  - [/auto - TODO Issue自動連続処理](#auto---todo-issue自動連続処理)
- [各コマンドの詳細](#各コマンドの詳細)
  - [1. /spec - プロジェクト仕様策定](#1-spec---プロジェクト仕様策定)
  - [2. /breakdown - Issue分解](#2-breakdown---issue分解)
  - [3. /critique - 設計レビュー](#3-critique---設計レビュー)
  - [4. /test - テストコード生成](#4-test---テストコード生成)
  - [5. /impl - 機能実装](#5-impl---機能実装)
  - [6. /sync - ドキュメント同期](#6-sync---ドキュメント同期)
  - [7. /review - コード監査](#7-review---コード監査)
  - [8. /kaizen - 継続的改善](#8-kaizen---継続的改善)
- [コマンドの手動実行](#コマンドの手動実行)
- [コマンドのカスタマイズ](#コマンドのカスタマイズ)

---

## コマンド概要

AI Factory は11個のコマンドを提供し、開発プロセスの各フェーズをカバーします。

### コマンド一覧

| コマンド | 説明 | エージェント | フェーズ | 引数 | 定義ファイル |
|---------|------|------------|---------|------|------------|
| `/prepare` | **企画フェーズ一気通貫** | Product Manager | 企画 | なし | [prepare.md](../.claude/commands/prepare.md) |
| `/run` | **実装フェーズ一気通貫** | 複数 | 実装 | Issue ID | [run.md](../.claude/commands/run.md) |
| `/auto` | **TODO Issue自動連続処理** | 複数 | 実装 | なし | [auto.md](../.claude/commands/auto.md) |
| `/spec` | プロジェクト仕様策定 | Product Manager | 企画 | なし | [spec.md](../.claude/commands/spec.md) |
| `/critique` | 設計レビュー | Critic | 企画 | なし | [critique.md](../.claude/commands/critique.md) |
| `/breakdown` | 仕様書をIssueに分解 | Issue Planner | 企画 | なし | [breakdown.md](../.claude/commands/breakdown.md) |
| `/test` | テストコード生成 | QA Engineer | 実装 | Issue ID | [test.md](../.claude/commands/test.md) |
| `/impl` | 機能実装 | Coder | 実装 | Issue ID | [impl.md](../.claude/commands/impl.md) |
| `/review` | コード監査・変異テスト | Tech Lead | 実装 | Issue ID | [review.md](../.claude/commands/review.md) |
| `/sync` | ドキュメント同期 | Librarian | 実装 | なし | [sync.md](../.claude/commands/sync.md) |
| `/kaizen` | 継続的改善（知識蓄積） | Scrum Master | 実装 | Issue ID | [kaizen.md](../.claude/commands/kaizen.md) |

### コマンドフロー図

```mermaid
graph LR
    subgraph 企画フェーズ["/prepare で一気通貫"]
        S[/spec] --> CR[/critique]
        CR -->|APPROVED| BR[/breakdown]
        CR -->|REQUEST_CHANGES| S
    end

    BR --> I[GitHub Issues]

    subgraph 実装フェーズ["/run {id} または /auto で一気通貫"]
        I --> T[/test]
        T --> IM[/impl]
        IM --> PT[pytest]
        PT -->|失敗| IM
        PT -->|成功| R[/review]
        R -->|Reject| IM
        R -->|Approved| SY[/sync]
        SY --> PR[PR作成]
        PR --> KZ[/kaizen]
    end

    style S fill:#e1f5ff
    style CR fill:#ffccbc
    style BR fill:#e1f5ff
    style T fill:#f8bbd0
    style IM fill:#d1c4e9
    style R fill:#c8e6c9
    style SY fill:#b2dfdb
    style KZ fill:#ffecd2
```

### 推奨ワークフロー

```bash
# 1. 企画フェーズ（仕様書作成 → レビュー → Issue分解）
/prepare

# 2. 実装フェーズ（全Issueを自動処理）
/auto

# または、特定のIssueのみ処理
/run 42
```

---

## 一気通貫コマンド

### /prepare - 企画フェーズ一気通貫

**定義ファイル**: [.claude/commands/prepare.md](../.claude/commands/prepare.md)

#### シンタックス

```bash
/prepare
```

#### 説明

ヒアリング → 仕様書作成 → レビュー → Issue分解を一連の流れで実行します。

#### 全体フロー

```
/prepare
│
├─── ヒアリングフェーズ（対話あり）─────────────┐
│    ユーザーと対話して要件を明確化              │
│    要件サマリーの承認を得る                   │
└───────────────────────────────────────────────┘
         ↓ 承認後
┌─── 自動実行フェーズ（確認なし）───────────────┐
│    /spec → /critique → /breakdown            │
│    途中で停止・確認しない                     │
└───────────────────────────────────────────────┘
         ↓
     最終報告
```

#### ヒアリングフェーズ（対話あり）

以下の項目が**全て明確になるまで**ヒアリングを続行します：

| # | 項目 | 確認すべきこと |
|---|------|---------------|
| 1 | **入力仕様** | 何を受け取るか？データ形式は？ |
| 2 | **出力仕様** | 何を生成するか？データ形式は？ |
| 3 | **処理ロジック** | 入力→出力の変換ルールは？ |
| 4 | **エラー処理** | 異常時の動作は？ |
| 5 | **スコープ外** | やらないことは何か？ |
| 6 | **成功基準** | 何をもって完了とするか？ |

全項目が明確になったら、**要件サマリー**を提示し、承認を得ます。

#### 自動実行フェーズ（確認なし）

承認後は、確認なしで以下を自動実行します：

1. **仕様書作成**: `/spec` コマンドを実行
2. **レビュー**: `/critique` コマンドを実行（`REQUEST_CHANGES` の場合は修正して再実行）
3. **Issue分解**: `/breakdown` コマンドを実行

**重要**: このフェーズではユーザーに確認を求めません。

#### 使用エージェント

- **@Product_Manager** - 仕様書作成とレビュー

---

### /run - 実装フェーズ一気通貫

**定義ファイル**: [.claude/commands/run.md](../.claude/commands/run.md)

#### シンタックス

```bash
/run {issue_id}
```

#### 説明

指定されたIssueに対して、テスト生成から実装、レビュー、PR作成までを一気通貫で実行します。

**重要**: このコマンドは**完全自動実行モード（確認なし）**で動作します。途中でユーザーに確認を求めません。

#### 実行フロー

1. **準備**: Issueの内容取得、アサイン、Git Worktree作成
2. **テスト生成**: `/test` 相当の処理
3. **実装**: `/impl` 相当の処理（テスト失敗時は修正リトライ）
4. **レビュー**: `/review` 相当の処理
5. **同期**: `/sync` 相当の処理
6. **PR作成**: `git push` + `gh pr create`、Issueに完了コメント投稿
7. **Kaizen**: `/kaizen` 相当の処理
8. **クリーンアップ**: Worktree削除

#### 成功時の出力

- PR作成（テスト結果・変更内容を含むbody）
- Issueに完了コメント投稿

#### 失敗時の出力

- Issueに失敗コメント投稿（失敗フェーズ、エラー内容、推奨アクション）
- `failed` ラベル付与、`todo` ラベル削除

---

### /auto - TODO Issue自動連続処理

**定義ファイル**: [.claude/commands/auto.md](../.claude/commands/auto.md)

#### シンタックス

```bash
/auto
```

#### 説明

`label:todo` かつ `no:assignee` のIssueを若い番号順に取得し、すべて処理するまで `/run` を繰り返し実行します。

**重要**: このコマンドは**完全自動実行モード（確認なし）**で動作します。全Issue処理完了まで停止しません。

#### 実行フロー

```
while (対象Issueあり):
    1. gh issue list で対象Issue検索
    2. 楽観的ロックでアサイン
    3. /run {issue_id} を実行
    4. 次のIssueへ
```

#### 各Issueの出力

`/run` は以下を自動で行います：

**成功時:**
- PR作成（テスト結果・変更内容を含むbody）
- Issueに完了コメント投稿

**失敗時:**
- Issueに失敗コメント投稿（失敗フェーズ、エラー内容、推奨アクション）
- `failed` ラベル付与、`todo` ラベル削除

#### 並列実行

複数ターミナルで `/auto` を同時実行可能。楽観的ロックにより、同じIssueを重複処理しません。

```bash
# ターミナル1
claude -p "/auto"

# ターミナル2
claude -p "/auto"
```

---

## 各コマンドの詳細

### 1. /spec - プロジェクト仕様策定

**定義ファイル**: [.claude/commands/spec.md](../.claude/commands/spec.md)

#### シンタックス

```bash
claude -p /spec
```

#### 引数

なし（対話形式でユーザーと要件を定義）

#### 説明

ユーザーと対話しながらプロジェクト全体の仕様書を作成します。Product Manager エージェントが、要望を詳しくヒアリングし、曖昧な要件を具体化します。

#### 出力ファイル

- `docs/specs/project-{timestamp}.md` - プロジェクト仕様書

#### 仕様書のフォーマット

```markdown
# プロジェクト仕様書: {タイトル}

## 概要
{プロジェクトの概要}

## 目的とスコープ
{目的と範囲}

## 機能要件
- {機能1}
- {機能2}

## 非機能要件
- {性能要件}
- {セキュリティ要件}

## 技術的制約
- {使用技術やフレームワーク}

## 実装タスク（大まかな分割）
1. {タスク1}
2. {タスク2}
```

#### 使用エージェント

**@Product_Manager** - 要件定義と詳細設計の専門家

#### 実行例

```bash
claude -p /spec
```

完了後、自動的に `/critique` を実行してレビューを受けることができます。

---

### 2. /breakdown - Issue分解

**定義ファイル**: [.claude/commands/breakdown.md](../.claude/commands/breakdown.md)

#### シンタックス

```bash
claude -p /breakdown
```

#### 引数

なし（最新のプロジェクト仕様書を自動検出）

#### 説明

プロジェクト仕様書を実装可能な単位のGitHub Issueに分解します。Issue Planner エージェントが、適切な粒度でタスクを分割し、依存関係を明確にします。

#### 入力ファイル

- `docs/specs/project-*.md` - 最新のプロジェクト仕様書

#### 出力

- GitHub Issues（自動作成、ラベル: `todo`）

#### 使用エージェント

**@Issue_Planner** - 仕様書をIssueに分解する専門家

#### 実行例

```bash
claude -p /breakdown
```

**期待される出力**:
```
仕様書を分析しています...
✓ 8個のIssueに分解しました
✓ Issue #1: ユーザー認証機能の実装
✓ Issue #2: データベーススキーマの設計
...
```

---

### 3. /critique - 設計レビュー

**定義ファイル**: [.claude/commands/critique.md](../.claude/commands/critique.md)

#### シンタックス

```bash
claude -p /critique -- <issue_id>
```

#### 引数

| 引数 | 必須 | 型 | 説明 |
|------|------|-----|------|
| `issue_id` | ✅ | 整数 | GitHub Issue番号 |

#### 説明

設計書をレビューし、矛盾・不明瞭な点・技術的なリスクを指摘します。Critic エージェントが、実現可能性・一貫性・セキュリティ・拡張性を評価します。

#### 入力ファイル

- `docs/specs/feature-{id}.md` - 設計書

#### 出力形式

Criticエージェントは以下の2つの判定を行います：

##### APPROVED（承認）

問題がない場合、文末に必ず **"APPROVED"** と出力します。

**出力例**:
```
設計書をレビューしました。

以下の点が良好です：
- ✅ 実現可能性: 既存のPythonライブラリで実装可能
- ✅ 一貫性: 矛盾なし、全ての要件が明確
- ✅ セキュリティ: SQL インジェクションのリスクなし
- ✅ 拡張性: 将来的に追加フィールドを容易に追加可能
- ✅ エッジケース: 境界値テストが網羅されている

APPROVED
```

##### REQUEST_CHANGES（要変更）

問題がある場合、**"REQUEST_CHANGES"** と共に具体的な修正点を列挙します。

**出力例**:
```
以下の問題が見つかりました：

REQUEST_CHANGES

## 重大な問題

### 1. データベーススキーマの定義が曖昧
**問題**: `user_id` のデータ型が未定義です。
**推奨**: `INTEGER PRIMARY KEY` と明記してください。

### 2. エラーハンドリングが不足
**問題**: ネットワークエラー時の挙動が未定義です。
**推奨**: リトライロジックとタイムアウトを追加してください。

## 軽微な問題

### 3. パフォーマンス考慮が不足
**推奨**: 頻繁にアクセスされる場合はキャッシュを検討してください。
```

#### 使用エージェント

**@Critic** - 設計とコードのレビュアー

詳細は [AGENTS.md#Critic](AGENTS.md#2-critic) を参照。

#### 実行例

```bash
# Issue #42 の設計書をレビュー
cd .claude/worktrees/task-42
claude -p /critique -- 42
```

**期待される出力**:
```
設計書をレビューしています...
✓ 実現可能性を検証しました
✓ 一貫性をチェックしました
✓ セキュリティリスクを評価しました
✓ 拡張性を確認しました

判定: APPROVED
```

#### 内部動作

1. `docs/specs/feature-{id}.md` を読み込み
2. Critic エージェントが以下の観点で評価：
   - **実現可能性**: 現在の技術スタックで実装可能か
   - **一貫性**: 矛盾や曖昧さがないか
   - **セキュリティ**: セキュリティリスクがないか
   - **拡張性**: 将来の変更に対応できるか
   - **パフォーマンス**: パフォーマンス上の問題がないか
3. 標準出力にフィードバックを出力
4. manager.pyは出力をログに保存（次ラウンドの設計に反映）

#### ワークフローでの使用

`/prepare` コマンド（`/spec` → `/critique` → `/breakdown`）の一部として実行されます。
`/spec` で作成された仕様書をレビューし、問題があれば修正を促します。

#### 注意事項

- **レビュー基準**: Criticの厳格さは [.claude/agents/critic.md](../.claude/agents/critic.md) で調整可能
- **停滞検出**: 仕様書が変化しなくなった場合、ラウンドを早期終了

---

### 4. /test - テストコード生成

**定義ファイル**: [.claude/commands/test.md](../.claude/commands/test.md)

#### シンタックス

```bash
claude -p /test -- <issue_id>
```

#### 引数

| 引数 | 必須 | 型 | 説明 |
|------|------|-----|------|
| `issue_id` | ✅ | 整数 | GitHub Issue番号 |

#### 説明

設計書に基づき、pytest用のテストコードを作成します。QA Engineer エージェントが、正常系・異常系・境界値テストを網羅的に実装します。

**TDD（テスト駆動開発）**: AI Factoryでは、実装前にテストを作成し、そのテストを通過する実装を行います。

#### 入力ファイル

- `docs/specs/feature-{id}.md` - 設計書

#### 出力ファイル

- `tests/test_feature_{id}.py` - pytestテストコード

#### テストコードの要件

- **pytest** フレームワークを使用
- **実装がない状態でもテストが実行可能**（必要であればMockを使用）
- **正常系・異常系・境界値テスト**を含む
- **Arrange-Act-Assert** パターン
- **テスト名は日本語可**（わかりやすさ優先）

#### 使用エージェント

**@QA_Engineer** - 品質保証とテスト自動化の専門家

詳細は [AGENTS.md#QA Engineer](AGENTS.md#3-qa-engineer) を参照。

#### 実行例

```bash
# Issue #42 のテストコードを作成
cd .claude/worktrees/task-42
claude -p /test -- 42
```

**期待される出力**:
```
テストコードを生成しています...
✓ 設計書を分析しました
✓ テストケースを設計しました（正常系: 3件、異常系: 2件、境界値: 2件）
✓ pytest用のテストコードを実装しました

テストコードを tests/test_feature_42.py に保存しました。
```

#### 生成されるテストコードの例

```python
import pytest
from datetime import datetime
from unittest.mock import Mock, patch
from src.user_profile import get_user_profile, UserNotFoundError


class TestGetUserProfile:
    """get_user_profile() 関数のテスト"""

    def test_正常系_ユーザープロフィールを正しく取得できる(self):
        """
        Given: 有効なユーザーIDが指定された
        When: get_user_profile()を呼び出す
        Then: ユーザー情報の辞書が返される
        """
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
        mock_db.query.assert_called_once()

    def test_異常系_ユーザーが存在しない(self):
        """
        Given: 存在しないユーザーIDが指定された
        When: get_user_profile()を呼び出す
        Then: UserNotFoundError が発生する
        """
        mock_db = Mock()
        mock_db.query.return_value = None

        with patch('src.user_profile.db', mock_db):
            with pytest.raises(UserNotFoundError, match="User with id 999 not found"):
                get_user_profile(999)

    @pytest.mark.parametrize("invalid_id", [0, -1, -100])
    def test_境界値_user_idが0以下(self, invalid_id):
        """
        Given: user_idが0以下の値
        When: get_user_profile()を呼び出す
        Then: ValueError が発生する
        """
        with pytest.raises(ValueError, match="Invalid user_id"):
            get_user_profile(invalid_id)
```

#### 内部動作

1. `docs/specs/feature-{id}.md` を読み込み
2. QA Engineer エージェントがテストケースを設計：
   - 正常系（Happy Path）
   - 異常系（Sad Path）
   - 境界値（Edge Cases）
3. pytest用のテストコードを実装：
   - unittest.mock でモック作成
   - Arrange-Act-Assert パターン
   - Given-When-Then スタイルのDocstring
4. `tests/test_feature_{id}.py` にpytestコードを出力

#### manager.py での使用

Phase 3（実装フェーズ）の最初に実行されます：

```python
# Phase B: Impl & Test
log_msg("--- 💻 Implementation Phase ---", Colors.OKBLUE)

# Create Tests (TDD: テスト先行)
if run_command(["claude", "-p", "/test", "--", iid], wt_path, True) != 0:
    failed = True
    fail_reason = "Test Generation Failed"

# Implement（テストを通過する実装を作成）
if not failed:
    run_command(["claude", "-p", "/impl", "--", iid], wt_path, True)
```

#### 注意事項

- **TDD**: テストを先に作成し、実装はそのテストを通過することを目指します
- **Mock使用**: 実装がない状態でもテストを実行できるよう、外部依存をモック化します
- **テスト網羅率**: 正常系・異常系・境界値を網羅することで、高いテスト網羅率を達成します

---

### 5. /impl - 機能実装

**定義ファイル**: [.claude/commands/impl.md](../.claude/commands/impl.md)

#### シンタックス

```bash
claude -p /impl -- <issue_id> [additional_instructions]
```

#### 引数

| 引数 | 必須 | 型 | 説明 |
|------|------|-----|------|
| `issue_id` | ✅ | 整数 | GitHub Issue番号 |
| `additional_instructions` | ❌ | 文字列 | 追加指示（例: "Fix test failures based on output"） |

#### 説明

設計書を満たし、テストを通過するコードを `src/` 配下に実装します。Coder エージェントが、コーディング規約を遵守しながら高品質なコードを作成します。

#### 入力ファイル

- `docs/specs/feature-{id}.md` - 設計書
- `tests/test_feature_{id}.py` - テストコード（参考）

#### 出力ファイル

- `src/*` - 実装コード

#### 実装の要件

- **[.claude/rules/python.md](../.claude/rules/python.md) のコーディング規約を遵守**
  - PEP 8 準拠
  - Google-style Docstring（日本語）
  - タイプヒント必須
- **既存コードを壊さない**
- **テストを通過することを確認** (`uv run pytest`)

#### 使用エージェント

**@Coder** - 実装担当のシニアエンジニア

詳細は [AGENTS.md#Coder](AGENTS.md#4-coder) を参照。

#### 実行例

##### 通常の実装

```bash
cd .claude/worktrees/task-42
claude -p /impl -- 42
```

**期待される出力**:
```
実装を開始します...
✓ 設計書を読み込みました
✓ テストコードを確認しました
✓ 実装コードを作成しました

実装を src/user_profile.py に保存しました。

次のステップ:
1. uv run pytest tests/test_feature_42.py -v
2. テストが通ることを確認してください
```

##### テスト失敗を修正（manager.pyが自動で行う）

```bash
claude -p /impl -- 42 "Fix test failures based on output"
```

#### 生成される実装コードの例

```python
"""ユーザープロフィール取得モジュール"""
from datetime import datetime
from typing import Dict
from src.db import db


class UserNotFoundError(Exception):
    """ユーザーが見つからない場合の例外"""
    pass


def get_user_profile(user_id: int) -> Dict[str, any]:
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
        UserNotFoundError: ユーザーが存在しない場合
        ValueError: user_idが無効な場合（0以下）

    Examples:
        >>> get_user_profile(123)
        {'name': 'John Doe', 'email': 'john@example.com', ...}
    """
    # 入力検証
    if user_id <= 0:
        raise ValueError(f"Invalid user_id: {user_id}. Must be positive integer.")

    # データベースクエリ
    result = db.query(
        "SELECT name, email, created_at FROM users WHERE id = ?",
        (user_id,)  # パラメータ化でSQLインジェクション防止
    )

    # 結果チェック
    if result is None:
        raise UserNotFoundError(f"User with id {user_id} not found")

    # 戻り値の構築
    return {
        "name": result["name"],
        "email": result["email"],
        "created_at": result["created_at"]
    }
```

#### 内部動作

1. `docs/specs/feature-{id}.md` を読み込み
2. `tests/test_feature_{id}.py` を確認（テストを通過することが目標）
3. Coder エージェントが実装を作成：
   - コーディング規約（python.md）を遵守
   - タイプヒント必須
   - Google-style Docstring
   - SQLインジェクション等のセキュリティリスク回避
4. `src/` 配下にコードを出力
5. （オプション）静的解析（ruff/mypy）を実行

#### manager.py での使用

Phase 3（実装フェーズ）で以下のフローで実行されます：

```python
# Implement
if run_command(["claude", "-p", "/impl", "--", iid], wt_path, True) != 0:
    failed = True
    fail_reason = "Implementation Failed"

# Verify
if not failed:
    passed, output = run_tests(wt_path)
    if not passed:
        log_msg("❌ Tests Failed. Auto-fixing...", Colors.FAIL)
        # Retry Fix (Self-Healing)
        if run_command(["claude", "-p", "/impl", "--", iid, "Fix test failures based on output"], wt_path, True) == 0:
            passed, output = run_tests(wt_path)

    if not passed:
        failed = True
        fail_reason = f"Tests failed:\n{output[-500:]}"
```

**自動修正フロー**:
1. `/impl` を実行
2. `uv run pytest` でテスト実行
3. 失敗した場合: `/impl -- {id} "Fix test failures..."` を1回だけ再実行
4. 再実行後もテストが失敗: ロールバック（failed ラベル付与）

**自動修正は1回のみ**（無限ループ防止）。

#### 注意事項

- **コーディング規約必須**: [.claude/rules/python.md](../.claude/rules/python.md) を必ず遵守
- **既存コードとの整合性**: 既存の設計パターンやインポート順序を踏襲
- **セキュリティ**: SQLインジェクション、XSS等のOWASP Top 10を意識
- **テスト通過が目標**: 実装の最終判定はpytestの結果

---

### 6. /sync - ドキュメント同期

**定義ファイル**: [.claude/commands/sync.md](../.claude/commands/sync.md)

#### シンタックス

```bash
claude -p /sync
```

#### 引数

なし（Issue IDは不要。プロジェクト全体が対象）

#### 説明

現在のソースコード構造を分析し、アーキテクチャドキュメントを更新します。Librarian エージェントが、コードとドキュメントの乖離を防ぎ、Single Source of Truthを維持します。

#### 入力ディレクトリ

- `src/` - ソースコード全体
- `docs/specs/` - 設計書（参考）

#### 出力ファイル

- `docs/architecture/current_system.md` - システムアーキテクチャドキュメント

#### ドキュメントの内容

Librarianが作成するドキュメントには以下を含みます：

- **モジュール構成**: ディレクトリ構造とファイル一覧
- **主要なクラスと関数**: 各クラス・関数の役割
- **データフロー**: データの流れと変換
- **API一覧**: 公開関数・クラスのリスト
- **依存関係**: モジュール間の依存関係

#### 使用エージェント

**@Librarian** - ドキュメント管理者

詳細は [AGENTS.md#Librarian](AGENTS.md#5-librarian) を参照。

#### 実行例

```bash
cd .claude/worktrees/task-42
claude -p /sync
```

**期待される出力**:
```
ドキュメントを同期しています...
✓ src/ ディレクトリを分析しました
✓ 主要なクラスと関数を抽出しました
✓ 依存関係を分析しました
✓ アーキテクチャドキュメントを更新しました

ドキュメントを docs/architecture/current_system.md に保存しました。
```

#### 生成されるドキュメントの例

```markdown
# システムアーキテクチャ

最終更新: 2025-01-20 12:34:56

## モジュール構成

\`\`\`
src/
├── __init__.py
├── db.py                    # データベース接続
├── user_profile.py          # ユーザープロフィール取得（NEW）
└── utils/
    ├── __init__.py
    └── validators.py        # 入力検証
\`\`\`

## 主要なクラスと関数

### user_profile.py

#### `UserNotFoundError`
**種類**: 例外クラス
**説明**: ユーザーが見つからない場合に発生

#### `get_user_profile(user_id: int) -> Dict[str, any]`
**説明**: ユーザープロフィールを取得
**引数**:
- `user_id`: ユーザーID（正の整数）

**戻り値**: ユーザー情報の辞書

**例外**:
- `UserNotFoundError`: ユーザーが存在しない
- `ValueError`: user_idが無効（0以下）

**依存**:
- `src.db.db`: データベース接続モジュール

## データフロー

\`\`\`
user_id (int)
   ↓
get_user_profile()
   ↓
db.query() ← データベース
   ↓
user_data (dict)
\`\`\`

## API一覧

| 関数 | モジュール | 公開 | 説明 |
|------|----------|------|------|
| `get_user_profile` | user_profile | ✅ | ユーザープロフィール取得 |
| `connect_db` | db | ✅ | データベース接続 |
| `validate_user_id` | utils.validators | ❌ | 内部: user_id検証 |
```

#### 内部動作

1. `src/` ディレクトリを再帰的に分析
2. Librarian エージェントが以下を抽出：
   - ディレクトリ構造
   - クラス定義（名前、役割）
   - 関数定義（名前、シグネチャ、Docstring）
   - インポート関係（依存関係）
3. マークダウン形式でドキュメントを生成
4. `docs/architecture/current_system.md` を更新（既存ファイルがある場合は上書き）

#### manager.py での使用

Phase 4（最終フェーズ）で実行されます：

```python
# Phase C: Review & PR
if not failed:
    log_msg("--- ✅ Sync & PR ---", Colors.OKGREEN)
    run_command(["claude", "-p", "/sync"], wt_path, True)

    # PR作成前にドキュメントを最新状態に同期
    # これにより、PRにドキュメント更新が含まれる
    subprocess.run(["git", "push", "origin", "HEAD", "--force-with-lease"], cwd=wt_path)
    subprocess.run(["gh", "pr", "create", ...], cwd=wt_path)
```

PR作成前に実行されるため、**PRにドキュメント更新が自動的に含まれます**。

#### 注意事項

- **Issue ID不要**: `/sync` コマンドはプロジェクト全体を対象とするため、Issue IDは不要です
- **上書き**: 既存の `current_system.md` がある場合は上書きされます
- **PR統合**: PR作成前に実行されるため、コードとドキュメントが常に同期した状態でレビュー可能

---

## コマンドの手動実行

manager.pyによる自動実行以外に、各コマンドを手動で実行することも可能です。

### 手動実行のメリット

- **各ステップを個別に確認・調整できる**
- **デバッグが容易**
- **カスタム指示を追加可能**

### 手動実行のデメリット

- **手動操作が必要**
- **ワークフロー全体の管理が複雑**

### 手動実行の例

#### 推奨ワークフロー（v2.6）

```bash
# 1. プロジェクト準備（仕様策定 → レビュー → Issue分解）
claude -p /prepare
# → Product Manager がヒアリング後、自動で /spec → /critique → /breakdown を実行

# 2. 単一Issueの実装
claude -p "/run 42"
# → 自動で /test → /impl → /review → /sync → /kaizen を実行

# 3. 全TODOの連続処理（自動）
claude -p /auto
# → label:todo のIssueを順次 /run で処理
```

#### 個別コマンドの手動実行

```bash
# Git Worktreeを作成
git worktree add .claude/worktrees/task-42 -b feature/issue-42
cd .claude/worktrees/task-42

# テストコードを生成
claude -p "/test 42"

# 実装を作成
claude -p "/impl 42"

# コードレビュー
claude -p "/review 42"

# ドキュメントを同期
claude -p /sync

# 学びを記録
claude -p "/kaizen 42"

# クリーンアップ
cd ../..
git worktree remove .claude/worktrees/task-42
```

---

## コマンドのカスタマイズ

### 新しいコマンドの追加

新しいコマンドを追加する手順:

#### 1. コマンド定義ファイルを作成

```bash
cat > .claude/commands/optimize.md <<EOF
---
description: Optimize performance
arguments:
  - name: id
---
@Performance_Engineer パフォーマンス最適化
入力: src/
出力: docs/performance/optimization-{id}.md

**指示**:
実装されたコードのパフォーマンスボトルネックを検出し、最適化案を提示してください。

**分析項目**:
1. 実行時間プロファイリング（cProfile）
2. メモリ使用量分析
3. ビッグO記法での計算量評価
4. 最適化前後のベンチマーク比較
EOF
```

#### 2. エージェントを定義（必要に応じて）

```bash
cat > .claude/agents/performance_engineer.md <<EOF
---
name: Performance Engineer
description: パフォーマンス最適化の専門家
---
あなたはパフォーマンスエンジニアです。

**役割**: コードのボトルネックを検出し、最適化提案を行う
**ツール**: cProfile, pytest-benchmark, memory_profiler
EOF
```

#### 3. 使用方法

```bash
cd .claude/worktrees/task-42
claude -p /optimize -- 42
```

#### 4. manager.pyに統合（オプション）

manager.pyの Phase 3（実装フェーズ）後に最適化フェーズを追加:

```python
# Phase C-2: Optimization (Optional)
if not failed:
    log_msg("--- ⚡ Optimization Phase ---", Colors.OKBLUE)
    run_command(["claude", "-p", "/optimize", "--", iid], wt_path, True)
```

### 既存コマンドの調整

既存のコマンド定義ファイル（`.claude/commands/*.md`）を直接編集することで、動作を調整できます。

#### 例: /spec コマンドに追加要件を含める

[.claude/commands/spec.md](../.claude/commands/spec.md) を編集:

```markdown
---
description: Create project specification
---
@Product_Manager 仕様書作成

**追加指示**:
以下のセクションを含む詳細仕様書を作成:
1. **概要**: 機能の目的とスコープ
2. **仕様詳細**: 振る舞い、入力/出力、データ構造
3. **エッジケース**: エラー処理、境界値の挙動
4. **実装計画**: 必要なファイル変更、ステップ
5. **パフォーマンス要件**: レスポンスタイム、スループット
6. **セキュリティ考慮**: OWASP Top 10 チェック
```

---

## 次のステップ

- [WORKFLOW.md](WORKFLOW.md) - コマンドがどのように連携するかを理解
- [AGENTS.md](AGENTS.md) - 各コマンドが呼び出すエージェントの詳細
- [USAGE.md](USAGE.md) - 実際の使用例とトラブルシューティング

---

### 7. /review - コード監査

**定義ファイル**: [.claude/commands/review.md](../.claude/commands/review.md)

#### シンタックス

```bash
claude -p /review -- <issue_id>
```

#### 引数

| 引数 | 必須 | 型 | 説明 |
|------|------|-----|------|
| `issue_id` | ✅ | 整数 | GitHub Issue番号 |

#### 説明

実装されたコードを静的解析と変異テストで検証し、品質基準を満たしているか判定します。Tech Lead エージェントが、アーキテクチャ違反、型エラー、テスト品質を厳格にチェックします。

#### 検証内容

1. **静的解析（ruff）**: コード品質チェック
2. **型チェック（mypy）**: 型エラーの検出
3. **変異テスト（mutmut）**: テスト品質の検証

#### 判定基準

- **mutmutスコア80%未満**: 必ずReject
- **アーキテクチャ違反**: Reject
- **型エラー（mypy）**: Reject
- **Ruffエラー**: Reject

#### 出力形式

##### Approved（承認）

GitHub Issueにコメント投稿:
```
✅ [Approved] 全チェック通過
- ruff: OK
- mypy: OK
- mutmut: 85% (17/20 killed)
```

##### Reject（却下）

GitHub Issueにコメント投稿:
```
🚨 [Reject] テスト品質不足
- mutmut: 65% (13/20 killed)
- 改善策: test_get_user_profile_not_found のアサーションを追加してください
```

#### 使用エージェント

**@Tech_Lead** - コード監査とテスト品質検証の専門家

詳細は [AGENTS.md#Tech Lead](AGENTS.md#6-tech-lead) を参照。

#### 実行例

```bash
cd .claude/worktrees/task-42
claude -p /review -- 42
```

#### 作業メモ記録

レビュー中に得た学びを `.claude/factory/memos/issue-{id}-tech_lead.md` に記録します。

---

### 8. /kaizen - 継続的改善

**定義ファイル**: [.claude/commands/kaizen.md](../.claude/commands/kaizen.md)

#### シンタックス

```bash
claude -p /kaizen -- <issue_id>
```

#### 引数

| 引数 | 必須 | 型 | 説明 |
|------|------|-----|------|
| `issue_id` | ✅ | 整数 | GitHub Issue番号 |

#### 説明

指定されたIssueの開発プロセスで得られた学びを収集し、汎用的な知識を `claude.md` に蓄積します。Scrum Master エージェントが、全エージェントの作業メモを分析し、次回以降に役立つ知識のみを抽出します。

#### 入力ファイル

- `.claude/factory/memos/issue-{id}-*.md` - 各エージェントの作業メモ
  - `issue-{id}-coder.md`
  - `issue-{id}-qa.md`
  - `issue-{id}-tech_lead.md`
  - `issue-{id}-librarian.md`

#### 出力ファイル

- `claude.md` または `src/{dir}/claude.md` - 汎用的な学び

#### 判断基準

- **追加しない**: Issue固有の内容（例: 「Issue #123のバグを修正した」）
- **追加する**: 汎用的な知識（例: 「ライブラリXのバージョンY以降では〇〇に注意」）

#### 使用エージェント

**@Scrum_Master** - 知識蒸留（Distillation）担当

詳細は [AGENTS.md#Scrum Master](AGENTS.md#7-scrum-master) を参照。

#### 実行例

```bash
claude -p /kaizen -- 42
```

**期待される出力**:
```
作業メモを収集しています...
✓ Coderのメモ: 3件の学び
✓ QAのメモ: 2件の学び
✓ Tech Leadのメモ: 1件の学び

汎用的な学びを抽出しました:
- pydantic v2 では Field(default_factory=list) の書き方が変更された

学びを claude.md に追加しました。
```

#### 注意事項

- **Issue固有の内容は除外**: 「Issue #42でバグを修正」のような内容は追加されません
- **影響範囲を考慮**: 学びの影響範囲に応じて、適切なディレクトリの `claude.md` に追記されます
- **自動実行**: PR作成成功後、manager.pyが自動的に `/kaizen` を実行します

---

**AI Factory v2.6 コマンドリファレンス** - 11個のコマンドの完全ガイド
