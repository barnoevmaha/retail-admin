import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ company_name: '', contact_person: '', phone: '', email: '', address: '', tax_number: '', notes: '' })

  const fetch = (q = '') => {
    const params = { limit: 100 }
    if (q) params.search = q
    api.get('/suppliers/', { params }).then((r) => { setSuppliers(r.data.items); setTotal(r.data.total) }).catch(() => {})
  }

  useEffect(() => { fetch() }, [])

  const add = async () => {
    if (!form.company_name) return
    await api.post('/suppliers/', form)
    setForm({ company_name: '', contact_person: '', phone: '', email: '', address: '', tax_number: '', notes: '' })
    fetch(search)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Suppliers ({total})</h1>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-bold mb-3">Add Supplier</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <input placeholder="Company name *" className="border p-2 rounded"
            value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          <input placeholder="Contact person" className="border p-2 rounded"
            value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <input placeholder="Phone" className="border p-2 rounded"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Email" className="border p-2 rounded"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Tax number" className="border p-2 rounded"
            value={form.tax_number} onChange={(e) => setForm({ ...form, tax_number: e.target.value })} />
          <input placeholder="Address" className="border p-2 rounded"
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <textarea placeholder="Notes" className="border p-2 rounded w-full mb-3"
          value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button onClick={add} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">Add Supplier</button>
      </div>
      <div className="mb-4">
        <input placeholder="Search suppliers..." className="border p-2 rounded w-64"
          value={search} onChange={(e) => { setSearch(e.target.value); fetch(e.target.value) }} />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Company</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Tax #</th>
              <th className="p-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{s.company_name}</td>
                <td className="p-3 text-gray-500">{s.contact_person || '-'}</td>
                <td className="p-3 text-gray-500">{s.phone || '-'}</td>
                <td className="p-3 text-gray-500">{s.email || '-'}</td>
                <td className="p-3 text-gray-500">{s.tax_number || '-'}</td>
                <td className="p-3 text-gray-500">{s.address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
