import { useState, useEffect } from 'react'
import api from '../api/client'

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
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Last Login</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Spent</th>
              <th className="p-3">Loyalty</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className={`border-t hover:bg-gray-50 ${c.is_blocked ? 'text-gray-400' : ''}`}>
                <td className="p-3 font-medium">{c.first_name} {c.last_name}</td>
                <td className="p-3">{c.email || '—'}</td>
                <td className="p-3">{c.phone || '—'}</td>
                <td className="p-3">
                  {c.email_verified ? '✅ Email' : ''}
                  {c.email_verified && c.phone_verified ? '/' : ''}
                  {c.phone_verified ? '📱 Phone' : ''}
                  {!c.email_verified && !c.phone_verified ? '—' : ''}
                </td>
                <td className="p-3">{c.last_login ? new Date(c.last_login).toLocaleDateString() : '—'}</td>
                <td className="p-3">{c.total_purchases}</td>
                <td className="p-3">${parseFloat(c.total_spent).toFixed(2)}</td>
                <td className="p-3">{c.loyalty_level}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleBlock(c.id)}
                    className={`text-xs px-2 py-1 rounded ${
                      c.is_blocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {c.is_blocked ? 'Unblock' : 'Block'}
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
