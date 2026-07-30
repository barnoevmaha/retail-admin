import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

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
      setMsg(t('warehouse.not_found'))
    }
  }

  const receive = async () => {
    if (!variant) return
    await api.post('/warehouse/receive', { variant_id: variant.id, quantity, operation: 'receiving' })
    setMsg(`${t('warehouse.received')} ${quantity} x ${variant.barcode}`)
    setQuantity(1)
    setBarcode('')
    setVariant(null)
    api.get('/warehouse/movements', { params: { limit: 20 } }).then((r) => setMovements(r.data))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('warehouse.title')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-6">
        <h2 className="font-bold mb-3 dark:text-white">{t('warehouse.receive_stock')}</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text" placeholder={t('warehouse.scan_barcode')}
            className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1"
            value={barcode} onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()}
            autoFocus
          />
          <button onClick={lookupBarcode} className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-4 rounded hover:bg-gray-300 dark:hover:bg-gray-600">{t('warehouse.lookup')}</button>
        </div>
        {variant && (
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded mb-3 text-sm dark:text-green-200">
            <strong>{variant.barcode}</strong> — {variant.sku} | {t('warehouse.qty')}: {variant.quantity}
          </div>
        )}
        {variant && (
          <div className="flex gap-2">
            <input type="number" min="1" className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-24" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
            <button onClick={receive} className="bg-green-600 text-white px-4 rounded hover:bg-green-700">{t('warehouse.receive')}</button>
          </div>
        )}
        {msg && <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{msg}</div>}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
        <h2 className="font-bold mb-3 dark:text-white">{t('warehouse.recent_movements')}</h2>
        {movements.map((m) => (
          <div key={m.id} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
            <span className="dark:text-gray-200">{m.operation}</span>
            <span className="font-medium dark:text-gray-200">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span>
            <span className="text-gray-500 dark:text-gray-400">{t('dashboard.variant')} #{m.variant_id}</span>
            <span className="text-gray-500 dark:text-gray-400">{new Date(m.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
