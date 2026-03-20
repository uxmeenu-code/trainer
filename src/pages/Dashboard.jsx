import { Card, Badge, Btn, SkillBar } from '../components/ui'
import { SKILL_COLORS, SKILL_LABELS } from '../constants'
import { downloadReport } from '../report'

export default function Dashboard({ state, onNavigate, onUpdate }) {
  const { user, skillGraph, tasks, streak, readinessScore, portfolioAnalysis, responses } = state

  const todayDone = tasks.some(
    (t) => t.date === new Date().toDateString() && t.completed
  )
  const totalDone = tasks.filter((t) => t.completed).length
  const avg = Object.values(skillGraph).reduce((a, b) => a + b, 0) / 5
  const level =
    avg >= 8
      ? 'MAANG Ready'
      : avg >= 6
      ? 'Approaching Bar'
      : avg >= 4
      ? 'Building Foundations'
      : 'Early Stage'
  const levelColor =
    avg >= 8 ? 'var(--teal)' : avg >= 6 ? 'var(--gold)' : 'var(--pink)'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      {/* Header */}
      <div
        className="fu"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 22,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--mono)',
              color: 'var(--text3)',
              fontSize: 11,
              marginBottom: 4,
            }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Welcome back, {user.name}
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 7 }}>
            <Badge color="lav">{user.targetRole}</Badge>
            <Badge color={portfolioAnalysis ? 'success' : 'muted'}>
              {portfolioAnalysis ? 'Portfolio-calibrated' : 'Baseline'}
            </Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <Btn onClick={() => downloadReport(state)} variant="secondary" size="sm">
            ⬇ Report
          </Btn>
          <Btn onClick={() => onNavigate('profile')} variant="secondary" size="sm">
            Profile →
          </Btn>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="fu1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}
      >
        {[
          { label: 'Readiness', value: `${readinessScore}%`, color: levelColor, sub: level },
          { label: 'Day Streak', value: `${streak}🔥`, color: 'var(--gold)' },
          { label: 'Tasks Done', value: totalDone, color: 'var(--teal)' },
          {
            label: 'Today',
            value: todayDone ? '✓ Done' : 'Pending',
            color: todayDone ? 'var(--teal)' : 'var(--pink)',
          },
        ].map(({ label, value, color, sub }) => (
          <Card key={label} style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color,
                marginBottom: 2,
                fontFamily: 'var(--mono)',
              }}
            >
              {value}
            </div>
            {sub && (
              <div
                style={{ fontSize: 9, color, fontFamily: 'var(--mono)', marginBottom: 2 }}
              >
                {sub}
              </div>
            )}
            <div
              style={{
                fontSize: 10,
                color: 'var(--text3)',
                fontFamily: 'var(--mono)',
                letterSpacing: '0.05em',
              }}
            >
              {label}
            </div>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14, marginBottom: 14 }}
      >
        {/* Skill Graph */}
        <Card className="fu2">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700 }}>Skill Graph</h3>
            <Badge color={portfolioAnalysis ? 'success' : 'muted'} style={{ fontSize: 9 }}>
              {portfolioAnalysis ? 'Portfolio-calibrated' : 'Baseline'}
            </Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(skillGraph).map(([key, value]) => (
              <SkillBar
                key={key}
                label={SKILL_LABELS[key]}
                value={value}
                color={SKILL_COLORS[key]}
              />
            ))}
          </div>
          {portfolioAnalysis?.overall_assessment && (
            <p
              style={{
                fontSize: 10,
                color: 'var(--text3)',
                marginTop: 12,
                paddingTop: 10,
                borderTop: '1px solid var(--border)',
                lineHeight: 1.6,
                fontFamily: 'var(--mono)',
              }}
            >
              {portfolioAnalysis.overall_assessment}
            </p>
          )}
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Card
            className="fu3"
            style={{
              background: 'linear-gradient(135deg,rgba(91,91,255,.08),rgba(155,139,232,.04))',
              borderColor: 'rgba(91,91,255,.2)',
              flex: 1,
            }}
          >
            <Badge color="accent" style={{ marginBottom: 9 }}>
              TODAY&apos;S TASK
            </Badge>
            <h3
              style={{ fontSize: 15, fontWeight: 700, margin: '7px 0 6px', lineHeight: 1.3 }}
            >
              {todayDone ? 'Task complete! 🎉' : 'Your 60-min challenge awaits'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 12 }}>
              {todayDone
                ? 'Great work. Come back tomorrow.'
                : 'Personalized task calibrated to your exact skill gaps.'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn
                onClick={() => onNavigate('task')}
                variant={todayDone ? 'secondary' : 'primary'}
                size="sm"
              >
                {todayDone ? 'View Task' : 'Start Task →'}
              </Btn>
              <Btn onClick={() => onNavigate('submit')} variant="secondary" size="sm">
                📤 Submit Work
              </Btn>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <Card
              className="fu4"
              style={{ cursor: 'pointer', padding: 16 }}
              onClick={() => onNavigate('calendar')}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>📅</div>
              <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>6-Month Plan</h4>
              <p style={{ fontSize: 10, color: 'var(--text3)' }}>Training calendar</p>
            </Card>
            <Card
              className="fu5"
              style={{ cursor: 'pointer', padding: 16 }}
              onClick={() => onNavigate('chat')}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>💬</div>
              <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Coach Chat</h4>
              <p style={{ fontSize: 10, color: 'var(--text3)' }}>Ask questions</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent evaluations */}
      {responses.length > 0 && (
        <Card className="fu4">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700 }}>Recent Evaluations</h3>
            <button
              onClick={() => onNavigate('history')}
              style={{
                fontSize: 11,
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View all →
            </button>
          </div>
          {responses
            .slice(-3)
            .reverse()
            .map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 12px',
                  background: 'var(--bg3)',
                  borderRadius: 'var(--r2)',
                  marginBottom: 6,
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate('history')}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg4)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
              >
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.taskTitle || 'Task'}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--text3)',
                      marginLeft: 9,
                      fontFamily: 'var(--mono)',
                    }}
                  >
                    {r.date}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  {r.level && (
                    <Badge color="muted" style={{ fontSize: 9 }}>
                      {r.level}
                    </Badge>
                  )}
                  <Badge color={r.score >= 8 ? 'success' : r.score >= 6 ? 'warn' : 'danger'}>
                    {r.score}/10
                  </Badge>
                </div>
              </div>
            ))}
        </Card>
      )}
    </div>
  )
}
