import { describe, it, expect } from 'vitest'
import { validateSTLFile, createSTLError } from './stlValidator'

describe('stlValidator', () => {
  describe('validateSTLFile', () => {
    it('STLファイル拡張子が有効な場合はtrueを返す', () => {
      const validFiles = [
        { name: 'model.stl', type: 'application/octet-stream' },
        { name: 'Model.STL', type: 'model/stl' },
        { name: 'test_model.Stl', type: '' },
      ]

      validFiles.forEach((file) => {
        const result = validateSTLFile(file as File)
        expect(result.valid).toBe(true)
        expect(result.error).toBeNull()
      })
    })

    it('STL以外の拡張子の場合はエラーを返す', () => {
      const invalidFiles = [
        { name: 'model.obj', type: 'application/octet-stream' },
        { name: 'image.png', type: 'image/png' },
        { name: 'document.pdf', type: 'application/pdf' },
        { name: 'noextension', type: '' },
      ]

      invalidFiles.forEach((file) => {
        const result = validateSTLFile(file as File)
        expect(result.valid).toBe(false)
        expect(result.error).not.toBeNull()
        expect(result.error?.type).toBe('unsupported_format')
      })
    })

    it('空のファイル名の場合はエラーを返す', () => {
      const file = { name: '', type: '' } as File
      const result = validateSTLFile(file)

      expect(result.valid).toBe(false)
      expect(result.error?.type).toBe('invalid_format')
    })
  })

  describe('createSTLError', () => {
    it('invalid_formatエラーを作成できる', () => {
      const error = createSTLError('invalid_format')

      expect(error.type).toBe('invalid_format')
      expect(error.message).toBeTruthy()
    })

    it('corrupted_fileエラーを作成できる', () => {
      const error = createSTLError('corrupted_file')

      expect(error.type).toBe('corrupted_file')
      expect(error.message).toBeTruthy()
    })

    it('unsupported_formatエラーを作成できる', () => {
      const error = createSTLError('unsupported_format')

      expect(error.type).toBe('unsupported_format')
      expect(error.message).toBeTruthy()
    })

    it('read_errorを作成できる', () => {
      const error = createSTLError('read_error')

      expect(error.type).toBe('read_error')
      expect(error.message).toBeTruthy()
    })

    it('unknownエラーを作成できる', () => {
      const error = createSTLError('unknown')

      expect(error.type).toBe('unknown')
      expect(error.message).toBeTruthy()
    })

    it('カスタムメッセージを追加できる', () => {
      const customDetails = 'ファイルサイズが0です'
      const error = createSTLError('corrupted_file', customDetails)

      expect(error.details).toBe(customDetails)
    })
  })
})
