---
description: Auto-process all todo issues
---

**TODO Issueの自動連続処理**

`label:todo` かつ `no:assignee` のIssueを若い番号順に取得し、すべて処理するまで `/run` を繰り返し実行します。

## 重要: 完全自動実行モード（確認なし）

このコマンドは **完全自動で実行** します。**途中でユーザーに確認を求めない。**

- ユーザーへの確認なしで全Issueを連続処理
- 各Issueごとに `/run {issue_id}` を呼び出し
- 全Issue処理完了まで停止しない
- 処理完了後に最終報告を行う

**禁止事項**:
- 「続行してよいですか？」と聞かない
- 「次のIssueに進みますか？」と聞かない
- エラー以外の理由で停止しない

---

## Slack通知

各イベント時にSlack通知を送信する。
環境変数 `AI_FACTORY_WEBHOOK` が設定されている場合のみ動作。

```bash
# 通知ヘルパー（エラーでも処理を止めない）
python .claude/factory/notify.py "メッセージ" --level info || true
```

**通知タイミング**:
- 🏭 自動処理開始時
- 📊 全Issue処理完了時（サマリー）

---

## 処理フロー

```
while true:
    1. gh issue list で対象Issue検索
    2. 見つからなければ終了
    3. 楽観的ロックでアサイン
    4. claude -p "/run {issue_id}" を実行（別プロセス）
    5. 終了コードを確認
    6. 次のIssueへ
```

**ポイント**: 各Issueの処理は`claude -p`で別プロセスとして実行。
これによりIssueごとにコンテキストがリセットされ、長時間実行でもメモリ問題を回避。

---

## ステップ1: 対象Issue検索

```bash
gh issue list --search "label:todo no:assignee state:open sort:created-asc" --limit 1 --json number --jq ".[0].number"
```

- `label:todo` - todoラベル付き
- `no:assignee` - 未アサイン
- `state:open` - オープン状態
- `sort:created-asc` - 作成日昇順（若い番号順）

---

## ステップ2: 終了判定

Issueが見つからない場合（空文字列が返る場合）、**ループを終了して最終報告へ**。

---

## ステップ3: 楽観的ロック（競合防止）

並列実行時に同じIssueを取り合わないようにする:

```bash
# 1. アサイン前に確認
gh issue view {id} --json assignees --jq ".assignees | length"
# → "0" でなければスキップして次のIssueへ

# 2. 自分をアサイン
gh issue edit {id} --add-assignee @me

# 3. 2秒待機後に再確認
sleep 2
gh issue view {id} --json assignees --jq ".assignees | length"
# → "1" でなければ競合発生、アサイン取り消してスキップ

# 4. 競合時のロールバック
gh issue edit {id} --remove-assignee @me
```

---

## ステップ4: /run 実行（別プロセス）

アサイン成功後、**別プロセス**で`/run`を実行してコンテキストをリセット:

```bash
# 別プロセスで実行（コンテキスト分離）
claude -p "/run {issue_id}"
```

**重要**: 同一セッション内で`/run`を呼び出すとコンテキストが蓄積してオーバーフローするため、
必ず`claude -p`で別プロセスとして起動する。

処理内容:
- Git worktree作成
- `/test` → `/impl` → `/review` → `/sync` → PR作成
- `/kaizen`
- クリーンアップ

### /run の主要な出力

`/run` は以下を自動で行う（詳細は `/run.md` 参照）:

**成功時:**
- PR作成（テスト結果・変更内容を含むbody）
- Issueに完了コメント投稿
- `todo` ラベルはそのまま（PRマージ時に削除）

**失敗時:**
- Issueに失敗コメント投稿（失敗フェーズ、エラー内容、推奨アクション）
- `failed` ラベル付与、`todo` ラベル削除

**`/run` 完了後（成功・失敗問わず）、ステップ1に戻って次のIssueを検索。**

---

## エラーハンドリング

| エラー | 対応 | Issueへの記録 |
|--------|------|--------------|
| アサイン失敗 | スキップして次のIssueへ | なし（競合のため） |
| `/run` 失敗 | 次のIssueへ | 失敗コメント + `failed`ラベル |
| GitHub CLI認証エラー | 処理を中断して最終報告へ | なし |

### 失敗時のIssueコメント例

```markdown
## ❌ 実装失敗

### 失敗フェーズ
フェーズ3: 実装

### エラー内容
```
pytest failed: 2 tests failed
- test_feature_a: AssertionError
- test_feature_b: TypeError
```

### 試行した対応
- 型エラーの修正を試行（3回リトライ）
- テストケースの見直し

### 推奨アクション
- Issueの要件を再確認
- 手動でテストを実行して原因調査

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## 並列実行

複数ターミナルで `/auto` を同時実行可能。楽観的ロックにより、同じIssueを重複処理しない。

```bash
# ターミナル1
claude -p "/auto"

# ターミナル2
claude -p "/auto"
```

---

## ステップ0: 開始通知

処理開始時にSlack通知を送信:

```bash
python .claude/factory/notify.py "🏭 自動処理開始" --title "AI Factory" --level info || true
```

---

## 最終報告（全Issue処理完了後）

**Slack通知**: 📊 自動処理完了

```bash
python .claude/factory/notify.py "📊 自動処理完了: 成功 N件 / 失敗 M件" --title "AI Factory" --level success || true
```

全Issue処理完了後、ユーザーに以下を報告:

1. **処理したIssue数**: N件
2. **成功したIssue**: 一覧（Issue番号、PR番号）
3. **失敗したIssue**: 一覧（Issue番号、失敗理由）
4. **残りのTODO Issue**: あれば一覧

## 完了条件

- `label:todo` かつ `no:assignee` のIssueが0件になる
- または、GitHub CLI認証エラーが発生する
