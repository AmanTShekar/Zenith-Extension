import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Zenith Website Boilerplate</h1>
      <p>This folder was recovered after a repository sterilization error.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

export default App
