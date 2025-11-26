# Issue #3 QA作業メモ

**作成日**: 2025-11-25
**担当**: QAエンジニア
**Issue**: #3 - STLファイルアップロード機能

---

## 作業概要

Issue #3（STLファイルアップロード機能）のテストコード作成を実施。テストフレームワークとしてVitest + React Testing Libraryを使用。

---

## テスト環境構築

### 使用技術
- **テストフレームワーク**: Vitest v4.0.14
- **テストライブラリ**: @testing-library/react v16.3.0
- **ユーザーイベントシミュレーション**: @testing-library/user-event v14.6.1
- **DOM マッチャー**: @testing-library/jest-dom v6.9.1
- **DOM環境**: jsdom v27.2.0

### セットアップで学んだこと

#### 1. Vitest設定ファイルの作成
- `vitest.config.ts`を作成し、React pluginとjsdom環境を設定
- `setupFiles`でテストの前処理を定義（`@testing-library/jest-dom`のインポート）
- `globals: true`でdescribe, it, expectをグローバルに使用可能に

#### 2. FileReader API のモック実装
- **課題**: jsdom環境では`FileReader`が完全に実装されていない
- **対策**: `src/tests/setup.ts`でFileReaderクラスをモック実装
- **実装のポイント**:
  - `readAsArrayBuffer`, `readAsText`, `readAsDataURL`の3メソッドを実装
  - 非同期動作をシミュレートするため`setTimeout`を使用
  - `onload`, `onerror`, `onloadend`コールバックを適切に呼び出す
  - `readyState`プロパティを正しく管理

```typescript
// モックのFileReaderで重要なポイント
readAsArrayBuffer(blob: Blob): void {
  setTimeout(() => {
    this.readyState = 2  // DONE状態
    blob.arrayBuffer().then(buffer => {
      this.result = buffer
      if (this.onload) {
        this.onload.call(this, new ProgressEvent('load'))
      }
    })
  }, 0)
}
```

---

## テストケース設計

### テストファイル構成

作成したテストファイル:
1. `/workspaces/stl-viewer-demo/.claude/worktrees/task-3/frontend/src/tests/FileUpload.test.tsx`
2. 既存: `/workspaces/stl-viewer-demo/.claude/worktrees/task-3/frontend/src/tests/stl-upload.test.tsx`

### テストケース分類

#### 1. UI要素の存在確認（3テスト）
- ファイル選択ボタンの存在確認
- ファイル入力要素（input type="file"）の存在確認
- ドラッグ&ドロップエリアの存在確認

**学び**:
- `data-testid`属性を使用することでテストが安定する
- アクセシビリティ属性（`aria-label`, `role`）も合わせてテスト

#### 2. ファイル選択機能（2テスト）
- STLファイル選択時の正常動作
- 非STLファイル選択時のエラーハンドリング

**学び**:
- `userEvent.upload()`を使用してファイル選択をシミュレート
- `waitFor()`で非同期のFileReader処理を待機（timeout: 3000ms設定）
- モック関数の呼び出しを`expect().toHaveBeenCalledWith()`で検証

#### 3. ドラッグ&ドロップ機能（5テスト）
- STLバイナリファイルのドロップ
- STL ASCIIファイルのドロップ
- dragOverイベントのpreventDefault確認
- 非STLファイルのドロップ時のエラー
- ドラッグ状態の視覚的フィードバック

**学び**:
- `fireEvent.drop()`でドロップイベントをシミュレート
- `dataTransfer.files`プロパティに配列としてファイルを設定
- `preventDefault()`が呼ばれたかを`event.defaultPrevented`で確認

**重要な発見**:
ドロップイベントのシミュレーションには以下の形式が必要:
```typescript
const dropEvent = new Event('drop', { bubbles: true }) as any
dropEvent.dataTransfer = {
  files: [file],
  types: ['Files']
}
fireEvent.drop(dropZone, dropEvent)
```

#### 4. STLフォーマットのバリデーション（3テスト）
- STLバイナリ形式の認識
- STL ASCII形式の認識
- 大文字拡張子（.STL）の認識

**学び**:
- STLバイナリ形式の最小構造:
  - 80バイトヘッダー
  - 4バイト三角形数（リトルエンディアン）
  - 各三角形: 法線(12B) + 頂点3つ(36B) + 属性(2B) = 50バイト

- STL ASCII形式の最小構造:
```
solid [名前]
  facet normal nx ny nz
    outer loop
      vertex x y z
      vertex x y z
      vertex x y z
    endloop
  endfacet
endsolid [名前]
```

- 拡張子チェックは大文字小文字を区別しない実装が推奨（`.toLowerCase()`使用）

#### 5. エラーハンドリング（2テスト）
- 空のファイルリスト処理
- FileReader読み込みエラー時の処理

**学び**:
- エラーシミュレーションのためにFileReaderクラスを一時的に上書き
- エラー後の状態復元を忘れずに実施（`global.FileReader = originalFileReader`）
- 空のファイルリストは`null`または`length === 0`で判定

#### 6. 複数ファイル対応（1テスト）
- `maxFiles` propsの動作確認

**学び**:
- 比較モード用に最大2ファイルまで対応する仕様
- propsの受け渡しテストは簡易的に実装可能

#### 7. アクセシビリティ（2テスト）
- `aria-label`属性の設定確認
- `role`属性の設定確認

**学び**:
- スクリーンリーダー対応のため、適切なARIA属性が必要
- ファイルアップロードUIは視覚障害者にとって使いにくい場合があるため配慮が重要

---

## テスト実行結果

### 実行コマンド
```bash
npm test -- --run
```

### 結果サマリー
- **合計テストケース**: 29個（2ファイル）
- **成功**: 15個
- **失敗**: 14個（実装がまだ存在しないため予想通り）
- **構文エラー**: なし

### FileUpload.test.tsx（17テスト）
- ✅ 成功: 9テスト（UI要素、エラーハンドリング、アクセシビリティ）
- ❌ 失敗: 8テスト（ファイルロード処理 - 実装待ち）

### stl-upload.test.tsx（12テスト）
- ✅ 成功: 6テスト
- ❌ 失敗: 6テスト（実装待ち）

---

## 境界値・エッジケースの設計

### 1. ファイルサイズ
- **テスト**: 空ファイル（0バイト）
- **テスト**: 最小STLファイル（84バイト）
- **未テスト**: 大容量ファイル（仕様上制限なし、パフォーマンステストとして別途必要）

### 2. ファイル名
- **テスト**: 小文字拡張子（.stl）
- **テスト**: 大文字拡張子（.STL）
- **未テスト**: 特殊文字を含むファイル名、非ASCII文字

### 3. ファイル内容
- **テスト**: STLバイナリ形式
- **テスト**: STL ASCII形式
- **未テスト**: 破損したSTLファイル、不正なヘッダー

### 4. ユーザー操作
- **テスト**: ファイル選択
- **テスト**: ドラッグ&ドロップ
- **テスト**: 非対応ファイルの選択
- **未テスト**: 複数ファイルの同時ドロップ、キャンセル操作

---

## モック作成時の注意点

### FileReader APIのモック
- **ハマったポイント**: FileReaderの`readAsArrayBuffer`が非同期なので、テストも`waitFor`で待機が必要
- **解決方法**: `setTimeout(() => {}, 0)`で次のイベントループに処理を遅延
- **注意**: 実際のFileReaderと完全に同じ挙動ではないため、ブラウザでの動作確認も必須

### File/Blobのモック
- **学び**: jsdomでは`File`と`Blob`は利用可能
- **注意**: `blob.arrayBuffer()`はPromiseを返すため、非同期処理が必要

### イベントのモック
- **学び**: `fireEvent`と`userEvent`の使い分け
  - `fireEvent`: 低レベルなイベント発火（drop, dragOverなど）
  - `userEvent`: 実際のユーザー操作をシミュレート（click, uploadなど）

---

## テストパターンのベストプラクティス

### 1. Arrange-Act-Assert パターン
すべてのテストで以下の構造を維持:
```typescript
it('テスト名', async () => {
  // Arrange: 準備
  render(<Component onFileLoad={mockFn} />)
  const element = screen.getByTestId('element')

  // Act: 実行
  await userEvent.upload(element, file)

  // Assert: 検証
  await waitFor(() => {
    expect(mockFn).toHaveBeenCalled()
  })
})
```

### 2. モック関数のクリア
`beforeEach`でモック関数をクリアし、テスト間の影響を排除

### 3. タイムアウト設定
非同期処理には適切なタイムアウトを設定（デフォルト1000ms → 3000msに延長）

### 4. 詳細なアサーション
単に「呼ばれたか」だけでなく、「正しい引数で呼ばれたか」も検証

---

## 次回以降に役立つ知見

### テスト作成時のチェックリスト
- [ ] UI要素の存在確認
- [ ] 正常系の動作確認
- [ ] 異常系・エラーハンドリング
- [ ] 境界値テスト
- [ ] アクセシビリティ確認
- [ ] 非同期処理の適切な待機
- [ ] モック関数の呼び出し検証
- [ ] クリーンアップ処理（afterEach）

### Vitestの便利機能
- `test.skip()`: 特定のテストをスキップ
- `test.only()`: 特定のテストのみ実行
- `--ui`: ブラウザでテスト結果を確認
- `--coverage`: カバレッジレポート生成

### React Testing Library の原則
- "The more your tests resemble the way your software is used, the more confidence they can give you."
- DOM要素の取得優先順位: getByRole > getByLabelText > getByPlaceholderText > getByText > getByTestId
- テストはユーザー視点で書く（内部実装に依存しない）

---

## 残課題・改善点

### 1. テストカバレッジ
現状のテストは基本機能のみをカバー。以下を追加検討:
- 複数ファイルの同時アップロード
- 大容量ファイルのパフォーマンステスト
- ネットワークエラー時の挙動

### 2. E2Eテスト
ユニットテストとは別に、Playwright/Cypressでのブラウザテストも検討

### 3. ビジュアルリグレッションテスト
ドラッグ&ドロップエリアの視覚的フィードバックをStorybookなどで確認

### 4. 実際のSTLファイルを使ったテスト
テストデータとして実際のSTLファイル（小さいもの）を用意し、より現実的なテストを実施

---

## まとめ

### 達成できたこと
- ✅ Vitest + React Testing Library環境の構築
- ✅ FileReader APIの適切なモック実装
- ✅ 網羅的なテストケースの作成（29テストケース）
- ✅ 構文エラーなしでのテスト実行
- ✅ 正常系・異常系・境界値テストの実装

### 重要な学び
1. jsdom環境でのFileReader APIモックは手動実装が必要
2. 非同期処理のテストは`waitFor`とタイムアウト設定が重要
3. ドラッグ&ドロップのシミュレーションには`dataTransfer`プロパティの設定が必須
4. アクセシビリティ属性のテストも品質保証の一環として重要

### 次のステップ
実装担当者がコンポーネントを実装後、以下を実施:
1. テストの実行と修正
2. カバレッジレポートの確認
3. 不足しているテストケースの追加
4. 実際のブラウザでの動作確認

---

**作業時間**: 約2時間
**テストファイル数**: 2ファイル
**総テストケース数**: 29個
**構文エラー**: 0件
