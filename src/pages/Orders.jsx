import { useState, useEffect } from 'react'
import api from '../api/client'

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
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">#{o.id}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{o.status}</span>
                </td>
                <td className="p-3">${parseFloat(o.total_amount).toFixed(2)}</td>
                <td className="p-3 text-gray-500">{o.payment_method || '-'}</td>
                <td className="p-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <select
                    className="border rounded p-1 text-xs"
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
