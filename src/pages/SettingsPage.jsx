import { useState, useEffect } from 'react'
import api from '../api/client'

const FIELDS = [
  { key: 'store_name', label: 'Store Name' },
  { key: 'currency', label: 'Currency' },
  { key: 'timezone', label: 'Timezone' },
  { key: 'tax_rate', label: 'Tax Rate (%)' },
  { key: 'receipt_footer', label: 'Receipt Footer' },
  { key: 'sms_provider', label: 'SMS Provider' },
  { key: 'telegram_bot_token', label: 'Telegram Bot Token' },
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
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-4 max-w-xl">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              className="border p-2 rounded w-full"
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
