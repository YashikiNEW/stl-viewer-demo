import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModelInfoPanel } from '../components/ModelInfoPanel'
import type { ModelInfo } from '../types/model'

describe('ModelInfoPanel', () => {
  const defaultModelInfo: ModelInfo = {
    vertexCount: 1000,
    faceCount: 500,
    boundingBox: { x: 10, y: 20, z: 30 }
  }

  describe('モデル情報の表示', () => {
    it('頂点数が正しく表示される', () => {
      render(<ModelInfoPanel modelInfo={defaultModelInfo} />)

      expect(screen.getByText(/頂点数/)).toBeInTheDocument()
      expect(screen.getByText(/1,000/)).toBeInTheDocument()
    })

    it('面数（三角形数）が正しく表示される', () => {
      render(<ModelInfoPanel modelInfo={defaultModelInfo} />)

      expect(screen.getByText(/面数/)).toBeInTheDocument()
      expect(screen.getByText(/500/)).toBeInTheDocument()
    })

    it('バウンディングボックスサイズが正しく表示される', () => {
      render(<ModelInfoPanel modelInfo={defaultModelInfo} />)

      expect(screen.getByText(/サイズ/)).toBeInTheDocument()
      // X, Y, Z のサイズが表示されていることを確認
      expect(screen.getByText(/X:/)).toBeInTheDocument()
      expect(screen.getByText(/Y:/)).toBeInTheDocument()
      expect(screen.getByText(/Z:/)).toBeInTheDocument()
      expect(screen.getByText(/10\.00/)).toBeInTheDocument()
      expect(screen.getByText(/20\.00/)).toBeInTheDocument()
      expect(screen.getByText(/30\.00/)).toBeInTheDocument()
    })

    it('大きな数値がカンマ区切りでフォーマットされる', () => {
      const largeModelInfo: ModelInfo = {
        vertexCount: 1234567,
        faceCount: 7654321,
        boundingBox: { x: 100, y: 200, z: 300 }
      }

      render(<ModelInfoPanel modelInfo={largeModelInfo} />)

      expect(screen.getByText(/1,234,567/)).toBeInTheDocument()
      expect(screen.getByText(/7,654,321/)).toBeInTheDocument()
    })

    it('小数点以下のサイズは2桁まで表示される', () => {
      const decimalModelInfo: ModelInfo = {
        vertexCount: 100,
        faceCount: 50,
        boundingBox: { x: 1.234, y: 5.678, z: 9.012 }
      }

      render(<ModelInfoPanel modelInfo={decimalModelInfo} />)

      expect(screen.getByText(/1\.23/)).toBeInTheDocument()
      expect(screen.getByText(/5\.68/)).toBeInTheDocument()
      expect(screen.getByText(/9\.01/)).toBeInTheDocument()
    })
  })

  describe('モデル未読み込み時の表示', () => {
    it('modelInfoがnullの場合は未読み込みメッセージが表示される', () => {
      render(<ModelInfoPanel modelInfo={null} />)

      expect(screen.getByText(/モデルが読み込まれていません/)).toBeInTheDocument()
    })

    it('modelInfoがundefinedの場合は未読み込みメッセージが表示される', () => {
      render(<ModelInfoPanel modelInfo={undefined} />)

      expect(screen.getByText(/モデルが読み込まれていません/)).toBeInTheDocument()
    })
  })

  describe('ゼロ値の表示', () => {
    it('頂点数0が正しく表示される', () => {
      const zeroModelInfo: ModelInfo = {
        vertexCount: 0,
        faceCount: 0,
        boundingBox: { x: 0, y: 0, z: 0 }
      }

      render(<ModelInfoPanel modelInfo={zeroModelInfo} />)

      // 0が表示されていることを確認
      const vertexRow = screen.getByText(/頂点数/).closest('div')
      expect(vertexRow).toHaveTextContent('0')
    })
  })

  describe('アクセシビリティ', () => {
    it('パネルに適切なaria-labelが設定されている', () => {
      render(<ModelInfoPanel modelInfo={defaultModelInfo} />)

      expect(screen.getByRole('region', { name: /モデル情報/ })).toBeInTheDocument()
    })

    it('セクションの見出しが存在する', () => {
      render(<ModelInfoPanel modelInfo={defaultModelInfo} />)

      expect(screen.getByRole('heading', { name: /モデル情報/ })).toBeInTheDocument()
    })
  })

  describe('表示更新', () => {
    it('modelInfoの更新が反映される', () => {
      const { rerender } = render(<ModelInfoPanel modelInfo={defaultModelInfo} />)

      expect(screen.getByText(/1,000/)).toBeInTheDocument()

      const updatedModelInfo: ModelInfo = {
        vertexCount: 2000,
        faceCount: 1000,
        boundingBox: { x: 15, y: 25, z: 35 }
      }

      rerender(<ModelInfoPanel modelInfo={updatedModelInfo} />)

      expect(screen.getByText(/2,000/)).toBeInTheDocument()
      expect(screen.getByText(/15\.00/)).toBeInTheDocument()
    })
  })
})
