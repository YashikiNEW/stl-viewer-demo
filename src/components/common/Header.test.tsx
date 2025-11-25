import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('ヘッダーが表示される', () => {
    render(<Header />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('デフォルトタイトルが表示される', () => {
    render(<Header />)
    expect(screen.getByText('STL 3D Viewer')).toBeInTheDocument()
  })

  it('カスタムタイトルが表示される', () => {
    render(<Header title="Custom Title" />)
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })
})
