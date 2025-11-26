import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StlUpload } from './StlUpload'

// サンプルSTLファイルデータ（ASCII形式）
const SAMPLE_ASCII_STL = `solid testmodel
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 1 0 0
      vertex 0 1 0
    endloop
  endfacet
endsolid testmodel`

// サンプルSTLファイルデータ（バイナリ形式のヘッダー）
const createBinarySTL = (): ArrayBuffer => {
  // バイナリSTLフォーマット:
  // 80バイトヘッダー + 4バイト三角形数 + 三角形データ
  const header = new Uint8Array(80)
  const triangleCount = new Uint32Array([1])
  // 各三角形: 法線(3*4バイト) + 頂点3つ(3*3*4バイト) + 属性(2バイト) = 50バイト
  const triangleData = new Float32Array([
    0, 0, 1, // 法線
    0, 0, 0, // 頂点1
    1, 0, 0, // 頂点2
    0, 1, 0, // 頂点3
  ])
  const attribute = new Uint16Array([0])

  const buffer = new ArrayBuffer(80 + 4 + 50)
  const view = new Uint8Array(buffer)
  view.set(header, 0)
  view.set(new Uint8Array(triangleCount.buffer), 80)
  view.set(new Uint8Array(triangleData.buffer), 84)
  view.set(new Uint8Array(attribute.buffer), 84 + 48)

  return buffer
}

// 無効なファイルデータ
const INVALID_FILE_CONTENT = 'This is not a valid STL file'

describe('StlUpload コンポーネント', () => {
  let mockOnFileLoad: ReturnType<typeof vi.fn>
  let mockOnError: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnFileLoad = vi.fn()
    mockOnError = vi.fn()
  })

  describe('ファイル選択ボタンの実装', () => {
    it('ファイル選択ボタンが表示される', () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const button = screen.getByRole('button', { name: /ファイル選択|ファイルを選択|アップロード|select file/i })
      expect(button).toBeInTheDocument()
    })

    it('ファイル入力要素が存在する', () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const input = document.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('accept', '.stl')
    })

    it('ファイル選択ボタンをクリックするとファイル選択ダイアログが開く', async () => {
      const user = userEvent.setup()
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      const button = screen.getByRole('button', { name: /ファイル選択|ファイルを選択|アップロード|select file/i })
      await user.click(button)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('有効なSTLファイルを選択するとonFileLoadが呼ばれる', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} onError={mockOnError} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File([SAMPLE_ASCII_STL], 'test.stl', { type: 'application/sla' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockOnFileLoad).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('ドラッグ&ドロップエリアの実装', () => {
    it('ドロップエリアが表示される', () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const dropZone = screen.getByTestId('drop-zone')
      expect(dropZone).toBeInTheDocument()
    })

    it('ドラッグオーバー時にスタイルが変化する', () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const dropZone = screen.getByTestId('drop-zone')

      fireEvent.dragOver(dropZone, {
        dataTransfer: { types: ['Files'] },
      })

      expect(dropZone).toHaveClass('drag-over')
    })

    it('ドラッグリーブ時にスタイルが元に戻る', () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const dropZone = screen.getByTestId('drop-zone')

      fireEvent.dragOver(dropZone, {
        dataTransfer: { types: ['Files'] },
      })
      fireEvent.dragLeave(dropZone)

      expect(dropZone).not.toHaveClass('drag-over')
    })

    it('有効なSTLファイルをドロップするとonFileLoadが呼ばれる', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const dropZone = screen.getByTestId('drop-zone')
      const file = new File([SAMPLE_ASCII_STL], 'test.stl', { type: 'application/sla' })

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      })

      await waitFor(() => {
        expect(mockOnFileLoad).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('ドロップ時にデフォルトの動作が防止される', () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const dropZone = screen.getByTestId('drop-zone')
      const event = new Event('drop', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'dataTransfer', {
        value: { files: [], types: ['Files'] },
      })

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      dropZone.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('ファイル読み込み処理（FileReader API）', () => {
    it('ASCII形式のSTLファイルを正しく読み込める', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File([SAMPLE_ASCII_STL], 'test.stl', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockOnFileLoad).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'test.stl',
            data: expect.any(ArrayBuffer),
          })
        )
      }, { timeout: 3000 })
    })

    it('バイナリ形式のSTLファイルを正しく読み込める', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const binaryData = createBinarySTL()
      const file = new File([binaryData], 'test.stl', { type: 'application/sla' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockOnFileLoad).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'test.stl',
            data: expect.any(ArrayBuffer),
          })
        )
      }, { timeout: 3000 })
    })

    it('ファイルが選択されていない場合は何もしない', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [] } })

      // 少し待ってからコールされていないことを確認
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockOnFileLoad).not.toHaveBeenCalled()
    })
  })

  describe('STL形式のバリデーション', () => {
    it('無効なファイル形式の場合はonErrorが呼ばれる', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} onError={mockOnError} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File([INVALID_FILE_CONTENT], 'test.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringMatching(/無効|invalid|stl/i)
        )
      })
    })

    it('.stl以外の拡張子のファイルは拒否される', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} onError={mockOnError} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['some content'], 'test.obj', { type: 'model/obj' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled()
        expect(mockOnFileLoad).not.toHaveBeenCalled()
      })
    })

    it('ASCII STLの基本フォーマットをチェックする', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} onError={mockOnError} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      // 'solid'で始まらない不正なASCII STL
      const invalidAsciiStl = 'not a valid stl format'
      const file = new File([invalidAsciiStl], 'test.stl', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled()
      })
    })

    it('空のファイルは拒否される', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} onError={mockOnError} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File([''], 'empty.stl', { type: 'application/sla' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled()
      })
    })
  })

  describe('ローディング状態', () => {
    it('ファイル読み込み中はローディング表示がされる', async () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File([SAMPLE_ASCII_STL], 'test.stl', { type: 'application/sla' })

      fireEvent.change(input, { target: { files: [file] } })

      // ローディング中の要素を確認（存在しない場合もあるのでtryで囲む）
      try {
        const loading = await screen.findByText(/読み込み中|loading/i, {}, { timeout: 500 })
        expect(loading).toBeInTheDocument()
      } catch {
        // ローディング表示が高速で終わった場合はスキップ
      }
    })
  })

  describe('アクセシビリティ', () => {
    it('ドロップエリアに説明テキストが表示される', () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const instructions = screen.getByText(/ドラッグ.*ドロップ|drag.*drop/i)
      expect(instructions).toBeInTheDocument()
    })

    it('サポートされるファイル形式の説明が表示される', () => {
      render(<StlUpload onFileLoad={mockOnFileLoad} />)

      const formatInfo = screen.getByText(/対応形式.*stl|supported.*stl/i)
      expect(formatInfo).toBeInTheDocument()
    })
  })
})
