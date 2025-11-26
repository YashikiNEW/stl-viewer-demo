/**
 * 比較モードで使用するモデルデータ型
 */
export interface CompareModelData {
  /** アップロードされたファイル */
  file: File
  /** ファイルデータ（ArrayBuffer） */
  data: ArrayBuffer | string
}

/**
 * 比較モードの状態
 */
export interface CompareModeState {
  /** 比較モードがONかどうか */
  isCompareMode: boolean
  /** 左側のモデル */
  leftModel: CompareModelData | null
  /** 右側のモデル */
  rightModel: CompareModelData | null
}
