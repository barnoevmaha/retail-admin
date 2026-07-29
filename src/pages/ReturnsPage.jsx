import { useState, useEffect } from 'react'
import api from '../api/client'

export default function ReturnsPage() {
  const [returns, setReturns] = useState([])
  const [orders, setOrders] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')
  const [variantBarcode, setVariantBarcode] = useState('')
  const [itemQty, setItemQty] = useState(1)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/returns/').then((r) => setReturns(r.data)).catch(() => {})
    api.get('/orders/', { params: { limit: 50 } }).then((r) => setOrders(r.data.items || [])).catch(() => {})
  }, [])

  const loadDetail = async (id) => {
    setActiveId(id)
    const r = await api.get(`/returns/${id}`)
    setDetail(r.data)
    setMsg('')
  }

  const createReturn = async () => {
    if (!orderId) return
    const r = await api.post('/returns/', { order_id: parseInt(orderId), reason: reason || null })
    setOrderId('')
    setReason('')
    loadDetail(r.data.id)
    api.get('/returns/').then((res) => setReturns(res.data))
  }

  const addItem = async () => {
    if (!variantBarcode || !activeId) return
    try {
      const v = await api.get(`/variants/barcode/${variantBarcode}`)
      await api.post(`/returns/${activeId}/items`, { variant_id: v.data.id, quantity: itemQty })
      setVariantBarcode('')
      setItemQty(1)
      setMsg(`Added ${itemQty} x ${v.data.barcode}`)
      loadDetail(activeId)
    } catch (err) {
      if (err.response?.status === 404) setMsg('Variant not found')
      else setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const confirmReturn = async () => {
    if (!activeId) return
    const r = await api.post(`/returns/${activeId}/confirm`)
    setMsg(`Return #${r.data.id} confirmed — ${r.data.total_quantity} items returned`)
    loadDetail(activeId)
    api.get('/returns/').then((res) => setReturns(res.data))
  }

  const cancel = async () => {
    if (!activeId) return
    await api.post(`/returns/${activeId}/cancel`)
    setMsg('Return cancelled')
    loadDetail(activeId)
    api.get('/returns/').then((res) => setReturns(res.data))
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Returns</h1>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-3">New Return</h2>
          <select className="border p-2 rounded w-full mb-2" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
            <option value="">Select order</option>
            {orders.map((o) => <option key={o.id} value={o.id}>#{o.id} — ${parseFloat(o.total_amount).toFixed(2)}</option>)}
          </select>
          <input type="text" placeholder="Reason" className="border p-2 rounded w-full mb-2"
            value={reason} onChange={(e) => setReason(e.target.value)} />
          <button onClick={createReturn} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">Create Return</button>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Returns List</h2>
          {returns.map((r) => (
            <div key={r.id} onClick={() => loadDetail(r.id)}
              className={`flex justify-between py-2 px-2 border-b text-sm cursor-pointer rounded ${
                activeId === r.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}>
              <div>
                <span className="font-medium">#{r.id}</span>
                <span className="text-gray-500 ml-2">Order #{r.order_id}</span>
              </div>
              <div className="flex gap-3">
                <span className={`px-2 rounded text-xs font-medium ${
                  r.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  r.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{r.status}</span>
                <span className="text-gray-500">{r.items_count} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">{detail ? `Return #${detail.id}` : 'Select a return'}</h2>
        {detail && (
          <div>
            {detail.status === 'draft' && (
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Scan barcode..." className="border p-2 rounded flex-1"
                    value={variantBarcode} onChange={(e) => setVariantBarcode(e.target.value)}
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
                  <span>x{item.quantity} @ ${parseFloat(item.price).toFixed(2)}</span>
                </div>
              ))}
              {detail.items.length === 0 && <div className="text-gray-400 text-center py-4">No items</div>}
            </div>
            <div className="text-sm text-gray-600 mb-3">Reason: {detail.reason || '—'} | Order: #{detail.order_id}</div>
            {detail.status === 'draft' && detail.items.length > 0 && (
              <button onClick={confirmReturn}
                className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 mb-2">Confirm Return</button>
            )}
            {detail.status === 'draft' && (
              <button onClick={cancel}
                className="w-full bg-red-100 text-red-700 py-2 rounded hover:bg-red-200">Cancel</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
