import { describe, it, expect } from 'vitest'
import { calculateModelInfo } from '../utils/modelInfo'
import type { ModelInfo } from '../types/model'

// Three.jsのBufferGeometryをモック
function createMockGeometry(
  vertices: number[],
  indices?: number[]
): { attributes: { position: { array: Float32Array; count: number } }; index: { array: Uint16Array; count: number } | null } {
  const positionArray = new Float32Array(vertices)
  return {
    attributes: {
      position: {
        array: positionArray,
        count: vertices.length / 3
      }
    },
    index: indices ? {
      array: new Uint16Array(indices),
      count: indices.length
    } : null
  }
}

describe('calculateModelInfo', () => {
  describe('頂点数の計算', () => {
    it('単一の三角形（3頂点）の頂点数を正しく計算できる', () => {
      // 三角形: 原点、x=1, y=1
      const geometry = createMockGeometry([
        0, 0, 0,  // 頂点1
        1, 0, 0,  // 頂点2
        0, 1, 0   // 頂点3
      ])

      const result = calculateModelInfo(geometry)

      expect(result.vertexCount).toBe(3)
    })

    it('複数の三角形（6頂点）の頂点数を正しく計算できる', () => {
      // 2つの三角形（6頂点）
      const geometry = createMockGeometry([
        0, 0, 0, 1, 0, 0, 0, 1, 0,  // 三角形1
        0, 0, 0, 1, 0, 0, 0, 0, 1   // 三角形2
      ])

      const result = calculateModelInfo(geometry)

      expect(result.vertexCount).toBe(6)
    })

    it('頂点数0のジオメトリを処理できる', () => {
      const geometry = createMockGeometry([])

      const result = calculateModelInfo(geometry)

      expect(result.vertexCount).toBe(0)
    })
  })

  describe('面数（三角形数）の計算', () => {
    it('インデックスなしジオメトリの面数を正しく計算できる', () => {
      // 2つの三角形（6頂点 / 3 = 2面）
      const geometry = createMockGeometry([
        0, 0, 0, 1, 0, 0, 0, 1, 0,
        0, 0, 0, 1, 0, 0, 0, 0, 1
      ])

      const result = calculateModelInfo(geometry)

      expect(result.faceCount).toBe(2)
    })

    it('インデックス付きジオメトリの面数を正しく計算できる', () => {
      // 4頂点、2三角形（インデックスで共有）
      const geometry = createMockGeometry(
        [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0],  // 4頂点
        [0, 1, 2, 0, 2, 3]  // 2つの三角形のインデックス
      )

      const result = calculateModelInfo(geometry)

      expect(result.faceCount).toBe(2)
    })

    it('面数0のジオメトリを処理できる', () => {
      const geometry = createMockGeometry([])

      const result = calculateModelInfo(geometry)

      expect(result.faceCount).toBe(0)
    })
  })

  describe('バウンディングボックスサイズの計算', () => {
    it('単位立方体のサイズを正しく計算できる', () => {
      // 単位立方体の8頂点
      const geometry = createMockGeometry([
        0, 0, 0,
        1, 0, 0,
        1, 1, 0,
        0, 1, 0,
        0, 0, 1,
        1, 0, 1,
        1, 1, 1,
        0, 1, 1
      ])

      const result = calculateModelInfo(geometry)

      expect(result.boundingBox.x).toBeCloseTo(1)
      expect(result.boundingBox.y).toBeCloseTo(1)
      expect(result.boundingBox.z).toBeCloseTo(1)
    })

    it('異なるサイズのバウンディングボックスを計算できる', () => {
      // 2x3x4のボックス
      const geometry = createMockGeometry([
        0, 0, 0,
        2, 0, 0,
        2, 3, 0,
        0, 3, 0,
        0, 0, 4,
        2, 0, 4,
        2, 3, 4,
        0, 3, 4
      ])

      const result = calculateModelInfo(geometry)

      expect(result.boundingBox.x).toBeCloseTo(2)
      expect(result.boundingBox.y).toBeCloseTo(3)
      expect(result.boundingBox.z).toBeCloseTo(4)
    })

    it('負の座標を含むジオメトリのサイズを計算できる', () => {
      // -1から1までの立方体
      const geometry = createMockGeometry([
        -1, -1, -1,
        1, -1, -1,
        1, 1, -1,
        -1, 1, -1,
        -1, -1, 1,
        1, -1, 1,
        1, 1, 1,
        -1, 1, 1
      ])

      const result = calculateModelInfo(geometry)

      expect(result.boundingBox.x).toBeCloseTo(2)
      expect(result.boundingBox.y).toBeCloseTo(2)
      expect(result.boundingBox.z).toBeCloseTo(2)
    })

    it('空のジオメトリのサイズは0を返す', () => {
      const geometry = createMockGeometry([])

      const result = calculateModelInfo(geometry)

      expect(result.boundingBox.x).toBe(0)
      expect(result.boundingBox.y).toBe(0)
      expect(result.boundingBox.z).toBe(0)
    })

    it('小数点以下の精度を維持する', () => {
      const geometry = createMockGeometry([
        0, 0, 0,
        1.5, 0, 0,
        1.5, 2.5, 0,
        0, 2.5, 3.5
      ])

      const result = calculateModelInfo(geometry)

      expect(result.boundingBox.x).toBeCloseTo(1.5)
      expect(result.boundingBox.y).toBeCloseTo(2.5)
      expect(result.boundingBox.z).toBeCloseTo(3.5)
    })
  })

  describe('統合テスト', () => {
    it('実際のSTLモデルに近いデータで正しくModelInfoを返す', () => {
      // 12三角形からなる立方体（36頂点）
      const cubeVertices: number[] = []
      const faces = [
        // 前面
        [[0,0,1], [1,0,1], [1,1,1]], [[0,0,1], [1,1,1], [0,1,1]],
        // 背面
        [[0,0,0], [0,1,0], [1,1,0]], [[0,0,0], [1,1,0], [1,0,0]],
        // 上面
        [[0,1,0], [0,1,1], [1,1,1]], [[0,1,0], [1,1,1], [1,1,0]],
        // 下面
        [[0,0,0], [1,0,0], [1,0,1]], [[0,0,0], [1,0,1], [0,0,1]],
        // 右面
        [[1,0,0], [1,1,0], [1,1,1]], [[1,0,0], [1,1,1], [1,0,1]],
        // 左面
        [[0,0,0], [0,0,1], [0,1,1]], [[0,0,0], [0,1,1], [0,1,0]]
      ]

      for (const face of faces) {
        for (const vertex of face) {
          cubeVertices.push(...vertex)
        }
      }

      const geometry = createMockGeometry(cubeVertices)

      const result: ModelInfo = calculateModelInfo(geometry)

      expect(result.vertexCount).toBe(36)
      expect(result.faceCount).toBe(12)
      expect(result.boundingBox.x).toBeCloseTo(1)
      expect(result.boundingBox.y).toBeCloseTo(1)
      expect(result.boundingBox.z).toBeCloseTo(1)
    })
  })
})
