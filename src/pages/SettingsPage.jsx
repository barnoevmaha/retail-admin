import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

const FIELDS = [
  { key: 'store_name', labelKey: 'settings.store_name' },
  { key: 'currency', labelKey: 'settings.currency' },
  { key: 'timezone', labelKey: 'settings.timezone' },
  { key: 'tax_rate', labelKey: 'settings.tax_rate' },
  { key: 'receipt_footer', labelKey: 'settings.receipt_footer' },
  { key: 'sms_provider', labelKey: 'settings.sms_provider' },
  { key: 'telegram_bot_token', labelKey: 'settings.telegram_token' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    api.get('/settings').then((r) => {
      const m = {}
      r.data.forEach((s) => { m[s.key] = s.value || '' })
      setSettings(m)
    }).catch(() => {})
  }, [])

  const save = async (key, value) => {
    try {
      await api.post('/settings', { key, value })
    } catch {}
  }

  const update = (key, val) => {
    setSettings({ ...settings, [key]: val })
    save(key, val)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('settings.title')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 max-w-xl">
        {FIELDS.map(({ key, labelKey }) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(labelKey)}</label>
            <input
              className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full"
              value={settings[key] || ''}
              onChange={(e) => update(key, e.target.value)}
              onBlur={(e) => save(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
