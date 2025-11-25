/**
 * STLファイル読み込みエラーの種類
 */
export type STLErrorType =
  | 'invalid_format'
  | 'corrupted_file'
  | 'unsupported_format'
  | 'read_error'
  | 'unknown'

/**
 * STLエラー情報
 */
export interface STLError {
  type: STLErrorType
  message: string
  details?: string
}

/**
 * エラー状態
 */
export interface ErrorState {
  hasError: boolean
  error: STLError | null
}
