/**
 * Vitest セットアップファイル
 * テスト実行前に実行される初期化処理
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});

// WebGLのモック（Three.jsのテストに必要）
class WebGLRenderingContextMock {
  canvas = document.createElement('canvas');
  getExtension = vi.fn();
  getParameter = vi.fn();
  getContextAttributes = vi.fn(() => ({
    alpha: true,
    antialias: true,
  }));
}

// HTMLCanvasElement.getContextのモック
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return new WebGLRenderingContextMock() as any;
  }
  return null;
});

// ResizeObserverのモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
