# プロジェクト全体の学び

このファイルは、各Issueの作業を通じて得られた汎用的な知識を蓄積します。

## 学び（Issue #1 より）

### Three.js + React Three Fiberのテスト環境構築

#### WebGL環境のモック実装
Three.jsはWebGL環境を必要とするため、CI/CDやヘッドレス環境ではテストが実行できません。以下のモックが必須です：

- **WebGLRenderingContext**: HTMLCanvasElement.getContextをモック化
- **Three.jsの主要クラス**: WebGLRenderer, Scene, PerspectiveCamera, Clock等をvi.mock()でモック
- **ResizeObserver**: Canvas要素のリサイズ監視に必要
- **matchMedia**: レスポンシブ対応時に必要

これらは `/tests/setup.ts` で一括設定することで、各テストファイルでのボイラープレートを削減できます。

#### React Three Fiberの特殊性
- `<Canvas>`コンポーネントは内部で`<canvas>`要素を生成
- テスト環境でWebGL contextが取得できるようモック実装が必須
- 描画ループ（requestAnimationFrame）も考慮が必要
- `@react-three/drei`のOrbitControlsで簡単にカメラ操作を追加可能

### Vitestの設定とテストファイル検出

#### 重要な設定項目
1. **テストファイルパターンの確認**
   - `include` パターンは必ず動作確認すること
   - `npx vitest list` でテストファイルが検出されることを確認
   - setupFilesのパスは絶対パスまたは明確な相対パスで指定

2. **テストが実行されない場合のデバッグ手順**
   - まず `npx vitest list` でファイル検出を確認
   - 設定を最小限にして段階的に追加
   - `npx vitest --reporter=verbose` で詳細ログを確認

3. **Vitestセットアップファイルの構成**
   - `/tests/setup.ts` で共通のモック設定を集約
   - `afterEach(() => cleanup())` でテスト後のDOMクリーンアップ
   - グローバルモック（WebGL, ResizeObserver, matchMedia）
   - テストユーティリティのインポート（@testing-library/jest-dom）

### Vite + TypeScriptプロジェクトの設定

#### TypeScript設定のベストプラクティス
- `moduleResolution: "bundler"` - Vite等のバンドラー向け設定
- `allowImportingTsExtensions: true` - .tsx等の拡張子付きインポートを許可
- `noEmit: true` - Viteが型チェックとトランスパイルを分離
- `tsconfig.node.json` で設定ファイル用のTypeScript設定を分離

#### Vite設定の分離
- `vite.config.ts` と `vitest.config.ts` は別ファイルとして管理
- パスエイリアス（@/*）を設定し、インポートパスを簡潔化
- 開発サーバーのポート設定（デフォルト3000等）

### TDD（テスト駆動開発）のベストプラクティス

#### ファイル存在確認テストの有効性
プロジェクトの初期セットアップ段階では、以下のような「構造テスト」が有効：
- ファイル/ディレクトリの存在確認
- package.jsonの内容検証（スクリプト、依存パッケージ）
- 設定ファイルの存在確認

**メリット**:
- プロジェクトの初期セットアップが正しく行われたか確認できる
- ファイル命名規則の遵守を強制できる
- CI/CDでセットアップの正当性を自動検証できる

**注意点**:
- パスは絶対パスで解決する（`resolve(__dirname, '..')`）
- ファイルが存在しない場合の分岐処理を含める

#### 静的解析によるコード検証
ファイル内容を文字列として読み込み、正規表現でインポート文やコンポーネント定義を確認する手法：

**メリット**:
- モジュールのインポートエラーを気にせずテストできる
- 構文エラーがあってもテストを実行できる
- TDD初期段階で有効（ファイルの雛形確認）

**注意点**:
- 正規表現は柔軟に設計する（例: `export\s+(default\s+)?function\s+App|export\s+default\s+App`）
- TypeScript構文の多様性を考慮する

#### package.jsonの依存パッケージ検証
`dependencies`と`devDependencies`を統合してチェック：

```typescript
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};
expect(dependencies.react).toBeDefined();
```

この方法により、依存パッケージの配置場所の違いに柔軟に対応できます。

### プロジェクトセットアップIssueのレビュー基準

#### 必須チェック項目
- TypeScript型チェック（`npx tsc --noEmit`）
- ビルド成功（`npm run build`）
- テスト実行可能（`npm test`）
- 開発サーバー起動確認（`npm run dev`）

#### 推奨チェック項目
- ESLint設定
- Prettier設定
- ビルドサイズの確認
- Three.jsのWebGLモック設定

**重要**: テストインフラが正しく動作することは必須。セットアップ段階での問題は後続タスクに大きく影響するため、厳格にRejectして早期修正を促すべき。

### ディレクトリ構成のベストプラクティス

#### React + Three.jsプロジェクトの推奨構成
```
src/
├── components/
│   ├── viewer/     # 3Dビューア関連
│   ├── sidebar/    # サイドパネル関連
│   └── common/     # 共通コンポーネント
├── hooks/          # カスタムフック
├── utils/          # ユーティリティ関数
├── types/          # 型定義
├── App.tsx         # メインアプリ
├── main.tsx        # エントリーポイント
└── index.css       # グローバルスタイル
```

この構成により、機能ごとにコードを整理し、保守性を向上できます。

## 学び（Issue #9 より）

### Three.js Canvas のスクリーンショット取得

#### preserveDrawingBuffer オプション

Three.js（React Three Fiber）のCanvasでスクリーンショットを取得するには、`preserveDrawingBuffer: true` オプションが必須:

```tsx
<Canvas gl={{ preserveDrawingBuffer: true }}>
```

**理由**: デフォルトではWebGLは描画後にバッファをクリアするため、`toDataURL()`で空の画像が取得される。

### forwardRef と useImperativeHandle パターン

子コンポーネントのDOM要素やメソッドを親から参照するには、`forwardRef`と`useImperativeHandle`を組み合わせる:

```tsx
export interface ComponentRef {
  someMethod: () => void
}

const Component = forwardRef<ComponentRef, Props>((props, ref) => {
  useImperativeHandle(ref, () => ({
    someMethod: () => { /* ... */ }
  }), [])
  // ...
})
```

**注意**: `forwardRef`でラップされたコンポーネントは`typeof`で`'object'`を返す（通常のfunction componentは`'function'`）。

### TypeScript verbatimModuleSyntax

`verbatimModuleSyntax`が有効な場合、型のみのインポートは明示的に`import type`を使用する:

```typescript
// NG
import { Component, ComponentRef } from './Component'

// OK
import { Component } from './Component'
import type { ComponentRef } from './Component'
```
