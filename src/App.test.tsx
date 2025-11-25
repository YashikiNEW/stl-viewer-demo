import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('アプリケーションがレンダリングされる', () => {
    render(<App />)
    expect(screen.getByTestId('app')).toBeInTheDocument()
  })

  it('ヘッダーが表示される', () => {
    render(<App />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('メインビューアが表示される', () => {
    render(<App />)
    expect(screen.getByTestId('main-viewer')).toBeInTheDocument()
  })

  it('サイドバーが表示される', () => {
    render(<App />)
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('基本レイアウトが正しく配置される', () => {
    render(<App />)
    const app = screen.getByTestId('app')
    expect(app).toContainElement(screen.getByTestId('header'))
    expect(app).toContainElement(screen.getByTestId('main-viewer'))
    expect(app).toContainElement(screen.getByTestId('sidebar'))
  })
})
