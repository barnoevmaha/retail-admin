import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

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
      setMsg(`${t('returns.added')} ${itemQty} x ${v.data.barcode}`)
      loadDetail(activeId)
    } catch (err) {
      if (err.response?.status === 404) setMsg(t('pos.not_found'))
      else setMsg(t('toast.error') + ': ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const confirmReturn = async () => {
    if (!activeId) return
    const r = await api.post(`/returns/${activeId}/confirm`)
    setMsg(`${t('returns.confirmed')} #${r.data.id} — ${r.data.total_quantity} ${t('returns.items')}`)
    loadDetail(activeId)
    api.get('/returns/').then((res) => setReturns(res.data))
  }

  const cancel = async () => {
    if (!activeId) return
    await api.post(`/returns/${activeId}/cancel`)
    setMsg(t('returns.cancelled'))
    loadDetail(activeId)
    api.get('/returns/').then((res) => setReturns(res.data))
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('returns.title')}</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('returns.new')}</h2>
          <select className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full mb-2" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
            <option value="">{t('returns.select_order')}</option>
            {orders.map((o) => <option key={o.id} value={o.id}>#{o.id} — ${parseFloat(o.total_amount).toFixed(2)}</option>)}
          </select>
          <input type="text" placeholder={t('returns.reason')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full mb-2"
            value={reason} onChange={(e) => setReason(e.target.value)} />
          <button onClick={createReturn} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('returns.create')}</button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('returns.list')}</h2>
          {returns.map((r) => (
            <div key={r.id} onClick={() => loadDetail(r.id)}
              className={`flex justify-between py-2 px-2 border-b dark:border-gray-700 text-sm cursor-pointer rounded ${
                activeId === r.id ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              <div>
                <span className="font-medium dark:text-gray-200">#{r.id}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">{t('returns.order')} #{r.order_id}</span>
              </div>
              <div className="flex gap-3">
                <span className={`px-2 rounded text-xs font-medium ${
                  r.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                  r.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>{r.status}</span>
                <span className="text-gray-500 dark:text-gray-400">{r.items_count} {t('returns.items')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4 dark:text-white">{detail ? `${t('returns.return')} #${detail.id}` : t('returns.select')}</h2>
        {detail && (
          <div>
            {detail.status === 'draft' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
                <div className="flex gap-2">
                  <input type="text" placeholder={t('warehouse.scan_barcode')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1"
                    value={variantBarcode} onChange={(e) => setVariantBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()} autoFocus />
                  <input type="number" min="1" className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-20" value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)} />
                  <button onClick={addItem} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">{t('common.create')}</button>
                </div>
                {msg && <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{msg}</div>}
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
              <h3 className="font-bold mb-2 dark:text-white">{t('returns.items')}</h3>
              {detail.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
                  <span className="font-medium dark:text-gray-200">{item.barcode || `#${item.variant_id}`}</span>
                  <span className="dark:text-gray-200">x{item.quantity} @ ${parseFloat(item.price).toFixed(2)}</span>
                </div>
              ))}
              {detail.items.length === 0 && <div className="text-gray-400 dark:text-gray-500 text-center py-4">{t('returns.no_items')}</div>}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('returns.reason')}: {detail.reason || '—'} | {t('returns.order')}: #{detail.order_id}</div>
            {detail.status === 'draft' && detail.items.length > 0 && (
              <button onClick={confirmReturn}
                className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 mb-2">{t('returns.confirm_btn')}</button>
            )}
            {detail.status === 'draft' && (
              <button onClick={cancel}
                className="w-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 py-2 rounded hover:bg-red-200 dark:hover:bg-red-800">{t('common.cancel')}</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
