import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/client'
import { t } from '../i18n'

const REASONS = ['damaged', 'wrong_size', 'wrong_item', 'not_as_described', 'no_longer_needed', 'other']

export default function ReturnsPage() {
  const location = useLocation()
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
    if (location.state?.orderId) setOrderId(String(location.state.orderId))
    api.get('/returns/').then((r) => setReturns(r.data)).catch(() => {})
    api.get('/orders/', { params: { limit: 50 } }).then((r) => setOrders(r.data.items || [])).catch(() => {})
  }, [])

  const loadDetail = async (id) => {
    setActiveId(id)
    try {
      const r = await api.get(`/returns/${id}`)
      setDetail(r.data)
      setMsg('')
    } catch { setDetail(null) }
  }

  const createReturn = async () => {
    if (!orderId) return
    try {
      const r = await api.post('/returns/', { order_id: parseInt(orderId), reason: reason || null })
      setOrderId('')
      setReason('')
      loadDetail(r.data.id)
      api.get('/returns/').then((res) => setReturns(res.data))
    } catch (err) {
      setMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const addItem = async () => {
    if (!variantBarcode || !activeId) return
    try {
      const v = await api.get(`/variants/barcode/${variantBarcode}`)
      await api.post(`/returns/${activeId}/items`, { variant_id: v.data.id, quantity: itemQty })
      setVariantBarcode('')
      setItemQty(1)
      setMsg(t('common.added_msg', { qty: itemQty, barcode: v.data.barcode }))
      loadDetail(activeId)
    } catch (err) {
      setMsg(err.response?.status === 404
        ? t('common.not_found')
        : 'Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const confirmReturn = async () => {
    if (!activeId) return
    try {
      const r = await api.post(`/returns/${activeId}/confirm`)
      setMsg(t('common.confirmed_msg', { id: r.data.id, count: r.data.total_quantity }))
      loadDetail(activeId)
      api.get('/returns/').then((res) => setReturns(res.data))
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const printReturn = () => {
    if (!detail) return
    const rows = (detail.items || []).map((it) =>
      `<tr><td style="padding:6px 12px;border-bottom:1px solid #ddd">${it.barcode || `#${it.variant_id}`}</td>` +
      `<td style="padding:6px 12px;border-bottom:1px solid #ddd;text-align:center">x${it.quantity}</td>` +
      `<td style="padding:6px 12px;border-bottom:1px solid #ddd;text-align:right">$${parseFloat(it.price).toFixed(2)}</td>` +
      `<td style="padding:6px 12px;border-bottom:1px solid #ddd;text-align:right">$${(parseFloat(it.price) * it.quantity).toFixed(2)}</td></tr>`
    ).join('')
    const w = window.open('', '_blank')
    w.document.write(`<!DOCTYPE html><html><head><title>Return #${detail.id}</title></head>
<body style="font-family:monospace;font-size:14px;margin:24px;color:#111">
<h2 style="margin:0 0 4px">RETURN RECEIPT</h2>
<p style="margin:0">Return #${detail.id} &nbsp; Order #${detail.order_id}</p>
<p style="margin:0">${new Date(detail.created_at || Date.now()).toLocaleString()}</p>
${detail.reason ? `<p style="margin:4px 0">Reason: ${detail.reason}</p>` : ''}
<table style="width:100%;border-collapse:collapse;margin-top:12px">${rows}</table>
<p style="margin-top:12px">Total items: ${(detail.items || []).reduce((s, i) => s + i.quantity, 0)}</p>
<script>window.onload=function(){window.print()}<\/script></body></html>`)
    w.document.close()
  }

  const cancel = async () => {
    if (!activeId) return
    try {
      await api.post(`/returns/${activeId}/cancel`)
      setMsg(t('returns.cancelled'))
      loadDetail(activeId)
      api.get('/returns/').then((res) => setReturns(res.data))
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          {t('returns.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('returns.subtitle')}</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Create + list */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">{t('returns.create')}</h2>
            <div className="space-y-5">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('returns.order')}</label>
                <select
                  className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md text-on-surface cursor-pointer"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                >
                  <option value="" className="bg-surface-container">{t('returns.select_order_placeholder')}</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id} className="bg-surface-container">
                      #{o.id} — ${parseFloat(o.total_amount).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('returns.reason')}</label>
                <select
                  className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md text-on-surface cursor-pointer"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="" className="bg-surface-container">{t('returns.select_reason')}</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r} className="bg-surface-container">{t('returns.reason_' + r)}</option>
                  ))}
                </select>
              </div>
              <button onClick={createReturn} className="w-full py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
                {t('returns.create')}
              </button>
            </div>
          </div>

          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">{t('returns.title')}</h2>
            {returns.map((r) => (
              <div
                key={r.id}
                onClick={() => loadDetail(r.id)}
                className={`flex justify-between items-center py-3 px-3 border-b border-outline-variant/30 cursor-pointer transition-colors ${
                  activeId === r.id ? 'bg-surface-container bg-surface-container-high' : 'hover:bg-surface-container'
                }`}
              >
                <div className="min-w-0">
                  <span className="font-body-md text-body-md text-primary font-medium">#{r.id}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant ml-2">{t('returns.order')} #{r.order_id}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${
                    r.status === 'confirmed'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : r.status === 'cancelled'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {t('status.' + r.status)}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{r.items_count} {t('common.items')}</span>
                </div>
              </div>
            ))}
            {returns.length === 0 && (
              <div className="py-8 text-center font-body-md text-body-md text-on-surface-variant/60">{t('returns.no_yet')}</div>
            )}
          </div>
        </section>

        {/* Right: Detail */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {detail ? (
            <>
              <div className="p-8 bg-surface-container-low border border-outline-variant">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">{t('returns.return')} #{detail.id}</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      {t('returns.order')} #{detail.order_id}{detail.reason ? ` · ${detail.reason}` : ''}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${
                    detail.status === 'confirmed'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : detail.status === 'cancelled'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {t('status.' + detail.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 -mt-4 mb-4">
                  <button onClick={printReturn} className="px-4 py-2 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    {t('returns.print')}
                  </button>
                </div>

                {detail.status === 'draft' && (
                  <div className="flex gap-3">
                    <input
                      type="text" placeholder={t("common.scan_item")}
                      className="flex-1 bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
                      value={variantBarcode}
                      onChange={(e) => setVariantBarcode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addItem()}
                      autoFocus
                    />
                    <input
                      type="number" min="1"
                      className="w-20 bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-center text-body-md"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    />
                    <button onClick={addItem} className="px-6 py-2 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined">add</span>
                      {t('common.add')}
                    </button>
                  </div>
                )}
                {msg && <p className="mt-3 text-sm text-secondary">{msg}</p>}
              </div>

              <div className="bg-surface-container-low border border-outline-variant">
                <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest px-6 pt-6 pb-4">{t('common.items_cap')}</h2>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[520px]">
                    <thead>
                      <tr className="border-t border-outline-variant">
                        {[t('common.product'), t('common.qty'), t('common.unit_price'), t('common.total')].map((h, i) => (
                          <th key={h} className={`py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ${i >= 2 ? 'text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {detail.items.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container transition-colors">
                          <td className="py-4 px-6 font-body-md text-body-md text-on-surface">{item.barcode || `#${item.variant_id}`}</td>
                          <td className="py-4 px-6 font-body-md text-body-md text-on-surface">x{item.quantity}</td>
                          <td className="py-4 px-6 text-right font-body-md text-body-md text-on-surface-variant">${parseFloat(item.price).toFixed(2)}</td>
                          <td className="py-4 px-6 text-right font-body-md text-body-md text-secondary">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {detail.items.length === 0 && (
                    <div className="py-12 text-center font-body-md text-body-md text-on-surface-variant/60">{t('common.scan_hint')}</div>
                  )}
                </div>
              </div>

              {detail.status === 'draft' && (
                <div className="grid grid-cols-2 gap-4">
                  {detail.items.length > 0 && (
                    <button onClick={confirmReturn} className="py-4 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
                      {t('returns.confirm_btn')}
                    </button>
                  )}
                  <button onClick={cancel} className="py-4 border border-error/50 text-error font-label-sm text-label-sm uppercase tracking-widest hover:bg-error-container/20 transition-all">
                    {t('returns.cancel_btn')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 p-16 border border-dashed border-outline-variant flex flex-col items-center justify-center text-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl">assignment_return</span>
              <p className="font-body-md text-body-md text-on-surface-variant/60">{t('returns.select_hint')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
