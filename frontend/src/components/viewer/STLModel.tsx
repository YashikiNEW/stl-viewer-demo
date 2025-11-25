import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface STLModelProps {
  geometry: THREE.BufferGeometry | null
  onCameraReset?: () => void
}

export default function STLModel({ geometry, onCameraReset }: STLModelProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useEffect(() => {
    if (geometry && meshRef.current) {
      // Compute bounding box and sphere for camera adjustment
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()

      const boundingBox = geometry.boundingBox
      const boundingSphere = geometry.boundingSphere

      if (boundingBox && boundingSphere) {
        // Center the geometry
        const center = new THREE.Vector3()
        boundingBox.getCenter(center)
        geometry.translate(-center.x, -center.y, -center.z)

        // Adjust camera to fit the model
        const distance = boundingSphere.radius * 2.5
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.position.set(distance, distance, distance)
          camera.lookAt(0, 0, 0)
          camera.updateProjectionMatrix()
        }

        if (onCameraReset) {
          onCameraReset()
        }
      }
    }
  }, [geometry, camera, onCameraReset])

  if (!geometry) {
    return null
  }

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#808080" />
    </mesh>
  )
}
