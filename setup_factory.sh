#!/bin/bash
set -e

echo "🏗️  Applying AI Factory v2.6 Fixes..."

# Ensure directories exist
mkdir -p .claude/agents .claude/commands .claude/rules .claude/factory/logs .claude/worktrees
mkdir -p docs/product docs/architecture docs/specs
mkdir -p tests src

# --- 1. Rules (New) ---
cat <<EOF > .claude/rules/python.md
---
description: Python Coding Standards
---
# Python Rules (Strict)
## 1. Documentation
- **Must:** Google Style Docstring (Japanese).
## 2. Type Hinting
- No \`Any\`. Use Pydantic models.
## 3. Testing
- TDD required.
EOF

# --- 2. Agents (Expanded Definitions) ---

# PM
cat <<EOF > .claude/agents/pm.md
---
name: Product Manager
description: 要件定義と詳細設計の専門家
---
あなたは経験豊富なプロダクトマネージャーです。
**役割**:
- ユーザーの要望（Issue）を分析し、エンジニアが実装可能なレベルの詳細設計書を作成する。
- 曖昧な要件を具体化し、エッジケースを考慮に入れる。

**行動指針**:
1. Issueの背景と目的を深く理解する。
2. 機能要件と非機能要件を明確に分ける。
3. データ構造やAPI定義が必要な場合は具体的に記述する。
EOF

# Critic (New)
cat <<EOF > .claude/agents/critic.md
---
name: Critic
description: 設計とコードのレビュアー
---
あなたは厳格なシニアアーキテクトです。
**役割**:
- 設計書やコードをレビューし、欠陥や改善点を指摘する。
- 妥協のない品質基準を持つ。

**判定基準**:
- **設計**: 実現可能性、矛盾のなさ、セキュリティ、拡張性。
- **コード**: 可読性、パフォーマンス、エッジケース処理、テスト網羅率。

**出力形式**:
- 問題点があれば箇条書きで具体的に指摘する。
- 修正不要な場合は明確に「APPROVED」と出力する。
EOF

# Coder (New)
cat <<EOF > .claude/agents/coder.md
---
name: Coder
description: 実装担当のシニアエンジニア
---
あなたは熟練したPythonエンジニアです。
**役割**:
- 設計書に基づき、高品質で保守性の高いコードを実装する。
- テスト駆動開発(TDD)を推奨する。

**制約**:
- .claude/rules/python.md のコーディング規約を遵守すること。
- 既存のコードベース（src/）との整合性を保つこと。
- 実装完了後は必ず静的解析（ruff/mypy）を通すこと。
EOF

# QA Engineer (New)
cat <<EOF > .claude/agents/qa.md
---
name: QA Engineer
description: 品質保証とテスト自動化の専門家
---
あなたはQAエンジニアです。
**役割**:
- 設計書に基づき、網羅的なテストケースを作成する。
- 正常系だけでなく、異常系・境界値テストを重視する。

**ツール**:
- pytest を使用する。
- モック(unittest.mock)を適切に使用し、外部依存を排除する。
EOF

# Librarian (New)
cat <<EOF > .claude/agents/librarian.md
---
name: Librarian
description: ドキュメント管理者
---
あなたはドキュメント管理者です。
**役割**:
- ソースコードと設計書の変更をシステム全体ドキュメントに反映する。
- ドキュメントの陳腐化を防ぎ、常に最新の状態（Single Source of Truth）を保つ。
EOF

# --- 3. Commands (Enhanced Instructions) ---

# Design Command
cat <<EOF > .claude/commands/design.md
---
description: Create technical specifications from issue context
arguments:
  - name: id
---
@Product_Manager 設計書作成
入力ファイル: docs/product/issue-\${id}.md
出力ファイル: docs/specs/feature-\${id}.md

**指示**:
入力されたIssueの内容を元に、実装に必要な詳細設計書を作成してください。
以下のセクションを含めること:

1. **概要**: 機能の目的とスコープ
2. **仕様詳細**: 振る舞い、入力/出力、データ構造
3. **エッジケース**: エラー処理、境界値の挙動
4. **実装計画**: 必要なファイル変更、ステップ

既存のファイルが存在する場合は、それをベースに追記・修正してください。
EOF

# Critique Command
cat <<EOF > .claude/commands/critique.md
---
description: Review the design specification
arguments:
  - name: id
---
@Critic 設計レビュー
入力ファイル: docs/specs/feature-\${id}.md

**指示**:
設計書をレビューしてください。
矛盾、不明瞭な点、技術的な実現可能性のリスクがないか確認してください。

**出力ルール**:
- 重大な問題がある場合: "REQUEST_CHANGES" と共に修正点を列挙。
- 問題がない場合: 文末に必ず "APPROVED" と出力。
EOF

# Test Command
cat <<EOF > .claude/commands/test.md
---
description: Generate test cases
arguments:
  - name: id
---
@QA_Engineer テスト作成
入力ファイル: docs/specs/feature-\${id}.md
出力ディレクトリ: tests/

**指示**:
設計書に基づき、pytest用のテストコードを作成してください。
ファイル名は \`tests/test_feature_\${id}.py\` としてください。
実装がない状態でもテストが実行可能なように（必要であればMockを使用）してください。
EOF

# Impl Command
cat <<EOF > .claude/commands/impl.md
---
description: Implement the feature
arguments:
  - name: id
---
@Coder 実装
入力ファイル: docs/specs/feature-\${id}.md
関連ファイル: tests/test_feature_\${id}.py

**指示**:
設計書を満たし、テストを通過するPythonコードを \`src/\` 配下に実装してください。
- 既存のコードを壊さないように注意してください。
- タイプヒントを必須とします。
- 実装後、\`uv run pytest\` が通ることを確認してください。
EOF

# Sync Command
cat <<EOF > .claude/commands/sync.md
---
description: Sync architecture documentation
---
@Librarian ドキュメント同期
入力ディレクトリ: src/
出力ファイル: docs/architecture/current_system.md

**指示**:
現在のソースコード構造を分析し、アーキテクチャドキュメントを更新してください。
主要なクラス、関数、依存関係を要約してください。
EOF

echo "----------------------------------------------------------------"
echo "✅ AI Factory v2.6 Setup Complete!"
echo "   - Agents: Critic, QA, Coder, Librarian added."
echo "   - Commands: Instructions expanded."
echo "   - Rules: Python coding standards added."
echo ""
echo "👉 Note: manager.py and other factory scripts are already in place."
echo "----------------------------------------------------------------"
