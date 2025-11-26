import { useCallback, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { downloadScreenshot } from '../utils/screenshot'

interface UseScreenshotReturn {
  takeScreenshot: () => void
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
}

/**
 * Custom hook for taking screenshots of a canvas element
 */
export function useScreenshot(): UseScreenshotReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const takeScreenshot = useCallback(() => {
    if (canvasRef.current) {
      downloadScreenshot(canvasRef.current)
    }
  }, [])

  return {
    takeScreenshot,
    canvasRef,
  }
}
