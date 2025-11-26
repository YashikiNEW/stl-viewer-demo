/**
 * Generate a filename for screenshot with timestamp
 * Format: stl-screenshot-YYYYMMDD-HHMMSS.png
 */
export function generateScreenshotFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `stl-screenshot-${year}${month}${day}-${hours}${minutes}${seconds}.png`
}

/**
 * Download screenshot from canvas element
 */
export function downloadScreenshot(canvas: HTMLCanvasElement): void {
  const dataURL = canvas.toDataURL('image/png')
  const filename = generateScreenshotFilename()

  const link = document.createElement('a')
  link.href = dataURL
  link.download = filename
  link.click()
}
