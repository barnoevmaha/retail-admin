import { useState, useEffect } from 'react'
import api from '../api/client'

export default function ReceivingPage() {
  const [receivings, setReceivings] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [startForm, setStartForm] = useState({ supplier_id: '', invoice_number: '', notes: '' })
  const [activeId, setActiveId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [barcode, setBarcode] = useState('')
  const [itemQty, setItemQty] = useState(1)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/receiving/').then((r) => setReceivings(r.data)).catch(() => {})
    api.get('/suppliers/').then((r) => setSuppliers(r.data)).catch(() => {})
  }, [])

  const loadDetail = async (id) => {
    setActiveId(id)
    const r = await api.get(`/receiving/${id}`)
    setDetail(r.data)
    setMsg('')
  }

  const startReceiving = async () => {
    const body = {
      supplier_id: startForm.supplier_id ? parseInt(startForm.supplier_id) : null,
      invoice_number: startForm.invoice_number || null,
      notes: startForm.notes || null,
    }
    const r = await api.post('/receiving/start', body)
    setStartForm({ supplier_id: '', invoice_number: '', notes: '' })
    loadDetail(r.data.id)
    api.get('/receiving/').then((res) => setReceivings(res.data))
  }

  const addByBarcode = async () => {
    if (!barcode || !activeId) return
    try {
      const r = await api.post(`/receiving/${activeId}/add-by-barcode`, {
        barcode, quantity: itemQty, purchase_price: 0,
      })
      setBarcode('')
      setItemQty(1)
      setMsg(`Added ${r.data.quantity} x ${r.data.barcode}`)
      loadDetail(activeId)
    } catch (err) {
      if (err.response?.status === 404) {
        setMsg(`Barcode "${barcode}" not found. Create the variant first via Products page.`)
      } else {
        setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
      }
    }
  }

  const confirm = async () => {
    if (!activeId) return
    const r = await api.post(`/receiving/${activeId}/confirm`)
    setMsg(`Receiving #${r.data.id} confirmed — ${r.data.total_quantity} items received`)
    loadDetail(activeId)
    api.get('/receiving/').then((res) => setReceivings(res.data))
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Receiving</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-3">Start New Receiving</h2>
          <select className="border p-2 rounded w-full mb-2"
            value={startForm.supplier_id} onChange={(e) => setStartForm({ ...startForm, supplier_id: e.target.value })}>
            <option value="">Select supplier</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.company_name}</option>)}
          </select>
          <input type="text" placeholder="Invoice number" className="border p-2 rounded w-full mb-2"
            value={startForm.invoice_number} onChange={(e) => setStartForm({ ...startForm, invoice_number: e.target.value })} />
          <input type="text" placeholder="Notes" className="border p-2 rounded w-full mb-2"
            value={startForm.notes} onChange={(e) => setStartForm({ ...startForm, notes: e.target.value })} />
          <button onClick={startReceiving} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">Start Receiving</button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Recent Receivings</h2>
          {receivings.map((r) => (
            <div key={r.id}
              onClick={() => loadDetail(r.id)}
              className={`flex justify-between py-2 px-2 border-b text-sm cursor-pointer rounded ${
                activeId === r.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}>
              <div>
                <span className="font-medium">#{r.id}</span>
                <span className="text-gray-500 ml-2">{r.supplier_name || 'No supplier'}</span>
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
        <h2 className="text-xl font-bold mb-4">
          {detail ? `Receiving #${detail.id}` : 'Select a receiving'}
        </h2>

        {detail && (
          <div>
            {detail.status === 'draft' && (
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Scan barcode..." className="border p-2 rounded flex-1"
                    value={barcode} onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addByBarcode()} autoFocus />
                  <input type="number" min="1" className="border p-2 rounded w-20"
                    value={itemQty} onChange={(e) => setItemQty(parseInt(e.target.value) || 1)} />
                  <button onClick={addByBarcode} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Add</button>
                </div>
                {msg && <div className="text-sm text-gray-600 mb-2">{msg}</div>}
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-bold mb-2">Items</h3>
              {detail.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b text-sm">
                  <div>
                    <span className="font-medium">{item.barcode || `#${item.variant_id}`}</span>
                    <span className="text-gray-500 ml-2">SKU: {item.sku}</span>
                  </div>
                  <div>
                    <span>x{item.quantity}</span>
                    <span className="text-gray-500 ml-2">@ ${parseFloat(item.purchase_price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {detail.items.length === 0 && <div className="text-gray-400 text-center py-4">No items added yet</div>}
            </div>

            <div className="flex gap-3">
              <div className="bg-gray-100 rounded-lg p-3 flex-1 text-sm">
                <span className="text-gray-500">Supplier:</span>
                <div className="font-medium">{detail.supplier_name || '—'}</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 flex-1 text-sm">
                <span className="text-gray-500">Invoice:</span>
                <div className="font-medium">{detail.invoice_number || '—'}</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 flex-1 text-sm">
                <span className="text-gray-500">Status:</span>
                <div className="font-medium">{detail.status}</div>
              </div>
            </div>

            {detail.status === 'draft' && detail.items.length > 0 && (
              <button onClick={confirm}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded font-bold text-lg hover:bg-green-700">
                Confirm Receiving
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
