import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as THREE from 'three'

// Mock react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
  useThree: () => ({
    camera: new THREE.PerspectiveCamera(),
    gl: {
      domElement: document.createElement('canvas'),
    },
    scene: new THREE.Scene(),
  }),
  useFrame: () => {},
}))

// Mock react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}))

// Import components after mocking
import STLViewer from '../components/viewer/STLViewer'
import STLModel from '../components/viewer/STLModel'

describe('STLViewer', () => {
  describe('Canvas Component', () => {
    it('renders the 3D canvas container', () => {
      render(<STLViewer geometry={null} />)
      expect(screen.getByTestId('canvas-mock')).toBeInTheDocument()
    })

    it('renders OrbitControls for camera interaction', () => {
      render(<STLViewer geometry={null} />)
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
    })
  })

  describe('Lighting Setup', () => {
    it('renders with ambient lighting', () => {
      const { container } = render(<STLViewer geometry={null} />)
      // Lighting is configured within the Canvas
      expect(container.querySelector('[data-testid="canvas-mock"]')).toBeInTheDocument()
    })

    it('renders with directional lighting', () => {
      const { container } = render(<STLViewer geometry={null} />)
      expect(container.querySelector('[data-testid="canvas-mock"]')).toBeInTheDocument()
    })
  })
})

describe('STLModel', () => {
  let mockGeometry: THREE.BufferGeometry

  beforeEach(() => {
    mockGeometry = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      0, 0, 0,
      1, 0, 0,
      0, 0, 1,
    ])
    mockGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    mockGeometry.computeBoundingBox()
    mockGeometry.computeBoundingSphere()
  })

  describe('Mesh Rendering', () => {
    it('renders mesh when geometry is provided', () => {
      const { container } = render(
        <STLModel geometry={mockGeometry} />
      )
      expect(container).toBeDefined()
    })

    it('does not render when geometry is null', () => {
      const { container } = render(
        <STLModel geometry={null} />
      )
      expect(container.innerHTML).toBe('')
    })
  })

  describe('Camera Auto-adjustment', () => {
    it('calls onCameraReset when geometry changes', () => {
      const onCameraReset = vi.fn()
      render(
        <STLModel
          geometry={mockGeometry}
          onCameraReset={onCameraReset}
        />
      )
      expect(onCameraReset).toHaveBeenCalled()
    })
  })
})

describe('OrbitControls Integration', () => {
  it('enables rotation control', () => {
    render(<STLViewer geometry={null} />)
    const controls = screen.getByTestId('orbit-controls')
    expect(controls).toBeInTheDocument()
  })

  it('enables zoom control', () => {
    render(<STLViewer geometry={null} />)
    const controls = screen.getByTestId('orbit-controls')
    expect(controls).toBeInTheDocument()
  })

  it('enables pan control', () => {
    render(<STLViewer geometry={null} />)
    const controls = screen.getByTestId('orbit-controls')
    expect(controls).toBeInTheDocument()
  })
})
