---
description: Python Coding Standards
---
# Pythonコーディング規約

## 1. ドキュメンテーション

### Docstrings
- **必須**: Google Style Docstring（日本語）
- すべての関数、クラス、モジュールにDocstringsを記述すること

```python
def example_function(param1: str, param2: int) -> bool:
    """関数の簡単な説明。

    詳細な説明をここに記述します。

    Args:
        param1: 第1引数の説明
        param2: 第2引数の説明

    Returns:
        戻り値の説明

    Raises:
        ValueError: 発生する可能性のある例外の説明
    """
    pass
```

### コメント
- **言語**: 日本語
- コードの意図や複雑なロジックには必ずコメントを付けること

## 2. 型アノテーション

### 必須事項
- すべての関数に型アノテーションを記述すること
- `Any`の使用は禁止。代わりにPydanticモデルや具体的な型を使用
- `Optional[T]`スタイルを使用すること（`T | None`ではなく）

```python
from typing import List, Dict, Optional

def process_data(
    input_file: Path,
    options: Dict[str, str],
    max_items: Optional[int] = None
) -> List[Dict[str, str]]:
    pass
```

## 3. ファイルパス操作

### 必須事項
- **必須**: `pathlib`モジュールを使用すること
- `os.path`の使用は禁止

```python
from pathlib import Path

# Good
config_path = Path("config") / "settings.json"

# Bad
import os
config_path = os.path.join("config", "settings.json")
```

## 4. テスト

### TDD（テスト駆動開発）
- 実装前にテストを作成すること
- pytest を使用
- 正常系だけでなく、異常系・境界値テストを重視

### テストカバレッジ
- 新規コードは80%以上のカバレッジを目指す
- 変異テスト（mutmut）で80%以上のスコアを維持

## 5. コード品質

### 静的解析
- `ruff check src/` でエラーがないこと
- `mypy src/` で型エラーがないこと

### セキュリティ
- ハードコードされた認証情報の禁止
- 環境変数または設定ファイルを使用

## 6. ファイル作成

### エンコーディング
- すべてのテキストファイルは`encoding='utf-8'`を指定すること

```python
# Good
path.write_text("内容", encoding='utf-8')

# Bad
path.write_text("内容")
```
