import { useState, useEffect } from 'react'
import api from '../api/client'

export default function InventoryHistory() {
  const [movements, setMovements] = useState([])
  const [operation, setOperation] = useState('')
  const [variantId, setVariantId] = useState('')

  const fetch = () => {
    const params = { limit: 100 }
    if (operation) params.operation = operation
    if (variantId) params.variant_id = variantId
    api.get('/inventory-history', { params }).then((r) => setMovements(r.data)).catch(() => {})
  }

  useEffect(() => { fetch() }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory History</h1>
      <div className="flex gap-4 mb-4">
        <input type="text" placeholder="Variant ID" value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="border rounded px-3 py-1 text-sm w-32" />
        <select value={operation} onChange={(e) => setOperation(e.target.value)} className="border rounded px-3 py-1 text-sm">
          <option value="">All Operations</option>
          {['receiving', 'sale', 'return', 'write_off', 'adjustment', 'transfer'].map((o) => (
            <option key={o} value={o}>{o.replace('_', ' ')}</option>
          ))}
        </select>
        <button onClick={fetch} className="bg-blue-600 text-white px-4 py-1 rounded text-sm">Search</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Product</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Operation</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3">By</th>
              <th className="p-3">Doc #</th>
              <th className="p-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3 whitespace-nowrap">{new Date(m.created_at).toLocaleString()}</td>
                <td className="p-3">{m.product_name || '-'}</td>
                <td className="p-3">{m.variant_sku || '-'}</td>
                <td className="p-3">
                  <span className={`font-medium ${m.operation === 'receiving' ? 'text-green-600' : m.operation === 'sale' ? 'text-red-600' : m.operation === 'return' ? 'text-blue-600' : m.operation === 'write_off' ? 'text-orange-600' : 'text-purple-600'}`}>
                    {m.operation.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                <td className="p-3">{m.warehouse_name || '-'}</td>
                <td className="p-3">{m.performed_by_name || '-'}</td>
                <td className="p-3">{m.document_number || '-'}</td>
                <td className="p-3 max-w-xs truncate">{m.reason || '-'}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr><td colSpan="9" className="p-3 text-center text-gray-400">No movements found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
