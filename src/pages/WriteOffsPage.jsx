import { useState, useEffect } from 'react'
import api from '../api/client'

const REASONS = ['damaged', 'lost', 'expired', 'manual']

export default function WriteOffsPage() {
  const [writeoffs, setWriteoffs] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [reason, setReason] = useState('damaged')
  const [notes, setNotes] = useState('')
  const [barcode, setBarcode] = useState('')
  const [itemQty, setItemQty] = useState(1)
  const [msg, setMsg] = useState('')

  useEffect(() => { api.get('/writeoffs/').then((r) => setWriteoffs(r.data)).catch(() => {}) }, [])

  const loadDetail = async (id) => {
    setActiveId(id)
    const r = await api.get(`/writeoffs/${id}`)
    setDetail(r.data)
    setMsg('')
  }

  const create = async () => {
    const r = await api.post('/writeoffs/', { reason, notes: notes || null })
    setReason('damaged')
    setNotes('')
    loadDetail(r.data.id)
    api.get('/writeoffs/').then((res) => setWriteoffs(res.data))
  }

  const addItem = async () => {
    if (!barcode || !activeId) return
    try {
      const v = await api.get(`/variants/barcode/${barcode}`)
      await api.post(`/writeoffs/${activeId}/items`, { variant_id: v.data.id, quantity: itemQty })
      setBarcode('')
      setItemQty(1)
      setMsg(`Added ${itemQty} x ${v.data.barcode}`)
      loadDetail(activeId)
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error')
    }
  }

  const confirm = async () => {
    if (!activeId) return
    const r = await api.post(`/writeoffs/${activeId}/confirm`)
    setMsg(`Write-off #${r.data.id} confirmed — ${r.data.total_quantity} items`)
    loadDetail(activeId)
    api.get('/writeoffs/').then((res) => setWriteoffs(res.data))
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Write-Offs</h1>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-3">New Write-Off</h2>
          <select className="border p-2 rounded w-full mb-2" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input type="text" placeholder="Notes" className="border p-2 rounded w-full mb-2"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button onClick={create} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">Create Write-Off</button>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Write-Offs List</h2>
          {writeoffs.map((w) => (
            <div key={w.id} onClick={() => loadDetail(w.id)}
              className={`flex justify-between py-2 px-2 border-b text-sm cursor-pointer rounded ${
                activeId === w.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}>
              <div>
                <span className="font-medium">#{w.id}</span>
                <span className="text-gray-500 ml-2">{w.reason}</span>
              </div>
              <div className="flex gap-3">
                <span className={`px-2 rounded text-xs font-medium ${
                  w.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{w.status}</span>
                <span className="text-gray-500">{w.items_count} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">{detail ? `Write-Off #${detail.id}` : 'Select a write-off'}</h2>
        {detail && (
          <div>
            {detail.status === 'draft' && (
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Scan barcode..." className="border p-2 rounded flex-1"
                    value={barcode} onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()} autoFocus />
                  <input type="number" min="1" className="border p-2 rounded w-20" value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)} />
                  <button onClick={addItem} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Add</button>
                </div>
                {msg && <div className="mt-2 text-sm text-gray-600">{msg}</div>}
              </div>
            )}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-bold mb-2">Items</h3>
              {detail.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b text-sm">
                  <span className="font-medium">{item.barcode || `#${item.variant_id}`}</span>
                  <span className="text-red-600">-{item.quantity}</span>
                </div>
              ))}
              {detail.items.length === 0 && <div className="text-gray-400 text-center py-4">No items</div>}
            </div>
            <div className="text-sm text-gray-600 mb-3">Reason: {detail.reason} | {detail.notes || ''}</div>
            {detail.status === 'draft' && detail.items.length > 0 && (
              <button onClick={confirm}
                className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700">Confirm Write-Off</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
