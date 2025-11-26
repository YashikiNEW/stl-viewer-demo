import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// クリーンアップを各テスト後に実行
afterEach(() => {
  cleanup()
})

// FileReader APIのモック
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class MockFileReader {
  result: string | ArrayBuffer | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any = null
  readyState: number = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onload: ((this: MockFileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((this: MockFileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onloadend: ((this: MockFileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onabort: ((this: MockFileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onloadstart: ((this: MockFileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onprogress: ((this: MockFileReader, ev: ProgressEvent<FileReader>) => any) | null = null

  readAsText(blob: Blob): void {
    this.readyState = 1 // LOADING
    setTimeout(async () => {
      try {
        this.readyState = 2 // DONE
        this.result = await blob.text()
        if (this.onload) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onload.call(this as any, new ProgressEvent('load'))
        }
        if (this.onloadend) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onloadend.call(this as any, new ProgressEvent('loadend'))
        }
      } catch (e) {
        this.error = e
        if (this.onerror) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onerror.call(this as any, new ProgressEvent('error'))
        }
      }
    }, 10)
  }

  readAsArrayBuffer(blob: Blob): void {
    this.readyState = 1 // LOADING
    // Promise.resolve().then() を使用して次のマイクロタスクで実行
    Promise.resolve().then(async () => {
      try {
        this.readyState = 2 // DONE
        // blob.arrayBuffer()を使用してバイナリデータを正しく取得
        this.result = await blob.arrayBuffer()
        if (this.onload) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onload.call(this as any, new ProgressEvent('load'))
        }
        if (this.onloadend) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onloadend.call(this as any, new ProgressEvent('loadend'))
        }
      } catch (e) {
        this.error = e
        if (this.onerror) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onerror.call(this as any, new ProgressEvent('error'))
        }
      }
    })
  }

  readAsDataURL(blob: Blob): void {
    this.readyState = 1 // LOADING
    setTimeout(async () => {
      try {
        this.readyState = 2 // DONE
        const text = await blob.text()
        const base64 = btoa(text)
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64}`
        if (this.onload) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onload.call(this as any, new ProgressEvent('load'))
        }
        if (this.onloadend) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onloadend.call(this as any, new ProgressEvent('loadend'))
        }
      } catch (e) {
        this.error = e
        if (this.onerror) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.onerror.call(this as any, new ProgressEvent('error'))
        }
      }
    }, 10)
  }

  abort(): void {
    this.readyState = 2
    if (this.onabort) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.onabort.call(this as any, new ProgressEvent('abort'))
    }
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent(): boolean { return true }

  static EMPTY = 0
  static LOADING = 1
  static DONE = 2
  EMPTY = 0
  LOADING = 1
  DONE = 2
}

// @ts-expect-error - MockFileReader is not a full implementation of FileReader
global.FileReader = MockFileReader
