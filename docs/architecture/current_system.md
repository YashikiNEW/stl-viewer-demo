# Current System Architecture

## 概要

STL Viewer Demo は、Web ブラウザ上で 3D モデル（STL ファイル）を表示・操作できる Single Page Application です。React Three Fiber を使用して Three.js の機能を React コンポーネントとして扱い、宣言的な UI で 3D グラフィックスを実現しています。

現在は基本的なプロジェクト構成と 3D レンダリング環境のセットアップが完了しており、テスト用の立方体が表示される状態です。

## 技術スタック

### フロントエンド

- **React** (v18.2.0): UI フレームワーク
- **TypeScript** (v5.3.3): 型安全な開発環境
- **Vite** (v5.0.8): ビルドツール・開発サーバー

### 3D レンダリング

- **Three.js** (v0.160.0): WebGL ベースの 3D ライブラリ
- **@react-three/fiber** (v8.15.0): React 向け Three.js レンダラー
- **@react-three/drei** (v9.93.0): React Three Fiber 用のヘルパーコンポーネント集

### テスト

- **Vitest** (v1.1.0): Vite ネイティブなテストフレームワーク
- **@testing-library/react** (v14.1.2): React コンポーネントのテストユーティリティ
- **@testing-library/jest-dom** (v6.1.5): DOM 要素のアサーション拡張
- **@testing-library/user-event** (v14.5.1): ユーザーインタラクションのシミュレーション
- **jsdom** (v23.0.1): DOM 環境のエミュレーション

## ディレクトリ構成

```
/workspaces/stl-viewer-demo/.claude/worktrees/task-1/
├── src/                        # ソースコード
│   ├── App.tsx                # ルートコンポーネント（3D Canvas を含む）
│   ├── main.tsx               # アプリケーションエントリーポイント
│   └── index.css              # グローバルスタイル
├── docs/                       # ドキュメント
│   └── architecture/          # アーキテクチャ設計書
│       └── current_system.md  # 現在のシステム構成（本ドキュメント）
├── tests/                      # テストコード
├── dist/                       # ビルド成果物
├── node_modules/              # npm 依存パッケージ
├── index.html                 # HTML エントリーポイント
├── package.json               # npm パッケージ設定
├── tsconfig.json              # TypeScript コンパイラ設定
├── tsconfig.node.json         # Node.js 用 TypeScript 設定
├── vite.config.ts             # Vite ビルド設定
└── vitest.config.ts           # Vitest テスト設定
```

## コンポーネント

### App.tsx

アプリケーションのルートコンポーネント。以下の要素を含みます:

- **Canvas**: React Three Fiber の 3D レンダリング領域
  - カメラ設定: position [0, 0, 5], fov 75
  - 背景色: #1a1a1a（ダークグレー）
- **ambientLight**: 環境光（強度 0.5）
- **directionalLight**: 平行光源（位置 [10, 10, 5]、強度 1）
- **mesh**: テスト用の立方体オブジェクト
  - ジオメトリ: 1x1x1 の boxGeometry
  - マテリアル: オレンジ色の meshStandardMaterial
- **OrbitControls**: マウス操作によるカメラコントロール

### main.tsx

React アプリケーションのエントリーポイント。`#root` 要素に App コンポーネントをマウントします。React.StrictMode でラップされており、開発時の潜在的な問題を検出します。

### index.css

グローバルスタイルの定義:

- リセット CSS（margin, padding, box-sizing）
- フォント設定（システムフォントスタック）
- #root 要素をビューポート全体に表示（100vw x 100vh）

## 依存関係

### 本番環境依存パッケージ

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| react | ^18.2.0 | UI フレームワーク |
| react-dom | ^18.2.0 | React DOM レンダリング |
| three | ^0.160.0 | 3D グラフィックスライブラリ |
| @react-three/fiber | ^8.15.0 | React 向け Three.js レンダラー |
| @react-three/drei | ^9.93.0 | React Three Fiber ヘルパー |

### 開発環境依存パッケージ

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| @vitejs/plugin-react | ^4.2.1 | Vite の React サポート |
| typescript | ^5.3.3 | TypeScript コンパイラ |
| @types/react | ^18.2.45 | React 型定義 |
| @types/react-dom | ^18.2.18 | React DOM 型定義 |
| @types/three | ^0.160.0 | Three.js 型定義 |
| @types/node | ^20.10.6 | Node.js 型定義 |
| vitest | ^1.1.0 | テストランナー |
| @vitest/ui | ^1.1.0 | Vitest UI インターフェース |
| @testing-library/react | ^14.1.2 | React テストユーティリティ |
| @testing-library/jest-dom | ^6.1.5 | DOM アサーション |
| @testing-library/user-event | ^14.5.1 | ユーザーイベントシミュレーション |
| jsdom | ^23.0.1 | DOM 環境エミュレーション |

## ビルド設定

### Vite (vite.config.ts)

- **プラグイン**: @vitejs/plugin-react でReactサポート
- **エイリアス**: `@/` を `./src/` にマッピング
- **開発サーバー**:
  - ポート 3000
  - 起動時にブラウザを自動オープン

### TypeScript (tsconfig.json)

- **ターゲット**: ES2020
- **モジュール解決**: bundler モード
- **JSX**: react-jsx（React 17+ の新しい JSX トランスフォーム）
- **Strictモード**: 有効
- **パスマッピング**: `@/*` を `./src/*` にマッピング
- **リント**: 未使用変数・パラメータの検出、switch 文の fallthrough 検出

### Vitest (vitest.config.ts)

テスト環境として jsdom を使用し、React コンポーネントのテストをサポートしています。

## NPM スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動（ポート 3000） |
| `npm run build` | 本番用ビルド（TypeScript コンパイル + Vite ビルド） |
| `npm run preview` | ビルド結果をプレビュー |
| `npm run test` | テストを1回実行 |
| `npm run test:watch` | テストをウォッチモードで実行 |
| `npm run test:ui` | Vitest UI でテスト実行 |
| `npm run test:coverage` | カバレッジレポート付きでテスト実行 |

## 現在の実装状態

### 完了している機能

- Vite + React + TypeScript プロジェクトのセットアップ
- Three.js / React Three Fiber / Drei のインストールと設定
- 基本的な 3D レンダリング環境の構築
  - Canvas コンポーネントの配置
  - ライティング設定（環境光 + 平行光源）
  - OrbitControls によるカメラ操作
  - テスト用立方体の表示
- テスト環境のセットアップ（Vitest + Testing Library）
- グローバルスタイルの設定

### 未実装の機能

今後実装予定の機能は、Issue ベースで管理されます。主な予定機能:

- STL ファイルのアップロード機能
- STL ファイルのパース・読み込み
- 3D モデルのレンダリング
- カメラ視点のリセット機能
- ワイヤーフレーム/ソリッド表示の切り替え
- モデル情報の表示（頂点数、面数など）
- エラーハンドリング
- ユニットテストの実装

## アーキテクチャ上の特記事項

### React Three Fiber の宣言的アプローチ

Three.js を直接使用する代わりに React Three Fiber を採用することで、以下の利点があります:

- 3D オブジェクトを React コンポーネントとして宣言的に記述
- React の状態管理・ライフサイクルを活用
- 手動での dispose 処理が不要（メモリリーク防止）
- TypeScript による型安全性

### パスエイリアス

`@/` を `src/` のエイリアスとして設定しており、インポート時の相対パスを簡潔に記述できます:

```typescript
// Before: import { something } from '../../components/something'
// After:  import { something } from '@/components/something'
```

### Strict モード

TypeScript の strict モードを有効化しており、以下のチェックが行われます:

- null/undefined の厳密なチェック
- 暗黙的な any の禁止
- 未使用変数・パラメータの検出
- その他の厳格な型チェック

これにより、ランタイムエラーを事前に防ぎ、コード品質を向上させています。

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-11-25 | 初版作成（Issue #1 実装完了時点） |
