import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Task from './pages/Task'
import Submit from './pages/Submit'
import Calendar from './pages/Calendar'
import History from './pages/History'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import KnowledgeBase from './pages/KnowledgeBase'
import { loadState, saveState, clearState } from './storage'
import { loadKnowledge } from './knowledge'

export default function App() {
  const [appState, setAppState] = useState(() => {
    // Wrap in try-catch — localStorage may be unavailable (private browsing, etc.)
    try { return loadState() } catch { return null }
  })
  const [page, setPage] = useState('dashboard')
  const [knowledgeReady, setKnowledgeReady] = useState(false)

  useEffect(() => {
    // Load knowledge in background — never blocks render
    loadKnowledge()
      .then(() => setKnowledgeReady(true))
      .catch(() => setKnowledgeReady(false))
  }, [])

  const handleUpdate = (newState) => {
    setAppState(newState)
    try { saveState(newState) } catch {}
  }

  const handleOnboard = (state) => {
    setAppState(state)
    setPage('dashboard')
  }

  const handleReset = () => {
    try { clearState() } catch {}
    setAppState(null)
    setPage('dashboard')
  }

  if (!appState) {
    return <Onboarding onComplete={handleOnboard} />
  }

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 15%, rgba(91,91,255,.025) 0%, transparent 55%), ' +
                    'radial-gradient(ellipse at 80% 85%, rgba(224,98,122,.02) 0%, transparent 55%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav page={page} onNavigate={setPage} userName={appState.user.name} />

        <main>
          {page === 'dashboard' && <Dashboard  state={appState} onNavigate={setPage} onUpdate={handleUpdate} />}
          {page === 'task'      && <Task        state={appState} onUpdate={handleUpdate} onNavigate={setPage} />}
          {page === 'submit'    && <Submit      state={appState} onUpdate={handleUpdate} onNavigate={setPage} />}
          {page === 'calendar'  && <Calendar    state={appState} onNavigate={setPage} />}
          {page === 'history'   && <History     state={appState} onNavigate={setPage} />}
          {page === 'profile'   && <Profile     state={appState} />}
          {page === 'chat'      && <Chat        state={appState} />}
          {page === 'knowledge' && <KnowledgeBase />}
        </main>

        {knowledgeReady && (
          <button
            onClick={() => setPage('knowledge')}
            style={{
              position: 'fixed', bottom: 12, left: 12,
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', background: 'var(--bg2)',
              border: '1px solid var(--border)', borderRadius: 20,
              fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--teal)',
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />
            Knowledge loaded
          </button>
        )}

        <button
          onClick={handleReset}
          style={{
            position: 'fixed', bottom: 12, right: 12,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            color: 'var(--text3)', padding: '5px 11px',
            borderRadius: 'var(--r2)', fontSize: 10,
            fontFamily: 'var(--mono)', cursor: 'pointer',
          }}
        >
          ↺ Reset
        </button>
      </div>
    </>
  )
}
