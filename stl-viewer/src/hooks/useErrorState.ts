import { useState, useCallback } from 'react'
import type { STLError, ErrorState } from '../types/error'

/**
 * エラー状態を管理するカスタムフック
 */
export function useErrorState(): ErrorState & {
  setError: (error: STLError) => void
  clearError: () => void
} {
  const [error, setErrorState] = useState<STLError | null>(null)

  const setError = useCallback((newError: STLError) => {
    setErrorState(newError)
  }, [])

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  return {
    hasError: error !== null,
    error,
    setError,
    clearError,
  }
}
