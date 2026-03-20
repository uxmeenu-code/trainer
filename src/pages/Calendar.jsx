import { useState } from 'react'
import { Card, Badge, Btn } from '../components/ui'
import { SKILL_COLORS, SKILL_LABELS } from '../constants'
import { generate6MonthPlan } from '../api'
import { saveState } from '../storage'
import { downloadReport } from '../report'

const TYPE_COLORS = { Book: '#5b5bff', Video: '#e0627a', Practice: '#2eb8a0', Article: '#d4a843', Project: '#9b8be8' }

export default function Calendar({ state, onNavigate }) {
  const [activeMonth, setActiveMonth] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [localPlan, setLocalPlan] = useState(state.plan)

  const genPlan = async () => {
    setGenerating(true)
    try {
      const p = await generate6MonthPlan(state.user, state.skillGraph, state.portfolioAnalysis)
      setLocalPlan(p)
      saveState({ ...state, plan: p })
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setGenerating(false)
  }

  if (!localPlan?.months?.length) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px' }}>
        <h2 className="fu" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>6-Month Training Calendar</h2>
        <p className="fu1" style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 26 }}>Your personalized MAANG prep roadmap.</p>
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📅</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No plan generated yet</h3>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Generate a 6-month calendar calibrated to your skill gaps.</p>
          <Btn onClick={genPlan} loading={generating}>Generate My 6-Month Plan →</Btn>
        </Card>
      </div>
    )
  }

  const months = localPlan.months
  const active = months.find((m) => m.month === activeMonth) || months[0]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>6-Month Training Calendar</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Calibrated to your skill gaps</p>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <Btn onClick={genPlan} loading={generating} variant="secondary" size="sm">↻ Regenerate</Btn>
          <Btn onClick={() => downloadReport(state)} variant="secondary" size="sm">⬇ Export</Btn>
        </div>
      </div>

      <div className="fu1" style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
        {months.map((m) => {
          const col = Object.values(SKILL_COLORS)[m.month % 5] || 'var(--accent)'
          const isActive = m.month === activeMonth
          return (
            <button key={m.month} onClick={() => setActiveMonth(m.month)} style={{ flexShrink: 0, padding: '11px 14px', borderRadius: 'var(--r)', cursor: 'pointer', background: isActive ? 'var(--bg3)' : 'var(--bg2)', border: `1px solid ${isActive ? col : 'var(--border)'}`, transition: 'all 0.2s', textAlign: 'left', minWidth: 125 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>MONTH {m.month}</span>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, color: isActive ? 'var(--text)' : 'var(--text2)', marginBottom: 2 }}>{m.theme}</p>
              <p style={{ fontSize: 10, color: 'var(--text3)' }}>{SKILL_LABELS[m.focus] || m.focus}</p>
            </button>
          )
        })}
      </div>

      {active && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <Card className="fu2" style={{ borderTop: `3px solid ${Object.values(SKILL_COLORS)[active.month % 5]}` }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 4 }}>MONTH {active.month} OF 6</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 7 }}>{active.theme}</h3>
              <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
                <Badge color="accent" style={{ fontSize: 9 }}>{SKILL_LABELS[active.focus] || active.focus}</Badge>
                {active.secondaryFocus && <Badge color="muted" style={{ fontSize: 9 }}>{SKILL_LABELS[active.secondaryFocus] || active.secondaryFocus}</Badge>}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 10 }}><strong style={{ color: 'var(--text)' }}>Goal:</strong> {active.goal}</p>
              {active.milestone && (
                <div style={{ padding: '8px 12px', background: 'rgba(46,184,160,.07)', borderRadius: 'var(--r2)', border: '1px solid rgba(46,184,160,.18)' }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--teal)' }}>MILESTONE: </span>
                  <span style={{ fontSize: 11, color: 'var(--text2)' }}>{active.milestone}</span>
                </div>
              )}
            </Card>
            {active.weeklyTasks?.length > 0 && (
              <Card className="fu3">
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 11 }}>WEEKLY TASKS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {active.weeklyTasks.map((task, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, padding: '9px 11px', background: 'var(--bg3)', borderRadius: 'var(--r2)' }}>
                      <div style={{ width: 21, height: 21, borderRadius: '50%', background: 'rgba(91,91,255,.14)', border: '1px solid rgba(91,91,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--accent)', flexShrink: 0 }}>W{i + 1}</div>
                      <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, paddingTop: 1 }}>{task}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {active.courses?.length > 0 && (
              <Card className="fu2">
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 11 }}>RESOURCES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {active.courses.map((c, i) => {
                    const tc = TYPE_COLORS[c.type] || 'var(--accent)'
                    return (
                      <div key={i} style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--r2)', borderLeft: `2px solid ${tc}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{c.title}</span>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <Badge color="muted" style={{ fontSize: 9, color: tc }}>{c.type}</Badge>
                            {c.duration && <Badge color="muted" style={{ fontSize: 9 }}>{c.duration}</Badge>}
                          </div>
                        </div>
                        {c.why && <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>{c.why}</p>}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
            <Card className="fu4" style={{ background: 'rgba(91,91,255,.04)', borderColor: 'rgba(91,91,255,.16)' }}>
              <Btn onClick={() => onNavigate('task')} size="sm" style={{ width: '100%', justifyContent: 'center' }}>Get Today&apos;s Task →</Btn>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
