import { useCallback, useRef, useState } from 'react'
import './StlUpload.css'

export interface StlFileData {
  name: string
  data: ArrayBuffer
}

export interface StlUploadProps {
  onFileLoad: (fileData: StlFileData) => void
  onError?: (message: string) => void
}

/**
 * STLファイルが有効かどうかを検証する
 * ASCII形式: "solid"で始まる
 * バイナリ形式: 80バイトヘッダー + 4バイト三角形数 + 三角形データ
 */
const validateStlContent = (buffer: ArrayBuffer): { valid: boolean; error?: string } => {
  // 空ファイルチェック
  if (buffer.byteLength === 0) {
    return { valid: false, error: '空のファイルは読み込めません' }
  }

  const view = new Uint8Array(buffer)

  // ASCII STLのチェック: "solid"で始まるか
  const headerBytes = view.slice(0, Math.min(5, view.length))
  const header = String.fromCharCode(...headerBytes)

  if (header.toLowerCase() === 'solid') {
    // ASCII形式の可能性が高い
    // さらに検証: "facet"や"vertex"が含まれているか確認
    const text = new TextDecoder().decode(buffer)
    if (text.includes('facet') || text.includes('endsolid')) {
      return { valid: true }
    }
    // "solid"で始まるがSTLフォーマットではない場合
    // ただし、"solid"で始まるだけでも有効なバイナリSTLの可能性がある（ヘッダーにsolidが含まれている場合）
    // 最小バイナリSTLサイズ: 84バイト（ヘッダー80 + 三角形数4）
    if (buffer.byteLength >= 84) {
      return { valid: true }
    }
    return { valid: false, error: '無効なSTLファイル形式です' }
  }

  // バイナリSTLのチェック
  // 最小サイズ: 80(ヘッダー) + 4(三角形数) = 84バイト
  if (buffer.byteLength >= 84) {
    const dataView = new DataView(buffer)
    const triangleCount = dataView.getUint32(80, true) // リトルエンディアン
    // 各三角形は50バイト: 法線(12) + 頂点3つ(36) + 属性(2)
    const expectedSize = 84 + triangleCount * 50
    // サイズが完全一致または近い値であればバイナリSTLと判断
    // 完全一致ではなく範囲チェックを行う（パディングがある場合を考慮）
    if (buffer.byteLength >= expectedSize - 2 && buffer.byteLength <= expectedSize + 2) {
      return { valid: true }
    }
    // 三角形数が妥当な範囲内でサイズも概ね正しければOK
    if (triangleCount > 0 && triangleCount < 10000000 && buffer.byteLength > 84) {
      return { valid: true }
    }
  }

  return { valid: false, error: '無効なSTLファイル形式です' }
}

/**
 * ファイル拡張子をチェック
 */
const validateFileExtension = (filename: string): boolean => {
  return filename.toLowerCase().endsWith('.stl')
}

export function StlUpload({ onFileLoad, onError }: StlUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const processFile = useCallback(async (file: File) => {
    // 拡張子チェック
    if (!validateFileExtension(file.name)) {
      onError?.('STLファイル（.stl）のみ対応しています')
      return
    }

    setIsLoading(true)

    try {
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          // ArrayBufferまたはArrayBufferLikeをチェック
          if (result && typeof result === 'object' && 'byteLength' in result) {
            resolve(result as ArrayBuffer)
          } else {
            reject(new Error('ファイルの読み込みに失敗しました'))
          }
        }
        reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
        reader.readAsArrayBuffer(file)
      })

      // STL形式の検証
      const validation = validateStlContent(buffer)
      if (!validation.valid) {
        onError?.(validation.error || '無効なSTLファイルです')
        setIsLoading(false)
        return
      }

      onFileLoad({
        name: file.name,
        data: buffer,
      })
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [onFileLoad, onError])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    processFile(files[0])
  }, [processFile])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const files = event.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }, [processFile])

  return (
    <div className="stl-upload">
      <input
        ref={inputRef}
        type="file"
        accept=".stl"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div
        data-testid="drop-zone"
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <>
            <p>STLファイルをドラッグ&ドロップ</p>
            <p>または</p>
            <button onClick={handleButtonClick}>ファイルを選択</button>
            <p className="format-info">対応形式: STL (バイナリ/ASCII)</p>
          </>
        )}
      </div>
    </div>
  )
}
