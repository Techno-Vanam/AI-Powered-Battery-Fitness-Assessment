import { useState, useEffect, useRef } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi',   flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',   flag: '🇮🇳' },
]

export default function LanguageSelector({ lang, setLang, theme = 'dark' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]
  const isDark = theme === 'dark'

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative" style={{ zIndex: 9999 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
        style={{
          background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
          border: isDark ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(124,58,237,0.25)',
          color: isDark ? '#ffffff' : '#1a1040',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 14px rgba(124,58,237,0.1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,1)'
          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(124,58,237,0.5)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)'
          e.currentTarget.style.borderColor = isDark ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(124,58,237,0.25)'
        }}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg
          className="w-3.5 h-3.5 transition-transform"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(26,16,64,0.7)'
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute right-0 mt-2 w-36 rounded-2xl overflow-hidden animate-fadeIn"
          style={{
            background: isDark ? 'rgba(20,20,40,0.95)' : 'rgba(255,255,255,0.96)',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(124,58,237,0.15)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.5)' : '0 12px 36px rgba(124,58,237,0.15)',
            zIndex: 9999,
          }}
        >
          {LANGUAGES.map(l => {
            const isSelected = lang === l.code
            return (
              <li key={l.code}>
                <button
                  onClick={(e) => { e.stopPropagation(); setLang(l.code); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all duration-150"
                  style={{
                    color: isSelected
                      ? (isDark ? '#a78bfa' : '#7c3aed')
                      : (isDark ? 'rgba(255,255,255,0.8)' : '#374151'),
                    background: isSelected
                      ? (isDark ? 'rgba(139,92,246,0.2)' : 'rgba(124,58,237,0.1)')
                      : 'transparent',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.05)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isSelected
                      ? (isDark ? 'rgba(139,92,246,0.2)' : 'rgba(124,58,237,0.1)')
                      : 'transparent'
                  }}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                  {isSelected && (
                    <svg className={`w-3.5 h-3.5 ml-auto ${isDark ? 'text-violet-400' : 'text-violet-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
