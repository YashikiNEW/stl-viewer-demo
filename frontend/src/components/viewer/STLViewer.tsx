import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import STLModel from './STLModel'

interface STLViewerProps {
  geometry: THREE.BufferGeometry | null
}

export interface STLViewerRef {
  takeScreenshot: () => HTMLCanvasElement | null
}

const STLViewer = forwardRef<STLViewerRef, STLViewerProps>(({ geometry }, ref) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      const canvas = canvasContainerRef.current?.querySelector('canvas')
      return canvas || null
    }
  }), [])

  return (
    <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ preserveDrawingBuffer: true }}
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
    </div>
  )
})

STLViewer.displayName = 'STLViewer'

export default STLViewer
