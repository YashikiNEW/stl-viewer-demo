import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('サイドバーが表示される', () => {
    render(<Sidebar />)
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('プレースホルダーが表示される（children未指定時）', () => {
    render(<Sidebar />)
    expect(screen.getByText('サイドパネル（後続Issueで実装）')).toBeInTheDocument()
  })

  it('childrenが表示される', () => {
    render(<Sidebar><div>テストコンテンツ</div></Sidebar>)
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument()
  })
})
