import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function Orders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.get('/orders/').then((r) => setOrders(r.data.items)).catch(() => {})
  }, [])

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status })
    api.get('/orders/').then((r) => setOrders(r.data.items))
  }

  const statuses = ['pending', 'confirmed', 'packing', 'ready', 'delivered', 'cancelled']

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('orders.title')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left">
            <tr>
              <th className="p-3 dark:text-gray-300">#</th>
              <th className="p-3 dark:text-gray-300">{t('orders.status')}</th>
              <th className="p-3 dark:text-gray-300">{t('orders.total')}</th>
              <th className="p-3 dark:text-gray-300">{t('orders.payment')}</th>
              <th className="p-3 dark:text-gray-300">{t('orders.date')}</th>
              <th className="p-3 dark:text-gray-300">{t('orders.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 font-medium dark:text-gray-200">#{o.id}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    o.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                    o.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                    'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                  }`}>{o.status}</span>
                </td>
                <td className="p-3 dark:text-gray-200">${parseFloat(o.total_amount).toFixed(2)}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{o.payment_method || '-'}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <select
                    className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded p-1 text-xs"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
