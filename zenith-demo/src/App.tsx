import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc'
    }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>
          Zenith <span style={{ color: '#38bdf8' }}>Demo</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8' }}>
          The first event-driven design engine. Test your extension logic below.
        </p>
      </header>

      <main style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Selection Test Card */}
        <section style={{ 
          padding: '24px', 
          borderRadius: '16px', 
          backgroundColor: '#1e293b',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Style Persistence</h2>
          <p style={{ marginBottom: '20px', color: '#94a3b8' }}>
            Modify this card's background or text color in the Zenith inspector.
          </p>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#0ea5e9', 
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 600
          }}>
            Interactive Element
          </div>
        </section>

        {/* State Test Card */}
        <section style={{ 
          padding: '24px', 
          borderRadius: '16px', 
          backgroundColor: '#1e293b',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>State Resilience</h2>
          <p style={{ marginBottom: '20px', color: '#94a3b8' }}>
            Counter ensures that Zenith's design edits don't wipe React memory.
          </p>
          <button 
            onClick={() => setCount(count + 1)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#334155', 
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Count is {count}
          </button>
        </section>
      </main>
    </div>
  )
}

export default App
