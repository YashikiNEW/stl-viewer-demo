import type { STLError, STLErrorType } from '../types/error'

/**
 * エラータイプごとのデフォルトメッセージ
 */
const ERROR_MESSAGES: Record<STLErrorType, string> = {
  invalid_format: 'ファイル形式が不正です',
  corrupted_file: 'ファイルが破損しています',
  unsupported_format: '対応していないファイル形式です',
  read_error: 'ファイルの読み込みに失敗しました',
  unknown: '不明なエラーが発生しました',
}

/**
 * STLファイルのバリデーション結果
 */
export interface ValidationResult {
  valid: boolean
  error: STLError | null
}

/**
 * STLファイルを検証する
 * @param file - 検証対象のファイル
 * @returns バリデーション結果
 */
export function validateSTLFile(file: File): ValidationResult {
  if (!file.name) {
    return {
      valid: false,
      error: createSTLError('invalid_format', 'ファイル名が空です'),
    }
  }

  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension !== 'stl') {
    return {
      valid: false,
      error: createSTLError(
        'unsupported_format',
        `対応しているファイル形式はSTLのみです。選択されたファイル: .${extension || '(拡張子なし)'}`
      ),
    }
  }

  return {
    valid: true,
    error: null,
  }
}

/**
 * STLエラーを作成する
 * @param type - エラータイプ
 * @param details - 詳細メッセージ（オプション）
 * @returns STLエラーオブジェクト
 */
export function createSTLError(type: STLErrorType, details?: string): STLError {
  return {
    type,
    message: ERROR_MESSAGES[type],
    details,
  }
}
