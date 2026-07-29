export default function NavBar({ theme, setTheme }) {
  const dark = theme === 'dark'

  const navBg    = dark ? 'rgba(15,12,40,0.95)'  : 'rgba(255,255,255,0.95)'
  const border   = dark ? 'rgba(255,255,255,0.08)': 'rgba(0,0,0,0.08)'
  const iconCol  = dark ? 'rgba(255,255,255,0.35)': 'rgba(0,0,0,0.35)'
  const iconHov  = dark ? '#a78bfa' : '#7c3aed'

  const NAV_ITEMS = [
    { icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ), label: 'Home' },
    { icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ), label: 'Profile' },
    { icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ), label: 'Stats' },
    { icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), label: 'Settings' },
  ]

  return (
    <div
      className="fixed left-0 top-0 h-full flex flex-col items-center py-5 gap-2 z-[9998]"
      style={{
        width: '60px',
        background: navBg,
        borderRight: `1px solid ${border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: dark ? '4px 0 24px rgba(0,0,0,0.4)' : '4px 0 24px rgba(0,0,0,0.08)',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Logo mark */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shrink-0"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </div>

      {/* Nav icons */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item, i) => (
          <button
            key={i}
            title={item.label}
            className="group w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ color: i === 0 ? iconHov : iconCol }}
            onMouseEnter={e => e.currentTarget.style.color = iconHov}
            onMouseLeave={e => e.currentTarget.style.color = i === 0 ? iconHov : iconCol}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Theme toggle */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: iconCol }}>
          {dark ? 'Dark' : 'Light'}
        </span>
        <button
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          title="Toggle theme"
          className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: dark ? 'rgba(139,92,246,0.15)' : 'rgba(124,58,237,0.1)',
            border: `1.5px solid ${dark ? 'rgba(139,92,246,0.4)' : 'rgba(124,58,237,0.25)'}`,
          }}
        >
          {/* Sun icon — light mode */}
          <svg
            className="w-5 h-5 absolute transition-all duration-300"
            style={{ opacity: dark ? 0 : 1, transform: dark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)', color: '#f59e0b' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          {/* Moon icon — dark mode */}
          <svg
            className="w-5 h-5 absolute transition-all duration-300"
            style={{ opacity: dark ? 1 : 0, transform: dark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)', color: '#a78bfa' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
