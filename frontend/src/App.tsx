import { useSTLLoader } from './hooks/useSTLLoader'
import { STLViewer } from './components/viewer'
import './App.css'

function App() {
  const { geometry, error, isLoading, loadFromFile, getModelInfo, reset } = useSTLLoader()
  const modelInfo = getModelInfo()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      loadFromFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      loadFromFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div className="app">
      <header className="header">
        <h1>STL 3D Viewer</h1>
        <div className="header-actions">
          <label className="upload-btn">
            Upload STL
            <input
              type="file"
              accept=".stl"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {geometry && (
            <button onClick={reset} className="reset-btn">
              Clear
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <div
          className="viewer-container"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {isLoading && <div className="loading">Loading...</div>}
          {error && <div className="error">{error}</div>}
          {!geometry && !isLoading && !error && (
            <div className="dropzone">
              <p>Drop STL file here or click Upload</p>
            </div>
          )}
          {geometry && <STLViewer geometry={geometry} />}
        </div>

        {modelInfo && (
          <aside className="sidebar">
            <section className="info-section">
              <h2>Model Info</h2>
              <dl>
                <dt>Vertices</dt>
                <dd>{modelInfo.vertexCount.toLocaleString()}</dd>
                <dt>Faces</dt>
                <dd>{modelInfo.faceCount.toLocaleString()}</dd>
                <dt>Size X</dt>
                <dd>{modelInfo.boundingBox.x.toFixed(2)}</dd>
                <dt>Size Y</dt>
                <dd>{modelInfo.boundingBox.y.toFixed(2)}</dd>
                <dt>Size Z</dt>
                <dd>{modelInfo.boundingBox.z.toFixed(2)}</dd>
              </dl>
            </section>
          </aside>
        )}
      </main>
    </div>
  )
}

export default App
