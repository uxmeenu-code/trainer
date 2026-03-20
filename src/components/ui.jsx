import { useState, useRef } from 'react'

export function Card({ children, style, className = '', onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Badge({ children, color = 'accent', style }) {
  const colorMap = {
    accent: ['rgba(91,91,255,.14)', '#7878ff'],
    success: ['rgba(46,184,160,.14)', '#2eb8a0'],
    warn: ['rgba(212,168,67,.14)', '#d4a843'],
    danger: ['rgba(224,98,122,.14)', '#e0627a'],
    muted: ['rgba(255,255,255,.06)', 'var(--text2)'],
    lav: ['rgba(155,139,232,.14)', '#9b8be8'],
  }
  const [bg, col] = colorMap[color] || colorMap.accent
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: bg,
        color: col,
        padding: '3px 9px',
        borderRadius: 20,
        fontSize: 10,
        fontFamily: 'var(--mono)',
        letterSpacing: '0.04em',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled, loading, style, size = 'md' }) {
  const padding = { sm: '7px 14px', md: '10px 20px', lg: '13px 26px' }[size]
  const fontSize = { sm: 12, md: 13, lg: 14 }[size]
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 3px 16px rgba(91,91,255,.3)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text2)',
      border: 'none',
    },
    success: {
      background: 'rgba(46,184,160,.1)',
      color: 'var(--teal)',
      border: '1px solid rgba(46,184,160,.2)',
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...(variants[variant] || variants.primary),
        padding,
        borderRadius: 'var(--r2)',
        fontSize,
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        transition: 'all 0.18s',
        letterSpacing: '-0.01em',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.opacity = '0.82'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {loading && (
        <span
          style={{
            width: 13,
            height: 13,
            border: '2px solid rgba(255,255,255,.25)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  )
}

export function Input({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 4,
  style,
  required,
}) {
  const baseStyle = {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r2)',
    color: 'var(--text)',
    padding: '10px 13px',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    ...style,
  }

  const handleFocus = (e) => (e.target.style.borderColor = 'var(--accent)')
  const handleBlur = (e) => (e.target.style.borderColor = 'var(--border)')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label
            style={{
              fontSize: 11,
              color: 'var(--text2)',
              fontFamily: 'var(--mono)',
              letterSpacing: '0.05em',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--pink)', marginLeft: 2 }}>*</span>}
          </label>
          {hint && <span style={{ fontSize: 10, color: 'var(--text3)' }}>{hint}</span>}
        </div>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...baseStyle, resize: 'vertical', lineHeight: 1.7 }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={baseStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )}
    </div>
  )
}

export function Spinner({ size = 18 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(91,91,255,.2)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.65s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

export function SkillBar({ label, value, max = 10, color = 'var(--accent)', evidence }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
          {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>
          {(+value).toFixed(1)}/10
        </span>
      </div>
      <div
        style={{
          height: 5,
          background: 'var(--bg4)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(value / max) * 100}%`,
            background: color,
            borderRadius: 3,
            animation: 'barGrow 0.85s ease both',
          }}
        />
      </div>
      {evidence && (
        <p
          style={{
            fontSize: 10,
            color: 'var(--text3)',
            lineHeight: 1.5,
            fontFamily: 'var(--mono)',
            marginTop: 2,
          }}
        >
          {evidence}
        </p>
      )}
    </div>
  )
}

export function FileDropZone({ label, hint, accept, onFile, file, icon = '📎', extracting = false }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleFile = (f) => {
    if (f) onFile(f)
  }

  return (
    <div
      onClick={() => !extracting && inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFile(e.dataTransfer.files[0])
      }}
      style={{
        border: `1.5px dashed ${dragging ? 'var(--accent)' : file ? 'var(--teal)' : 'var(--border)'}`,
        borderRadius: 'var(--r)',
        padding: 16,
        cursor: extracting ? 'default' : 'pointer',
        background: dragging
          ? 'rgba(91,91,255,.05)'
          : file
          ? 'rgba(46,184,160,.04)'
          : 'var(--bg3)',
        transition: 'all 0.2s',
        textAlign: 'center',
      }}
    >
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {extracting ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <Spinner size={16} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Reading file...</p>
          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{file?.name}</p>
        </>
      ) : file ? (
        <>
          <div style={{ fontSize: 20, marginBottom: 5 }}>✅</div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)' }}>{file.name}</p>
          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
            {(file.size / 1024).toFixed(0)} KB · Click to replace
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{label}</p>
          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{hint}</p>
        </>
      )}
    </div>
  )
}
