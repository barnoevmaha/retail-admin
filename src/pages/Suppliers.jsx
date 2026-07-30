import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

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
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('suppliers.title')} ({total})</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-6">
        <h2 className="font-bold mb-3 dark:text-white">{t('suppliers.add')}</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <input placeholder={t('suppliers.company_name') + ' *'} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded"
            value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          <input placeholder={t('suppliers.contact_person')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded"
            value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <input placeholder={t('customers.phone')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Email" className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder={t('suppliers.tax_number')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded"
            value={form.tax_number} onChange={(e) => setForm({ ...form, tax_number: e.target.value })} />
          <input placeholder={t('suppliers.address')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded"
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <textarea placeholder={t('suppliers.notes')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full mb-3"
          value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button onClick={add} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('suppliers.add')}</button>
      </div>
      <div className="mb-4">
        <input placeholder={t('common.search')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-64"
          value={search} onChange={(e) => { setSearch(e.target.value); fetch(e.target.value) }} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left">
            <tr>
              <th className="p-3 dark:text-gray-300">{t('suppliers.company_name')}</th>
              <th className="p-3 dark:text-gray-300">{t('suppliers.contact_person')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.phone')}</th>
              <th className="p-3 dark:text-gray-300">Email</th>
              <th className="p-3 dark:text-gray-300">{t('suppliers.tax_number')}</th>
              <th className="p-3 dark:text-gray-300">{t('suppliers.address')}</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 font-medium dark:text-gray-200">{s.company_name}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{s.contact_person || '-'}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{s.phone || '-'}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{s.email || '-'}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{s.tax_number || '-'}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{s.address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
