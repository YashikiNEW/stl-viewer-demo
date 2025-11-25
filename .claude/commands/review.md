---
description: Review code and run mutation tests
arguments:
  - name: id
---
@Tech_Lead

コード監査と変異テストを実行してください。

Issue ID: ${id}

**実行内容**:
1. 静的解析（ruff, mypy）
2. 変異テスト（mutmut）
3. 判定結果を GitHub Issue にコメント