import { useState, useEffect, useRef } from 'react'
import LanguageSelector from './LanguageSelector'
import t from '../translations'

const errCls = 'text-red-400 text-xs mt-1 pl-1'
const MOCK_OTP = '123456'

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="orb1 absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'var(--orb1)' }} />
      <div className="orb2 absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: 'var(--orb2)' }} />
      <div className="orb3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl" style={{ background: 'var(--orb3)' }} />
    </div>
  )
}

function Toast({ message, desc, onHide }) {
  useEffect(() => { const t = setTimeout(onHide, 5000); return () => clearTimeout(t) }, [onHide])
  return (
    <div className="toast-in fixed top-5 left-1/2 -translate-x-1/2 z-[99999] flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-xs w-full"
      style={{ background: 'var(--surface)', border: '1px solid rgba(139,92,246,0.4)', backdropFilter: 'blur(20px)' }}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{message}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
      </div>
    </div>
  )
}

function OtpInput({ value = '', onChange, error, tr }) {
  const inputs = useRef([])
  const digits = Array.from({ length: 6 }, (_, idx) => value[idx] || '')

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]
        next[i] = ''
        onChange(next.join(''))
      } else if (i > 0) {
        inputs.current[i - 1]?.focus()
        const next = [...digits]
        next[i - 1] = ''
        onChange(next.join(''))
      }
    }
  }

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = val
    onChange(next.join(''))
    if (val && i < 5) {
      inputs.current[i + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    inputs.current[Math.min(pasted.length, 5)]?.focus()
    e.preventDefault()
  }

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{tr.otpLabel}</p>
      <div className="flex gap-2 justify-between">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i]}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste}
            className="otp-box"
            style={{
              width: 44,
              height: 52,
              borderRadius: 14,
              border: digits[i] ? '2px solid #7c3aed' : '1.5px solid var(--input-border)',
              background: digits[i] ? 'rgba(124,58,237,0.15)' : 'var(--input-bg)',
              color: 'var(--input-text)',
              WebkitTextFillColor: 'var(--input-text)',
              fontSize: '1.4rem',
              fontWeight: 800,
              textAlign: 'center',
              outline: 'none',
              caretColor: '#a78bfa',
              boxShadow: digits[i] ? '0 0 0 3px rgba(124,58,237,0.25)' : 'none',
              transition: 'border 0.15s, background 0.15s, box-shadow 0.15s',
              cursor: 'text',
            }}
            onFocus={e => {
              e.target.style.border = '2px solid #7c3aed'
              e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.3)'
              e.target.style.background = 'rgba(124,58,237,0.12)'
            }}
            onBlur={e => {
              e.target.style.border = digits[i] ? '2px solid #7c3aed' : '1.5px solid var(--input-border)'
              e.target.style.boxShadow = digits[i] ? '0 0 0 3px rgba(124,58,237,0.25)' : 'none'
              e.target.style.background = digits[i] ? 'rgba(124,58,237,0.15)' : 'var(--input-bg)'
            }}
          />
        ))}
      </div>
      {error && <p className={errCls}>{error}</p>}
    </div>
  )
}

function IndiaScroll({ tr }) {
  const text = `🇮🇳  ${tr.scrollText}  ☸  ${tr.scrollText2}  ⚡  ${tr.scrollText3}  🇮🇳  ${tr.scrollText}  ☸  ${tr.scrollText2}  ⚡  ${tr.scrollText3}`
  return (
    <div className="relative z-40 overflow-hidden">
      <div style={{ background: '#FF9933', height: '6px' }} />
      <div className="relative overflow-hidden" style={{ background: '#f8f8f8', height: '28px', display: 'flex', alignItems: 'center' }}>
        <span className="absolute left-3 z-10 text-base select-none" style={{ color: '#000080' }}>☸</span>
        <span className="absolute right-3 z-10 text-base select-none" style={{ color: '#000080' }}>☸</span>
        <div className="marquee-track inline-block">
          <span className="text-xs font-bold tracking-wide" style={{ color: '#000080' }}>{text}</span>
        </div>
      </div>
      <div style={{ background: '#138808', height: '6px' }} />
    </div>
  )
}

function SocialBtn({ icon, label }) {
  return (
    <button className="social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium">
      {icon}{label}
    </button>
  )
}

export default function AuthScreen({ lang, setLang, theme }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [idValue, setIdValue] = useState('')
  const [idState, setIdState] = useState('idle')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState(null)
  const [resend, setResend] = useState(0)
  const tr = t[lang]

  const handleIdChange = (val) => {
    const numeric = val.replace(/\D/g, '').slice(0, 12)
    setIdValue(numeric); setIdState('idle'); setOtpSent(false); setOtp('')
    setErrors(e => ({ ...e, id: undefined }))
    if (numeric.length === 12) { setIdState('verifying'); setTimeout(() => setIdState('verified'), 1200) }
  }

  useEffect(() => {
    if (resend <= 0) return
    const t = setTimeout(() => setResend(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resend])

  const sendOtp = () => {
    if (idState !== 'verified') return
    setOtpSent(true); setOtp(''); setResend(30)
    setToast({ message: tr.otpSent, desc: tr.otpSentDesc })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (mode === 'register' && !name.trim()) errs.name = tr.nameRequired
    if (!idValue || idValue.length !== 12) errs.id = tr.idInvalid
    if (!otpSent) errs.otp = tr.otpRequired
    else if (otp.length !== 6) errs.otp = tr.otpInvalid
    else if (otp !== MOCK_OTP) errs.otp = tr.otpWrong
    setErrors(errs)
    if (!Object.keys(errs).length) setSubmitted(true)
  }

  const switchMode = (m) => {
    setMode(m); setErrors({}); setName(''); setIdValue('')
    setIdState('idle'); setOtpSent(false); setOtp(''); setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <FloatingOrbs />
        <div className="relative z-10 text-center animate-fadeIn">
          <div className="check-pop w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-violet-500/40">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mode === 'login' ? tr.welcomeBack : tr.accountCreated}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{tr.allSet}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: 'var(--bg)', transition: 'background 0.3s' }}>
      <FloatingOrbs />
      {toast && <Toast message={toast.message} desc={toast.desc} onHide={() => setToast(null)} />}

      {/* Top bar */}
      <div className="relative z-50 flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--text)' }}>BatteryFit</span>
        </div>
        <LanguageSelector lang={lang} setLang={setLang} theme={theme} />
      </div>

      {/* India scroll */}
      <IndiaScroll tr={tr} />

      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-6">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-6 animate-fadeIn">
            <h2 className="text-3xl font-bold leading-tight whitespace-pre-line" style={{ color: 'var(--text)' }}>
              {mode === 'login' ? tr.loginHeading : tr.registerHeading}
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {mode === 'login' ? tr.loginSub : tr.registerSub}
            </p>
          </div>

          {/* Glass card */}
          <div className="glass-card rounded-3xl p-6 animate-fadeIn">

            {/* Tabs */}
            <div className="flex rounded-2xl p-1 mb-5 gap-1" style={{ background: 'var(--tab-bg)' }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${mode === m ? 'tab-active' : 'tab-inactive hover:opacity-70'}`}>
                  {m === 'login' ? tr.login : tr.register}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {mode === 'register' && (
                <div>
                  <div className="relative flex items-center rounded-2xl overflow-hidden">
                    <span className="absolute left-4" style={{ color: 'var(--text-muted)' }}>👤</span>
                    <input className="input-glow w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm"
                      placeholder={tr.fullName} value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  {errors.name && <p className={errCls}>{errors.name}</p>}
                </div>
              )}

              {/* ID field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tr.idLabel}</span>
                  <span className="text-xs font-medium" style={{ color: idValue.length === 12 ? '#a78bfa' : 'var(--text-faint)' }}>
                    {idValue.length}/12
                  </span>
                </div>
                <div className={`relative flex items-center rounded-2xl overflow-hidden transition-all duration-200 ${idState === 'verified' ? 'ring-2 ring-emerald-500/50' : idState === 'verifying' ? 'ring-2 ring-violet-500/40' : ''}`}>
                  <span className="absolute left-4" style={{ color: 'var(--text-muted)' }}>🪪</span>
                  <input className="input-glow w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm tracking-widest"
                    placeholder={tr.idPlaceholder} inputMode="numeric"
                    value={idValue} onChange={e => handleIdChange(e.target.value)} maxLength={12} />
                  <span className="absolute right-4 text-sm">
                    {idState === 'verifying' && <span className="w-4 h-4 border-2 border-violet-400/40 border-t-violet-400 rounded-full inline-block animate-spin-slow" />}
                    {idState === 'verified' && <span className="text-emerald-400">✓</span>}
                  </span>
                </div>
                <div className="mt-2 h-0.5 rounded-full" style={{ background: 'var(--divider)' }}>
                  <div className="id-progress" style={{ width: `${(idValue.length / 12) * 100}%` }} />
                </div>
                <p className="text-xs mt-1" style={{ color: idState === 'verified' ? '#10b981' : idState === 'verifying' ? '#a78bfa' : 'var(--text-faint)' }}>
                  {idState === 'verifying' ? tr.idVerifying : idState === 'verified' ? tr.idVerified : tr.idHint}
                </p>
                {errors.id && <p className={errCls}>{errors.id}</p>}
              </div>

              {idState === 'verified' && !otpSent && (
                <button type="button" onClick={sendOtp}
                  className="btn-primary w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2">
                  <span>📲</span> {tr.sendOtp}
                </button>
              )}

              {otpSent && (
                <div className="space-y-3">
                  <OtpInput value={otp} onChange={setOtp} error={errors.otp} tr={tr} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {resend > 0 ? `${tr.resendIn} ${resend}s` : ''}
                    </span>
                    <button type="button" disabled={resend > 0} onClick={sendOtp}
                      className="text-xs font-medium transition"
                      style={{ color: resend > 0 ? 'var(--resend-dis)' : '#a78bfa', cursor: resend > 0 ? 'not-allowed' : 'pointer' }}>
                      {tr.resendOtp}
                    </button>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 rounded-2xl text-white font-bold text-sm">
                    {mode === 'login' ? tr.verifyLogin : tr.createAccount}
                  </button>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: 'var(--divider)' }} />
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{tr.orContinueWith}</span>
              <div className="flex-1 h-px" style={{ background: 'var(--divider)' }} />
            </div>

            {/* Social */}
            <div className="flex gap-3">
              <SocialBtn label="Google" icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              } />
              <SocialBtn label="Apple" icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              } />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
