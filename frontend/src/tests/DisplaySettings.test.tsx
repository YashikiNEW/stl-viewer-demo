import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DisplaySettings } from '../components/DisplaySettings'

describe('DisplaySettings', () => {
  const defaultProps = {
    modelColor: '#808080',
    wireframe: false,
    onColorChange: vi.fn(),
    onWireframeChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('コンポーネントの表示', () => {
    it('タイトル「表示設定」が表示される', () => {
      render(<DisplaySettings {...defaultProps} />)
      expect(screen.getByRole('heading', { name: '表示設定' })).toBeInTheDocument()
    })

    it('カラーピッカーが表示される', () => {
      render(<DisplaySettings {...defaultProps} />)
      const colorInput = screen.getByLabelText('モデル色')
      expect(colorInput).toBeInTheDocument()
      expect(colorInput).toHaveAttribute('type', 'color')
    })

    it('初期のモデル色が設定される', () => {
      render(<DisplaySettings {...defaultProps} modelColor="#ff0000" />)
      const colorInput = screen.getByLabelText('モデル色') as HTMLInputElement
      expect(colorInput.value).toBe('#ff0000')
    })

    it('ワイヤーフレームトグルが表示される', () => {
      render(<DisplaySettings {...defaultProps} />)
      const checkbox = screen.getByRole('checkbox', { name: /ワイヤーフレーム/i })
      expect(checkbox).toBeInTheDocument()
    })

    it('初期のワイヤーフレーム状態がOFFで表示される', () => {
      render(<DisplaySettings {...defaultProps} wireframe={false} />)
      const checkbox = screen.getByRole('checkbox', { name: /ワイヤーフレーム/i })
      expect(checkbox).not.toBeChecked()
    })

    it('初期のワイヤーフレーム状態がONで表示される', () => {
      render(<DisplaySettings {...defaultProps} wireframe={true} />)
      const checkbox = screen.getByRole('checkbox', { name: /ワイヤーフレーム/i })
      expect(checkbox).toBeChecked()
    })
  })

  describe('色変更の操作', () => {
    it('カラーピッカーで色を変更するとonColorChangeが呼ばれる', async () => {
      const onColorChange = vi.fn()
      render(<DisplaySettings {...defaultProps} onColorChange={onColorChange} />)

      const colorInput = screen.getByLabelText('モデル色')
      fireEvent.input(colorInput, { target: { value: '#ff5500' } })

      expect(onColorChange).toHaveBeenCalledWith('#ff5500')
    })

    it('カラーピッカーで別の色に変更できる', async () => {
      const onColorChange = vi.fn()
      render(<DisplaySettings {...defaultProps} onColorChange={onColorChange} />)

      const colorInput = screen.getByLabelText('モデル色')
      fireEvent.input(colorInput, { target: { value: '#00ff00' } })

      expect(onColorChange).toHaveBeenCalledWith('#00ff00')
    })
  })

  describe('ワイヤーフレーム切り替えの操作', () => {
    it('ワイヤーフレームをONにするとonWireframeChangeがtrueで呼ばれる', async () => {
      const user = userEvent.setup()
      const onWireframeChange = vi.fn()
      render(
        <DisplaySettings
          {...defaultProps}
          wireframe={false}
          onWireframeChange={onWireframeChange}
        />
      )

      const checkbox = screen.getByRole('checkbox', { name: /ワイヤーフレーム/i })
      await user.click(checkbox)

      expect(onWireframeChange).toHaveBeenCalledWith(true)
    })

    it('ワイヤーフレームをOFFにするとonWireframeChangeがfalseで呼ばれる', async () => {
      const user = userEvent.setup()
      const onWireframeChange = vi.fn()
      render(
        <DisplaySettings
          {...defaultProps}
          wireframe={true}
          onWireframeChange={onWireframeChange}
        />
      )

      const checkbox = screen.getByRole('checkbox', { name: /ワイヤーフレーム/i })
      await user.click(checkbox)

      expect(onWireframeChange).toHaveBeenCalledWith(false)
    })
  })

  describe('アクセシビリティ', () => {
    it('セクションにregionロールとラベルが設定されている', () => {
      render(<DisplaySettings {...defaultProps} />)
      const section = screen.getByRole('region', { name: '表示設定' })
      expect(section).toBeInTheDocument()
    })
  })

  describe('デフォルト値', () => {
    it('デフォルトの色は#808080（グレー）', () => {
      render(<DisplaySettings {...defaultProps} modelColor="#808080" />)
      const colorInput = screen.getByLabelText('モデル色') as HTMLInputElement
      expect(colorInput.value).toBe('#808080')
    })

    it('デフォルトでワイヤーフレームはOFF', () => {
      render(<DisplaySettings {...defaultProps} wireframe={false} />)
      const checkbox = screen.getByRole('checkbox', { name: /ワイヤーフレーム/i })
      expect(checkbox).not.toBeChecked()
    })
  })
})
