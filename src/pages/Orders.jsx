import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { t } from '../i18n'

const statusBadge = (status) => {
  if (status === 'delivered' || status === 'ready')
    return 'bg-secondary-container text-on-secondary-container'
  if (status === 'cancelled') return 'bg-error-container text-on-error-container'
  if (status === 'paid' || status === 'confirmed')
    return 'bg-surface-container-highest text-on-surface-variant'
  return 'bg-surface-container-highest text-on-surface-variant'
}

const paymentMethodLabel = (method, t) => {
  const labels = {
    cash: t('pos.payment_cash'),
    manual: t('pos.payment_manual'),
    card: t('pos.payment_card'),
    bank_transfer: t('pos.payment_bank_transfer'),
  }
  return labels[method] || method || '—'
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/orders/').then((r) => setOrders(r.data.items)).catch(() => {})
  }, [])

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status })
    api.get('/orders/').then((r) => setOrders(r.data.items))
  }

  const statuses = ['pending', 'confirmed', 'packing', 'ready', 'delivered', 'cancelled']

  const visible = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return String(o.id).includes(q) || (o.customer_name || '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">{t('orders.title')}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('orders.subtitle')}</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 border border-outline-variant hover:border-secondary hover:text-secondary transition-all duration-300 font-label-sm text-label-sm uppercase tracking-widest w-fit">
          <span className="material-symbols-outlined">ios_share</span>
          {t('orders.export')}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 py-4 border-y border-outline-variant">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-label-sm text-on-surface-variant mr-2 uppercase tracking-tighter">{t('orders.filter_by')}</span>
          <div className="flex gap-1 p-1 bg-surface-container rounded-[4px]">
            {['all', 'pending', 'paid', 'shipped'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-label-sm font-medium rounded-[4px] transition-colors ${
                  filter === f ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {f === 'all' ? t('common.all') : t('status.' + f)}
              </button>
            ))}
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder={t("orders.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-outline-variant focus:border-secondary focus:ring-0 pl-8 pr-4 py-2 text-body-md transition-all outline-none placeholder:text-on-surface-variant/40"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-outline-variant">
              {[t('orders.order_no'), t('orders.date'), t('orders.customer'), t('common.items_cap'), t('orders.payment'), t('orders.status'), t('common.total')].map((h, i) => (
                <th key={h} className={`pb-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-4 ${i === 6 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {visible.map((o) => (
              <tr key={o.id} className="group hover:bg-surface-container-low transition-colors">
                <td className="py-5 px-4 font-medium text-primary">
                  <Link to={`/orders/${o.id}`} className="hover:text-secondary transition-colors">#{o.id}</Link>
                </td>
                <td className="py-5 px-4 text-on-surface-variant font-body-md text-body-md">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td className="py-5 px-4 text-on-surface font-body-md text-body-md">
                  {o.customer_id ? (
                    <Link to={`/customers/${o.customer_id}`} className="text-primary hover:text-secondary transition-colors">{o.customer_name || t('orders.walk_in')}</Link>
                  ) : (
                    o.customer_name || t('orders.walk_in')
                  )}
                </td>
                <td className="py-5 px-4 text-on-surface-variant font-body-md text-body-md">{o.items_count ?? '—'}</td>
                <td className="py-5 px-4 text-on-surface-variant font-body-md text-body-md">
                  {paymentMethodLabel(o.payment_method, t)}
                  {['card', 'manual', 'bank_transfer'].includes(o.payment_method) && (
                    <span className="ml-2 px-2 py-0.5 bg-warning/10 border border-warning/30 text-warning text-[10px] font-bold uppercase tracking-widest">
                      {t('payment.pending')}
                    </span>
                  )}
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${statusBadge(o.status)}`}>
                      {t('status.' + o.status)}
                    </span>
                    <select
                      className="bg-surface-container-high border border-outline-variant text-label-sm text-on-surface rounded-[2px] px-1 py-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer outline-none"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      title={t("orders.update_status")}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{t('status.' + s)}</option>)}
                    </select>
                  </div>
                </td>
                <td className="py-5 px-4 text-right font-headline-sm text-headline-sm text-primary">
                  ${parseFloat(o.total_amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{t('orders.no_yet')}</div>
        )}
      </div>

      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-outline-variant">
        <span className="text-label-sm text-on-surface-variant">{t('orders.showing', { shown: visible.length, total: orders.length })}</span>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center border border-outline-variant hover:border-secondary hover:text-secondary transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-secondary text-secondary bg-surface-container-low font-label-sm text-label-sm">1</button>
          <button className="w-10 h-10 flex items-center justify-center border border-outline-variant hover:border-secondary hover:text-secondary transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
