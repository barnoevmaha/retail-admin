import { useState, useEffect } from 'react'
import api from '../api/client'

const REASONS = ['inventory_count', 'correction', 'initial_balance']

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [reason, setReason] = useState('inventory_count')
  const [notes, setNotes] = useState('')
  const [barcode, setBarcode] = useState('')
  const [actualQty, setActualQty] = useState(0)
  const [msg, setMsg] = useState('')

  useEffect(() => { api.get('/adjustments/').then((r) => setAdjustments(r.data)).catch(() => {}) }, [])

  const loadDetail = async (id) => {
    setActiveId(id)
    const r = await api.get(`/adjustments/${id}`)
    setDetail(r.data)
    setMsg('')
  }

  const create = async () => {
    const r = await api.post('/adjustments/', { reason, notes: notes || null })
    setReason('inventory_count')
    setNotes('')
    loadDetail(r.data.id)
    api.get('/adjustments/').then((res) => setAdjustments(res.data))
  }

  const addItem = async () => {
    if (!barcode || !activeId) return
    try {
      const v = await api.get(`/variants/barcode/${barcode}`)
      await api.post(`/adjustments/${activeId}/items`, {
        variant_id: v.data.id,
        expected_quantity: v.data.quantity,
        actual_quantity: actualQty,
      })
      setBarcode('')
      setActualQty(0)
      setMsg(`Added ${v.data.barcode}: expected ${v.data.quantity} → actual ${actualQty}`)
      loadDetail(activeId)
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error')
    }
  }

  const confirm = async () => {
    if (!activeId) return
    const r = await api.post(`/adjustments/${activeId}/confirm`)
    setMsg(`Adjustment #${r.data.id} confirmed — ${r.data.items_count} items adjusted`)
    loadDetail(activeId)
    api.get('/adjustments/').then((res) => setAdjustments(res.data))
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Inventory Adjustments</h1>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-3">New Adjustment</h2>
          <select className="border p-2 rounded w-full mb-2" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
          <input type="text" placeholder="Notes" className="border p-2 rounded w-full mb-2"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button onClick={create} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">Create Adjustment</button>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Adjustments List</h2>
          {adjustments.map((a) => (
            <div key={a.id} onClick={() => loadDetail(a.id)}
              className={`flex justify-between py-2 px-2 border-b text-sm cursor-pointer rounded ${
                activeId === a.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}>
              <div>
                <span className="font-medium">#{a.id}</span>
                <span className="text-gray-500 ml-2">{a.reason.replace('_', ' ')}</span>
              </div>
              <div className="flex gap-3">
                <span className={`px-2 rounded text-xs font-medium ${
                  a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{a.status}</span>
                <span className="text-gray-500">{a.items_count} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">{detail ? `Adjustment #${detail.id}` : 'Select an adjustment'}</h2>
        {detail && (
          <div>
            {detail.status === 'draft' && (
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Scan barcode..." className="border p-2 rounded flex-1"
                    value={barcode} onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()} autoFocus />
                  <input type="number" placeholder="Actual" className="border p-2 rounded w-24"
                    value={actualQty} onChange={(e) => setActualQty(parseInt(e.target.value) || 0)} />
                  <button onClick={addItem} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Record</button>
                </div>
                {msg && <div className="text-sm text-gray-600">{msg}</div>}
              </div>
            )}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-bold mb-2">Items</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b"><th className="pb-2">SKU</th><th className="pb-2">Expected</th><th className="pb-2">Actual</th><th className="pb-2">Diff</th></tr></thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.barcode || `#${item.variant_id}`}</td>
                      <td className="py-2">{item.expected_quantity}</td>
                      <td className="py-2">{item.actual_quantity}</td>
                      <td className={`py-2 font-medium ${item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : ''}`}>
                        {item.difference > 0 ? `+${item.difference}` : item.difference}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {detail.items.length === 0 && <div className="text-gray-400 text-center py-4">No items</div>}
            </div>
            <div className="text-sm text-gray-600 mb-3">Reason: {detail.reason.replace('_', ' ')}</div>
            {detail.status === 'draft' && detail.items.length > 0 && (
              <button onClick={confirm}
                className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">Confirm Adjustment</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
