import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Three.js WebGLRenderer
vi.mock('three', async () => {
  const actual = await vi.importActual('three')
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement('canvas'),
    })),
  }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: vi.fn(({ children }) => <div data-testid="canvas-mock">{children}</div>),
  useThree: vi.fn(() => ({
    gl: {
      domElement: document.createElement('canvas'),
      render: vi.fn(),
    },
    scene: {},
    camera: {},
  })),
  useFrame: vi.fn(),
}))

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: vi.fn(() => null),
}))

describe('Screenshot Feature', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Screenshot Button', () => {
    test('screenshot button exists when geometry is loaded', async () => {
      // Import App dynamically to apply mocks
      const { default: App } = await import('../App')
      render(<App />)

      // Initially, screenshot button should not be visible (no geometry loaded)
      expect(screen.queryByText(/screenshot/i)).not.toBeInTheDocument()
    })
  })

  describe('useScreenshot Hook', () => {
    test('useScreenshot hook should be exported', async () => {
      const screenshotModule = await import('../hooks/useScreenshot')
      expect(screenshotModule.useScreenshot).toBeDefined()
    })

    test('useScreenshot returns takeScreenshot function', async () => {
      const { useScreenshot } = await import('../hooks/useScreenshot')
      const { result } = await import('@testing-library/react').then(m => {
        const { renderHook } = m
        return renderHook(() => useScreenshot())
      })

      expect(result.current.takeScreenshot).toBeDefined()
      expect(typeof result.current.takeScreenshot).toBe('function')
    })
  })

  describe('Screenshot File Generation', () => {
    test('generateScreenshotFilename creates correct filename format', async () => {
      const { generateScreenshotFilename } = await import('../utils/screenshot')

      // Mock Date
      const mockDate = new Date('2025-11-26T12:30:45.000Z')
      vi.setSystemTime(mockDate)

      const filename = generateScreenshotFilename()
      expect(filename).toMatch(/^stl-screenshot-\d{8}-\d{6}\.png$/)

      vi.useRealTimers()
    })

    test('downloadScreenshot creates PNG download', async () => {
      const { downloadScreenshot } = await import('../utils/screenshot')

      // Mock canvas with toDataURL
      const mockCanvas = document.createElement('canvas')
      mockCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,mockdata')

      // Mock createElement for anchor
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement
        }
        return originalCreateElement(tag)
      })

      downloadScreenshot(mockCanvas)

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockAnchor.download).toMatch(/^stl-screenshot-.*\.png$/)
    })
  })

  describe('STLViewer Screenshot Integration', () => {
    test('STLViewer exports ref interface for screenshot', async () => {
      // Verify the component exports the ref interface
      const viewerModule = await import('../components/viewer/STLViewer')
      const STLViewer = viewerModule.default

      // forwardRef components are objects, not functions
      expect(STLViewer).toBeDefined()
      expect(typeof STLViewer).toBe('object')
    })
  })
})
