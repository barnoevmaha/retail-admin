import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Customers() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    api.get('/customers/').then((r) => setCustomers(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Purchases</th>
              <th className="p-3">Spent</th>
              <th className="p-3">Loyalty</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{c.first_name} {c.last_name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.total_purchases}</td>
                <td className="p-3">${parseFloat(c.total_spent).toFixed(2)}</td>
                <td className="p-3">{c.loyalty_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
