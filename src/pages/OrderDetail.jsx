import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import { t } from '../i18n'

// ponytail: mock fallback until GET /orders/{id} exists on the backend — delete this block once live
const MOCK = {
  id: 92,
  created_at: new Date().toISOString(),
  status: 'confirmed',
  payment_method: 'card',
  total_amount: 1119,
  customer: { first_name: 'Elias', last_name: 'Thorne', email: 'elias@thorne.com', phone: '+44 20 7946 0123', address: '12 Savile Row, London' },
  items: [{ name: 'Merino Wool Overcoat', sku: 'MWO-48-CH', qty: 1, price: 895 }],
  shipping: 45,
  tax: 179,
  payment_label: 'Amex Platinum',
  payment_status: 'AUTHORIZED',
  delivery: ['Elias Thorne', '12 Savile Row', 'Mayfair, London W1S 3PQ', 'United Kingdom'],
  notes: 'Signature required on delivery. Client requested double-boxed protective shipping for high-value garment.',
}

const STATUSES = ['pending', 'confirmed', 'packing', 'ready', 'delivered', 'cancelled']
const NEXT = { pending: 'confirmed', confirmed: 'packing', packing: 'ready', ready: 'delivered' }

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch(() => setOrder({ ...MOCK, id: Number(id) }))
  }
  useEffect(load, [id])

  if (!order) {
    return <div className="py-24 text-center font-body-md text-body-md text-on-surface-variant">Loading order...</div>
  }

  const customer = order.customer || { first_name: order.customer_name || 'Walk-in', last_name: '', email: '', phone: '', address: '' }
  const items = (order.items || []).map((i) => ({
    name: i.name || i.product_name || 'Product',
    sku: i.sku || i.barcode || '',
    qty: i.quantity ?? i.qty ?? 1,
    price: parseFloat(i.price ?? i.selling_price ?? 0),
  }))
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const shipping = order.shipping ?? 0
  const tax = order.tax ?? 0
  const total = order.total_amount ?? subtotal + shipping + tax
  const statusIdx = STATUSES.indexOf(order.status)

  const updateStatus = async (status) => {
    if (busy) return
    setBusy(true)
    try {
      await api.put(`/orders/${order.id}/status`, { status })
      setOrder({ ...order, status })
      setMsg(status === 'cancelled' ? 'Order cancelled.' : 'Order processed.')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
    } finally {
      setBusy(false)
    }
  }

  const cancel = () => {
    if (window.confirm(`Cancel order #${order.id}?`)) updateStatus('cancelled')
  }

  const timeline = [
    { label: 'Order Created', desc: 'System generated order via E-commerce gateway.', done: true, active: false },
    { label: 'Processing', desc: 'Inventory check and quality assurance inspection initiated.', done: statusIdx >= 1, active: statusIdx === 1 },
    { label: 'Fulfillment', desc: 'Scheduled for professional packaging and dispatch.', done: statusIdx >= 3, active: statusIdx === 3 || statusIdx === 2 },
  ]

  return (
    <div className="flex flex-col">
      {/* Sticky sub-header */}
      <section className="sticky top-topbar-height bg-background/90 backdrop-blur-md z-30 px-margin-mobile md:px-margin-desktop py-6 border-b border-outline-variant/20 -mx-margin-mobile md:-mx-margin-desktop mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">
              <Link to="/orders" className="hover:text-secondary transition-colors">Sales</Link>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <Link to="/orders" className="hover:text-secondary transition-colors">Orders</Link>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-on-surface">#{order.id}</span>
            </nav>
            <h2 className="font-headline-md text-headline-md text-primary tracking-tight">Order #{order.id}</h2>
          </div>
          <div className="flex items-center gap-4">
            {msg && <span className="font-label-sm text-label-sm text-secondary">{msg}</span>}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                onClick={cancel}
                disabled={busy}
                className="px-6 py-2.5 font-label-sm text-label-sm border border-outline-variant text-on-surface hover:bg-surface-container-high transition-all active:opacity-90 disabled:opacity-50 uppercase tracking-widest"
              >
                Cancel
              </button>
            )}
            {NEXT[order.status] && (
              <button
                onClick={() => updateStatus(NEXT[order.status])}
                disabled={busy}
                className="px-8 py-2.5 font-label-sm text-label-sm bg-secondary text-on-secondary font-bold hover:opacity-90 transition-all active:opacity-90 disabled:opacity-50 uppercase tracking-widest"
              >
                Process Order
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-gutter gap-6 lg:gap-gutter">
        {/* Left: Order Content */}
        <div className="col-span-12 lg:col-span-7 space-y-12">
          {/* Customer Card */}
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">person</span>
            </div>
            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.2em] mb-6">Customer Profile</h3>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant shrink-0">
                <span className="material-symbols-outlined text-3xl text-on-secondary-container">person</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 flex-grow">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{t('common.full_name')}</p>
                  <p className="font-medium text-lg text-primary">{customer.first_name} {customer.last_name}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{t('common.email')}</p>
                  <p className="font-body-md text-body-md text-on-surface">{customer.email || '—'}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{t('common.phone')}</p>
                  <p className="font-body-md text-body-md text-on-surface">{customer.phone || '—'}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Address</p>
                  <p className="font-body-md text-body-md text-on-surface">{customer.address || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-6">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.2em]">Order Content</h3>
            <div className="overflow-hidden border border-outline-variant/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Product Details</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-center">Qty</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {items.map((i, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 aspect-[3/4] bg-surface-container-highest border border-outline-variant overflow-hidden group-hover:border-secondary transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant opacity-40">checkroom</span>
                          </div>
                          <div>
                            <p className="font-medium text-primary text-lg">{i.name}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">SKU: {i.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center font-medium text-on-surface">{i.qty}</td>
                      <td className="px-6 py-6 text-right font-medium text-lg text-primary">${i.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && (
                <div className="py-12 text-center font-body-md text-body-md text-on-surface-variant/60">No items on this order.</div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.2em]">Activity Timeline</h3>
            {order.status === 'cancelled' ? (
              <div className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
                <div className="relative">
                  <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-error ring-4 ring-background"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-error">Cancelled</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">This order was cancelled.</p>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
                {timeline.map((s, i) => (
                  <div key={s.label} className={`relative ${!s.done && !s.active ? 'opacity-40' : ''} ${i < timeline.length - 1 ? 'mb-12' : ''}`}>
                    <div className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-background ${s.active ? 'bg-secondary animate-pulse' : s.done ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-medium ${s.active ? 'text-secondary' : 'text-primary'}`}>{s.label}</p>
                        <p className="font-body-md text-body-md text-on-surface-variant">{s.desc}</p>
                      </div>
                      <p className={`font-label-sm text-label-sm uppercase ${s.active ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                        {s.active ? 'Currently' : i === 0 ? new Date(order.created_at).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar Panels */}
        <div className="col-span-12 lg:col-span-5 space-y-gutter flex flex-col gap-6 lg:gap-gutter">
          {/* Payment Summary */}
          <div className="glass-panel p-8 border border-secondary/20">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.2em] mb-8">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between font-body-md text-body-md">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-on-surface">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md">
                <span className="text-on-surface-variant">Shipping</span>
                <span className="text-on-surface">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md pb-6 border-b border-outline-variant/30">
                <span className="text-on-surface-variant">Tax</span>
                <span className="text-on-surface">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Total Amount</span>
                <span className="text-3xl font-headline-sm text-primary tracking-tighter">${parseFloat(total).toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-10 pt-10 border-t border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">{t('order.payment_method')}</p>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">credit_card</span>
                    <span className="font-medium text-on-surface">{order.payment_label || order.payment_method || '—'}</span>
                  </div>
                </div>
                {order.payment_status && (
                  <span className="px-3 py-1 bg-secondary-container/10 border border-secondary-container/30 text-on-secondary-container text-[10px] font-bold uppercase tracking-widest">
                    {order.payment_status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-surface-container-low p-8 border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-on-surface-variant">local_shipping</span>
              <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest">Delivery Address</h3>
            </div>
            <div className="text-on-surface-variant space-y-1 font-body-md text-body-md">
              {(order.delivery || [customer.first_name + ' ' + customer.last_name, customer.address]).filter(Boolean).map((l, i) => (
                <p key={i} className={i === 0 ? 'text-primary font-medium' : ''}>{l}</p>
              ))}
              {order.latitude != null && order.longitude != null && (
                <p className="pt-2">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${order.latitude}&mlon=${order.longitude}#map=17/${order.latitude}/${order.longitude}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">map</span>
                    View on map
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-surface-container-low p-8 border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-on-surface-variant">description</span>
              <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest">Administrative Notes</h3>
            </div>
            {order.notes ? (
              <p className="bg-background/50 p-4 border-l-2 border-secondary italic text-secondary/90 font-body-md text-body-md">
                "{order.notes}"
              </p>
            ) : (
              <p className="font-body-md text-body-md text-on-surface-variant/60">No notes on this order.</p>
            )}
          </div>

          {/* Security Clearance */}
          <div className="p-6 border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">verified_user</span>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">{t('order.security_clearance')}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Risk Level: Low</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary">check_circle</span>
          </div>
        </div>
      </div>
    </div>
  )
}
