import { useState } from 'react'
import { Card, Badge, Btn, Input, SkillBar, FileDropZone } from '../components/ui'
import { evaluateResponse, generateImprovement } from '../api'
import { readFileAsText } from '../pdf'

export default function Submit({ state, onUpdate, onNavigate }) {
  const [workFile, setWorkFile] = useState(null)
  const [workText, setWorkText] = useState('')
  const [workExtracting, setWorkExtracting] = useState(false)
  const [context, setContext] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [improvement, setImprovement] = useState(null)
  const [error, setError] = useState(null)

  const handleWorkFile = async (file) => {
    setWorkFile(file)
    setWorkExtracting(true)
    const text = await readFileAsText(file)
    if (text) setWorkText(text.slice(0, 5000))
    setWorkExtracting(false)
  }

  const submit = async () => {
    const content = workText || (workFile ? `[File: ${workFile.name}]` : '')
    if (!content) return
    setEvaluating(true)
    setError(null)
    try {
      const fakeTask = {
        task_title: context || 'Submitted Work',
        problem_statement: context || 'Evaluate this design work at MAANG bar.',
        expected_output: 'Portfolio-quality design thinking',
      }
      const ev = await evaluateResponse(fakeTask, workText || content)
      if (!ev) throw new Error('Evaluation failed.')
      const imp = await generateImprovement(ev, fakeTask)
      setEvaluation(ev)
      setImprovement(imp)
      onUpdate({
        ...state,
        responses: [
          ...state.responses,
          { taskTitle: context || 'Uploaded Work', date: new Date().toLocaleDateString(), score: ev.final_score, level: ev.level },
        ],
      })
    } catch (e) {
      setError(e.message)
    }
    setEvaluating(false)
  }

  const scoreColor = (s) => (s >= 8 ? 'var(--teal)' : s >= 6 ? 'var(--gold)' : 'var(--pink)')

  if (evaluation) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px' }}>
        <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Work Evaluated</h3>
            <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 3 }}>{context || 'Uploaded Work'}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: scoreColor(evaluation.final_score), lineHeight: 1, fontFamily: 'var(--mono)' }}>
              {evaluation.final_score}/10
            </div>
            <Badge color={evaluation.final_score >= 8 ? 'success' : evaluation.final_score >= 6 ? 'warn' : 'danger'} style={{ marginTop: 5 }}>
              {evaluation.level}
            </Badge>
          </div>
        </div>

        <Card className="fu1" style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 11 }}>SCORES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(evaluation.scores || {}).map(([d, s]) => (
              <SkillBar key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} value={s} color={scoreColor(s)} />
            ))}
          </div>
        </Card>

        <Card className="fu2" style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 10 }}>FEEDBACK</div>
          {evaluation.detailed_feedback?.overall && (
            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r2)', padding: '11px 13px', borderLeft: '2px solid var(--accent)' }}>
              <p style={{ fontSize: 13, lineHeight: 1.75 }}>{evaluation.detailed_feedback.overall}</p>
            </div>
          )}
        </Card>

        {improvement?.action_steps?.length > 0 && (
          <Card className="fu3" style={{ marginBottom: 11, borderColor: 'rgba(46,184,160,.2)' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--teal)', marginBottom: 9 }}>HOW TO IMPROVE</div>
            {improvement.action_steps.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, padding: '2px 0' }}>• {s}</p>)}
            {improvement.example_snippet && (
              <div style={{ background: 'rgba(46,184,160,.06)', border: '1px solid rgba(46,184,160,.16)', borderRadius: 'var(--r2)', padding: '11px 13px', marginTop: 10 }}>
                <p style={{ fontSize: 12, lineHeight: 1.75 }}>{improvement.example_snippet}</p>
              </div>
            )}
          </Card>
        )}

        <div style={{ display: 'flex', gap: 9 }}>
          <Btn onClick={() => { setEvaluation(null); setWorkFile(null); setWorkText(''); setContext('') }} variant="secondary">Submit Another</Btn>
          <Btn onClick={() => onNavigate('profile')}>View Profile →</Btn>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px' }}>
      <h2 className="fu" style={{ fontSize: 22, fontWeight: 700, marginBottom: 5 }}>Submit Your Work</h2>
      <p className="fu1" style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 22 }}>Upload or paste design work for MAANG-bar evaluation.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card className="fu2">
          <Input label="TASK / BRIEF CONTEXT (optional)" value={context} onChange={setContext} hint="What was the challenge?" placeholder="e.g. Redesign checkout flow for fintech app targeting millennials..." />
        </Card>
        <Card className="fu3">
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 11 }}>UPLOAD YOUR WORK</div>
          <FileDropZone label="Upload file" hint="PDF, image, DOCX, any file · drag & drop" accept="*" onFile={handleWorkFile} file={workFile} icon="📤" extracting={workExtracting} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '11px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>or paste text</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <Input multiline rows={8} value={workText} onChange={setWorkText} placeholder="Paste your design writeup, case study, or any work to evaluate..." />
        </Card>
        {error && (
          <div style={{ background: 'rgba(224,98,122,.09)', border: '1px solid rgba(224,98,122,.2)', borderRadius: 'var(--r2)', padding: '10px 13px', color: 'var(--pink)', fontSize: 12 }}>⚠️ {error}</div>
        )}
        <div style={{ display: 'flex', gap: 9 }}>
          <Btn onClick={() => onNavigate('dashboard')} variant="secondary">← Back</Btn>
          <Btn onClick={submit} loading={evaluating} disabled={!workText.trim() && !workFile}>Evaluate My Work →</Btn>
        </div>
      </div>
    </div>
  )
}
