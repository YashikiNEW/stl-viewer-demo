/**
 * Issue #1: プロジェクトセットアップのテスト
 *
 * 受け入れ条件:
 * - `npm run dev` で開発サーバーが起動する
 * - React Three Fiberの基本的なCanvasが表示される
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ROOT = resolve(__dirname, '..');

describe('Issue #1: プロジェクトセットアップ', () => {
  describe('package.jsonの確認', () => {
    let packageJson: any;

    beforeEach(() => {
      const packageJsonPath = resolve(PROJECT_ROOT, 'package.json');
      expect(existsSync(packageJsonPath), 'package.json が存在すること').toBe(true);

      const content = readFileSync(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(content);
    });

    it('devスクリプトが定義されていること', () => {
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(typeof packageJson.scripts.dev).toBe('string');
    });

    it('必要な依存パッケージが含まれていること', () => {
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // React関連
      expect(dependencies.react).toBeDefined();
      expect(dependencies['react-dom']).toBeDefined();

      // Three.js関連
      expect(dependencies.three).toBeDefined();
      expect(dependencies['@react-three/fiber']).toBeDefined();
      expect(dependencies['@react-three/drei']).toBeDefined();

      // TypeScript型定義
      expect(dependencies['@types/three']).toBeDefined();
    });

    it('TypeScriptが設定されていること', () => {
      expect(packageJson.devDependencies?.typescript).toBeDefined();
    });

    it('Viteが設定されていること', () => {
      expect(packageJson.devDependencies?.vite).toBeDefined();
    });
  });

  describe('ディレクトリ構成の確認', () => {
    it('srcディレクトリが存在すること', () => {
      const srcPath = resolve(PROJECT_ROOT, 'src');
      expect(existsSync(srcPath), 'src/ ディレクトリが存在すること').toBe(true);
    });

    it('src/App.tsxが存在すること', () => {
      const appPath = resolve(PROJECT_ROOT, 'src/App.tsx');
      expect(existsSync(appPath), 'src/App.tsx が存在すること').toBe(true);
    });

    it('vite.config.tsが存在すること', () => {
      const vitePath = resolve(PROJECT_ROOT, 'vite.config.ts');
      expect(existsSync(vitePath), 'vite.config.ts が存在すること').toBe(true);
    });

    it('tsconfig.jsonが存在すること', () => {
      const tsconfigPath = resolve(PROJECT_ROOT, 'tsconfig.json');
      expect(existsSync(tsconfigPath), 'tsconfig.json が存在すること').toBe(true);
    });
  });

  describe('App.tsxの基本構造確認', () => {
    let appContent: string;

    beforeEach(() => {
      const appPath = resolve(PROJECT_ROOT, 'src/App.tsx');
      if (existsSync(appPath)) {
        appContent = readFileSync(appPath, 'utf-8');
      }
    });

    it('React Three FiberのCanvasがインポートされていること', () => {
      expect(appContent).toMatch(/@react-three\/fiber/);
      expect(appContent).toMatch(/Canvas/);
    });

    it('Appコンポーネントがエクスポートされていること', () => {
      expect(appContent).toMatch(/export\s+(default\s+)?function\s+App|export\s+default\s+App/);
    });

    it('CanvasコンポーネントがJSX内で使用されていること', () => {
      expect(appContent).toMatch(/<Canvas[\s>]/);
    });
  });
});
