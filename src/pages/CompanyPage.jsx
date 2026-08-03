import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

const FIELDS = [
  ['name', 'company.name'],
  ['address', 'company.address'],
  ['phone', 'company.phone'],
  ['email', 'company.email'],
  ['logo', 'company.logo'],
  ['tin', 'company.tin'],
]

export default function CompanyPage() {
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', logo: '', tin: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/company').then((r) => {
      if (r.data && r.data.id) setForm(r.data)
    }).catch(() => {})
  }, [])

  const save = async () => {
    try {
      await api.put('/company', form)
      setMsg(t('common.success'))
      setTimeout(() => setMsg(''), 2000)
    } catch (err) {
      setMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          {t('company.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('company.subtitle')}</p>
      </header>

      <div className="p-8 bg-surface-container-low border border-outline-variant max-w-2xl">
        <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-8">{t('company.details')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
          {FIELDS.map(([key, labelKey]) => (
            <div key={key}>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t(labelKey)}</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-lg font-body-lg placeholder:text-on-surface-variant/40"
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant/50 mb-8">{t('company.receipt_hint')}</p>
        <button onClick={save} className="px-8 py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
          {t('company.save')}
        </button>
        {msg && <span className="ml-4 text-sm text-secondary">{msg}</span>}
      </div>
    </div>
  )
}
