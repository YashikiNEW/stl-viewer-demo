# Issue #4 - 3Dビューア実装 学び

## 技術的学び

### React Three Fiber + Vitest の組み合わせ
- React Three Fiberのコンポーネントをテストする際、WebGL のモックが必要
- `three/examples/jsm/loaders/STLLoader.js` のインポートパスに注意
- テストでは `vi.mock` でローダーをモックし、クラスとして実装する必要がある

### Vite + Vitest の設定
- Vitest を使う場合、`vitest/config` から `defineConfig` をインポートし、`mergeConfig` を使って Vite 設定と統合する
- テストファイルは `tsconfig.app.json` の exclude に追加してビルドから除外する

### TypeScript 設定のポイント
- `erasableSyntaxOnly: true` が設定されている場合、型情報のみの構文が必要
- テスト用のセットアップファイルで `any` を使う場合は `@typescript-eslint/no-explicit-any` を明示的に無効化

## パターン

### STLLoader のモック方法
```typescript
const mockParse = vi.fn()

vi.mock('three/examples/jsm/loaders/STLLoader.js', () => ({
  STLLoader: class {
    load = vi.fn()
    parse = mockParse
  },
}))
```

### FileReader のモック方法
```typescript
class MockFileReader {
  result: ArrayBuffer | null = arrayBuffer
  onload: (() => void) | null = null
  onerror: ((e: Error) => void) | null = null
  readAsArrayBuffer() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}
vi.stubGlobal('FileReader', MockFileReader)
```

## 改善点

1. WebGL モックはより包括的なライブラリ（例: @react-three/test-renderer）を検討
2. E2Eテストで実際のSTLファイルを使ったレンダリングテストを追加すると良い
