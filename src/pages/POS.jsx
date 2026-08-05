import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { fileUrl } from '../api/client'
import { t } from '../i18n'

const firstVariant = (p) => {
  const vs = p.variants || []
  return vs.find((v) => Number(v.quantity) > 0) || vs[0]
}

export default function POS() {
  const [barcode, setBarcode] = useState('')
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customer, setCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [msg, setMsg] = useState('')
  const [suspendedSessions, setSuspendedSessions] = useState([])
  const [showSuspended, setShowSuspended] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [orders, setOrders] = useState([])
  const [lastOrderId, setLastOrderId] = useState(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    api.get('/products/', { params: { limit: 50 } }).then((r) => setProducts(r.data.items)).catch(() => {})
  }, [])

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const categories = ['All', ...new Set(products.map((p) => p.category_name).filter(Boolean))]

  const addVariant = (v, name) => {
    if (!v) return
    setItems((prev) => {
      const existing = prev.find((i) => i.id === v.id)
      if (existing) return prev.map((i) => (i.id === v.id ? { ...i, qty: i.qty + 1 } : i))
      return [...prev, {
        id: v.id, barcode: v.barcode, name: name || v.sku, size: v.size, color: v.color,
        price: parseFloat(v.selling_price), qty: 1,
      }]
    })
  }

  const lookup = async (code) => {
    if (!code) return
    try {
      const r = await api.get(`/variants/barcode/${code}`)
      const v = r.data
      addVariant(v, v.sku)
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
      const sessionKey = `pos-${Date.now()}`
      await Promise.all(items.map((it) =>
        api.post('/cart/items', { variant_id: it.id, quantity: it.qty }, { headers: { 'X-Session-Key': sessionKey } })
      ))
      const r = await api.post('/checkout/', { payment_method: paymentMethod }, {
        headers: { 'X-Customer-Id': customerId || '', 'X-Session-Key': sessionKey }
      })
      await api.put(`/orders/${r.data.id}/status`, { status: 'confirmed' })
      setLastOrderId(r.data.id)
      setMsg(`${t('pos.sale_complete')} #${r.data.id}`)
      setItems([])
      setCustomer(null)
      setCustomerPhone('')
      inputRef.current?.focus()
    } catch (err) {
      setMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
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
      setMsg(t('pos.error_suspend', { detail: err.response?.data?.detail || t('common.unknown') }))
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
      setMsg(t('pos.error_resume', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const cancelSale = async (sessionId) => {
    try {
      await api.put(`/pos-sessions/${sessionId}/cancel`)
      loadSuspended()
      setMsg(t('pos.cancelled'))
    } catch (err) {
      setMsg(t('pos.error_cancel', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const reprintReceipt = async (orderId) => {
    const id = orderId || lastOrderId
    if (!id) { setMsg(t('pos.no_receipt')); return }
    window.open(`${api.defaults.baseURL}/receipts/${id}`, '_blank')
  }

  const toggleSuspended = () => {
    loadSuspended()
    setShowSuspended(!showSuspended)
  }

  const loadOrders = async () => {
    try {
      const r = await api.get('/orders/', { params: { limit: 10 } })
      setOrders((r.data.items || r.data || []).filter((o) => ['completed', 'pending', 'confirmed'].includes(o.status)))
    } catch {}
  }

  const toggleOrders = () => {
    loadOrders()
    setShowHistory(!showHistory)
  }

  const clearCart = () => {
    setItems([])
    setCustomer(null)
    setCustomerPhone('')
    setMsg('Sale cancelled')
    inputRef.current?.focus()
  }

  const shownProducts = products.filter((p) => category === 'All' || p.category_name === category)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Product Section */}
      <section className="flex-1 flex flex-col min-w-0 border border-outline-variant bg-background">
        <header className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              ref={inputRef}
              type="text"
              placeholder={t('pos.scan_placeholder')}
              className="w-full bg-transparent border-b border-outline-variant py-2 pl-8 focus:outline-none focus:border-secondary transition-all font-body-md text-body-md placeholder:text-on-surface-variant/40"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => inputRef.current?.focus()}
              className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-[4px] border border-outline-variant hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-secondary">barcode_scanner</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">{t('pos.scan_heading')}</span>
            </button>
            <div className="flex gap-2 font-label-sm text-label-sm">
              <span className="text-secondary">EN</span>
              <span className="text-outline-variant">|</span>
              <span className="text-on-surface-variant">RU</span>
              <span className="text-outline-variant">|</span>
              <span className="text-on-surface-variant">UZ</span>
            </div>
          </div>
        </header>

        <div className="px-6 py-4 flex gap-3 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-5 py-2 font-label-sm text-label-sm rounded-[4px] uppercase tracking-widest whitespace-nowrap transition-colors ${
                category === c
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:border-secondary'
              }`}
            >
              {c === 'All' ? t('pos.all_items') : c}
            </button>
          ))}
        </div>

        <div className="px-6 pb-8 flex-1 overflow-y-auto max-h-[calc(100vh-340px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {shownProducts.map((p) => {
              const v = firstVariant(p)
              const img = fileUrl(p.images?.[0]?.image_url || (typeof p.image_url === 'string' ? p.image_url : null))
              return (
                <div key={p.id} className="group cursor-pointer" onClick={() => { addVariant(v, p.name) }}>
                  <div className="relative aspect-[4/5] bg-surface-container overflow-hidden mb-3 border border-outline-variant/30">
                    {img ? (
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={img} alt={p.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant opacity-40">checkroom</span>
                      </div>
                    )}
                    {v && (
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <button
                          className="bg-secondary text-on-secondary px-8 py-3 font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                          onClick={(e) => { e.stopPropagation(); addVariant(v, p.name) }}
                        >
                          <span className="material-symbols-outlined">add</span>
                          {t('common.add')}
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="font-body-md text-body-md text-on-surface font-medium truncate">{p.name}</h3>
                  <p className="font-label-sm text-label-sm text-secondary mt-1">
                    {v ? `$${parseFloat(v.selling_price).toFixed(2)}` : '—'}
                  </p>
                </div>
              )
            })}
          </div>
          {shownProducts.length === 0 && (
            <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{t('pos.no_products')}</div>
          )}
        </div>
      </section>

      {/* Right: Cart Panel */}
      <section className="w-full md:w-5/12 flex flex-col bg-surface-container-low border border-outline-variant">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('pos.current_order')}</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-wider">{items.length} {t('common.items')}</p>
          </div>
          <button onClick={clearCart} className="w-10 h-10 flex items-center justify-center border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">delete_sweep</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[calc(100vh-420px)]">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 group">
              <div className="w-16 h-20 bg-surface-container overflow-hidden border border-outline-variant flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant opacity-40">checkroom</span>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between gap-2">
                    <h4 className="font-body-md text-body-md text-on-surface font-medium truncate">{item.name}</h4>
                    <p className="font-body-md text-body-md text-on-surface whitespace-nowrap">${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{item.barcode}{item.size ? ` · ${item.size}` : ''}{item.color ? ` / ${item.color}` : ''}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="font-body-md text-body-md w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                  <button onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))} className="text-on-surface-variant/40 hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="py-12 text-center font-body-md text-body-md text-on-surface-variant">{t('pos.no_items')}</div>
          )}
        </div>

        {showSuspended && (
          <div className="p-4 border-t border-outline-variant bg-surface-container space-y-2 max-h-48 overflow-y-auto">
            <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest mb-2">{t('pos.suspended_sales')}</h3>
            {suspendedSessions.length === 0 ? (
              <div className="text-on-surface-variant text-sm text-center py-2">{t('pos.no_suspended')}</div>
            ) : (
              suspendedSessions.map((s) => (
                <div key={s.id} className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 py-1 border-b border-outline-variant/30 text-sm">
                  <div className="flex flex-wrap items-center gap-x-2 min-w-0">
                    <span className="text-on-surface-variant text-xs whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</span>
                    <span className="font-bold text-on-surface">${s.total.toFixed(2)}</span>
                    <span className="text-on-surface-variant text-xs">{s.customer_name || t('pos.walk_in')}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => resumeSale(s)} className="px-2 py-1 border border-secondary/40 text-secondary text-xs hover:bg-secondary hover:text-on-secondary transition-colors">{t('pos.resume')}</button>
                    <button onClick={() => cancelSale(s.id)} className="px-2 py-1 border border-error/40 text-error text-xs hover:bg-error hover:text-on-error transition-colors">{t('common.cancel')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showHistory && (
          <div className="p-4 border-t border-outline-variant bg-surface-container space-y-2 max-h-48 overflow-y-auto">
            <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest mb-2">{t('pos.history')}</h3>
            {orders.length === 0 ? (
              <div className="text-on-surface-variant text-sm text-center py-2">{t('pos.no_orders')}</div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 py-1 border-b border-outline-variant/30 text-sm">
                  <div className="flex flex-wrap items-center gap-x-2 min-w-0">
                    <span className="text-on-surface-variant text-xs whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</span>
                    <span className="font-bold text-on-surface">#{o.id}</span>
                    <span className="font-bold text-on-surface">${Number(o.total_amount).toFixed(2)}</span>
                    <span className="text-on-surface-variant text-xs">{o.payment_method}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => reprintReceipt(o.id)} className="px-2 py-1 border border-outline-variant text-on-surface-variant text-xs hover:border-secondary hover:text-secondary transition-colors">{t('pos.reprint')}</button>
                    <button onClick={() => navigate('/returns', { state: { orderId: o.id } })} className="px-2 py-1 border border-error/40 text-error text-xs hover:bg-error hover:text-on-error transition-colors">{t('pos.return')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="p-6 bg-surface-container space-y-5">
          {msg && <div className="text-sm text-secondary">{msg}</div>}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant">person_search</span>
            <input
              type="text"
              placeholder={t('pos.phone_placeholder')}
              className="w-full bg-transparent border-b border-outline-variant py-2 pl-8 focus:outline-none focus:border-secondary transition-all font-body-md text-body-md placeholder:text-on-surface-variant/40"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onBlur={lookupCustomer}
            />
            {customer && <p className="text-xs text-secondary mt-1">{customer.first_name} {customer.last_name}</p>}
          </div>

          <div className="flex items-center justify-between gap-2">
            {['cash', 'card', 'bank_transfer'].map((m) => (
              <label key={m} className={`flex-1 text-center px-2 py-2 border font-label-sm text-label-sm uppercase tracking-widest cursor-pointer transition-colors ${paymentMethod === m ? 'border-secondary text-secondary' : 'border-outline-variant text-on-surface-variant hover:border-secondary'}`}>
                <input type="radio" name="payment" value={m} checked={paymentMethod === m} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                {t('pos.payment_' + m)}
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-on-surface-variant font-body-md text-body-md">
              <span>{t('pos.subtotal')}</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface font-headline-sm text-headline-sm pt-2 border-t border-outline-variant">
              <span>{t('pos.total')}</span>
              <span className="text-secondary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={toggleSuspended} className="py-3 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:border-secondary transition-all">
              {showSuspended ? t('pos.hide') : t('pos.hold', { count: suspendedSessions.length })}
            </button>
            <button onClick={suspendSale} className="py-3 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:border-secondary transition-all">
              {t('pos.suspend')}
            </button>
          </div>
          <button onClick={toggleOrders} className="w-full py-3 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:border-secondary transition-all">
            {t('pos.history')} ({orders.length})
          </button>
          <button onClick={reprintReceipt} className="w-full py-3 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:border-secondary transition-all">
            {t('pos.reprint')}
          </button>
          <button onClick={completeSale} className="w-full bg-secondary text-on-secondary py-5 font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">payments</span>
            {t('pos.charge', { total: `$${total.toFixed(2)}` })}
          </button>
        </div>
      </section>
    </div>
  )
}
