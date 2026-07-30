import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { t, setLanguage, getLanguage, getLanguages } from '../i18n'
import PasswordInput from '../components/PasswordInput'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { mode, setTheme } = useTheme()
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md dark:shadow-gray-900/50 w-96">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold dark:text-white">{t('auth.login.title')}</h1>
          <div className="flex items-center gap-2">
            <select
              value={getLanguage()}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded px-1 py-0.5"
            >
              {langs.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setTheme(mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark')}
              className="text-sm"
            >
              {mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '💻'}
            </button>
          </div>
        </div>
        {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
        <input type="email" placeholder={t('auth.login.email')} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 rounded mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PasswordInput value={password} placeholder={t('auth.login.password')} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white p-2 rounded mt-4 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50">{loading ? t('auth.login.loading') : t('auth.login.button')}</button>
      </form>
    </div>
  )
}
