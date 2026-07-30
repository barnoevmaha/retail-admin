import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function Customers() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    api.get('/customers/').then((r) => setCustomers(r.data)).catch(() => {})
  }, [])

  const toggleBlock = async (id) => {
    try {
      await api.put(`/customers/${id}/block`)
      setCustomers(customers.map((c) => c.id === id ? { ...c, is_blocked: !c.is_blocked } : c))
    } catch {}
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('customers.title')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left">
            <tr>
              <th className="p-3 dark:text-gray-300">{t('customers.name')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.email')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.phone')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.verified')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.last_login')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.orders')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.spent')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.loyalty')}</th>
              <th className="p-3 dark:text-gray-300">{t('customers.status')}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className={`border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${c.is_blocked ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                <td className="p-3 font-medium dark:text-gray-200">{c.first_name} {c.last_name}</td>
                <td className="p-3 dark:text-gray-300">{c.email || '—'}</td>
                <td className="p-3 dark:text-gray-300">{c.phone || '—'}</td>
                <td className="p-3 dark:text-gray-300">
                  {c.email_verified ? '✅ Email' : ''}
                  {c.email_verified && c.phone_verified ? '/' : ''}
                  {c.phone_verified ? '📱 Phone' : ''}
                  {!c.email_verified && !c.phone_verified ? '—' : ''}
                </td>
                <td className="p-3 dark:text-gray-300">{c.last_login ? new Date(c.last_login).toLocaleDateString() : '—'}</td>
                <td className="p-3 dark:text-gray-200">{c.total_purchases}</td>
                <td className="p-3 dark:text-gray-200">${parseFloat(c.total_spent).toFixed(2)}</td>
                <td className="p-3 dark:text-gray-200">{c.loyalty_level}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleBlock(c.id)}
                    className={`text-xs px-2 py-1 rounded ${
                      c.is_blocked ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {c.is_blocked ? t('customers.unblock') : t('customers.block')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
