import { useState, useCallback } from 'react'
import type { CompareModelData } from '../types/compare'

/**
 * 比較モードのフックの戻り値
 */
interface UseCompareModeReturn {
  /** 比較モードがONかどうか */
  isCompareMode: boolean
  /** 左側のモデル */
  leftModel: CompareModelData | null
  /** 右側のモデル */
  rightModel: CompareModelData | null
  /** 比較モードを有効にする */
  enableCompareMode: () => void
  /** 比較モードを無効にする（モデルもクリア） */
  disableCompareMode: () => void
  /** 比較モードをトグルする */
  toggleCompareMode: () => void
  /** 左側モデルを設定する */
  setLeftModel: (file: File, data: ArrayBuffer | string) => void
  /** 右側モデルを設定する */
  setRightModel: (file: File, data: ArrayBuffer | string) => void
  /** 左側モデルをクリアする */
  clearLeftModel: () => void
  /** 右側モデルをクリアする */
  clearRightModel: () => void
}

/**
 * 比較モードを管理するカスタムフック
 *
 * @returns 比較モードの状態と操作関数
 */
export function useCompareMode(): UseCompareModeReturn {
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [leftModel, setLeftModelState] = useState<CompareModelData | null>(null)
  const [rightModel, setRightModelState] = useState<CompareModelData | null>(null)

  const enableCompareMode = useCallback(() => {
    setIsCompareMode(true)
  }, [])

  const disableCompareMode = useCallback(() => {
    setIsCompareMode(false)
    setLeftModelState(null)
    setRightModelState(null)
  }, [])

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => {
      if (prev) {
        // 比較モードをOFFにする場合、モデルもクリア
        setLeftModelState(null)
        setRightModelState(null)
      }
      return !prev
    })
  }, [])

  const setLeftModel = useCallback((file: File, data: ArrayBuffer | string) => {
    setLeftModelState({ file, data })
  }, [])

  const setRightModel = useCallback((file: File, data: ArrayBuffer | string) => {
    setRightModelState({ file, data })
  }, [])

  const clearLeftModel = useCallback(() => {
    setLeftModelState(null)
  }, [])

  const clearRightModel = useCallback(() => {
    setRightModelState(null)
  }, [])

  return {
    isCompareMode,
    leftModel,
    rightModel,
    enableCompareMode,
    disableCompareMode,
    toggleCompareMode,
    setLeftModel,
    setRightModel,
    clearLeftModel,
    clearRightModel,
  }
}
