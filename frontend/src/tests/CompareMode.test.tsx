/**
 * 複数モデル比較機能のテスト
 * Issue #8: 複数モデル比較機能
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CompareMode } from '../components/CompareMode'
import { useCompareMode } from '../hooks/useCompareMode'
import { renderHook, act } from '@testing-library/react'

describe('useCompareMode', () => {
  describe('初期状態', () => {
    it('比較モードは初期状態でOFFである', () => {
      const { result } = renderHook(() => useCompareMode())
      expect(result.current.isCompareMode).toBe(false)
    })

    it('左右のモデルは初期状態でnullである', () => {
      const { result } = renderHook(() => useCompareMode())
      expect(result.current.leftModel).toBeNull()
      expect(result.current.rightModel).toBeNull()
    })
  })

  describe('比較モードの切り替え', () => {
    it('enableCompareModeで比較モードをONにできる', () => {
      const { result } = renderHook(() => useCompareMode())

      act(() => {
        result.current.enableCompareMode()
      })

      expect(result.current.isCompareMode).toBe(true)
    })

    it('disableCompareModeで比較モードをOFFにできる', () => {
      const { result } = renderHook(() => useCompareMode())

      act(() => {
        result.current.enableCompareMode()
        result.current.disableCompareMode()
      })

      expect(result.current.isCompareMode).toBe(false)
    })

    it('toggleCompareModeで比較モードを切り替えできる', () => {
      const { result } = renderHook(() => useCompareMode())

      expect(result.current.isCompareMode).toBe(false)

      act(() => {
        result.current.toggleCompareMode()
      })
      expect(result.current.isCompareMode).toBe(true)

      act(() => {
        result.current.toggleCompareMode()
      })
      expect(result.current.isCompareMode).toBe(false)
    })
  })

  describe('モデルの設定', () => {
    it('setLeftModelで左側モデルを設定できる', () => {
      const { result } = renderHook(() => useCompareMode())
      const mockFile = new File(['test'], 'test.stl', { type: 'application/octet-stream' })
      const mockData = new ArrayBuffer(10)

      act(() => {
        result.current.setLeftModel(mockFile, mockData)
      })

      expect(result.current.leftModel).not.toBeNull()
      expect(result.current.leftModel?.file).toBe(mockFile)
      expect(result.current.leftModel?.data).toBe(mockData)
    })

    it('setRightModelで右側モデルを設定できる', () => {
      const { result } = renderHook(() => useCompareMode())
      const mockFile = new File(['test'], 'test.stl', { type: 'application/octet-stream' })
      const mockData = new ArrayBuffer(10)

      act(() => {
        result.current.setRightModel(mockFile, mockData)
      })

      expect(result.current.rightModel).not.toBeNull()
      expect(result.current.rightModel?.file).toBe(mockFile)
      expect(result.current.rightModel?.data).toBe(mockData)
    })

    it('clearLeftModelで左側モデルをクリアできる', () => {
      const { result } = renderHook(() => useCompareMode())
      const mockFile = new File(['test'], 'test.stl', { type: 'application/octet-stream' })
      const mockData = new ArrayBuffer(10)

      act(() => {
        result.current.setLeftModel(mockFile, mockData)
        result.current.clearLeftModel()
      })

      expect(result.current.leftModel).toBeNull()
    })

    it('clearRightModelで右側モデルをクリアできる', () => {
      const { result } = renderHook(() => useCompareMode())
      const mockFile = new File(['test'], 'test.stl', { type: 'application/octet-stream' })
      const mockData = new ArrayBuffer(10)

      act(() => {
        result.current.setRightModel(mockFile, mockData)
        result.current.clearRightModel()
      })

      expect(result.current.rightModel).toBeNull()
    })
  })

  describe('比較モード終了時の処理', () => {
    it('比較モードを終了するとモデルがクリアされる', () => {
      const { result } = renderHook(() => useCompareMode())
      const mockFile = new File(['test'], 'test.stl', { type: 'application/octet-stream' })
      const mockData = new ArrayBuffer(10)

      act(() => {
        result.current.enableCompareMode()
        result.current.setLeftModel(mockFile, mockData)
        result.current.setRightModel(mockFile, mockData)
        result.current.disableCompareMode()
      })

      expect(result.current.leftModel).toBeNull()
      expect(result.current.rightModel).toBeNull()
    })
  })
})

describe('CompareMode コンポーネント', () => {
  describe('比較モードボタン', () => {
    it('比較モードに切り替えるボタンが表示される', () => {
      render(
        <CompareMode
          isCompareMode={false}
          onToggleCompare={vi.fn()}
          leftModel={null}
          rightModel={null}
          onLeftModelLoad={vi.fn()}
          onRightModelLoad={vi.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /比較モード/i })).toBeInTheDocument()
    })

    it('比較モード中は終了ボタンが表示される', () => {
      render(
        <CompareMode
          isCompareMode={true}
          onToggleCompare={vi.fn()}
          leftModel={null}
          rightModel={null}
          onLeftModelLoad={vi.fn()}
          onRightModelLoad={vi.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /比較終了/i })).toBeInTheDocument()
    })

    it('ボタンクリックでonToggleCompareが呼ばれる', () => {
      const mockToggle = vi.fn()
      render(
        <CompareMode
          isCompareMode={false}
          onToggleCompare={mockToggle}
          leftModel={null}
          rightModel={null}
          onLeftModelLoad={vi.fn()}
          onRightModelLoad={vi.fn()}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /比較モード/i }))
      expect(mockToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('左右分割レイアウト', () => {
    it('比較モードで左右分割レイアウトが表示される', () => {
      render(
        <CompareMode
          isCompareMode={true}
          onToggleCompare={vi.fn()}
          leftModel={null}
          rightModel={null}
          onLeftModelLoad={vi.fn()}
          onRightModelLoad={vi.fn()}
        />
      )

      expect(screen.getByTestId('compare-container')).toBeInTheDocument()
      expect(screen.getByTestId('left-panel')).toBeInTheDocument()
      expect(screen.getByTestId('right-panel')).toBeInTheDocument()
    })

    it('非比較モードでは分割レイアウトは表示されない', () => {
      render(
        <CompareMode
          isCompareMode={false}
          onToggleCompare={vi.fn()}
          leftModel={null}
          rightModel={null}
          onLeftModelLoad={vi.fn()}
          onRightModelLoad={vi.fn()}
        />
      )

      expect(screen.queryByTestId('compare-container')).not.toBeInTheDocument()
    })
  })

  describe('ファイルアップロード', () => {
    it('左側パネルにファイルアップロードUIがある', () => {
      render(
        <CompareMode
          isCompareMode={true}
          onToggleCompare={vi.fn()}
          leftModel={null}
          rightModel={null}
          onLeftModelLoad={vi.fn()}
          onRightModelLoad={vi.fn()}
        />
      )

      const leftPanel = screen.getByTestId('left-panel')
      expect(leftPanel.querySelector('[data-testid="left-upload"]')).toBeInTheDocument()
    })

    it('右側パネルにファイルアップロードUIがある', () => {
      render(
        <CompareMode
          isCompareMode={true}
          onToggleCompare={vi.fn()}
          leftModel={null}
          rightModel={null}
          onLeftModelLoad={vi.fn()}
          onRightModelLoad={vi.fn()}
        />
      )

      const rightPanel = screen.getByTestId('right-panel')
      expect(rightPanel.querySelector('[data-testid="right-upload"]')).toBeInTheDocument()
    })
  })
})
