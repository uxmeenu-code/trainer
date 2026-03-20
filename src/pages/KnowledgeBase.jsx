import { useState, useEffect } from 'react'
import { Card, Badge, Input } from '../components/ui'
import { getKnowledgeStats, searchKnowledge, getKnowledgeForSkill } from '../knowledge'
import { SKILL_COLORS, SKILL_LABELS } from '../constants'

const CATEGORY_LABELS = {
  principles: 'Principles',
  frameworks: 'Frameworks',
  guidelines: 'Guidelines',
  books: 'Books',
  articles: 'Articles',
}

const SKILL_ICONS = {
  productThinking: '💡',
  uxExecution: '✏️',
  systemsThinking: '⚙️',
  aiUnderstanding: '🤖',
  communication: '🗣️',
  general: '📌',
}

function SourceBadge({ source }) {
  const colorMap = {
    'MIT': 'danger',
    'Stanford': 'accent',
    'W3C': 'success',
    'Google': 'warn',
    'Microsoft': 'lav',
    'Apple': 'muted',
    'Nielsen': 'success',
    'OpenLibrary': 'muted',
    'Adobe': 'danger',
    'MAANG': 'accent',
    'Amazon': 'warn',
    'Meta': 'accent',
  }
  const key = Object.keys(colorMap).find((k) => source?.includes(k)) || 'muted'
  return (
    <Badge color={colorMap[key]} style={{ fontSize: 9 }}>
      {source?.slice(0, 22) || 'Unknown'}
    </Badge>
  )
}

function KnowledgeCard({ item, expanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${expanded ? 'rgba(91,91,255,.35)' : 'var(--border)'}`,
        borderRadius: 'var(--r)',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderLeft: `3px solid ${SKILL_COLORS[item.skillArea] || 'var(--border)'}`,
      }}
      onMouseEnter={(e) => {
        if (!expanded) e.currentTarget.style.borderColor = 'rgba(91,91,255,.25)'
      }}
      onMouseLeave={(e) => {
        if (!expanded) e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11 }}>{SKILL_ICONS[item.skillArea] || '📌'}</span>
            <Badge color="muted" style={{ fontSize: 9 }}>
              {SKILL_LABELS[item.skillArea] || 'General'}
            </Badge>
            <SourceBadge source={item.source} />
          </div>
          <h4 style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: 'var(--text)' }}>
            {item.title}
          </h4>
        </div>
        <span style={{ color: 'var(--text3)', fontSize: 11, flexShrink: 0, marginTop: 2 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.8,
              color: 'var(--text2)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {item.content}
          </p>
          {item.url && item.url !== 'internal' && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-block',
                marginTop: 10,
                fontSize: 11,
                color: 'var(--accent)',
                textDecoration: 'none',
                fontFamily: 'var(--mono)',
              }}
            >
              → Source
            </a>
          )}
          {item.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 9,
                    padding: '2px 7px',
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    color: 'var(--text3)',
                    fontFamily: 'var(--mono)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function KnowledgeBase() {
  const [stats, setStats] = useState(null)
  const [query, setQuery] = useState('')
  const [activeSkill, setActiveSkill] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')
  const [results, setResults] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load all items on mount
  useEffect(() => {
    const s = getKnowledgeStats()
    setStats(s)

    // Load all items for browsing
    fetch('./knowledge.json')
      .then((r) => r.json())
      .then((db) => {
        const all = [
          ...(db.principles || []),
          ...(db.frameworks || []),
          ...(db.guidelines || []),
          ...(db.books || []),
          ...(db.articles || []),
        ]
        setResults(all)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Filter whenever query / skill / category changes
  useEffect(() => {
    if (loading) return

    fetch('./knowledge.json')
      .then((r) => r.json())
      .then((db) => {
        let all = [
          ...(db.principles || []).map((i) => ({ ...i, _cat: 'principles' })),
          ...(db.frameworks || []).map((i) => ({ ...i, _cat: 'frameworks' })),
          ...(db.guidelines || []).map((i) => ({ ...i, _cat: 'guidelines' })),
          ...(db.books || []).map((i) => ({ ...i, _cat: 'books' })),
          ...(db.articles || []).map((i) => ({ ...i, _cat: 'articles' })),
        ]

        if (activeSkill !== 'all') {
          all = all.filter((i) => i.skillArea === activeSkill)
        }
        if (activeCategory !== 'all') {
          all = all.filter((i) => i._cat === activeCategory)
        }
        if (query.trim()) {
          const q = query.toLowerCase()
          all = all.filter(
            (i) =>
              i.title.toLowerCase().includes(q) ||
              i.content.toLowerCase().includes(q) ||
              (i.tags || []).some((t) => t.toLowerCase().includes(q))
          )
        }

        setResults(all)
      })
      .catch(() => {})
  }, [query, activeSkill, activeCategory, loading])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: '2px solid rgba(91,91,255,.2)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.65s linear infinite',
          }}
        />
        <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          Loading knowledge base...
        </p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
        <h3 style={{ marginBottom: 8 }}>Knowledge base not found</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
          Run the build script to generate the knowledge base:
        </p>
        <div
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '14px 18px',
            fontFamily: 'var(--mono)',
            fontSize: 13,
            color: 'var(--teal)',
            textAlign: 'left',
          }}
        >
          node scripts/build-knowledge.mjs
        </div>
        <p style={{ color: 'var(--text3)', fontSize: 11, marginTop: 10 }}>
          Then restart the dev server.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      {/* Header */}
      <div className="fu" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 5 }}>📚 Knowledge Base</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 14 }}>
          {stats.stats?.total} items from {stats.sources?.length} sources — preloaded into every AI prompt
        </p>

        {/* Source pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {(stats.sources || []).map((src) => (
            <div
              key={src.name}
              style={{
                padding: '3px 10px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                fontSize: 10,
                color: 'var(--text2)',
                fontFamily: 'var(--mono)',
              }}
            >
              {src.name}
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(stats.stats || {})
            .filter(([k]) => k !== 'total')
            .map(([k, v]) => (
              <div
                key={k}
                onClick={() => setActiveCategory(activeCategory === k ? 'all' : k)}
                style={{
                  padding: '6px 12px',
                  background: activeCategory === k ? 'var(--accent)' : 'var(--bg2)',
                  border: `1px solid ${activeCategory === k ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--r2)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'var(--mono)',
                  transition: 'all 0.18s',
                  color: activeCategory === k ? '#fff' : 'var(--text2)',
                }}
              >
                <span style={{ fontWeight: 700 }}>{v}</span>{' '}
                {CATEGORY_LABELS[k] || k}
              </div>
            ))}
        </div>
      </div>

      {/* Filters */}
      <div className="fu1" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            label="SEARCH"
            value={query}
            onChange={setQuery}
            placeholder="Search by title, content, or tag..."
          />
        </div>

        <div>
          <label
            style={{
              fontSize: 11,
              color: 'var(--text2)',
              fontFamily: 'var(--mono)',
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: 5,
            }}
          >
            SKILL AREA
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveSkill('all')}
              style={{
                padding: '7px 12px',
                borderRadius: 'var(--r2)',
                fontSize: 11,
                cursor: 'pointer',
                background: activeSkill === 'all' ? 'var(--accent)' : 'var(--bg3)',
                color: activeSkill === 'all' ? '#fff' : 'var(--text2)',
                border: `1px solid ${activeSkill === 'all' ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.18s',
              }}
            >
              All
            </button>
            {Object.entries(SKILL_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveSkill(activeSkill === key ? 'all' : key)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--r2)',
                  fontSize: 11,
                  cursor: 'pointer',
                  background:
                    activeSkill === key
                      ? SKILL_COLORS[key]
                      : 'var(--bg3)',
                  color: activeSkill === key ? '#fff' : 'var(--text2)',
                  border: `1px solid ${activeSkill === key ? SKILL_COLORS[key] : 'var(--border)'}`,
                  transition: 'all 0.18s',
                }}
              >
                {SKILL_ICONS[key]} {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          {results.length} item{results.length !== 1 ? 's' : ''}
          {query ? ` matching "${query}"` : ''}
          {activeSkill !== 'all' ? ` · ${SKILL_LABELS[activeSkill]}` : ''}
          {activeCategory !== 'all' ? ` · ${CATEGORY_LABELS[activeCategory]}` : ''}
        </span>
      </div>

      {/* Items grid */}
      {results.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No results found</p>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>
            Try a different search term or clear the filters
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((item) => (
            <KnowledgeCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div
        style={{
          marginTop: 32,
          padding: '14px 16px',
          background: 'rgba(91,91,255,.05)',
          border: '1px solid rgba(91,91,255,.15)',
          borderRadius: 'var(--r)',
          fontSize: 11,
          color: 'var(--text3)',
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
          How this knowledge is used:
        </strong>{' '}
        Every AI call — task generation, evaluation, improvement plans, and coach chat — automatically
        receives 2–4 relevant items from this knowledge base as context. This means your tasks are
        grounded in real MAANG design frameworks from MIT, Stanford, W3C, and Google, not just
        generic AI knowledge.
        <br />
        <br />
        <strong style={{ color: 'var(--text2)' }}>To refresh with live data:</strong>{' '}
        <code
          style={{
            background: 'var(--bg3)',
            padding: '2px 7px',
            borderRadius: 4,
            color: 'var(--teal)',
            fontFamily: 'var(--mono)',
          }}
        >
          node scripts/ingest.mjs
        </code>{' '}
        — fetches live content from all sources and rebuilds knowledge.json.
      </div>
    </div>
  )
}
