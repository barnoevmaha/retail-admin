import { useState, useEffect } from 'react'
import api from '../api/client'

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
    <div>
      <h1 className="text-2xl font-bold mb-6">Company Profile</h1>
      <div className="bg-white rounded-lg shadow p-4 max-w-xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            ['name', 'Company Name'],
            ['address', 'Address'],
            ['phone', 'Phone'],
            ['email', 'Email'],
            ['logo', 'Logo URL'],
            ['tin', 'TIN / Tax ID'],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input className="border p-2 rounded w-full" value={form[field] || ''}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-3">This information appears on all receipts.</p>
        <button onClick={save} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">Save</button>
        {msg && <span className="ml-3 text-sm text-green-600">{msg}</span>}
      </div>
    </div>
  )
}
