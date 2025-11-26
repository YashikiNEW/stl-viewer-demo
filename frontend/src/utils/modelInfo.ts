import type { ModelInfo, BoundingBoxSize } from '../types/model'

/**
 * BufferGeometryライクなオブジェクトの型定義
 */
interface GeometryLike {
  attributes: {
    position: {
      array: Float32Array
      count: number
    }
  }
  index: {
    array: Uint16Array | Uint32Array
    count: number
  } | null
}

/**
 * 頂点配列からバウンディングボックスサイズを計算する
 */
function calculateBoundingBox(positionArray: Float32Array): BoundingBoxSize {
  if (positionArray.length === 0) {
    return { x: 0, y: 0, z: 0 }
  }

  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

  for (let i = 0; i < positionArray.length; i += 3) {
    const x = positionArray[i]
    const y = positionArray[i + 1]
    const z = positionArray[i + 2]

    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
  }

  return {
    x: maxX - minX,
    y: maxY - minY,
    z: maxZ - minZ
  }
}

/**
 * 3Dジオメトリからモデル情報を計算する
 * @param geometry Three.jsのBufferGeometryまたは互換オブジェクト
 * @returns モデル情報（頂点数、面数、バウンディングボックス）
 */
export function calculateModelInfo(geometry: GeometryLike): ModelInfo {
  const position = geometry.attributes.position
  const vertexCount = position.count

  // 面数の計算
  // インデックスがある場合はインデックス数から、ない場合は頂点数から計算
  let faceCount: number
  if (geometry.index) {
    faceCount = geometry.index.count / 3
  } else {
    faceCount = vertexCount / 3
  }

  // バウンディングボックスの計算
  const boundingBox = calculateBoundingBox(position.array)

  return {
    vertexCount,
    faceCount,
    boundingBox
  }
}
