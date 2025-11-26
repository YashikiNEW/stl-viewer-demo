import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDisplaySettings } from '../hooks/useDisplaySettings'

describe('useDisplaySettings', () => {
  describe('初期状態', () => {
    it('デフォルトの色は#808080（グレー）', () => {
      const { result } = renderHook(() => useDisplaySettings())
      expect(result.current.modelColor).toBe('#808080')
    })

    it('デフォルトでワイヤーフレームはfalse', () => {
      const { result } = renderHook(() => useDisplaySettings())
      expect(result.current.wireframe).toBe(false)
    })
  })

  describe('カスタム初期値', () => {
    it('初期色を指定できる', () => {
      const { result } = renderHook(() =>
        useDisplaySettings({ initialColor: '#ff0000' })
      )
      expect(result.current.modelColor).toBe('#ff0000')
    })

    it('初期ワイヤーフレーム状態を指定できる', () => {
      const { result } = renderHook(() =>
        useDisplaySettings({ initialWireframe: true })
      )
      expect(result.current.wireframe).toBe(true)
    })
  })

  describe('色の変更', () => {
    it('setModelColorで色を変更できる', () => {
      const { result } = renderHook(() => useDisplaySettings())

      act(() => {
        result.current.setModelColor('#ff5500')
      })

      expect(result.current.modelColor).toBe('#ff5500')
    })

    it('色を複数回変更できる', () => {
      const { result } = renderHook(() => useDisplaySettings())

      act(() => {
        result.current.setModelColor('#ff0000')
      })
      expect(result.current.modelColor).toBe('#ff0000')

      act(() => {
        result.current.setModelColor('#00ff00')
      })
      expect(result.current.modelColor).toBe('#00ff00')
    })
  })

  describe('ワイヤーフレームの切り替え', () => {
    it('setWireframeでワイヤーフレームをONにできる', () => {
      const { result } = renderHook(() => useDisplaySettings())

      act(() => {
        result.current.setWireframe(true)
      })

      expect(result.current.wireframe).toBe(true)
    })

    it('setWireframeでワイヤーフレームをOFFにできる', () => {
      const { result } = renderHook(() =>
        useDisplaySettings({ initialWireframe: true })
      )

      act(() => {
        result.current.setWireframe(false)
      })

      expect(result.current.wireframe).toBe(false)
    })

    it('toggleWireframeでワイヤーフレームを切り替えられる', () => {
      const { result } = renderHook(() => useDisplaySettings())

      expect(result.current.wireframe).toBe(false)

      act(() => {
        result.current.toggleWireframe()
      })
      expect(result.current.wireframe).toBe(true)

      act(() => {
        result.current.toggleWireframe()
      })
      expect(result.current.wireframe).toBe(false)
    })
  })

  describe('設定のリセット', () => {
    it('resetSettingsでデフォルト値に戻せる', () => {
      const { result } = renderHook(() => useDisplaySettings())

      act(() => {
        result.current.setModelColor('#ff0000')
        result.current.setWireframe(true)
      })

      expect(result.current.modelColor).toBe('#ff0000')
      expect(result.current.wireframe).toBe(true)

      act(() => {
        result.current.resetSettings()
      })

      expect(result.current.modelColor).toBe('#808080')
      expect(result.current.wireframe).toBe(false)
    })

    it('カスタム初期値を指定した場合はその値に戻せる', () => {
      const { result } = renderHook(() =>
        useDisplaySettings({ initialColor: '#00ff00', initialWireframe: true })
      )

      act(() => {
        result.current.setModelColor('#ff0000')
        result.current.setWireframe(false)
      })

      act(() => {
        result.current.resetSettings()
      })

      expect(result.current.modelColor).toBe('#00ff00')
      expect(result.current.wireframe).toBe(true)
    })
  })
})
