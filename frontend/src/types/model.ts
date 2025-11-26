/**
 * 3Dモデルの情報を表す型定義
 */

/**
 * バウンディングボックスのサイズ
 */
export interface BoundingBoxSize {
  x: number
  y: number
  z: number
}

/**
 * 3Dモデルの情報
 */
export interface ModelInfo {
  /** 頂点数 */
  vertexCount: number
  /** 面（三角形）数 */
  faceCount: number
  /** バウンディングボックスサイズ */
  boundingBox: BoundingBoxSize
}
