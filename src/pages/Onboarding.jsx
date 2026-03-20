import { useState } from 'react'
import { Card, Badge, Btn, Input, SkillBar, FileDropZone } from '../components/ui'
import { ROLES, SKILL_COLORS, SKILL_LABELS } from '../constants'
import { analyzeProfile, generate6MonthPlan } from '../api'
import { readFileAsText } from '../pdf'
import { saveApiKey, saveState } from '../storage'

function StepDots({ current }) {
  const steps = ['Profile', 'Resume', 'Portfolio', 'Analysis', 'Results']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 34 }}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: done ? 'var(--accent)' : active ? 'rgba(91,91,255,.18)' : 'var(--bg3)',
                  border: `1.5px solid ${done || active ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontFamily: 'var(--mono)',
                  fontWeight: 600,
                  color: done ? '#fff' : active ? 'var(--accent)' : 'var(--text3)',
                  transition: 'all 0.3s',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'var(--mono)',
                  color: active ? 'var(--accent)' : done ? 'var(--text2)' : 'var(--text3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: done ? 'var(--accent)' : 'var(--border)',
                  margin: '0 5px',
                  marginBottom: 20,
                  transition: 'background 0.4s',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [apiKey, setApiKey] = useState(localStorage.getItem('mdc_apikey') || '')
  const [form, setForm] = useState({ name: '', experience: '', targetRole: ROLES[0] })
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [resumeExtracting, setResumeExtracting] = useState(false)
  const [resumeExtracted, setResumeExtracted] = useState(false)
  const [portfolioFile, setPortfolioFile] = useState(null)
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [portfolioDesc, setPortfolioDesc] = useState('')
  const [portfolioExtracting, setPortfolioExtracting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState(null)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)

  const handleResumeFile = async (file) => {
    setResumeFile(file)
    setResumeExtracting(true)
    setResumeExtracted(false)
    setResumeText('')
    const text = await readFileAsText(file)
    setResumeText(text || '')
    setResumeExtracted(!!text)
    setResumeExtracting(false)
  }

  const handlePortfolioFile = async (file) => {
    setPortfolioFile(file)
    setPortfolioExtracting(true)
    const text = await readFileAsText(file)
    if (text && !portfolioDesc) setPortfolioDesc(text.slice(0, 2000))
    setPortfolioExtracting(false)
  }

  const runAnalysis = async () => {
    if (apiKey) {
      saveApiKey(apiKey)
      window.__MDC_API_KEY__ = apiKey
    }
    setAnalyzing(true)
    setError(null)
    setStep(3)

    const progressSteps = [
      'Reading your resume...',
      'Scanning portfolio...',
      'Scoring vs MAANG bar...',
      'Identifying skill gaps...',
      'Building 6-month plan...',
    ]
    let pi = 0
    setProgress(progressSteps[0])
    const interval = setInterval(() => {
      pi = Math.min(pi + 1, progressSteps.length - 1)
      setProgress(progressSteps[pi])
    }, 2800)

    try {
      const analysisResult = await analyzeProfile({
        resumeText: resumeText.trim(),
        resumeFile,
        portfolioUrl: portfolioUrl.trim(),
        portfolioDesc: portfolioDesc.trim(),
        portfolioFile,
        experience: form.experience,
        targetRole: form.targetRole,
      })

      if (!analysisResult) {
        throw new Error('Analysis returned no data. Please check your API key.')
      }

      setResult(analysisResult)

      const planResult = await generate6MonthPlan(form, analysisResult.scores, analysisResult)
      setPlan(planResult)

      clearInterval(interval)
      setStep(4)
    } catch (e) {
      clearInterval(interval)
      setError(e.message)
      setStep(2)
    } finally {
      setAnalyzing(false)
    }
  }

  const finish = () => {
    const skillGraph = result.scores
    const readiness = Math.round(
      (Object.values(skillGraph).reduce((a, b) => a + b, 0) / 5) * 10
    )
    const state = {
      user: { ...form },
      skillGraph,
      portfolioAnalysis: result,
      plan,
      tasks: [],
      responses: [],
      streak: 0,
      lastActive: null,
      readinessScore: readiness,
      createdAt: Date.now(),
    }
    saveState(state)
    onComplete(state)
  }

  // ── Step 0: Welcome ──────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div className="fu" style={{ maxWidth: 520, textAlign: 'center' }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 14,
              background: 'rgba(91,91,255,.14)',
              border: '1px solid rgba(91,91,255,.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              margin: '0 auto 22px',
            }}
          >
            🎯
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 10,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            MAANG Designer
            <br />
            Coach
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8, marginBottom: 10 }}>
            AI training system preparing product designers for MAANG roles in 6 months.
          </p>
          <p
            style={{
              color: 'var(--text3)',
              fontSize: 12,
              lineHeight: 1.7,
              marginBottom: 24,
              fontFamily: 'var(--mono)',
            }}
          >
            We analyze your actual resume and portfolio — not self-reported scores.
          </p>

          {/* API Key input */}
          <div
            style={{
              background: 'rgba(91,91,255,.06)',
              border: '1px solid rgba(91,91,255,.2)',
              borderRadius: 'var(--r)',
              padding: '14px 16px',
              marginBottom: 24,
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontFamily: 'var(--mono)',
                color: 'var(--accent)',
                marginBottom: 6,
              }}
            >
              ANTHROPIC API KEY
            </p>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              type="password"
              style={{
                width: '100%',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r2)',
                color: 'var(--text)',
                padding: '10px 13px',
                fontSize: 13,
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
            <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6, lineHeight: 1.5 }}>
              Get your key at{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent)' }}
              >
                console.anthropic.com
              </a>
              . Stored only in your browser.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            {[
              'Resume analysis',
              'Evidence-based scores',
              'Daily 60-min tasks',
              'MAANG evaluations',
              '6-month calendar',
              'PDF reports',
            ].map((f) => (
              <div
                key={f}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 11px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                }}
              >
                <span style={{ color: 'var(--teal)', fontSize: 10 }}>✓</span>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>{f}</span>
              </div>
            ))}
          </div>

          <Btn
            onClick={() => {
              if (apiKey) {
                saveApiKey(apiKey)
                window.__MDC_API_KEY__ = apiKey
              }
              setStep(1)
            }}
            size="lg"
            disabled={!apiKey.startsWith('sk-')}
          >
            Get Started →
          </Btn>
          {!apiKey.startsWith('sk-') && (
            <p
              style={{
                fontSize: 11,
                color: 'var(--text3)',
                marginTop: 10,
                fontFamily: 'var(--mono)',
              }}
            >
              Enter your API key above to continue
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── Step 1: Basic info ───────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          <StepDots current={0} />
          <h2 className="fu" style={{ fontSize: 22, fontWeight: 700, marginBottom: 5 }}>
            About you
          </h2>
          <p className="fu1" style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>
            Context to calibrate your analysis.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <Input
              label="YOUR NAME"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Alex Chen"
              required
            />
            <Input
              label="YEARS OF DESIGN EXPERIENCE"
              type="number"
              value={form.experience}
              onChange={(v) => setForm((f) => ({ ...f, experience: v }))}
              placeholder="4"
              required
            />
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: 'var(--text2)',
                  fontFamily: 'var(--mono)',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                TARGET ROLE
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setForm((f) => ({ ...f, targetRole: role }))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--r2)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: form.targetRole === role ? 'var(--accent)' : 'var(--bg3)',
                      color: form.targetRole === role ? '#fff' : 'var(--text2)',
                      border: `1px solid ${form.targetRole === role ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Btn onClick={() => setStep(2)} disabled={!form.name || !form.experience}>
            Continue →
          </Btn>
        </div>
      </div>
    )
  }

  // ── Step 2: Resume + Portfolio ───────────────────────────────────────────────
  if (step === 2) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 720 }}>
          <StepDots current={1} />

          {error && (
            <div
              style={{
                background: 'rgba(224,98,122,.1)',
                border: '1px solid rgba(224,98,122,.2)',
                borderRadius: 'var(--r2)',
                padding: '11px 14px',
                marginBottom: 18,
                color: 'var(--pink)',
                fontSize: 12,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Resume */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: 'rgba(91,91,255,.14)',
                    border: '1px solid rgba(91,91,255,.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                  }}
                >
                  📄
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Resume</h3>
                  <p style={{ fontSize: 11, color: 'var(--text3)' }}>Upload PDF or paste text</p>
                </div>
              </div>

              <FileDropZone
                label="Upload Resume"
                hint="PDF, DOCX, TXT · drag & drop"
                accept=".pdf,.doc,.docx,.txt"
                onFile={handleResumeFile}
                file={resumeFile}
                icon="📄"
                extracting={resumeExtracting}
              />

              {!resumeExtracting && resumeFile && (
                <p
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--mono)',
                    marginTop: 5,
                    color: resumeExtracted ? 'var(--teal)' : 'var(--gold)',
                  }}
                >
                  {resumeExtracted
                    ? '✓ Text extracted — review below'
                    : '⚠ Could not read PDF — paste text below'}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  margin: '10px 0',
                }}
              >
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  or paste text
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <Input
                multiline
                rows={9}
                value={resumeText}
                onChange={setResumeText}
                placeholder={
                  'Company, Role (Year-Year)\n• Key achievement with metrics\n• Projects, tools, impact\n\nPaste your full resume here'
                }
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  {resumeText.length} chars
                </span>
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: 'rgba(224,98,122,.14)',
                    border: '1px solid rgba(224,98,122,.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                  }}
                >
                  🎨
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Portfolio</h3>
                  <p style={{ fontSize: 11, color: 'var(--text3)' }}>File + URL + case studies</p>
                </div>
              </div>

              <FileDropZone
                label="Upload Portfolio PDF"
                hint="PDF, images · drag & drop"
                accept=".pdf,.png,.jpg"
                onFile={handlePortfolioFile}
                file={portfolioFile}
                icon="🎨"
                extracting={portfolioExtracting}
              />

              <Input
                style={{ marginTop: 10 }}
                value={portfolioUrl}
                onChange={setPortfolioUrl}
                placeholder="https://yourportfolio.com (optional)"
              />

              <Input
                style={{ marginTop: 10 }}
                multiline
                rows={6}
                value={portfolioDesc}
                onChange={setPortfolioDesc}
                placeholder={
                  'Describe your 2-3 best case studies:\n• Problem + business context\n• Process and decisions\n• Trade-offs you made\n• Measurable outcomes'
                }
              />
            </div>
          </div>

          <div
            style={{
              background: 'rgba(91,91,255,.05)',
              border: '1px solid rgba(91,91,255,.14)',
              borderRadius: 'var(--r)',
              padding: '11px 14px',
              margin: '14px 0',
              display: 'flex',
              gap: 9,
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
              Your resume and portfolio text are sent only to the Anthropic API. Nothing else is
              stored.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => setStep(1)} variant="secondary">
              ← Back
            </Btn>
            <Btn
              onClick={runAnalysis}
              loading={analyzing}
              disabled={
                !resumeText.trim() && !resumeFile && !portfolioDesc.trim() && !portfolioFile
              }
            >
              Analyze My Profile →
            </Btn>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8, fontFamily: 'var(--mono)' }}>
            Provide resume or portfolio to continue
          </p>
        </div>
      </div>
    )
  }

  // ── Step 3: Analyzing ────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          gap: 28,
        }}
      >
        <StepDots current={2} />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{ position: 'relative', width: 70, height: 70, margin: '0 auto 22px' }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1.5px solid rgba(91,91,255,.15)',
                animation: 'spin 3s linear infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 8,
                borderRadius: '50%',
                border: '1.5px solid rgba(91,91,255,.25)',
                animation: 'spin 2s linear infinite reverse',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 16,
                borderRadius: '50%',
                background: 'rgba(91,91,255,.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              🎯
            </div>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 7 }}>Analyzing your profile</h3>
          <p
            style={{
              fontSize: 12,
              color: 'var(--text2)',
              fontFamily: 'var(--mono)',
              animation: 'pulse 2s ease infinite',
            }}
          >
            {progress}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12 }}>
            30–45 seconds · reading every detail of your experience
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            maxWidth: 380,
            width: '100%',
          }}
        >
          {Object.entries(SKILL_LABELS).map(([key, label], i) => (
            <div
              key={key}
              className={`fu${i}`}
              style={{
                padding: '9px 13px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                gridColumn: i === 4 ? '1 / -1' : 'auto',
              }}
            >
              <span style={{ fontSize: 13 }}>
                {['💡', '✏️', '⚙️', '🤖', '🗣️'][i]}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: Object.values(SKILL_COLORS)[i],
                  animation: 'pulse 1.4s ease infinite',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 4: Results ──────────────────────────────────────────────────────────
  if (step === 4 && result) {
    const avgScore = Object.values(result.scores).reduce((a, b) => a + b, 0) / 5
    const readiness = Math.round(avgScore * 10)
    const levelColor = avgScore >= 8 ? 'var(--teal)' : avgScore >= 6 ? 'var(--gold)' : 'var(--pink)'
    const levelLabel =
      avgScore >= 8
        ? 'Close to MAANG Bar'
        : avgScore >= 6
        ? 'Approaching Bar'
        : avgScore >= 4
        ? 'Building Foundations'
        : 'Early Stage'

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '44px 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 700 }}>
          <StepDots current={4} />

          <div
            className="fu"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 18,
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <div>
              <Badge color="success" style={{ marginBottom: 10 }}>
                Analysis Complete
              </Badge>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Your Skill Baseline</h2>
              <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 3 }}>
                Scored from your actual resume and portfolio
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: levelColor,
                  lineHeight: 1,
                  fontFamily: 'var(--mono)',
                }}
              >
                {readiness}%
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text3)',
                  fontFamily: 'var(--mono)',
                  marginTop: 1,
                }}
              >
                MAANG READINESS
              </div>
              <div style={{ fontSize: 12, color: levelColor, marginTop: 3, fontWeight: 600 }}>
                {levelLabel}
              </div>
            </div>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14, marginBottom: 14 }}
          >
            <Card className="fu1">
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--mono)',
                  color: 'var(--text3)',
                  marginBottom: 14,
                }}
              >
                SKILL SCORES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(result.scores).map(([key, value]) => (
                  <SkillBar
                    key={key}
                    label={SKILL_LABELS[key]}
                    value={value}
                    color={SKILL_COLORS[key]}
                    evidence={result.evidence?.[key]}
                  />
                ))}
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.overall_assessment && (
                <Card className="fu2" style={{ borderLeft: '3px solid var(--accent)' }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--mono)',
                      color: 'var(--text3)',
                      marginBottom: 8,
                    }}
                  >
                    ASSESSMENT
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.75 }}>{result.overall_assessment}</p>
                </Card>
              )}
              {result.immediate_gaps?.length > 0 && (
                <Card className="fu3" style={{ borderColor: 'rgba(224,98,122,.2)' }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--mono)',
                      color: 'var(--pink)',
                      marginBottom: 7,
                    }}
                  >
                    TOP GAPS
                  </div>
                  {result.immediate_gaps.map((g, i) => (
                    <p key={i} style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, padding: '2px 0' }}>
                      • {g}
                    </p>
                  ))}
                </Card>
              )}
              {result.strengths?.length > 0 && (
                <Card className="fu4" style={{ borderColor: 'rgba(46,184,160,.2)' }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--mono)',
                      color: 'var(--teal)',
                      marginBottom: 7,
                    }}
                  >
                    STRENGTHS
                  </div>
                  {result.strengths.map((s, i) => (
                    <p key={i} style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, padding: '2px 0' }}>
                      • {s}
                    </p>
                  ))}
                </Card>
              )}
            </div>
          </div>

          {plan?.months?.length > 0 && (
            <Card
              className="fu4"
              style={{
                marginBottom: 14,
                background: 'rgba(91,91,255,.04)',
                borderColor: 'rgba(91,91,255,.18)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--mono)',
                  color: 'var(--accent)',
                  marginBottom: 10,
                }}
              >
                6-MONTH ROADMAP PREVIEW
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {plan.months.map((m) => (
                  <div
                    key={m.month}
                    style={{
                      flexShrink: 0,
                      width: 130,
                      padding: '10px 12px',
                      background: 'var(--bg3)',
                      borderRadius: 'var(--r2)',
                      borderTop: `3px solid ${Object.values(SKILL_COLORS)[m.month % 5]}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontFamily: 'var(--mono)',
                        color: 'var(--text3)',
                        marginBottom: 3,
                      }}
                    >
                      MONTH {m.month}
                    </div>
                    <p
                      style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.35, marginBottom: 3 }}
                    >
                      {m.theme}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text3)' }}>
                      {SKILL_LABELS[m.focus] || m.focus}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn
              onClick={() => {
                setStep(2)
                setResult(null)
                setPlan(null)
              }}
              variant="secondary"
              size="sm"
            >
              ← Re-analyze
            </Btn>
            <Btn onClick={finish} size="lg">
              Start My Training →
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  return null
}
