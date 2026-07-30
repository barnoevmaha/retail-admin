import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { t } from '../i18n'
import PasswordInput from '../components/PasswordInput'

export default function ChangePassword() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setMessage(null)
    setSaving(true)
    try {
      await api.put('/users/me/change-password', form)
      setMessage('success')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setErrors({ form: detail })
      } else {
        setErrors({ form: t('toast.error') })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('change_password.title')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 max-w-xl">
        {message === 'success' && (
          <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-3 rounded mb-4 text-sm border border-green-200 dark:border-green-800">
            {t('change_password.success')}
          </div>
        )}
        {errors.form && (
          <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded mb-4 text-sm border border-red-200 dark:border-red-800">
            {errors.form}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('change_password.current')}</label>
            <PasswordInput
              value={form.current_password}
              onChange={set('current_password')}
              placeholder={t('change_password.current_placeholder')}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('change_password.new')}</label>
            <PasswordInput
              value={form.new_password}
              onChange={set('new_password')}
              placeholder={t('change_password.new_placeholder')}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('change_password.confirm')}</label>
            <PasswordInput
              value={form.confirm_password}
              onChange={set('confirm_password')}
              placeholder={t('change_password.confirm_placeholder')}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="px-4 py-2 border dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              {saving ? t('common.loading') : t('change_password.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}