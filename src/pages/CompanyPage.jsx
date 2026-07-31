import { useState, useEffect } from 'react'
import api from '../api/client'

const FIELDS = [
  ['name', 'Company Name'],
  ['address', 'Address'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['logo', 'Logo URL'],
  ['tin', 'TIN / Tax ID'],
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
      setMsg('Saved!')
      setTimeout(() => setMsg(''), 2000)
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          Company
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Company details shown on receipts and documents.</p>
      </header>

      <div className="p-8 bg-surface-container-low border border-outline-variant max-w-2xl">
        <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-8">Company Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
          {FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{label}</label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-lg font-body-lg placeholder:text-on-surface-variant/40"
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant/50 mb-8">These details appear on printed receipts and generated documents.</p>
        <button onClick={save} className="px-8 py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
          Save
        </button>
        {msg && <span className="ml-4 text-sm text-secondary">{msg}</span>}
      </div>
    </div>
  )
}
