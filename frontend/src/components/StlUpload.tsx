import { useState, useRef, useCallback } from 'react'
import './StlUpload.css'

interface StlUploadProps {
  onFileLoad?: (file: File, data: ArrayBuffer | string) => void
  onError?: (error: Error) => void
  maxFiles?: number
}

export function StlUpload({ onFileLoad, onError }: StlUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateStlFile = (file: File): boolean => {
    const extension = file.name.toLowerCase().split('.').pop()
    return extension === 'stl'
  }

  const readFile = useCallback(async (file: File) => {
    if (!validateStlFile(file)) {
      if (onError) {
        onError(new Error('STLファイルのみアップロード可能です'))
      }
      return
    }

    setIsLoading(true)

    const reader = new FileReader()

    reader.onload = () => {
      if (reader.result && onFileLoad) {
        onFileLoad(file, reader.result)
      }
      setIsLoading(false)
    }

    reader.onerror = () => {
      if (onError) {
        onError(new Error('ファイルの読み込みに失敗しました'))
      }
      setIsLoading(false)
    }

    reader.readAsArrayBuffer(file)
  }, [onFileLoad, onError])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    readFile(files[0])
  }, [readFile])

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(false)

    const files = event.dataTransfer.files
    if (!files || files.length === 0) return
    readFile(files[0])
  }, [readFile])

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        data-testid="file-input"
        accept=".stl"
        onChange={handleFileSelect}
        aria-label="STLファイルを選択"
        style={{ display: 'none' }}
      />

      <button
        type="button"
        data-testid="file-button"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        ファイルを選択
      </button>

      <div
        data-testid="drop-zone"
        className={`stl-upload-dropzone ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label="ドラッグ&ドロップエリア"
      >
        {isLoading ? '読み込み中...' : 'ここにSTLファイルをドロップ'}
      </div>
    </div>
  )
}
