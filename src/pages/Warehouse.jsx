import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Warehouse() {
  const [barcode, setBarcode] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [variant, setVariant] = useState(null)
  const [movements, setMovements] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => { api.get('/warehouse/movements', { params: { limit: 20 } }).then((r) => setMovements(r.data)) }, [])

  const lookupBarcode = async () => {
    if (!barcode) return
    try {
      const r = await api.get(`/variants/barcode/${barcode}`)
      setVariant(r.data)
      setMsg('')
    } catch {
      setVariant(null)
      setMsg('Variant not found. Create it in Products first.')
    }
  }

  const receive = async () => {
    if (!variant) return
    await api.post('/warehouse/receive', { variant_id: variant.id, quantity, operation: 'receiving' })
    setMsg(`Received ${quantity} x ${variant.barcode}`)
    setQuantity(1)
    setBarcode('')
    setVariant(null)
    api.get('/warehouse/movements', { params: { limit: 20 } }).then((r) => setMovements(r.data))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Warehouse</h1>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-bold mb-3">Receive Stock</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text" placeholder="Scan or enter barcode..."
            className="border p-2 rounded flex-1"
            value={barcode} onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()}
            autoFocus
          />
          <button onClick={lookupBarcode} className="bg-gray-200 px-4 rounded hover:bg-gray-300">Lookup</button>
        </div>
        {variant && (
          <div className="bg-green-50 p-3 rounded mb-3 text-sm">
            <strong>{variant.barcode}</strong> — {variant.sku} | Qty: {variant.quantity}
          </div>
        )}
        {variant && (
          <div className="flex gap-2">
            <input type="number" min="1" className="border p-2 rounded w-24" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
            <button onClick={receive} className="bg-green-600 text-white px-4 rounded hover:bg-green-700">Receive</button>
          </div>
        )}
        {msg && <div className="mt-2 text-sm text-gray-600">{msg}</div>}
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold mb-3">Recent Movements</h2>
        {movements.map((m) => (
          <div key={m.id} className="flex justify-between py-2 border-b text-sm">
            <span>{m.operation}</span>
            <span className="font-medium">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span>
            <span className="text-gray-500">Variant #{m.variant_id}</span>
            <span className="text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
