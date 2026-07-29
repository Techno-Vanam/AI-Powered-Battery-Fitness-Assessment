import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import AuthScreen from './components/AuthScreen'

export default function App() {
  const [screen, setScreen] = useState('splash')
  const [lang, setLang] = useState('en')

  return screen === 'splash'
    ? <SplashScreen onDone={() => setScreen('auth')} lang={lang} setLang={setLang} />
    : <AuthScreen lang={lang} setLang={setLang} />
}
