import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import AuthScreen from './components/AuthScreen'
import NavBar from './components/NavBar'

export default function App() {
  const [screen, setScreen] = useState('splash')
  const [lang, setLang] = useState('en')
  const [theme, setTheme] = useState('dark')

  // Apply theme to <html> so CSS vars cascade everywhere
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', transition: 'background 0.3s' }}>
      {screen === 'auth' && <NavBar theme={theme} setTheme={setTheme} />}
      <div className="flex-1" style={{ marginLeft: screen === 'auth' ? '60px' : '0' }}>
        {screen === 'splash'
          ? <SplashScreen onDone={() => setScreen('auth')} lang={lang} setLang={setLang} />
          : <AuthScreen lang={lang} setLang={setLang} theme={theme} />
        }
      </div>
    </div>
  )
}
