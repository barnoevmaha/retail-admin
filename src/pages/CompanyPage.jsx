import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

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
      setMsg(t('common.success') + '!')
      setTimeout(() => setMsg(''), 2000)
    } catch (err) {
      setMsg(t('toast.error') + ': ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('company.title')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 max-w-xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            ['name', 'company.name'],
            ['address', 'company.address'],
            ['phone', 'company.phone'],
            ['email', 'company.email'],
            ['logo', 'company.logo'],
            ['tin', 'company.tin'],
          ].map(([field, labelKey]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t(labelKey)}</label>
              <input className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full" value={form[field] || ''}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('company.receipt_hint')}</p>
        <button onClick={save} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('common.save')}</button>
        {msg && <span className="ml-3 text-sm text-green-600 dark:text-green-400">{msg}</span>}
      </div>
    </div>
  )
}
