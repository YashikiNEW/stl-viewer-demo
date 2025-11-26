# STL Viewer - システムアーキテクチャ

最終更新: 2025-11-25

## 1. システム概要

STL Viewerは、STLファイル（3Dモデル形式）をブラウザ上で表示・操作するためのWebアプリケーションです。

### 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite 6 |
| 3Dレンダリング | Three.js + React Three Fiber |
| テスト | Vitest + Testing Library |
| スタイル | CSS |

## 2. ディレクトリ構造

```
frontend/
├── src/
│   ├── components/
│   │   ├── viewer/
│   │   │   ├── STLViewer.tsx    # 3Dビューアコンポーネント
│   │   │   ├── STLModel.tsx     # 3Dモデル描画
│   │   │   └── index.ts
│   │   ├── StlUpload.tsx        # ファイルアップロード
│   │   ├── DisplaySettings.tsx  # 表示設定
│   │   ├── ModelInfoPanel.tsx   # モデル情報表示
│   │   ├── CompareMode.tsx      # 比較モード
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useSTLLoader.ts      # STL読み込みロジック
│   │   ├── useDisplaySettings.ts
│   │   ├── useCompareMode.ts
│   │   ├── useScreenshot.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── screenshot.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## 3. コンポーネント設計

### 3.1 StlUpload (ファイルアップロード)

**責務**: STLファイルの選択とドラッグ&ドロップによる読み込み

```
┌─────────────────────────────────────┐
│         StlUpload                   │
├─────────────────────────────────────┤
│ Props:                              │
│  - onFileLoad: (file, data) => void │
│  - onError: (error) => void         │
│  - maxFiles?: number                │
├─────────────────────────────────────┤
│ State:                              │
│  - isDragOver: boolean              │
│  - isLoading: boolean               │
├─────────────────────────────────────┤
│ Features:                           │
│  - ファイル選択ボタン              │
│  - ドラッグ&ドロップエリア          │
│  - STL拡張子バリデーション          │
│  - FileReader APIでの読み込み      │
└─────────────────────────────────────┘
```

**実装ファイル**: `src/components/StlUpload.tsx`

### 3.2 STLViewer (3Dビューア)

**責務**: Three.jsを使用した3Dモデルの表示と操作

```
┌─────────────────────────────────────┐
│         STLViewer                   │
├─────────────────────────────────────┤
│ Props:                              │
│  - geometry: BufferGeometry | null  │
├─────────────────────────────────────┤
│ Ref Methods:                        │
│  - takeScreenshot(): HTMLCanvas     │
├─────────────────────────────────────┤
│ Features:                           │
│  - React Three Fiber Canvas         │
│  - OrbitControls (回転/ズーム/パン) │
│  - 照明設定                         │
│  - スクリーンショット機能           │
└─────────────────────────────────────┘
```

**実装ファイル**: `src/components/viewer/STLViewer.tsx`

### 3.3 useSTLLoader (カスタムフック)

**責務**: STLファイルの解析とジオメトリ生成

```
┌─────────────────────────────────────┐
│         useSTLLoader                │
├─────────────────────────────────────┤
│ Returns:                            │
│  - geometry: BufferGeometry | null  │
│  - error: string | null             │
│  - isLoading: boolean               │
│  - loadFromFile: (File) => void     │
│  - getModelInfo: () => ModelInfo    │
│  - reset: () => void                │
├─────────────────────────────────────┤
│ ModelInfo:                          │
│  - vertexCount: number              │
│  - faceCount: number                │
│  - boundingBox: {x, y, z}           │
└─────────────────────────────────────┘
```

**実装ファイル**: `src/hooks/useSTLLoader.ts`

## 4. データフロー

```
┌──────────────┐    File     ┌──────────────┐
│  StlUpload   │ ─────────▶ │ useSTLLoader │
└──────────────┘             └──────────────┘
                                    │
                             BufferGeometry
                                    │
                                    ▼
                             ┌──────────────┐
                             │  STLViewer   │
                             └──────────────┘
                                    │
                              Three.js Mesh
                                    │
                                    ▼
                             ┌──────────────┐
                             │   Canvas     │
                             │  (WebGL)     │
                             └──────────────┘
```

## 5. STLファイル形式のサポート

### ASCII形式
- `solid` キーワードで始まる
- `facet normal`, `vertex`, `endsolid` などのキーワードを含む
- テキスト形式で人間が読める

### バイナリ形式
- 80バイトのヘッダー
- 4バイトの三角形数（リトルエンディアン）
- 各三角形: 50バイト（法線12 + 頂点36 + 属性2）

### バリデーションロジック

```typescript
const validateStlContent = (buffer: ArrayBuffer) => {
  // 空ファイルチェック
  if (buffer.byteLength === 0) return { valid: false }

  // ASCII形式: "solid"で始まるかチェック
  const header = /* 最初の5バイトを文字列化 */
  if (header.toLowerCase() === 'solid') {
    // facet/endsolidキーワードの存在確認
  }

  // バイナリ形式: 84バイト以上 + 三角形数の検証
  if (buffer.byteLength >= 84) {
    const triangleCount = /* 80バイト目から4バイト読み取り */
    const expectedSize = 84 + triangleCount * 50
    // サイズ整合性チェック
  }
}
```

## 6. テスト戦略

### ユニットテスト

| コンポーネント | テストファイル | カバレッジ目標 |
|---------------|----------------|---------------|
| StlUpload | StlUpload.test.tsx | 19テスト |
| STLViewer | STLViewer.test.tsx | WebGLモック必要 |
| useSTLLoader | - | フック単体テスト |

### テスト環境設定

- **jsdom**: ブラウザ環境シミュレーション
- **FileReader モック**: 非同期ファイル読み込みのテスト
- **WebGL モック**: Three.js コンポーネントのテスト

## 7. 今後の拡張予定

- [ ] 複数モデル比較機能 (Issue #8)
- [ ] 表示設定パネル
- [ ] モデル情報の詳細表示
- [ ] スクリーンショット機能
- [ ] レスポンシブデザイン対応

---

*このドキュメントは自動生成されています。ソースコードの変更に伴い更新してください。*
