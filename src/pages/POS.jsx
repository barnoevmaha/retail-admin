import { useState, useRef, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function POS() {
  const [barcode, setBarcode] = useState('')
  const [items, setItems] = useState([])
  const [customerPhone, setCustomerPhone] = useState('')
  const [customer, setCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [msg, setMsg] = useState('')
  const [suspendedSessions, setSuspendedSessions] = useState([])
  const [showSuspended, setShowSuspended] = useState(false)
  const [lastOrderId, setLastOrderId] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  const lookup = async (code) => {
    if (!code) return
    try {
      const r = await api.get(`/variants/barcode/${code}`)
      const v = r.data
      setItems((prev) => {
        const existing = prev.find((i) => i.id === v.id)
        if (existing) {
          return prev.map((i) => (i.id === v.id ? { ...i, qty: i.qty + 1 } : i))
        }
        return [...prev, { id: v.id, barcode: v.barcode, name: `${v.sku}`, size: v.size, color: v.color, price: parseFloat(v.selling_price), qty: 1 }]
      })
      setBarcode('')
      setMsg('')
    } catch {
      setMsg(t('pos.not_found'))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      lookup(barcode)
    }
  }

  const updateQty = (id, qty) => {
    if (qty < 1) { setItems((prev) => prev.filter((i) => i.id !== id)); return }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  }

  const lookupCustomer = async () => {
    if (!customerPhone) return
    try {
      const r = await api.get('/customers/', { params: { limit: 100 } })
      const found = r.data.find((c) => c.phone.includes(customerPhone))
      setCustomer(found || null)
    } catch { setCustomer(null) }
  }

  const completeSale = async () => {
    if (items.length === 0) return
    let customerId = customer?.id
    if (!customerId && customerPhone) {
      try {
        const r = await api.post('/customers/', { first_name: 'Walk-in', last_name: 'Customer', phone: customerPhone })
        customerId = r.data.id
        setCustomer(r.data)
      } catch {}
    }
    try {
      const r = await api.post('/checkout/', { payment_method: paymentMethod }, {
        headers: { 'X-Customer-Id': customerId || '', 'X-Session-Key': `pos-${Date.now()}` }
      })
      setLastOrderId(r.data.id)
      setMsg(`${t('pos.sale_complete')} #${r.data.id}`)
      setItems([])
      setCustomer(null)
      setCustomerPhone('')
      inputRef.current?.focus()
    } catch (err) {
      setMsg(t('toast.error') + ': ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const suspendSale = async () => {
    if (items.length === 0) return
    try {
      await api.post('/pos-sessions', {
        items: JSON.stringify(items),
        customer_id: customer?.id,
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        total,
      })
      setMsg(t('pos.suspended'))
      setItems([])
      setCustomer(null)
      setCustomerPhone('')
      loadSuspended()
      inputRef.current?.focus()
    } catch (err) {
      setMsg(t('toast.error') + ': ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const loadSuspended = async () => {
    try {
      const r = await api.get('/pos-sessions')
      setSuspendedSessions(r.data)
    } catch {}
  }

  const resumeSale = async (session) => {
    try {
      await api.put(`/pos-sessions/${session.id}/resume`)
      setItems(JSON.parse(session.items))
      setCustomerPhone(session.customer_phone)
      if (session.customer_id) {
        const r = await api.get('/customers/', { params: { limit: 100 } })
        const found = r.data.find((c) => c.id === session.customer_id)
        setCustomer(found || null)
      }
      setPaymentMethod(session.payment_method)
      setShowSuspended(false)
      loadSuspended()
      setMsg(`${t('pos.resumed')} ${new Date(session.created_at).toLocaleString()}`)
      inputRef.current?.focus()
    } catch (err) {
      setMsg(t('toast.error') + ': ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const cancelSale = async (sessionId) => {
    try {
      await api.put(`/pos-sessions/${sessionId}/cancel`)
      loadSuspended()
      setMsg(t('pos.cancelled'))
    } catch (err) {
      setMsg(t('toast.error') + ': ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const reprintReceipt = async () => {
    if (!lastOrderId) { setMsg(t('pos.no_receipt')); return }
    window.open(`/api/receipts/${lastOrderId}`, '_blank')
  }

  const toggleSuspended = () => {
    loadSuspended()
    setShowSuspended(!showSuspended)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('pos.title')}</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
            <input
              ref={inputRef}
              type="text"
              placeholder={t('pos.scan_placeholder')}
              className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-3 rounded w-full text-lg"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {msg && <div className="mt-2 text-sm text-red-600 dark:text-red-400">{msg}</div>}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
            <table className="w-full text-sm">
              <thead className="text-left border-b dark:border-gray-700">
                <tr>
                  <th className="pb-2 dark:text-gray-300">{t('pos.item')}</th>
                  <th className="pb-2 dark:text-gray-300">{t('pos.qty')}</th>
                  <th className="pb-2 dark:text-gray-300">{t('pos.price')}</th>
                  <th className="pb-2 dark:text-gray-300">{t('pos.total')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b dark:border-gray-700">
                    <td className="py-2">
                      <div className="font-medium dark:text-gray-200">{item.barcode}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{item.size} / {item.color}</div>
                    </td>
                    <td className="py-2">
                      <input type="number" min="1" className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-1 rounded w-16 text-center"
                        value={item.qty} onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)} />
                    </td>
                    <td className="py-2 dark:text-gray-200">${item.price.toFixed(2)}</td>
                    <td className="py-2 font-medium dark:text-gray-200">${(item.price * item.qty).toFixed(2)}</td>
                    <td className="py-2">
                      <button onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                        className="text-red-500 hover:text-red-700">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div className="text-gray-400 dark:text-gray-500 text-center py-8">{t('pos.no_items')}</div>}
          </div>

          <div className="flex gap-2 mt-2">
            <button onClick={() => { setItems([]); setCustomer(null); setCustomerPhone(''); setMsg(t('pos.cancelled')); inputRef.current?.focus() }}
              className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600">{t('pos.cancel_sale')}</button>
            <button onClick={suspendSale}
              className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600">{t('pos.suspend')}</button>
            <button onClick={toggleSuspended}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
              {showSuspended ? t('pos.hide_suspended') : `${t('pos.suspended')} (${suspendedSessions.length})`}
            </button>
            <button onClick={reprintReceipt}
              className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600">{t('pos.reprint')}</button>
          </div>

          {showSuspended && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 mt-2 p-2">
              <h3 className="font-bold text-sm mb-2 dark:text-gray-200">{t('pos.suspended_sales')}</h3>
              {suspendedSessions.length === 0 ? (
                <div className="text-gray-400 dark:text-gray-500 text-sm text-center py-2">{t('pos.no_suspended')}</div>
              ) : (
                suspendedSessions.map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-1 border-b dark:border-gray-700 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{new Date(s.created_at).toLocaleString()}</span>
                      <span className="ml-2 font-bold dark:text-gray-200">${s.total.toFixed(2)}</span>
                      <span className="ml-2 text-gray-400 dark:text-gray-500">{s.customer_name || 'Walk-in'}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => resumeSale(s)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">{t('pos.resume')}</button>
                      <button onClick={() => cancelSale(s.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">{t('common.cancel')}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
            <div className="text-lg font-bold mb-2 dark:text-white">{t('pos.customer')}</div>
            <input type="text" placeholder={t('pos.phone_placeholder')}
              className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full mb-2"
              value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
              onBlur={lookupCustomer} />
            {customer && <div className="text-sm text-green-600 dark:text-green-400">{customer.first_name} {customer.last_name}</div>}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
            <div className="text-lg font-bold mb-2 dark:text-white">{t('pos.payment')}</div>
            {['cash', 'card', 'bank_transfer'].map((m) => (
              <label key={m} className="flex items-center gap-2 py-1 text-sm dark:text-gray-200">
                <input type="radio" name="payment" value={m} checked={paymentMethod === m}
                  onChange={(e) => setPaymentMethod(e.target.value)} />
                {m.replace('_', ' ')}
              </label>
            ))}
          </div>

          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg shadow dark:shadow-gray-900/50 p-4">
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-1">{t('pos.total')}</div>
            <div className="text-3xl font-bold">${total.toFixed(2)}</div>
            <button onClick={completeSale}
              className="w-full mt-3 bg-green-500 text-white py-3 rounded text-lg font-bold hover:bg-green-600">
              {t('pos.complete')}
            </button>
          </div>

          {msg && <div className="mt-2 text-sm text-center p-2 rounded bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200">{msg}</div>}
        </div>
      </div>
    </div>
  )
}
