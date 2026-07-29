import { useEffect, useState } from 'react'
import LanguageSelector from './LanguageSelector'
import t from '../translations'

const ILLUSTRATIONS = [
  (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="60" cy="128" rx="44" ry="8" fill="#6366f1" fillOpacity="0.2"/>
      <rect x="28" y="10" width="64" height="108" rx="12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
      <rect x="33" y="18" width="54" height="92" rx="7" fill="#0f0c29"/>
      <rect x="42" y="36" width="36" height="18" rx="4" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
      <rect x="78" y="42" width="4" height="7" rx="2" fill="#6366f1"/>
      <rect x="44" y="38" width="22" height="14" rx="3" fill="#6366f1" fillOpacity="0.8"/>
      <path d="M61 39l-4 7h3l-2 6 6-8h-3l4-5z" fill="white"/>
      <rect x="38" y="64" width="8" height="22" rx="3" fill="#6366f1" fillOpacity="0.4"/>
      <rect x="50" y="57" width="8" height="29" rx="3" fill="#6366f1" fillOpacity="0.65"/>
      <rect x="62" y="50" width="8" height="36" rx="3" fill="#6366f1" fillOpacity="0.9"/>
      <rect x="74" y="59" width="8" height="27" rx="3" fill="#06b6d4" fillOpacity="0.7"/>
      <circle cx="28" cy="30" r="6" fill="#6366f1" fillOpacity="0.12" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="2 2"/>
      <circle cx="28" cy="30" r="2" fill="#6366f1" fillOpacity="0.6"/>
      <circle cx="94" cy="80" r="7" fill="#06b6d4" fillOpacity="0.1" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="2 2"/>
      <circle cx="94" cy="80" r="2.5" fill="#06b6d4" fillOpacity="0.6"/>
    </svg>
  ),
  (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="60" cy="128" rx="48" ry="8" fill="#8b5cf6" fillOpacity="0.18"/>
      <circle cx="60" cy="30" r="18" fill="#1e1040" stroke="#8b5cf6" strokeWidth="1.5"/>
      <circle cx="60" cy="30" r="11" fill="#8b5cf6" fillOpacity="0.25"/>
      <text x="60" y="35" textAnchor="middle" fontSize="12" fill="white">🎯</text>
      <rect x="30" y="56" width="60" height="68" rx="8" fill="#1a1040" stroke="#8b5cf6" strokeWidth="1"/>
      <rect x="44" y="51" width="32" height="9" rx="4.5" fill="#8b5cf6"/>
      <rect x="38" y="70" width="44" height="3" rx="1.5" fill="#8b5cf6" fillOpacity="0.5"/>
      <rect x="38" y="79" width="34" height="3" rx="1.5" fill="#8b5cf6" fillOpacity="0.3"/>
      <rect x="38" y="88" width="40" height="3" rx="1.5" fill="#8b5cf6" fillOpacity="0.4"/>
      <circle cx="42" cy="101" r="4" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="1"/>
      <path d="M40 101l1.5 1.5 3-3" stroke="#8b5cf6" strokeWidth="1" strokeLinecap="round"/>
      <rect x="49" y="99" width="28" height="3" rx="1.5" fill="#8b5cf6" fillOpacity="0.3"/>
      <circle cx="42" cy="113" r="4" fill="#ec4899" fillOpacity="0.2" stroke="#ec4899" strokeWidth="1"/>
      <path d="M40 113l1.5 1.5 3-3" stroke="#ec4899" strokeWidth="1" strokeLinecap="round"/>
      <rect x="49" y="111" width="22" height="3" rx="1.5" fill="#ec4899" fillOpacity="0.3"/>
      <circle cx="14" cy="85" r="9" fill="#8b5cf6" fillOpacity="0.12" stroke="#8b5cf6" strokeWidth="0.8"/>
      <text x="14" y="89" textAnchor="middle" fontSize="8" fill="white">👤</text>
      <circle cx="106" cy="85" r="9" fill="#ec4899" fillOpacity="0.12" stroke="#ec4899" strokeWidth="0.8"/>
      <text x="106" y="89" textAnchor="middle" fontSize="8" fill="white">👤</text>
      <line x1="23" y1="85" x2="30" y2="85" stroke="#8b5cf6" strokeWidth="0.8" strokeDasharray="2 1.5"/>
      <line x1="90" y1="85" x2="97" y2="85" stroke="#ec4899" strokeWidth="0.8" strokeDasharray="2 1.5"/>
    </svg>
  ),
  (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="60" cy="128" rx="46" ry="8" fill="#10b981" fillOpacity="0.18"/>
      <circle cx="68" cy="26" r="14" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1.5"/>
      <text x="68" y="31" textAnchor="middle" fontSize="14" fill="white">🏃</text>
      <path d="M18 105 Q60 45 102 105" stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 3" fill="none" strokeOpacity="0.4"/>
      <circle cx="30" cy="98" r="6" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1.2"/>
      <circle cx="30" cy="98" r="2.5" fill="#10b981"/>
      <circle cx="60" cy="62" r="7" fill="#10b981" fillOpacity="0.25" stroke="#10b981" strokeWidth="1.5"/>
      <circle cx="60" cy="62" r="3" fill="#10b981"/>
      <circle cx="90" cy="98" r="6" fill="#06b6d4" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="1.2"/>
      <circle cx="90" cy="98" r="2.5" fill="#06b6d4"/>
      <rect x="28" y="114" width="64" height="7" rx="3.5" fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeWidth="0.8"/>
      <rect x="29.5" y="115.5" width="44" height="4" rx="2" fill="#10b981" fillOpacity="0.65"/>
      <text x="60" y="130" textAnchor="middle" fontSize="6" fill="#10b981" fillOpacity="0.7">ENERGY 73%</text>
      <text x="18" y="50" fontSize="9" fill="#10b981" fillOpacity="0.45">★</text>
      <text x="96" y="44" fontSize="7" fill="#06b6d4" fillOpacity="0.45">★</text>
      <text x="104" y="70" fontSize="8" fill="#10b981" fillOpacity="0.35">★</text>
    </svg>
  ),
]

const CARD_META = [
  { accent: '#6366f1', accentTo: '#06b6d4', bg: 'linear-gradient(170deg, #1e1b4b 0%, #0f0c29 100%)', badgeKey: 'card0Badge', titleKey: 'card0Title', subKey: 'card0Sub' },
  { accent: '#8b5cf6', accentTo: '#ec4899', bg: 'linear-gradient(170deg, #1a0d2e 0%, #0d0d1a 100%)', badgeKey: 'card1Badge', titleKey: 'card1Title', subKey: 'card1Sub' },
  { accent: '#10b981', accentTo: '#06b6d4', bg: 'linear-gradient(170deg, #071a12 0%, #0a1a1a 100%)', badgeKey: 'card2Badge', titleKey: 'card2Title', subKey: 'card2Sub' },
]

export default function SplashScreen({ onDone, lang, setLang }) {
  const [show, setShow] = useState(false)
  const tr = t[lang]

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(onDone, 6000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="min-h-screen flex flex-col bg-[#080818] select-none overflow-hidden relative" onClick={onDone}>

      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

      {/* Header */}
      {show && (
        <div className="relative z-10 flex items-center justify-between px-4 pt-8 pb-4 animate-fadeIn">
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-2">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">BatteryFit</h1>
            <p className="text-white/40 text-xs mt-0.5">{tr.appTagline}</p>
          </div>
          {/* Language selector — stop click propagation so it doesn't trigger onDone */}
          <div className="absolute right-4 top-8" onClick={e => e.stopPropagation()}>
            <LanguageSelector lang={lang} setLang={setLang} />
          </div>
        </div>
      )}

      {/* 3 Portrait Cards */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-3 pb-4 gap-3">
        {show && CARD_META.map((card, i) => (
          <div
            key={i}
            className={`card-enter-${i} flex flex-col rounded-3xl overflow-hidden border border-white/10 shadow-2xl`}
            style={{ background: card.bg, flex: '1 1 0', minWidth: 0, maxWidth: '160px', height: '420px' }}
          >
            {/* Illustration */}
            <div className="flex items-center justify-center pt-5 px-4" style={{ height: '160px' }}>
              {ILLUSTRATIONS[i]}
            </div>

            {/* Glow divider */}
            <div className="mx-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${card.accent}66, transparent)` }} />

            {/* Content */}
            <div className="flex flex-col flex-1 px-4 pt-4 pb-5">
              <span
                className="self-start text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-3"
                style={{ background: `${card.accent}22`, color: card.accent, border: `1px solid ${card.accent}44` }}
              >
                {tr[card.badgeKey]}
              </span>
              <h2 className="text-white font-extrabold text-sm leading-snug mb-2 whitespace-pre-line">
                {tr[card.titleKey]}
              </h2>
              <p className="text-white/45 text-[10px] leading-relaxed flex-1">
                {tr[card.subKey]}
              </p>
              <div className="mt-4 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${card.accent}, ${card.accentTo})`, opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {show && (
        <div className="relative z-10 flex flex-col items-center pb-8 gap-3 animate-fadeIn" onClick={e => e.stopPropagation()}>
          <button
            onClick={onDone}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)', boxShadow: '0 8px 28px rgba(99,102,241,0.4)' }}
          >
            {tr.getStarted}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </button>
          <p className="text-white/25 text-[10px]">{tr.tapToContinue}</p>
        </div>
      )}
    </div>
  )
}
