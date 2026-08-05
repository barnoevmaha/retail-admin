import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

const FIELDS = [
  { key: 'store_name', labelKey: 'settings.store_name', hintKey: 'settings.store_name_hint' },
  { key: 'currency', labelKey: 'settings.currency', hintKey: 'settings.currency_hint' },
  { key: 'timezone', labelKey: 'settings.timezone', hintKey: 'settings.timezone_hint' },
  { key: 'tax_rate', labelKey: 'settings.tax_rate', hintKey: 'settings.tax_rate_hint' },
  { key: 'receipt_footer', labelKey: 'settings.receipt_footer', hintKey: 'settings.receipt_footer_hint' },
  { key: 'sms_provider', labelKey: 'settings.sms_provider', hintKey: 'settings.sms_provider_hint' },
  { key: 'telegram_bot_token', labelKey: 'settings.telegram_bot_token', hintKey: 'settings.telegram_bot_token_hint' },
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
          {t('settings.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('settings.subtitle')}</p>
      </header>

      <div className="p-8 bg-surface-container-low border border-outline-variant max-w-2xl">
        <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-8">{t('settings.details')}</h2>
        <div className="space-y-8">
          {FIELDS.map(({ key, labelKey, hintKey }) => (
            <div key={key}>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t(labelKey)}</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-lg font-body-lg placeholder:text-on-surface-variant/40"
                value={settings[key] || ''}
                onChange={(e) => update(key, e.target.value)}
                onBlur={(e) => save(key, e.target.value)}
              />
              {hintKey && <p className="font-label-sm text-label-sm text-on-surface-variant/40 mt-1">{t(hintKey)}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
