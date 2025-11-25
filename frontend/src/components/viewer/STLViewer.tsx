import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import STLModel from './STLModel'

interface STLViewerProps {
  geometry: THREE.BufferGeometry | null
}

export default function STLViewer({ geometry }: STLViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <STLModel geometry={geometry} />
      <OrbitControls
        enableRotate={true}
        enableZoom={true}
        enablePan={true}
      />
    </Canvas>
  )
}
