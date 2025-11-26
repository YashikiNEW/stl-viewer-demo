# Issue #6: モデル情報表示 - 学び

## 概要
3Dモデルの情報（頂点数、面数、バウンディングボックス）を計算・表示する機能を実装した。

## 実装のポイント

### 1. Three.js BufferGeometryからの情報抽出
Three.jsのBufferGeometryは以下の構造を持つ：
- `attributes.position.array`: Float32Arrayで頂点座標を格納（3要素ずつx, y, z）
- `attributes.position.count`: 頂点数
- `index`: インデックス付きジオメトリの場合、頂点の参照順序を格納

面数の計算方法：
- インデックスありの場合: `index.count / 3`
- インデックスなしの場合: `vertexCount / 3`

### 2. バウンディングボックスの計算
手動で計算する場合は、全頂点を走査してmin/max値を求める：
```typescript
for (let i = 0; i < positionArray.length; i += 3) {
  const x = positionArray[i]
  const y = positionArray[i + 1]
  const z = positionArray[i + 2]
  // min/max更新
}
```

空のジオメトリ（頂点数0）の場合は、サイズ0を返すように明示的に処理。

### 3. 数値フォーマット
- 頂点数・面数: `toLocaleString('ja-JP')` でカンマ区切り
- バウンディングボックスサイズ: `toFixed(2)` で小数点2桁

### 4. TypeScript設定とテストファイル
問題: テストファイルにvitestのモック型が含まれ、本番ビルドでエラー

解決: `tsconfig.app.json`の`exclude`でテストファイルを除外
```json
{
  "include": ["src"],
  "exclude": ["src/tests", "src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

### 5. アクセシビリティ
- `role="region"` + `aria-label` でセクションを識別可能に
- 見出し（`<h2>`）でスクリーンリーダー対応

## テスト設計
- 頂点数、面数、バウンディングボックスを個別にテスト
- インデックス付き/なしの両方のジオメトリをテスト
- 空のジオメトリのエッジケースを含める
- 大きな数値のフォーマット確認
- モデル未読み込み状態のテスト

## 次のステップへの示唆
- 実際の3Dビューアと統合時、STLLoader等から取得したgeometryをcalculateModelInfoに渡す
- サイドパネルにModelInfoPanelを配置し、モデル読み込み時にmodelInfoを更新
