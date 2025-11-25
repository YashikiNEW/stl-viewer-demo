---
description: Generate test cases
arguments:
  - name: id
---
@QA_Engineer テスト作成
入力ファイル: docs/specs/feature-${id}.md
出力ディレクトリ: tests/

**指示**:
設計書に基づき、pytest用のテストコードを作成してください。
ファイル名は `tests/test_feature_${id}.py` としてください。
実装がない状態でもテストが実行可能なように（必要であればMockを使用）してください。
