# Issue #1 QA作業メモ

## 作業日時
2025-11-25

## 対象Issue
**Issue #1**: プロジェクトセットアップ（Vite + React + TypeScript + Three.js）

## テスト設計の概要

### 受け入れ条件に基づくテストケース
1. **package.jsonの存在とdevスクリプトの確認**
   - package.jsonが存在すること
   - `scripts.dev`が定義されていること
   - 必要な依存パッケージが含まれていること（react, react-dom, three, @react-three/fiber, @react-three/drei, @types/three）
   - TypeScript、Viteが設定されていること

2. **ディレクトリ構成の確認**
   - `src/`ディレクトリが存在すること
   - `src/App.tsx`が存在すること
   - `vite.config.ts`が存在すること
   - `tsconfig.json`が存在すること

3. **App.tsxの基本構造確認**
   - React Three FiberのCanvasコンポーネントがインポートされていること
   - Appコンポーネントが正しくエクスポートされていること
   - CanvasコンポーネントがJSX内で使用されていること

4. **Canvasのレンダリング確認**
   - Canvasコンポーネントが正しくレンダリングされること
   - WebGL環境がない場合でもテストが実行できるようにモックを使用

## 作成したテストファイル

### 1. `/tests/setup.test.ts`
- プロジェクトの基本構成を確認する統合テスト
- ファイルの存在確認（package.json, src/App.tsx, vite.config.ts, tsconfig.json）
- package.jsonの内容検証（スクリプト、依存パッケージ）
- App.tsxの静的解析（正規表現でインポート文とコンポーネント定義を確認）

### 2. `/tests/App.test.tsx`
- App.tsxのコンポーネントレンダリングテスト
- React Testing Libraryを使用
- Three.jsとWebGLのモック実装
- Canvasのレンダリング確認

### 3. `/tests/setup.ts`
- Vitestのセットアップファイル
- WebGLRenderingContextのモック実装
- ResizeObserverのモック実装
- matchMediaのモック実装

### 4. `/vitest.config.ts`
- Vitestの設定ファイル
- jsdom環境の設定
- React Pluginの設定
- カバレッジ設定

## テスト実行結果（初回）

### 期待通りの失敗
TDD（テスト駆動開発）のアプローチとして、実装前にテストを作成したため、すべてのテストが失敗しました。これは正常な動作です。

```
Test Files  2 failed (2)
     Tests  11 failed (11)
  Duration  102.64s
```

### 失敗したテストの内訳

#### package.json関連（4件）
1. devスクリプトが定義されていない
2. 必要な依存パッケージ（react, react-dom, three等）がない
3. TypeScriptが設定されていない
4. Viteが設定されていない

#### ディレクトリ構成関連（4件）
5. srcディレクトリが存在しない
6. src/App.tsxが存在しない
7. vite.config.tsが存在しない
8. tsconfig.jsonが存在しない

#### App.tsx構造関連（3件）
9. React Three FiberのCanvasがインポートされていない（ファイル未存在）
10. Appコンポーネントがエクスポートされていない（ファイル未存在）
11. CanvasコンポーネントがJSX内で使用されていない（ファイル未存在）

## 学びと発見

### 1. Three.jsテストのモック設計
**課題**: Three.jsはWebGL環境を必要とするため、CI/CDやヘッドレス環境ではテストが実行できない

**解決策**:
- WebGLRenderingContextの完全なモック実装
- HTMLCanvasElement.getContextのモック化
- `vi.mock('three')`でThree.jsのクラスをモック化
- ResizeObserverのモック（Canvas要素のリサイズ監視に必要）

**学び**: Three.jsを使用するReactコンポーネントのテストでは、最低限以下のモックが必要：
- WebGLRenderingContext
- Three.jsの主要クラス（WebGLRenderer, Scene, PerspectiveCamera, Clock等）
- ResizeObserver
- matchMedia（レスポンシブ対応時）

### 2. React Three Fiberの特殊性
**発見**: React Three Fiberは通常のReactコンポーネントと異なり、内部でThree.jsの複雑な処理を行うため、以下の点に注意が必要：
- Canvasコンポーネントは<canvas>要素を生成する
- テスト環境でWebGL contextが取得できるようモック実装が必須
- 描画ループ（requestAnimationFrame）も考慮する必要がある

### 3. ファイル存在確認テストのベストプラクティス
**学び**: Node.jsのfsモジュールを使用してファイル存在を確認するテストは、ビルド成果物ではなくソースコードの構成を検証する「構造テスト」として有効

**メリット**:
- プロジェクトの初期セットアップが正しく行われたか確認できる
- ファイル命名規則の遵守を強制できる
- CI/CDでセットアップの正当性を自動検証できる

**注意点**:
- パスは絶対パスで解決する（`resolve(__dirname, '..')`）
- ファイルが存在しない場合の分岐処理を含める（beforeEach内で確認）

### 4. package.jsonの依存パッケージ検証
**ベストプラクティス**: `dependencies`と`devDependencies`を統合してチェックすることで、どちらに配置されていても検出可能

```typescript
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};
expect(dependencies.react).toBeDefined();
```

**学び**: この方法により、プロジェクトセットアップ時の依存パッケージの配置場所の違いに対して柔軟に対応できる

### 5. 静的解析によるコード内容の検証
**アプローチ**: ファイル内容を文字列として読み込み、正規表現でインポート文やコンポーネント定義を確認

**メリット**:
- モジュールのインポートエラーを気にせずテストできる
- 構文エラーがあってもテストを実行できる
- TDD初期段階で有効（ファイルの雛形確認）

**注意点**:
- 正規表現は柔軟に設計する（`export\s+(default\s+)?function\s+App|export\s+default\s+App`）
- TypeScript構文の多様性を考慮する

### 6. Vitestセットアップファイルの重要性
**発見**: `/tests/setup.ts`で共通のモック設定を行うことで、各テストファイルでのボイラープレートコードを削減できる

**設定項目**:
- `afterEach(() => cleanup())`: テスト後のDOMクリーンアップ
- グローバルモック（WebGL, ResizeObserver, matchMedia）
- テストユーティリティのインポート（@testing-library/jest-dom）

## 次回以降に役立つポイント

### 1. Three.jsテストのモックテンプレート
今回作成した`tests/setup.ts`は、Three.jsを使用する他のプロジェクトでも再利用可能。特に以下のモックは汎用的：
- WebGLRenderingContext
- ResizeObserver
- matchMedia

### 2. TDDサイクルの確認
- Red（テスト失敗）→ Green（実装して成功）→ Refactor（リファクタリング）
- 今回は「Red」フェーズを完了
- 次の開発者（デベロッパー）がこのテストを参照して実装を行う

### 3. 受け入れ条件とテストの対応
受け入れ条件をそのままテストケースに変換することで、仕様とテストの乖離を防げる：
- 受け入れ条件: "`npm run dev` で開発サーバーが起動する"
- テストケース: "devスクリプトが定義されていること"

### 4. エッジケースの検討
プロジェクトセットアップのテストでは以下のエッジケースも考慮できる（今回は未実装）：
- package.jsonの構文エラー処理
- 依存パッケージのバージョン制約確認
- tsconfig.jsonの設定内容検証
- vite.configの妥当性確認

## まとめ
- 11個のテストケースを作成し、すべて期待通り失敗（TDD初期段階）
- Three.jsのモック設計に関する知見を獲得
- ファイル存在確認とpackage.json検証のベストプラクティスを確立
- 次の実装者が参照できる明確なテスト仕様を提供
