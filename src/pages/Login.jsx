import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { t, setLanguage, getLanguage, getLanguages } from '../i18n'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const langs = getLanguages()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || t('auth.login.error')
      setError(msg)
      if (import.meta.env.DEV) console.error('Login error:', err)
    } finally { setLoading(false) }
  }

  const fieldClass =
    'peer block w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-lg text-body-lg py-2 px-0 focus:ring-0 focus:outline-none focus:border-secondary transition-colors duration-300 placeholder-transparent'
  const labelClass =
    'absolute left-0 top-2 font-body-lg text-body-lg text-on-surface-variant transition-all duration-300 peer-focus:-top-5 peer-focus:text-label-sm peer-focus:font-label-sm peer-focus:text-secondary peer-valid:-top-5 peer-valid:text-label-sm peer-valid:font-label-sm'

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden luxury-bg bg-background px-margin-mobile md:px-margin-desktop">
      <div className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none mix-blend-luminosity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBn3gVKzGplLJ_Nim4Y0cuB8Qyk7vEWjMXeJ9o9-yfa17SsyKEFm2LIBlY7sw-aD0itkNR-mG1y7lk5Z1zez73A-LM8RpX3IFU4ce_UEngSPY9CwdGnpiehpplPHY5P_KmhQgFw4kZ71c9An5eV-JXjf41Kq2jrnZbRlEjJV5scg9WNiHZDTYFc0VAQxXLYI9uLR62ACrFETq57EJjqtVfNLAo9dxUoUTB1s3h6OhMPim08eN5hbYkrnw')" }} />
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20">
        <select
          value={getLanguage()}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent border-0 border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-widest py-1 focus:outline-none focus:border-secondary transition-colors duration-300"
        >
          {langs.map((l) => (
            <option key={l.code} value={l.code} className="bg-surface-container">{l.label}</option>
          ))}
        </select>
      </div>
      <main className="w-full max-w-md relative z-10">
        <div className="bg-surface-container/80 backdrop-blur-xl border border-outline-variant rounded-xl p-10 md:p-12 flex flex-col items-center">
          <div className="mb-6 flex justify-center items-center h-16 w-16 rounded-full bg-surface-container-high border border-outline-variant shadow-lg shadow-black/50">
            <span className="material-symbols-outlined text-secondary text-3xl">lock</span>
          </div>
          <div className="text-center mb-10 w-full">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-3">SECURE BACKOFFICE</h2>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-wide">AURELIUS</h1>
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
            {error && (
              <div className="border border-error/40 bg-error-container/30 text-error font-body-md text-body-md px-4 py-3 rounded-[4px]">{error}</div>
            )}
            <div className="relative">
              <input
                id="email"
                type="email"
                className={fieldClass}
                placeholder={t('auth.login.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email" className={labelClass}>{t('auth.login.email')}</label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className={fieldClass + ' pr-8'}
                placeholder={t('auth.login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password" className={labelClass}>{t('auth.login.password')}</label>
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant hover:text-secondary transition-colors"
              >
                {showPw ? 'visibility_off' : 'visibility'}
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-widest py-4 px-6 rounded-[4px] hover:bg-primary transition-colors duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? t('auth.login.loading') : t('auth.login.button')}</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'wght' 400" }}>arrow_right_alt</span>
              </button>
              <a className="text-center font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors duration-200 mt-2" href="#">REQUEST ACCESS</a>
            </div>
          </form>
        </div>
        <div className="mt-8 text-center text-on-surface-variant font-label-sm text-label-sm opacity-60">
          <p>© 2026 AURELIUS CURATION. ALL RIGHTS RESERVED.</p>
        </div>
      </main>
    </div>
  )
}
