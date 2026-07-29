import { useState } from 'react'
import LanguageSelector from './LanguageSelector'
import t from '../translations'

const errCls = 'text-red-400 text-xs mt-1 pl-1'

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="orb1 absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="orb2 absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-blue-600/25 blur-3xl" />
      <div className="orb3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl" />
    </div>
  )
}

function InputField({ placeholder, type = 'text', value, onChange, icon, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <div className={`relative flex items-center rounded-2xl overflow-hidden transition-all duration-200 ${focused ? 'ring-2 ring-violet-500/50' : ''}`}>
        <span className="absolute left-4 text-white/40 text-base">{icon}</span>
        <input
          className="input-glow w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm"
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {error && <p className={errCls}>{error}</p>}
    </div>
  )
}

function SocialBtn({ icon, label }) {
  return (
    <button className="social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-white/80">
      {icon}
      {label}
    </button>
  )
}

export default function AuthScreen({ lang, setLang }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', contact: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const tr = t[lang]
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (mode === 'register' && !form.name.trim()) e.name = tr.nameRequired
    if (!form.contact.trim()) e.contact = tr.contactRequired
    if (!form.password) e.password = tr.passwordRequired
    else if (form.password.length < 6) e.password = tr.passwordMin
    if (mode === 'register') {
      if (!form.confirm) e.confirm = tr.confirmRequired
      else if (form.confirm !== form.password) e.confirm = tr.passwordMismatch
    }
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    setErrors(e2)
    if (!Object.keys(e2).length) setSubmitted(true)
  }

  const switchMode = (m) => { setMode(m); setErrors({}); setSubmitted(false); setForm({ name: '', contact: '', password: '', confirm: '' }) }

  if (submitted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#0a0a1a] overflow-hidden">
        <FloatingOrbs />
        <div className="relative z-10 text-center animate-fadeIn">
          <div className="check-pop w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-violet-500/40">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">{mode === 'login' ? tr.welcomeBack : tr.accountCreated}</h2>
          <p className="text-white/50 text-sm mt-2">{tr.allSet}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-[#0a0a1a]">
      <FloatingOrbs />

      {/* Top bar */}
      <div className="relative z-50 flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">BatteryFit</span>
        </div>
        <LanguageSelector lang={lang} setLang={setLang} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-white leading-tight whitespace-pre-line">
              {mode === 'login' ? tr.loginHeading : tr.registerHeading}
            </h2>
            <p className="text-white/40 text-sm mt-2">
              {mode === 'login' ? tr.loginSub : tr.registerSub}
            </p>
          </div>

          {/* Glass card */}
          <div className="glass-card rounded-3xl p-6 animate-fadeIn">

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-6 gap-1">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${mode === m ? 'tab-active text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  {m === 'login' ? tr.login : tr.register}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {mode === 'register' && (
                <InputField
                  icon="👤"
                  placeholder={tr.fullName}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  error={errors.name}
                />
              )}

              <InputField
                icon="📧"
                placeholder={tr.emailOrPhone}
                value={form.contact}
                onChange={e => set('contact', e.target.value)}
                error={errors.contact}
              />

              <div>
                <div className="relative flex items-center rounded-2xl overflow-hidden">
                  <span className="absolute left-4 text-white/40 text-base">🔒</span>
                  <input
                    className="input-glow w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm"
                    placeholder={tr.password}
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 text-white/30 hover:text-white/70 transition text-xs"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <p className={errCls}>{errors.password}</p>}
              </div>

              {mode === 'register' && (
                <InputField
                  icon="🔑"
                  placeholder={tr.confirmPassword}
                  type="password"
                  value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  error={errors.confirm}
                />
              )}

              {mode === 'login' && (
                <div className="text-right pt-1">
                  <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition">
                    {tr.forgotPassword}
                  </button>
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3.5 rounded-2xl text-white font-bold text-sm mt-2">
                {mode === 'login' ? tr.login : tr.createAccount}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">{tr.orContinueWith}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social */}
            <div className="flex gap-3">
              <SocialBtn
                label="Google"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }
              />
              <SocialBtn
                label="Apple"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
