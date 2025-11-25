import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

/**
 * STL Viewer Demo Application
 *
 * React Three Fiberを使用した基本的な3Dビューアアプリケーション
 */
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: '#1a1a1a' }}
      >
        {/* 環境光 */}
        <ambientLight intensity={0.5} />

        {/* 平行光源 */}
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* テスト用のメッシュ（立方体） */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>

        {/* カメラコントロール */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}
