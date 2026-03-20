const LINKS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'task',      label: 'Task' },
  { id: 'submit',    label: 'Submit Work' },
  { id: 'calendar',  label: 'Calendar' },
  { id: 'history',   label: 'History' },
  { id: 'profile',   label: 'Profile' },
  { id: 'knowledge', label: '📚 Knowledge' },
  { id: 'chat',      label: 'Coach' },
]

export default function Nav({ page, onNavigate, userName }) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9,9,9,.95)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 12px 0 0',
            marginRight: 8,
            borderRight: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            M
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em' }}>MDC</span>
        </div>

        {/* Links */}
        {LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            style={{
              padding: '15px 10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: page === link.id ? 'var(--text)' : 'var(--text2)',
              fontSize: 12,
              fontWeight: page === link.id ? 700 : 400,
              borderBottom: page === link.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color 0.18s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <span
        style={{
          fontSize: 10,
          color: 'var(--text3)',
          fontFamily: 'var(--mono)',
          maxWidth: 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginLeft: 12,
          flexShrink: 0,
        }}
      >
        {userName}
      </span>
    </nav>
  )
}
