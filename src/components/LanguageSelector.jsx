import { useState, useEffect, useRef } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi',   flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',   flag: '🇮🇳' },
]

export default function LanguageSelector({ lang, setLang }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGUAGES.find(l => l.code === lang)

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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition"
        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg
          className="w-3.5 h-3.5 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute right-0 mt-2 w-36 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(20,20,40,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 9999,
          }}
        >
          {LANGUAGES.map(l => (
            <li key={l.code}>
              <button
                onClick={(e) => { e.stopPropagation(); setLang(l.code); setOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition"
                style={{
                  color: lang === l.code ? '#a78bfa' : 'rgba(255,255,255,0.7)',
                  background: lang === l.code ? 'rgba(139,92,246,0.15)' : 'transparent',
                  fontWeight: lang === l.code ? 600 : 400,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = lang === l.code ? 'rgba(139,92,246,0.15)' : 'transparent'}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
                {lang === l.code && (
                  <svg className="w-3.5 h-3.5 ml-auto text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
