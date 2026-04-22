import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center', 
      fontFamily: 'system-ui', 
      background: '#111', 
      color: '#fff', 
      minHeight: '100vh' 
    }}>
      <h1>Space Scroll Demo</h1>
      <p>System restored. Component logic is ready for implementation.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

export default App
