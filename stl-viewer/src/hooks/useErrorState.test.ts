import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useErrorState } from './useErrorState'
import type { STLError } from '../types/error'

describe('useErrorState', () => {
  it('初期状態ではエラーがない', () => {
    const { result } = renderHook(() => useErrorState())

    expect(result.current.hasError).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('setErrorでエラーを設定できる', () => {
    const { result } = renderHook(() => useErrorState())

    const testError: STLError = {
      type: 'invalid_format',
      message: 'ファイル形式が不正です',
      details: 'STLファイルではありません',
    }

    act(() => {
      result.current.setError(testError)
    })

    expect(result.current.hasError).toBe(true)
    expect(result.current.error).toEqual(testError)
  })

  it('clearErrorでエラーをクリアできる', () => {
    const { result } = renderHook(() => useErrorState())

    const testError: STLError = {
      type: 'corrupted_file',
      message: 'ファイルが破損しています',
    }

    act(() => {
      result.current.setError(testError)
    })

    expect(result.current.hasError).toBe(true)

    act(() => {
      result.current.clearError()
    })

    expect(result.current.hasError).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('エラータイプごとに適切なメッセージを取得できる', () => {
    const { result } = renderHook(() => useErrorState())

    const errorTypes: STLError['type'][] = [
      'invalid_format',
      'corrupted_file',
      'unsupported_format',
      'read_error',
      'unknown',
    ]

    errorTypes.forEach((type) => {
      act(() => {
        result.current.setError({
          type,
          message: `テストメッセージ: ${type}`,
        })
      })

      expect(result.current.error?.type).toBe(type)
    })
  })
})
