import './App.css'
import { Header } from './components/common/Header'
import { MainViewer } from './components/viewer/MainViewer'
import { Sidebar } from './components/sidebar/Sidebar'

function App() {
  return (
    <div className="app" data-testid="app">
      <Header />
      <div className="app__content">
        <MainViewer />
        <Sidebar />
      </div>
    </div>
  )
}

export default App
