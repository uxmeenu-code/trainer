import { useState } from 'react'
import { Card, Badge, Btn } from '../components/ui'
import { downloadReport } from '../report'

export default function History({ state, onNavigate }) {
  const [selected, setSelected] = useState(null)
  const completed = state.tasks.filter((t) => t.completed)

  if (!state.responses.length) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <h3 style={{ marginBottom: 8 }}>No evaluations yet</h3>
        <p style={{ color: 'var(--text2)', marginBottom: 20, fontSize: 13 }}>Complete your first task to see history.</p>
        <Btn onClick={() => onNavigate('task')}>Start Today&apos;s Task →</Btn>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 20px' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 3 }}>Evaluation History</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{completed.length} tasks completed</p>
        </div>
        <Btn onClick={() => downloadReport(state)} variant="secondary" size="sm">⬇ Download Report</Btn>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {completed.slice().reverse().map((task, i) => {
          const r = state.responses.find((r) => r.taskTitle === task.task_title)
          const score = r?.score || task.evaluation?.final_score || 0
          const open = selected === i
          return (
            <Card key={i} className="fu" style={{ cursor: 'pointer', borderColor: open ? 'rgba(91,91,255,.3)' : 'var(--border)', transition: 'border-color 0.2s' }} onClick={() => setSelected(open ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: open ? 12 : 0 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{task.task_title}</h4>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge color="muted" style={{ fontSize: 9 }}>{task.task_type}</Badge>
                    <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{task.date}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Badge color={score >= 8 ? 'success' : score >= 6 ? 'warn' : 'danger'}>{score}/10</Badge>
                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
                </div>
              </div>
              {open && task.evaluation && (
                <div>
                  <div style={{ height: 1, background: 'var(--border)', marginBottom: 11 }} />
                  <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 11 }}>{task.evaluation.detailed_feedback?.overall}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                    {Object.entries(task.evaluation.scores || {}).map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: 'var(--r2)', padding: '7px 4px' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: v >= 8 ? 'var(--teal)' : v >= 6 ? 'var(--gold)' : 'var(--pink)', fontFamily: 'var(--mono)' }}>{v}</div>
                        <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{k.slice(0, 5)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
