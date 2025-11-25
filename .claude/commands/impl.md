---
description: Implement the feature
arguments:
  - name: id
---
@Coder 実装
入力ファイル: docs/specs/feature-${id}.md
関連ファイル: tests/test_feature_${id}.py

**指示**:
設計書を満たし、テストを通過するPythonコードを `src/` 配下に実装してください。
- 既存のコードを壊さないように注意してください。
- タイプヒントを必須とします。
- 実装後、`uv run pytest` が通ることを確認してください。
