import { useState, useEffect, useRef } from 'react'
import { Btn } from '../components/ui'
import { chatWithCoach } from '../api'

const QUICK_PROMPTS = [
  'How to structure a MAANG design case?',
  'What metrics matter most?',
  'How do I show systems thinking?',
  'Give me a mock interview question',
]

export default function Chat({ state }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${state.user.name}! I'm your MAANG Design Coach.\n\nAsk me anything:\n• How to structure a design case\n• Skill-specific improvement\n• Mock interview questions\n• Feedback on your thinking`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const reply = await chatWithCoach(newMessages, state.user, state.skillGraph)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "Couldn't connect. Check your API key." },
      ])
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)',
      }}
    >
      <h2 className="fu" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
        Coach Chat
      </h2>
      <p className="fu1" style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 16 }}>
        Your MAANG-level design mentor
      </p>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 11,
          paddingBottom: 12,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeUp 0.28s ease',
            }}
          >
            {m.role === 'assistant' && (
              <div
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  marginRight: 8,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                🎯
              </div>
            )}
            <div
              style={{
                maxWidth: '76%',
                padding: '11px 14px',
                borderRadius:
                  m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg2)',
                border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                fontSize: 13,
                lineHeight: 1.72,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 25,
                height: 25,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
              }}
            >
              🎯
            </div>
            <div
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '14px 14px 14px 3px',
                padding: '11px 14px',
                display: 'flex',
                gap: 5,
              }}
            >
              {[0, 1, 2].map((j) => (
                <span
                  key={j}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--text3)',
                    display: 'inline-block',
                    animation: `pulse 1.2s ${j * 0.18}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div
        style={{
          display: 'flex',
          gap: 7,
          marginBottom: 7,
          overflowX: 'auto',
          paddingBottom: 3,
        }}
      >
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            onClick={() => setInput(q)}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '5px 11px',
              color: 'var(--text2)',
              fontSize: 11,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.18s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text2)'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 9 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your coach anything..."
          style={{
            flex: 1,
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r2)',
            color: 'var(--text)',
            padding: '10px 13px',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'var(--font)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        <Btn onClick={send} loading={loading} disabled={!input.trim()}>
          Send
        </Btn>
      </div>
      <span
        style={{
          fontSize: 10,
          color: 'var(--text3)',
          fontFamily: 'var(--mono)',
          marginTop: 5,
        }}
      >
        Enter to send · Shift+Enter for new line
      </span>
    </div>
  )
}
