/**
 * Knowledge Module
 * Loads pre-built knowledge base (public/knowledge.json) at startup.
 * Never fetches during user interaction — all data is preloaded.
 *
 * Usage:
 *   import { getKnowledgeForSkill, buildKnowledgeContext } from './knowledge'
 */

let _db = null
let _loading = null

/**
 * Load and cache the knowledge base once at app startup.
 * Returns null gracefully if the file is not found.
 */
export async function loadKnowledge() {
  if (_db) return _db
  if (_loading) return _loading

  _loading = fetch('./knowledge.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      _db = data
      if (data) {
        console.log(
          `[MDC Knowledge] Loaded ${data.stats?.total || 0} items from ${data.sources?.length || 0} sources`
        )
      }
      return data
    })
    .catch(() => {
      console.warn('[MDC Knowledge] knowledge.json not found — run: node scripts/build-knowledge.mjs')
      return null
    })

  return _loading
}

/**
 * Get all knowledge items relevant to a specific skill area.
 * Returns up to `limit` items, mixed across principles/frameworks/guidelines.
 */
export function getKnowledgeForSkill(skillKey, limit = 4) {
  if (!_db) return []

  const allItems = [
    ...(_db.principles || []),
    ...(_db.frameworks || []),
    ...(_db.guidelines || []),
    ...(_db.books || []),
    ...(_db.articles || []),
  ]

  // Get items tagged for this skill
  const skillIds = _db.bySkill?.[skillKey] || []
  const bySkillId = allItems.filter((item) => skillIds.includes(item.id))

  // Also get items where skillArea matches directly
  const bySkillArea = allItems.filter(
    (item) => item.skillArea === skillKey && !skillIds.includes(item.id)
  )

  const combined = [...bySkillId, ...bySkillArea].slice(0, limit)
  return combined
}

/**
 * Get random knowledge items across all skill areas for general context.
 */
export function getGeneralKnowledge(limit = 6) {
  if (!_db) return []

  const allItems = [
    ...(_db.principles || []),
    ...(_db.frameworks || []),
  ]

  // Shuffle and pick
  const shuffled = allItems.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
}

/**
 * Build a knowledge context string to inject into AI prompts.
 * Called before task generation, evaluation, and improvement planning.
 *
 * @param {string[]} skillAreas - skill areas to focus on (e.g. ['productThinking', 'uxExecution'])
 * @param {number} itemsPerSkill - number of knowledge items per skill area
 * @returns {string} formatted context block for AI prompts
 */
export function buildKnowledgeContext(skillAreas = [], itemsPerSkill = 2) {
  if (!_db) return ''

  const selected = []
  const seen = new Set()

  // Get items for each skill area
  for (const skill of skillAreas) {
    const items = getKnowledgeForSkill(skill, itemsPerSkill)
    for (const item of items) {
      if (!seen.has(item.id)) {
        selected.push(item)
        seen.add(item.id)
      }
    }
  }

  // If no skills specified, grab general knowledge
  if (selected.length === 0) {
    const general = getGeneralKnowledge(4)
    general.forEach((item) => {
      if (!seen.has(item.id)) {
        selected.push(item)
        seen.add(item.id)
      }
    })
  }

  if (selected.length === 0) return ''

  const lines = [
    '--- RELEVANT DESIGN KNOWLEDGE ---',
    'Use the following principles and frameworks to inform your response:',
    '',
    ...selected.map(
      (item, i) =>
        `[${i + 1}] ${item.title} (${item.source})\n${item.content}`
    ),
    '--- END KNOWLEDGE CONTEXT ---',
  ]

  return lines.join('\n')
}

/**
 * Get a knowledge item by ID for display in the UI.
 */
export function getItemById(id) {
  if (!_db) return null
  const allItems = [
    ...(_db.principles || []),
    ...(_db.frameworks || []),
    ...(_db.guidelines || []),
    ...(_db.books || []),
    ...(_db.articles || []),
  ]
  return allItems.find((item) => item.id === id) || null
}

/**
 * Get knowledge stats for the Knowledge Browser UI.
 */
export function getKnowledgeStats() {
  if (!_db) return null
  return {
    stats: _db.stats,
    sources: _db.sources,
    lastUpdated: _db.lastUpdated,
  }
}

/**
 * Search knowledge items by keyword.
 */
export function searchKnowledge(query, limit = 10) {
  if (!_db || !query.trim()) return []

  const q = query.toLowerCase()
  const allItems = [
    ...(_db.principles || []),
    ...(_db.frameworks || []),
    ...(_db.guidelines || []),
    ...(_db.books || []),
    ...(_db.articles || []),
  ]

  return allItems
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.tags || []).some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, limit)
}
