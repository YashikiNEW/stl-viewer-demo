import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MainViewer } from './MainViewer'

describe('MainViewer', () => {
  it('メインビューアが表示される', () => {
    render(<MainViewer />)
    expect(screen.getByTestId('main-viewer')).toBeInTheDocument()
  })

  it('プレースホルダーが表示される（children未指定時）', () => {
    render(<MainViewer />)
    expect(screen.getByText('3Dビューアエリア（後続Issueで実装）')).toBeInTheDocument()
  })

  it('childrenが表示される', () => {
    render(<MainViewer><div>テストコンテンツ</div></MainViewer>)
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument()
  })
})
