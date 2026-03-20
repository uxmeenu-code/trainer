import { useState, useEffect, useRef } from 'react'
import { Card, Badge, Btn, Input, SkillBar } from '../components/ui'
import { generateTask, evaluateResponse, generateImprovement } from '../api'

export default function Task({ state, onUpdate, onNavigate }) {
  const [phase, setPhase] = useState('loading')
  const [task, setTask] = useState(null)
  const [response, setResponse] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [improvement, setImprovement] = useState(null)
  const [error, setError] = useState(null)
  const [timer, setTimer] = useState(3600)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const today = new Date().toDateString()
    const todayTask = state.tasks.find((t) => t.date === today)
    if (todayTask) {
      setTask(todayTask)
      if (todayTask.completed && todayTask.evaluation) {
        setEvaluation(todayTask.evaluation)
        setImprovement(todayTask.improvement)
        setPhase('done')
      } else {
        setPhase('task')
      }
    } else {
      loadTask()
    }
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  const loadTask = async () => {
    setPhase('loading')
    setError(null)
    try {
      const month = Math.min(6, Math.max(1, Math.floor((Date.now() - (state.createdAt || Date.now())) / (30 * 86400000)) + 1))
      const t = await generateTask(state.user, state.skillGraph, state.plan, month)
      if (!t) throw new Error('Failed to generate task.')
      const newTask = { ...t, date: new Date().toDateString(), completed: false, id: Date.now() }
      setTask(newTask)
      onUpdate({ ...state, tasks: [...state.tasks, newTask] })
      setPhase('task')
    } catch (e) {
      setError(e.message)
      setPhase('error')
    }
  }

  const submit = async () => {
    if (!response.trim()) return
    setPhase('evaluating')
    try {
      const ev = await evaluateResponse(task, response)
      if (!ev) throw new Error('Evaluation failed.')
      const imp = await generateImprovement(ev, task)
      setEvaluation(ev)
      setImprovement(imp)

      const sg = { ...state.skillGraph }
      const skillMap = {
        clarity: ['communication'],
        structure: ['uxExecution', 'communication'],
        tradeoffs: ['productThinking', 'systemsThinking'],
        depth: ['systemsThinking', 'aiUnderstanding'],
        metrics: ['productThinking'],
      }
      if (ev.scores) {
        Object.entries(ev.scores).forEach(([dim, score]) => {
          ;(skillMap[dim] || []).forEach((key) => {
            sg[key] = Math.round(Math.max(1, Math.min(10, sg[key] * 0.72 + score * 0.28)) * 10) / 10
          })
        })
      }
      const readiness = Math.round((Object.values(sg).reduce((a, b) => a + b, 0) / 5) * 10)
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const newStreak =
        state.lastActive === yesterday ? state.streak + 1 : state.lastActive === new Date().toDateString() ? state.streak : 1

      const updatedTasks = state.tasks.map((t) =>
        t.id === task.id ? { ...t, completed: true, evaluation: ev, improvement: imp } : t
      )
      onUpdate({
        ...state,
        skillGraph: sg,
        readinessScore: readiness,
        tasks: updatedTasks,
        responses: [
          ...state.responses,
          { taskTitle: task.task_title, date: new Date().toLocaleDateString(), score: ev.final_score, level: ev.level },
        ],
        streak: newStreak,
        lastActive: new Date().toDateString(),
      })
      setPhase('done')
      setTimerRunning(false)
    } catch (e) {
      setError(e.message)
      setPhase('task')
    }
  }

  const mins = Math.floor(timer / 60)
  const secs = timer % 60
  const timerColor = timer < 600 ? 'var(--pink)' : timer < 1800 ? 'var(--gold)' : 'var(--teal)'
  const scoreColor = (s) => (s >= 8 ? 'var(--teal)' : s >= 6 ? 'var(--gold)' : 'var(--pink)')

  if (phase === 'loading' || phase === 'evaluating') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <div style={{ width: 30, height: 30, border: '2px solid rgba(91,91,255,.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />
        <p style={{ color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 12 }}>
          {phase === 'evaluating' ? 'Evaluating your response...' : 'Generating your task...'}
        </p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div style={{ maxWidth: 460, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>Something went wrong</h3>
        <p style={{ color: 'var(--text2)', marginBottom: 20, fontSize: 13 }}>{error}</p>
        <Btn onClick={loadTask}>Try Again</Btn>
      </div>
    )
  }

  if (phase === 'done' && evaluation) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px' }}>
        <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Evaluation Results</h2>
            <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 3 }}>{task?.task_title}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: scoreColor(evaluation.final_score), lineHeight: 1, fontFamily: 'var(--mono)', animation: 'popIn 0.4s ease' }}>
              {evaluation.final_score}/10
            </div>
            <Badge color={evaluation.final_score >= 8 ? 'success' : evaluation.final_score >= 6 ? 'warn' : 'danger'} style={{ marginTop: 5 }}>
              {evaluation.level}
            </Badge>
          </div>
        </div>

        <Card className="fu1" style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 12 }}>SCORE BREAKDOWN</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(evaluation.scores || {}).map(([dim, score]) => (
              <SkillBar key={dim} label={dim.charAt(0).toUpperCase() + dim.slice(1)} value={score} color={scoreColor(score)} />
            ))}
          </div>
        </Card>

        <Card className="fu2" style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 11 }}>FEEDBACK</div>
          {evaluation.detailed_feedback?.overall && (
            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r2)', padding: '11px 13px', marginBottom: 10, borderLeft: '2px solid var(--accent)' }}>
              <p style={{ fontSize: 13, lineHeight: 1.75 }}>{evaluation.detailed_feedback.overall}</p>
            </div>
          )}
          <div style={{ display: 'grid', gap: 7 }}>
            {Object.entries(evaluation.detailed_feedback || {}).filter(([k]) => k !== 'overall').map(([dim, fb]) => (
              <div key={dim} style={{ padding: '9px 12px', background: 'var(--bg3)', borderRadius: 'var(--r2)' }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', display: 'block', marginBottom: 3 }}>{dim.toUpperCase()}</span>
                <p style={{ fontSize: 12, lineHeight: 1.6 }}>{fb}</p>
              </div>
            ))}
          </div>
        </Card>

        {improvement && (
          <Card className="fu3" style={{ marginBottom: 11, borderColor: 'rgba(46,184,160,.22)' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--teal)', marginBottom: 12 }}>IMPROVEMENT PLAN</div>
            {improvement.root_causes?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}>Root causes:</p>
                {improvement.root_causes.map((c, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, padding: '2px 0' }}>• {c}</p>)}
              </div>
            )}
            {improvement.action_steps?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}>Action steps:</p>
                <ol style={{ paddingLeft: 15 }}>
                  {improvement.action_steps.map((s, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.65, padding: '2px 0' }}>{s}</li>)}
                </ol>
              </div>
            )}
            {improvement.example_snippet && (
              <div style={{ background: 'rgba(46,184,160,.06)', border: '1px solid rgba(46,184,160,.18)', borderRadius: 'var(--r2)', padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--teal)', marginBottom: 6 }}>EXAMPLE IMPROVED ANSWER</div>
                <p style={{ fontSize: 12, lineHeight: 1.75 }}>{improvement.example_snippet}</p>
              </div>
            )}
          </Card>
        )}

        <div style={{ display: 'flex', gap: 9 }}>
          <Btn onClick={() => onNavigate('dashboard')} variant="secondary">← Dashboard</Btn>
          <Btn onClick={() => onNavigate('chat')} variant="secondary">Discuss with Coach</Btn>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
            <Badge color="muted">{task?.task_type}</Badge>
            <Badge color={task?.difficulty === 'MAANG-Level' ? 'danger' : task?.difficulty === 'Advanced' ? 'warn' : 'muted'}>{task?.difficulty}</Badge>
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{task?.task_title}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: timerColor }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <Btn onClick={() => setTimerRunning((r) => !r)} variant="secondary" size="sm">
            {timerRunning ? '⏸ Pause' : '▶ Start Timer'}
          </Btn>
        </div>
      </div>

      <Card className="fu1" style={{ marginBottom: 9 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 8 }}>PROBLEM STATEMENT</div>
        <p style={{ fontSize: 13, lineHeight: 1.8 }}>{task?.problem_statement}</p>
      </Card>

      {task?.time_breakdown?.length > 0 && (
        <Card className="fu2" style={{ marginBottom: 9 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 9 }}>60-MINUTE BREAKDOWN</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {task.time_breakdown.map((p, i) => (
              <div key={i} style={{ flex: '1 1 130px', background: 'var(--bg3)', borderRadius: 'var(--r2)', padding: '9px 11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>PHASE {i + 1}</span>
                  <Badge color="accent" style={{ fontSize: 9 }}>{p.minutes}min</Badge>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{p.phase}</p>
                <p style={{ fontSize: 10, color: 'var(--text3)' }}>{p.goal}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="fu3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 12 }}>
        <Card>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 7 }}>EXPECTED OUTPUT</div>
          <p style={{ fontSize: 12, lineHeight: 1.7 }}>{task?.expected_output}</p>
        </Card>
        <Card>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 8 }}>CRITERIA</div>
          <ul style={{ paddingLeft: 13 }}>
            {task?.evaluation_criteria?.map((c, i) => (
              <li key={i} style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, padding: '1px 0' }}>{c}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="fu4" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 9 }}>YOUR RESPONSE</div>
        <Input
          multiline
          rows={10}
          value={response}
          onChange={setResponse}
          placeholder="Walk through your thinking: user insights → problem framing → solution → trade-offs → metrics."
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{response.length} chars</span>
          <Btn onClick={submit} disabled={response.trim().length < 50}>Submit for Evaluation →</Btn>
        </div>
      </Card>

      {error && (
        <div style={{ background: 'rgba(224,98,122,.09)', border: '1px solid rgba(224,98,122,.2)', borderRadius: 'var(--r2)', padding: '10px 13px', color: 'var(--pink)', fontSize: 12 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
