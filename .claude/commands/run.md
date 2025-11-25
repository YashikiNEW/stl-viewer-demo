---
description: Implement the feature
arguments:
  - name: id
    description: Issue ID to implement
    required: true
---

**Issue #{$ARGUMENTS} の実装パイプライン実行**

指定されたIssueに対して、テスト生成から実装、レビュー、PR作成までを一気通貫で実行します。

## 重要: 完全自動実行モード（確認なし）

このコマンドは **一気通貫で自動実行** します。**途中でユーザーに確認を求めない。**

- ユーザーへの確認なしで全フェーズを連続実行
- 途中で停止しない（エラー時を除く）
- 全フェーズ完了後に最終報告を行う

**禁止事項**:
- 「この実装でよいですか？」と聞かない
- 「PRを作成してよいですか？」と聞かない
- 「続行しますか？」と聞かない
- エラー以外の理由で停止しない

---

## Slack通知

各フェーズの開始・完了時にSlack通知を送信する。
環境変数 `AI_FACTORY_WEBHOOK` が設定されている場合のみ動作。

```bash
# 通知ヘルパー（エラーでも処理を止めない）
python .claude/factory/notify.py "メッセージ" --level info || true
```

---

## フェーズ0: 準備

**Slack通知**: 🎯 タスク開始 #{issue_id}

```bash
python .claude/factory/notify.py "🎯 タスク開始 #${issue_id}" --title "Issue #${issue_id}" --level info || true
```

1. `gh issue view {issue_id}` でIssueの内容を取得
2. Issueが存在し、openであることを確認
3. `gh issue edit {issue_id} --add-assignee @me` で自分をアサイン

---

## フェーズ1: Git Worktree作成

`.claude/worktrees/task-{issue_id}` にworktreeを作成。

```bash
git worktree add .claude/worktrees/task-{issue_id} -b feature/issue-{issue_id}
```

以降の作業はこのworktree内で実行。

**完了したら、停止せずにフェーズ2へ進む。**

---

## フェーズ2: テスト生成（TDD）

`/test {issue_id}` コマンドを実行してテストコードを生成する。

- Issueの内容を読み取り、テストケースを設計
- `tests/` ディレクトリにテストファイルを作成
- `uv run pytest` で構文エラーがないことを確認（テスト失敗OK）

**完了したら、停止せずにフェーズ3へ進む。**

---

## フェーズ3: 実装

`/impl {issue_id}` コマンドを実行して実装を作成する。

- テストを通過する実装を作成
- `uv run pytest -v` でテストを実行
- テスト失敗の場合は修正（最大3回リトライ）

**テスト通過したら、停止せずにフェーズ4へ進む。**

---

## フェーズ4: コードレビュー

`/review {issue_id}` コマンドを実行してコードレビューを行う。

- 静的解析を実行（ruff, mypy）
- 変異テストを実行（mutmut）
- 問題があればIssueにコメントして修正

**レビュー通過したら、停止せずにフェーズ5へ進む。**

---

## フェーズ5: ドキュメント同期

`/sync` コマンドを実行してドキュメントを更新する。

- アーキテクチャドキュメントを更新
- 必要に応じてREADMEを更新

**完了したら、停止せずにフェーズ6へ進む。**

---

## フェーズ6: PR作成

### 6-1. 変更をコミット

```bash
git add -A
git commit -m "feat: Resolve #{issue_id} - [Issueタイトル]"
```

### 6-2. プッシュ

```bash
git push origin HEAD --force-with-lease
```

### 6-3. PR作成

```bash
gh pr create --title "feat: Resolve #{issue_id}" --body "$(cat <<'EOF'
## Summary

[実装内容の1-3行サマリー]

## Changes

- [変更点1]
- [変更点2]
- [変更点3]

## Test Results

- ✅ pytest: [passed/failed] ([N] tests)
- ✅ ruff: [passed/failed]
- ✅ mypy: [passed/failed]

## Related Issue

Closes #{issue_id}

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 6-4. Issueに完了コメントを投稿

```bash
gh issue comment {issue_id} --body "$(cat <<'EOF'
## ✅ 実装完了

PR #{pr_number} を作成しました。

### 実装内容
- [実装内容のサマリー]

### テスト結果
- pytest: ✅ passed ([N] tests)
- ruff: ✅ passed
- mypy: ✅ passed

### 変更ファイル
- `path/to/file1.py`
- `path/to/file2.py`

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Slack通知**: 🚀 PR作成完了 #{issue_id}

```bash
python .claude/factory/notify.py "🚀 PR作成完了 #${issue_id}" --title "Issue #${issue_id}" --level success || true
```

**PR作成完了したら、停止せずにフェーズ7へ進む。**

---

## フェーズ7: Kaizen

`/kaizen {issue_id}` コマンドを実行して学びを記録する。

- 作業中の学びを `.claude/factory/memos/issue-{issue_id}-*.md` に記録
- 汎用的な学びを `claude.md` に追記

---

## フェーズ8: クリーンアップ

worktreeを削除:
```bash
git worktree remove .claude/worktrees/task-{issue_id}
git worktree prune
```

---

## エラー時の動作

各フェーズで失敗した場合:

### 1. Issueに失敗コメントを投稿

```bash
gh issue comment {issue_id} --body "$(cat <<'EOF'
## ❌ 実装失敗

### 失敗フェーズ
[フェーズ名] (例: フェーズ3: 実装)

### エラー内容
```
[エラーメッセージ]
```

### 試行した対応
- [対応1]
- [対応2]

### 推奨アクション
- [手動で確認が必要な点]
- [修正のヒント]

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Slack通知**: ❌ 実装失敗 #{issue_id}

```bash
python .claude/factory/notify.py "❌ 実装失敗 #${issue_id} - [失敗フェーズ名]" --title "Issue #${issue_id}" --level error || true
```

### 2. ラベル変更

```bash
gh issue edit {issue_id} --remove-assignee @me --remove-label todo --add-label failed
```

### 3. worktreeクリーンアップ

```bash
git worktree remove .claude/worktrees/task-{issue_id} --force
git worktree prune
```

---

## 最終報告（全フェーズ完了後）

全フェーズ完了後、ユーザーに以下を報告:

1. **処理したIssue**: #{issue_id}
2. **作成したPR**: PR番号とURL
3. **テスト結果**: pass/fail
4. **レビュー結果**: 指摘事項と対応
5. **Kaizen**: 記録した学び

## 完了条件

- PRが作成されている
- Issueに完了コメントが投稿されている
- worktreeがクリーンアップされている
