import { Card, Badge, SkillBar, Btn } from '../components/ui'
import { SKILL_COLORS, SKILL_LABELS } from '../constants'
import { downloadReport } from '../report'

export default function Profile({ state }) {
  const { user, skillGraph, portfolioAnalysis, responses, readinessScore } = state
  const avg = Object.values(skillGraph).reduce((a, b) => a + b, 0) / 5
  const levelColor = avg >= 8 ? 'var(--teal)' : avg >= 6 ? 'var(--gold)' : 'var(--pink)'

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>My Profile</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Baseline assessment and evaluation history</p>
        </div>
        <Btn onClick={() => downloadReport(state)} variant="primary" size="sm">⬇ Download Report</Btn>
      </div>

      <Card className="fu1" style={{ marginBottom: 14, background: 'linear-gradient(135deg,rgba(91,91,255,.08),rgba(155,139,232,.04))', borderColor: 'rgba(91,91,255,.2)' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: 13, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 5 }}>{user.name}</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge color="lav">{user.targetRole}</Badge>
              <Badge color="muted">{user.experience} years exp</Badge>
              <Badge color={portfolioAnalysis ? 'success' : 'muted'}>
                {portfolioAnalysis ? 'Portfolio analyzed' : 'No portfolio'}
              </Badge>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: levelColor, fontFamily: 'var(--mono)' }}>{readinessScore}%</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>MAANG READINESS</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card className="fu2">
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 13 }}>Skill Baseline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(skillGraph).map(([key, value]) => (
              <SkillBar key={key} label={SKILL_LABELS[key]} value={value} color={SKILL_COLORS[key]} evidence={portfolioAnalysis?.evidence?.[key]} />
            ))}
          </div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {portfolioAnalysis ? (
            <>
              <Card className="fu3" style={{ borderLeft: '3px solid var(--accent)' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 7 }}>PORTFOLIO ASSESSMENT</div>
                <p style={{ fontSize: 12, lineHeight: 1.75 }}>{portfolioAnalysis.overall_assessment}</p>
              </Card>
              {portfolioAnalysis.immediate_gaps?.length > 0 && (
                <Card className="fu4" style={{ borderColor: 'rgba(224,98,122,.2)' }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--pink)', marginBottom: 7 }}>GAPS TO CLOSE</div>
                  {portfolioAnalysis.immediate_gaps.map((g, i) => <p key={i} style={{ fontSize: 11, color: 'var(--text2)', padding: '2px 0' }}>• {g}</p>)}
                </Card>
              )}
              {portfolioAnalysis.strengths?.length > 0 && (
                <Card className="fu5" style={{ borderColor: 'rgba(46,184,160,.2)' }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--teal)', marginBottom: 7 }}>STRENGTHS</div>
                  {portfolioAnalysis.strengths.map((s, i) => <p key={i} style={{ fontSize: 11, color: 'var(--text2)', padding: '2px 0' }}>• {s}</p>)}
                </Card>
              )}
            </>
          ) : (
            <Card style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>📂</div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>No portfolio data</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Reset and re-onboard with your resume and portfolio.</p>
            </Card>
          )}
        </div>
      </div>

      {responses.length > 0 && (
        <Card className="fu4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700 }}>All Evaluations</h3>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{responses.length} total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {responses.slice().reverse().map((r, i) => (
              <div key={i} style={{ padding: '10px 13px', background: 'var(--bg3)', borderRadius: 'var(--r2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{r.taskTitle || 'Task'}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.date}</div>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  {r.level && <Badge color="muted" style={{ fontSize: 9 }}>{r.level}</Badge>}
                  <Badge color={r.score >= 8 ? 'success' : r.score >= 6 ? 'warn' : 'danger'} style={{ fontSize: 11 }}>{r.score}/10</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
