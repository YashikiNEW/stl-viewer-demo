import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import * as THREE from 'three'

// Create mock parse function
const mockParse = vi.fn()

// Mock STLLoader as a class
vi.mock('three/examples/jsm/loaders/STLLoader.js', () => ({
  STLLoader: class {
    load = vi.fn()
    parse = mockParse
  },
}))

import { useSTLLoader } from '../hooks/useSTLLoader'

describe('useSTLLoader', () => {
  let mockGeometry: THREE.BufferGeometry

  beforeEach(() => {
    vi.clearAllMocks()
    mockGeometry = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
    ])
    mockGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    mockGeometry.computeBoundingBox()
    mockGeometry.computeBoundingSphere()
  })

  describe('Initial State', () => {
    it('returns null geometry initially', () => {
      const { result } = renderHook(() => useSTLLoader())
      expect(result.current.geometry).toBeNull()
    })

    it('returns no error initially', () => {
      const { result } = renderHook(() => useSTLLoader())
      expect(result.current.error).toBeNull()
    })

    it('is not loading initially', () => {
      const { result } = renderHook(() => useSTLLoader())
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('File Loading', () => {
    it('sets loading state when loadFromFile is called', () => {
      const { result } = renderHook(() => useSTLLoader())
      const file = new File(['test'], 'test.stl', { type: 'application/octet-stream' })

      act(() => {
        result.current.loadFromFile(file)
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('parses file content and returns geometry on success', async () => {
      mockParse.mockReturnValue(mockGeometry)

      const { result } = renderHook(() => useSTLLoader())
      const arrayBuffer = new ArrayBuffer(8)

      // Mock FileReader with a class
      class MockFileReader {
        result: ArrayBuffer | null = arrayBuffer
        onload: (() => void) | null = null
        onerror: ((e: Error) => void) | null = null
        readAsArrayBuffer() {
          setTimeout(() => {
            if (this.onload) this.onload()
          }, 0)
        }
      }
      vi.stubGlobal('FileReader', MockFileReader)

      const file = new File([arrayBuffer], 'test.stl', { type: 'application/octet-stream' })

      act(() => {
        result.current.loadFromFile(file)
      })

      await waitFor(() => {
        expect(result.current.geometry).toBe(mockGeometry)
        expect(result.current.isLoading).toBe(false)
      })

      vi.unstubAllGlobals()
    })

    it('sets error state when parsing fails', async () => {
      mockParse.mockImplementation(() => {
        throw new Error('Parse error')
      })

      const { result } = renderHook(() => useSTLLoader())
      const arrayBuffer = new ArrayBuffer(8)

      // Mock FileReader with a class
      class MockFileReader {
        result: ArrayBuffer | null = arrayBuffer
        onload: (() => void) | null = null
        onerror: ((e: Error) => void) | null = null
        readAsArrayBuffer() {
          setTimeout(() => {
            if (this.onload) this.onload()
          }, 0)
        }
      }
      vi.stubGlobal('FileReader', MockFileReader)

      const file = new File([arrayBuffer], 'test.stl', { type: 'application/octet-stream' })

      act(() => {
        result.current.loadFromFile(file)
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Parse error')
        expect(result.current.isLoading).toBe(false)
      })

      vi.unstubAllGlobals()
    })
  })

  describe('Geometry Info', () => {
    it('computes model info from geometry', () => {
      mockParse.mockReturnValue(mockGeometry)

      const { result } = renderHook(() => useSTLLoader())

      // Set geometry directly for testing getModelInfo
      act(() => {
        result.current.setGeometry(mockGeometry)
      })

      const info = result.current.getModelInfo()
      expect(info).not.toBeNull()
      expect(info?.vertexCount).toBeDefined()
      expect(info?.faceCount).toBeDefined()
      expect(info?.boundingBox).toBeDefined()
    })

    it('returns null info when no geometry loaded', () => {
      const { result } = renderHook(() => useSTLLoader())
      const info = result.current.getModelInfo()
      expect(info).toBeNull()
    })
  })

  describe('Reset', () => {
    it('clears geometry and error on reset', async () => {
      const { result } = renderHook(() => useSTLLoader())

      act(() => {
        result.current.setGeometry(mockGeometry)
      })

      expect(result.current.geometry).toBe(mockGeometry)

      act(() => {
        result.current.reset()
      })

      expect(result.current.geometry).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })
})
