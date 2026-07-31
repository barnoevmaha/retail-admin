import { useState, useEffect } from 'react'
import api from '../api/client'

const FIELDS = [
  { key: 'store_name', label: 'Store Name', hint: 'Shown on receipts and invoices' },
  { key: 'currency', label: 'Currency', hint: 'e.g. USD, UZS' },
  { key: 'timezone', label: 'Timezone', hint: 'e.g. Asia/Tashkent' },
  { key: 'tax_rate', label: 'Tax Rate', hint: 'e.g. 12 (percent)' },
  { key: 'receipt_footer', label: 'Receipt Footer', hint: 'Shown at the bottom of receipts' },
  { key: 'sms_provider', label: 'SMS Provider', hint: 'Provider key or name' },
  { key: 'telegram_bot_token', label: 'Telegram Bot Token', hint: 'Used for Telegram notifications' },
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
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Store preferences. Changes save automatically.</p>
      </header>

      <div className="p-8 bg-surface-container-low border border-outline-variant max-w-2xl">
        <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-8">Store Settings</h2>
        <div className="space-y-8">
          {FIELDS.map(({ key, label, hint }) => (
            <div key={key}>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{label}</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-lg font-body-lg placeholder:text-on-surface-variant/40"
                value={settings[key] || ''}
                onChange={(e) => update(key, e.target.value)}
                onBlur={(e) => save(key, e.target.value)}
              />
              {hint && <p className="font-label-sm text-label-sm text-on-surface-variant/40 mt-1">{hint}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
