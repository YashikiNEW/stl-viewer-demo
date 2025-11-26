import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorMessage } from './ErrorMessage'
import type { STLError } from '../../types/error'

describe('ErrorMessage', () => {
  const defaultError: STLError = {
    type: 'invalid_format',
    message: '不正なファイル形式です',
    details: 'STLファイルをアップロードしてください',
  }

  it('エラーメッセージが表示される', () => {
    render(<ErrorMessage error={defaultError} onRetry={() => {}} />)

    expect(screen.getByText('不正なファイル形式です')).toBeInTheDocument()
  })

  it('エラー詳細が表示される', () => {
    render(<ErrorMessage error={defaultError} onRetry={() => {}} />)

    expect(
      screen.getByText('STLファイルをアップロードしてください')
    ).toBeInTheDocument()
  })

  it('詳細がない場合でも正しく表示される', () => {
    const errorWithoutDetails: STLError = {
      type: 'read_error',
      message: '読み込みエラー',
    }

    render(<ErrorMessage error={errorWithoutDetails} onRetry={() => {}} />)

    expect(screen.getByText('読み込みエラー')).toBeInTheDocument()
  })

  it('再アップロードボタンが表示される', () => {
    render(<ErrorMessage error={defaultError} onRetry={() => {}} />)

    expect(
      screen.getByRole('button', { name: /再アップロード|リトライ|再試行/i })
    ).toBeInTheDocument()
  })

  it('再アップロードボタンをクリックするとonRetryが呼ばれる', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage error={defaultError} onRetry={onRetry} />)

    const retryButton = screen.getByRole('button', {
      name: /再アップロード|リトライ|再試行/i,
    })
    fireEvent.click(retryButton)

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('エラーアイコンまたはアラート表示がある', () => {
    render(<ErrorMessage error={defaultError} onRetry={() => {}} />)

    // role="alert" または特定のアラートクラスを持つ要素があることを確認
    expect(
      screen.getByRole('alert') || screen.getByTestId('error-icon')
    ).toBeInTheDocument()
  })

  describe('エラータイプ別のメッセージ', () => {
    it('invalid_formatエラーが適切に表示される', () => {
      const error: STLError = {
        type: 'invalid_format',
        message: 'ファイル形式が不正です',
      }
      render(<ErrorMessage error={error} onRetry={() => {}} />)
      expect(screen.getByText('ファイル形式が不正です')).toBeInTheDocument()
    })

    it('corrupted_fileエラーが適切に表示される', () => {
      const error: STLError = {
        type: 'corrupted_file',
        message: 'ファイルが破損しています',
      }
      render(<ErrorMessage error={error} onRetry={() => {}} />)
      expect(screen.getByText('ファイルが破損しています')).toBeInTheDocument()
    })

    it('unsupported_formatエラーが適切に表示される', () => {
      const error: STLError = {
        type: 'unsupported_format',
        message: '対応していない形式です',
      }
      render(<ErrorMessage error={error} onRetry={() => {}} />)
      expect(screen.getByText('対応していない形式です')).toBeInTheDocument()
    })

    it('read_errorが適切に表示される', () => {
      const error: STLError = {
        type: 'read_error',
        message: 'ファイルの読み込みに失敗しました',
      }
      render(<ErrorMessage error={error} onRetry={() => {}} />)
      expect(
        screen.getByText('ファイルの読み込みに失敗しました')
      ).toBeInTheDocument()
    })

    it('unknownエラーが適切に表示される', () => {
      const error: STLError = {
        type: 'unknown',
        message: '不明なエラーが発生しました',
      }
      render(<ErrorMessage error={error} onRetry={() => {}} />)
      expect(
        screen.getByText('不明なエラーが発生しました')
      ).toBeInTheDocument()
    })
  })
})
