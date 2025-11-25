import './MainViewer.css'

interface MainViewerProps {
  children?: React.ReactNode
}

export function MainViewer({ children }: MainViewerProps) {
  return (
    <main className="main-viewer" data-testid="main-viewer">
      {children || (
        <div className="main-viewer__placeholder">
          3Dビューアエリア（後続Issueで実装）
        </div>
      )}
    </main>
  )
}
