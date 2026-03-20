/**
 * Knowledge Module
 * Loads pre-built knowledge base (public/knowledge.json) at startup.
 * Fails silently — app works fine without it, just without enhanced context.
 */

let _db = null

export async function loadKnowledge() {
  if (_db) return _db
  try {
    // Try multiple paths to handle different deployment scenarios
    const paths = ['/knowledge.json', './knowledge.json', 'knowledge.json']
    for (const path of paths) {
      try {
        const r = await fetch(path)
        if (r.ok) {
          _db = await r.json()
          console.log(`[MDC] Knowledge loaded: ${_db.stats?.total || 0} items`)
          return _db
        }
      } catch {}
    }
  } catch (e) {
    // Silent fail — app works without knowledge base
    console.warn('[MDC] Knowledge base not available — run: python3 scripts/build-knowledge.py')
  }
  return null
}

export function getKnowledgeForSkill(skillKey, limit = 4) {
  if (!_db) return []
  const all = getAllItems()
  const ids = _db.bySkill?.[skillKey] || []
  const byId = all.filter(i => ids.includes(i.id))
  const byArea = all.filter(i => i.skillArea === skillKey && !ids.includes(i.id))
  return [...byId, ...byArea].slice(0, limit)
}

export function getGeneralKnowledge(limit = 4) {
  if (!_db) return []
  return getAllItems().sort(() => Math.random() - 0.5).slice(0, limit)
}

export function buildKnowledgeContext(skillAreas = [], itemsPerSkill = 2) {
  if (!_db) return ''
  const seen = new Set()
  const selected = []
  for (const skill of skillAreas) {
    for (const item of getKnowledgeForSkill(skill, itemsPerSkill)) {
      if (!seen.has(item.id)) { selected.push(item); seen.add(item.id) }
    }
  }
  if (selected.length === 0) {
    for (const item of getGeneralKnowledge(3)) {
      if (!seen.has(item.id)) { selected.push(item); seen.add(item.id) }
    }
  }
  if (selected.length === 0) return ''
  return [
    '--- DESIGN KNOWLEDGE CONTEXT ---',
    'Reference these principles and frameworks in your response:',
    '',
    ...selected.map((item, i) => `[${i + 1}] ${item.title} (${item.source})\n${item.content}`),
    '--- END CONTEXT ---',
  ].join('\n')
}

export function getKnowledgeStats() {
  if (!_db) return null
  return { stats: _db.stats, sources: _db.sources, lastUpdated: _db.lastUpdated }
}

export function searchKnowledge(query, limit = 20) {
  if (!_db || !query.trim()) return getAllItems().slice(0, limit)
  const q = query.toLowerCase()
  return getAllItems()
    .filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.content.toLowerCase().includes(q) ||
      (i.tags || []).some(t => t.toLowerCase().includes(q))
    )
    .slice(0, limit)
}

function getAllItems() {
  if (!_db) return []
  return [
    ...(_db.principles || []),
    ...(_db.frameworks || []),
    ...(_db.guidelines || []),
    ...(_db.books || []),
    ...(_db.articles || []),
  ]
}
