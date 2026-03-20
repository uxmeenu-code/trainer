import { SKILL_COLORS, SKILL_LABELS } from './constants'

function skillBar(value, color) {
  const width = Math.round((value / 10) * 100)
  return `<div style="height:6px;background:#1e1e1e;border-radius:3px;margin-top:4px;">
    <div style="height:100%;width:${width}%;background:${color};border-radius:3px;"></div>
  </div>`
}

export function downloadReport(state) {
  const { user, skillGraph, portfolioAnalysis, responses, plan } = state
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const avg = (Object.values(skillGraph).reduce((a, b) => a + b, 0) / 5).toFixed(1)
  const readiness = Math.round(parseFloat(avg) * 10)
  const readinessColor = readiness >= 70 ? '#2eb8a0' : readiness >= 50 ? '#d4a843' : '#e0627a'

  const skillRowsHtml = Object.entries(skillGraph)
    .map(([key, value]) => {
      const evidence = portfolioAnalysis?.evidence?.[key] || ''
      return `<div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:#888;">${SKILL_LABELS[key] || key}</span>
          <span style="font-size:13px;font-weight:700;color:${SKILL_COLORS[key] || '#fff'};">${(+value).toFixed(1)}/10</span>
        </div>
        ${skillBar(value, SKILL_COLORS[key] || '#5b5bff')}
        ${evidence ? `<p style="font-size:10px;color:#555;margin-top:4px;">${evidence}</p>` : ''}
      </div>`
    })
    .join('')

  const evalRowsHtml =
    responses && responses.length
      ? responses
          .slice(-10)
          .reverse()
          .map((r) => {
            const col = r.score >= 8 ? '#2eb8a0' : r.score >= 6 ? '#d4a843' : '#e0627a'
            return `<tr style="border-top:1px solid #1e1e1e;">
            <td style="padding:9px 0;font-size:12px;color:#aaa;">${r.taskTitle || 'Task'}</td>
            <td style="padding:9px 0;font-size:12px;color:#aaa;text-align:center;">${r.date}</td>
            <td style="padding:9px 0;font-size:13px;font-weight:700;color:${col};text-align:center;">${r.score}/10</td>
            <td style="padding:9px 0;font-size:11px;color:#666;text-align:center;">${r.level || '—'}</td>
          </tr>`
          })
          .join('')
      : '<tr><td colspan="4" style="padding:12px 0;color:#555;text-align:center;">No evaluations yet</td></tr>'

  const monthRowsHtml = (plan?.months || [])
    .map((m) => {
      const col = Object.values(SKILL_COLORS)[m.month % 5] || '#5b5bff'
      return `<div style="margin-bottom:12px;padding:14px;background:#111;border-radius:8px;border-left:3px solid ${col};">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:13px;font-weight:700;">Month ${m.month}: ${m.theme}</span>
          <span style="font-size:10px;color:#5b5bff;">${SKILL_LABELS[m.focus] || m.focus}</span>
        </div>
        <p style="font-size:12px;color:#888;margin-bottom:4px;">${m.goal}</p>
        <p style="font-size:11px;color:#555;font-style:italic;">Milestone: ${m.milestone}</p>
      </div>`
    })
    .join('')

  const metaHtml = [
    ['TARGET ROLE', user.targetRole, '#f0eef8'],
    ['EXPERIENCE', `${user.experience} years`, '#f0eef8'],
    ['READINESS', `${readiness}%`, readinessColor],
    ['AVG SCORE', `${avg}/10`, '#f0eef8'],
    ['DATE', date, '#f0eef8'],
  ]
    .map(
      ([k, v, c]) =>
        `<div>
        <div style="font-size:14px;font-weight:700;color:${c};">${v}</div>
        <div style="font-size:9px;color:#555;margin-top:2px;">${k}</div>
      </div>`
    )
    .join('')

  const gapsHtml = (portfolioAnalysis?.immediate_gaps || [])
    .map((g) => `<p style="font-size:12px;color:#e0627a;padding:3px 0;">• ${g}</p>`)
    .join('')

  const strengthsHtml = (portfolioAnalysis?.strengths || [])
    .map((s) => `<p style="font-size:12px;color:#2eb8a0;padding:3px 0;">• ${s}</p>`)
    .join('')

  const css = `
    body { font-family: Helvetica Neue, Helvetica, Arial, sans-serif; background: #0d0d0d; color: #f0eef8; margin: 0; padding: 40px; }
    .page { max-width: 750px; margin: 0 auto; }
    .sec { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; padding: 22px; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 10px; color: #555; font-weight: 400; padding-bottom: 9px; letter-spacing: 0.06em; }
    @media print { body { background: #fff; color: #000; } .sec { background: #f8f8f8; border-color: #ddd; } }
  `

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>MDC Report — ${user.name}</title>
  <style>${css}</style>
</head>
<body>
  <div class="page">
    <div class="sec" style="background:linear-gradient(135deg,rgba(91,91,255,.12),rgba(155,139,232,.06));border-color:rgba(91,91,255,.25);">
      <div style="font-size:10px;color:#5b5bff;letter-spacing:.1em;margin-bottom:10px;">MAANG DESIGNER COACH — PROFILE REPORT</div>
      <h1 style="font-size:26px;font-weight:700;margin:0 0 12px;">${user.name}</h1>
      <div style="display:flex;gap:28px;flex-wrap:wrap;">${metaHtml}</div>
    </div>

    <div class="sec">
      <div style="font-size:10px;color:#555;letter-spacing:.08em;margin-bottom:14px;">SKILL GRAPH — PORTFOLIO CALIBRATED</div>
      ${skillRowsHtml}
    </div>

    ${
      portfolioAnalysis
        ? `<div class="sec">
        <div style="font-size:10px;color:#555;margin-bottom:10px;">PORTFOLIO ASSESSMENT</div>
        <p style="font-size:13px;line-height:1.7;color:#aaa;margin-bottom:12px;">${portfolioAnalysis.overall_assessment || ''}</p>
        ${gapsHtml ? `<div style="margin-bottom:10px;"><div style="font-size:10px;color:#e0627a;margin-bottom:6px;">TOP GAPS</div>${gapsHtml}</div>` : ''}
        ${strengthsHtml ? `<div><div style="font-size:10px;color:#2eb8a0;margin-bottom:6px;">STRENGTHS</div>${strengthsHtml}</div>` : ''}
      </div>`
        : ''
    }

    ${
      responses && responses.length
        ? `<div class="sec">
        <div style="font-size:10px;color:#555;margin-bottom:12px;">EVALUATION HISTORY</div>
        <table>
          <thead>
            <tr>
              <th>TASK</th>
              <th style="text-align:center;">DATE</th>
              <th style="text-align:center;">SCORE</th>
              <th style="text-align:center;">LEVEL</th>
            </tr>
          </thead>
          <tbody>${evalRowsHtml}</tbody>
        </table>
      </div>`
        : ''
    }

    ${
      plan?.months?.length
        ? `<div class="sec">
        <div style="font-size:10px;color:#555;margin-bottom:12px;">6-MONTH TRAINING ROADMAP</div>
        ${monthRowsHtml}
      </div>`
        : ''
    }

    <div style="text-align:center;padding:16px 0;font-size:10px;color:#333;">
      Generated by MAANG Designer Coach · ${date}
    </div>
  </div>
</body>
</html>`

  const filename = `MDC-${user.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
