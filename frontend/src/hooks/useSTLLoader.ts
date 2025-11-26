import { useState, useCallback } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

export interface ModelInfo {
  vertexCount: number
  faceCount: number
  boundingBox: {
    x: number
    y: number
    z: number
  }
}

export function useSTLLoader() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadFromFile = useCallback((file: File) => {
    setIsLoading(true)
    setError(null)

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const loader = new STLLoader()
        const arrayBuffer = reader.result as ArrayBuffer
        const loadedGeometry = loader.parse(arrayBuffer)

        loadedGeometry.computeBoundingBox()
        loadedGeometry.computeBoundingSphere()

        setGeometry(loadedGeometry)
        setIsLoading(false)
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load STL file'
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      setError('Failed to read file')
      setIsLoading(false)
    }

    reader.readAsArrayBuffer(file)
  }, [])

  const getModelInfo = useCallback((): ModelInfo | null => {
    if (!geometry) return null

    geometry.computeBoundingBox()
    const boundingBox = geometry.boundingBox

    if (!boundingBox) return null

    const positionAttribute = geometry.getAttribute('position')
    const vertexCount = positionAttribute ? positionAttribute.count : 0
    const faceCount = Math.floor(vertexCount / 3)

    const size = new THREE.Vector3()
    boundingBox.getSize(size)

    return {
      vertexCount,
      faceCount,
      boundingBox: {
        x: size.x,
        y: size.y,
        z: size.z,
      },
    }
  }, [geometry])

  const reset = useCallback(() => {
    if (geometry) {
      geometry.dispose()
    }
    setGeometry(null)
    setError(null)
    setIsLoading(false)
  }, [geometry])

  return {
    geometry,
    setGeometry,
    error,
    isLoading,
    loadFromFile,
    getModelInfo,
    reset,
  }
}
