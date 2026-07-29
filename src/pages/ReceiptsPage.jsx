import { useState, useEffect } from 'react'
import api from '../api/client'

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([])

  useEffect(() => {
    api.get('/receipts/history', { params: { limit: 100 } }).then((r) => setReceipts(r.data)).catch(() => {})
  }, [])

  const printReceipt = (id) => window.open(`/api/receipts/${id}`, '_blank')
  const downloadReceipt = (id) => window.open(`/api/receipts/${id}/download`, '_blank')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Receipt History</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Receipt #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Items</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">#{r.id}</td>
                <td className="p-3 text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3 font-bold">${r.total.toFixed(2)}</td>
                <td className="p-3">{r.payment_method || '-'}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">{r.item_count}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => printReceipt(r.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">View</button>
                  <button onClick={() => downloadReceipt(r.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600">Download</button>
                </td>
              </tr>
            ))}
            {receipts.length === 0 && (
              <tr><td colSpan="7" className="p-3 text-center text-gray-400">No receipts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
