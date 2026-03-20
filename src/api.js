import { AI_SYSTEM } from './constants'
import { getApiKey } from './storage'
import { buildKnowledgeContext } from './knowledge'

async function callAI(messages, json = false) {
  const key = getApiKey()
  if (!key || !key.startsWith('sk-')) {
    throw new Error('No valid API key. Please add your Anthropic API key on the welcome screen.')
  }

  const fullMessages = [
    { role: 'user', content: AI_SYSTEM + '\n\nRespond to the following:' },
    { role: 'assistant', content: 'Understood. I will follow those instructions.' },
    ...messages,
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: fullMessages,
    }),
  })

  const data = await response.json()
  if (!response.ok || data.error) throw new Error(data.error?.message || `API error ${response.status}`)

  const text = (data.content || []).map((b) => b.text || '').join('').trim()
  if (!text) throw new Error('Empty response from API. Check your API key.')

  if (json) {
    const clean = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
    const s = clean.indexOf('{')
    const e = clean.lastIndexOf('}')
    if (s !== -1 && e > s) { try { return JSON.parse(clean.slice(s, e + 1)) } catch {} }
    try { return JSON.parse(clean) } catch { return null }
  }
  return text
}

export async function analyzeProfile({ resumeText, resumeFile, portfolioUrl, portfolioDesc, portfolioFile, experience, targetRole }) {
  const sources = []
  if (resumeText) sources.push('RESUME:\n' + resumeText.slice(0, 4000))
  else if (resumeFile) sources.push('Resume file: ' + resumeFile.name)
  if (portfolioUrl) sources.push('Portfolio URL: ' + portfolioUrl)
  if (portfolioDesc) sources.push('Portfolio case studies:\n' + portfolioDesc.slice(0, 2000))
  else if (portfolioFile) sources.push('Portfolio file: ' + portfolioFile.name)

  const knowledge = buildKnowledgeContext(
    ['productThinking', 'uxExecution', 'systemsThinking', 'aiUnderstanding', 'communication'], 1
  )

  const prompt = `Evaluate a product designer for ${targetRole} at MAANG. ${experience} years experience.

${sources.join('\n---\n')}

${knowledge ? knowledge + '\n\n' : ''}Score ONLY on concrete evidence. Thin evidence = 3-5.
Rubric: 1-3 no evidence, 4-5 shallow, 6-7 approaching MAANG, 8-9 strong MAANG, 10 extraordinary.
Dimensions: productThinking, uxExecution, systemsThinking, aiUnderstanding, communication.

Return ONLY valid JSON:
{
  "scores": { "productThinking": N, "uxExecution": N, "systemsThinking": N, "aiUnderstanding": N, "communication": N },
  "evidence": { "productThinking": "...", "uxExecution": "...", "systemsThinking": "...", "aiUnderstanding": "...", "communication": "..." },
  "overall_assessment": "2-3 honest sentences vs MAANG bar",
  "immediate_gaps": ["gap1", "gap2", "gap3"],
  "strengths": ["s1", "s2"],
  "recommended_start": "which skill to focus first and why"
}`

  return callAI([{ role: 'user', content: prompt }], true)
}

export async function generate6MonthPlan(user, skillGraph, analysis) {
  const sorted = Object.entries(skillGraph).sort((a, b) => a[1] - b[1])
  const weakSkills = sorted.slice(0, 2).map(([k]) => k)
  const knowledge = buildKnowledgeContext(weakSkills, 2)

  const prompt = `Create a 6-month MAANG design prep calendar.
Target: ${user.targetRole}, ${user.experience} years experience.
Skills (low to high): ${sorted.map(([k, v]) => k + ':' + v).join(', ')}
Key gaps: ${analysis?.immediate_gaps?.join(', ') || 'general improvement'}
Start with: ${analysis?.recommended_start || sorted[0][0]}

${knowledge ? knowledge + '\n\n' : ''}Return ONLY valid JSON:
{
  "months": [{
    "month": 1,
    "theme": "month theme",
    "focus": "skillKey",
    "secondaryFocus": "skillKey",
    "goal": "what success looks like",
    "courses": [{ "title": "t", "type": "Book|Video|Practice|Article|Project", "duration": "Xh", "why": "reason" }],
    "weeklyTasks": ["week 1 task", "week 2 task", "week 3 task", "week 4 task"],
    "milestone": "measurable milestone",
    "expectedScoreGain": { "productThinking": 0, "uxExecution": 0, "systemsThinking": 0, "aiUnderstanding": 0, "communication": 0 }
  }]
}`

  return callAI([{ role: 'user', content: prompt }], true)
}

export async function generateTask(user, skillGraph, plan, month) {
  const weak = Object.entries(skillGraph).sort((a, b) => a[1] - b[1])
  const focus = plan?.months?.[month - 1]?.focus || weak[0][0]
  const knowledge = buildKnowledgeContext([focus, weak[1]?.[0]].filter(Boolean), 3)

  const prompt = `Generate a 1-hour product design task.
Designer: ${user.name}, ${user.experience} years, targeting ${user.targetRole}.
Month ${month} focus: ${focus}. Weakest skills: ${weak.slice(0, 2).map(([k, v]) => k + '(' + v + ')').join(', ')}.

${knowledge ? knowledge + '\n\n' : ''}The task should directly test application of these principles and frameworks.
Return ONLY valid JSON:
{
  "task_title": "specific title",
  "task_type": "Design Sprint|Case Study|System Design|UX Audit|Concept Design",
  "difficulty": "Foundational|Intermediate|Advanced|MAANG-Level",
  "focus_skill": "skillKey",
  "problem_statement": "2-3 paragraph scenario with real context and constraints",
  "time_breakdown": [{ "phase": "name", "minutes": 15, "goal": "deliverable" }],
  "expected_output": "specific artifacts to produce",
  "evaluation_criteria": ["c1", "c2", "c3", "c4", "c5"]
}`

  return callAI([{ role: 'user', content: prompt }], true)
}

export async function evaluateResponse(task, response) {
  const focusSkill = task.focus_skill || 'uxExecution'
  const knowledge = buildKnowledgeContext([focusSkill], 3)

  const prompt = `Evaluate this product design response at MAANG bar.

TASK: ${task.task_title}
Focus skill: ${focusSkill}
Problem: ${(task.problem_statement || '').slice(0, 500)}
Expected output: ${task.expected_output || ''}

${knowledge ? knowledge + '\n\n' : ''}RESPONSE:
${response.slice(0, 3000)}

Score strictly against MAANG standards. 5-7 = solid. 8+ = truly impressive.
Return ONLY valid JSON:
{
  "scores": { "clarity": N, "structure": N, "tradeoffs": N, "depth": N, "metrics": N },
  "final_score": N,
  "level": "Below Bar|Approaching Bar|Bar|Above Bar|Exceptional",
  "weak_areas": ["area1", "area2"],
  "detailed_feedback": {
    "clarity": "...", "structure": "...", "tradeoffs": "...", "depth": "...", "metrics": "...",
    "overall": "2-3 sentence honest assessment referencing MAANG bar standards"
  }
}`

  return callAI([{ role: 'user', content: prompt }], true)
}

export async function generateImprovement(evaluation, task) {
  const focusSkill = task?.focus_skill || 'uxExecution'
  const knowledge = buildKnowledgeContext([focusSkill], 2)

  const prompt = `Create an improvement plan for this design evaluation.
Task: ${task?.task_title || 'Design Work'}
Score: ${evaluation.final_score}/10 (${evaluation.level})
Weak areas: ${(evaluation.weak_areas || []).join(', ')}
Feedback: ${JSON.stringify(evaluation.detailed_feedback)}

${knowledge ? knowledge + '\n\n' : ''}Return ONLY valid JSON:
{
  "root_causes": ["specific reason 1", "specific reason 2"],
  "action_steps": ["step referencing specific frameworks above", "step 2", "step 3", "step 4"],
  "example_snippet": "150-200 word improved answer applying the relevant frameworks",
  "next_focus": "skillKey",
  "difficulty_adjustment": "easier|same|harder",
  "reason": "why this adjustment"
}`

  return callAI([{ role: 'user', content: prompt }], true)
}

export async function chatWithCoach(messages, user, skillGraph) {
  const relevantSkills = Object.entries(skillGraph).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([k]) => k)
  const knowledge = buildKnowledgeContext(relevantSkills, 2)

  const context = AI_SYSTEM + '\n\nYou are coaching ' + user.name + ' for ' + user.targetRole
    + ' at MAANG.\nCurrent skills: ' + JSON.stringify(skillGraph)
    + '\nBe direct, specific, critical. Reference specific frameworks when relevant.\n\n'
    + (knowledge || '')

  const fullMessages = [
    { role: 'user', content: context + '\n\nNow respond to the following:' },
    { role: 'assistant', content: 'Understood. I will coach you using these frameworks.' },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  const key = getApiKey()
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1000, messages: fullMessages }),
  })

  const data = await response.json()
  return (data.content || []).map((b) => b.text || '').join('').trim() || 'Could not connect.'
}
