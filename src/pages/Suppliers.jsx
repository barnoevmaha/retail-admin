import { useState, useEffect } from 'react'
import api from '../api/client'

const EMPTY_FORM = { company_name: '', contact_person: '', phone: '', email: '', address: '', tax_number: '', notes: '' }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  const fetch = (q = '') => {
    const params = { limit: 100 }
    if (q) params.search = q
    api.get('/suppliers/', { params }).then((r) => { setSuppliers(r.data.items); setTotal(r.data.total) }).catch(() => {})
  }

  useEffect(() => { fetch() }, [])

  const add = async () => {
    if (!form.company_name) return
    try {
      await api.post('/suppliers/', form)
      setForm(EMPTY_FORM)
      fetch(search)
    } catch {}
  }

  const field = (key, label, required = false) => (
    <div>
      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">
        {label}{required && <span className="text-secondary"> *</span>}
      </label>
      <input
        type="text"
        className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
        placeholder={label}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          Suppliers <span className="text-secondary">({total})</span>
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage suppliers and their contact details.</p>
      </header>

      <div className="p-8 bg-surface-container-low border border-outline-variant">
        <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">Add Supplier</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 mb-6">
          {field('company_name', 'Company Name', true)}
          {field('contact_person', 'Contact Person')}
          {field('phone', 'Phone')}
          {field('email', 'Email')}
          {field('tax_number', 'Tax Number')}
          {field('address', 'Address')}
        </div>
        <div className="mb-6">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">Notes</label>
          <textarea
            rows="2"
            className="w-full bg-transparent border border-outline-variant focus:border-secondary outline-none p-3 text-body-md resize-none placeholder:text-on-surface-variant/40"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <button onClick={add} className="px-8 py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
          Add Supplier
        </button>
      </div>

      <div className="relative w-full md:w-96">
        <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input
          type="text"
          placeholder="Search suppliers..."
          className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 pl-8 font-body-md text-body-md placeholder:text-on-surface-variant/40"
          value={search}
          onChange={(e) => { setSearch(e.target.value); fetch(e.target.value) }}
        />
      </div>

      <div className="bg-surface-container-low border border-outline-variant">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant">
                {['Company', 'Contact', 'Phone', 'Email', 'Tax Number', 'Address'].map((h) => (
                  <th key={h} className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 font-body-md text-body-md text-primary font-medium">{s.company_name}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{s.contact_person || '—'}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{s.phone || '—'}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{s.email || '—'}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{s.tax_number || '—'}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{s.address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {suppliers.length === 0 && (
            <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">No suppliers found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
