import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { t } from '../i18n'

const statusBadge = (status) => {
  if (status === 'delivered' || status === 'ready')
    return 'bg-secondary-container text-on-secondary-container'
  if (status === 'cancelled') return 'bg-error-container text-on-error-container'
  return 'bg-surface-container-highest text-on-surface-variant'
}

function Stat({ label, value }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant p-6">
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">{label}</p>
      <p className="font-headline-sm text-headline-sm text-primary">{value}</p>
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get(`/customers/${id}/detail`).then((r) => {
      setData(r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { window.scrollTo(0, 0) }, [])

  if (loading) {
    return <div className="py-24 text-center font-body-md text-body-md text-on-surface-variant">{t('common.loading')}</div>
  }
  if (!data) {
    return <div className="py-24 text-center font-body-md text-body-md text-on-surface-variant">{t('customers.not_found')}</div>
  }

  const cust = data.customer
  const fullName = [cust.first_name, cust.last_name].filter(Boolean).join(' ') || '—'
  const status = cust.is_blocked ? t('customers.blocked') : t('common.active')

  const toggleBlock = async () => {
    try {
      await api.put(`/customers/${cust.id}/block`)
      load()
    } catch {}
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 w-fit text-label-sm text-on-surface-variant hover:text-primary uppercase tracking-widest">
          <span className="material-symbols-outlined">arrow_back</span>
          {t('common.back')}
        </button>
      </div>

      {/* Header */}
      <div className="bg-surface-container-low border border-outline-variant p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-md rounded-full border border-outline-variant">
              {(fullName.charAt(0) || '?').toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary">{fullName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {cust.email && <span className="flex items-center gap-1.5 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">mail</span>{cust.email}</span>}
                {cust.phone && <span className="flex items-center gap-1.5 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">call</span>{cust.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${cust.is_blocked ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>
              {status}
            </span>
            <button
              onClick={toggleBlock}
              className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-[2px] border transition-all duration-300 ${
                cust.is_blocked
                  ? 'border-secondary text-secondary hover:bg-secondary hover:text-on-secondary'
                  : 'border-error/60 text-error hover:bg-error hover:text-on-error'
              }`}
            >
              {cust.is_blocked ? t('customers.unblock') : t('customers.block')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label={t('customers.orders')} value={cust.total_purchases} />
        <Stat label={t('customers.spent')} value={`$${parseFloat(cust.total_spent || 0).toFixed(2)}`} />
        <Stat label={t('customers.registered')} value={cust.created_at ? new Date(cust.created_at).toLocaleDateString() : '—'} />
        <Stat label={t('customers.verified')} value={[cust.email_verified && 'email', cust.phone_verified && 'phone'].filter(Boolean).map((x) => x).join(', ') || '—'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Saved addresses */}
        <div className="bg-surface-container-low border border-outline-variant p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
            <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest">{t('customers.saved_addresses')}</h3>
          </div>
          {data.addresses.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant/60">{t('customers.no_addresses')}</p>
          ) : (
            <div className="space-y-4">
              {data.addresses.map((a) => (
                <div key={a.id} className="border border-outline-variant p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-body-md text-body-md text-on-surface font-medium">{[a.receiver_name, a.receiver_phone].filter(Boolean).join(' · ') || '—'}</p>
                    {(a.is_default_shipping || a.is_default_billing) && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container">
                        {[a.is_default_shipping && t('customers.default_shipping'), a.is_default_billing && t('customers.default_billing')].filter(Boolean).join(' / ')}
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {[a.country, a.city, [a.street, a.house].filter(Boolean).join(' '), a.apartment && `apt. ${a.apartment}`, a.postal_code].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order history */}
        <section className="xl:col-span-2 bg-surface-container-low border border-outline-variant p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-on-surface-variant">receipt_long</span>
            <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest">{t('customers.order_history')}</h3>
          </div>
          {data.recent_orders.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant/60">{t('customers.no_orders')}</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-outline-variant">
                    {[t('orders.order_no'), t('orders.date'), t('common.items_cap'), t('orders.payment'), t('orders.status'), t('common.total')].map((h, i) => (
                      <th key={h} className={`pb-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-3 ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {data.recent_orders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-container transition-colors">
                      <td className="py-4 px-3 font-medium text-primary">
                        <Link to={`/orders/${o.id}`} className="hover:text-secondary transition-colors">#{o.id}</Link>
                      </td>
                      <td className="py-4 px-3 text-on-surface-variant font-body-md text-body-md">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-3 text-on-surface-variant font-body-md text-body-md">{o.items_count ?? '—'}</td>
                      <td className="py-4 px-3 text-on-surface-variant font-body-md text-body-md">{o.payment_method || '—'}</td>
                      <td className="py-4 px-3">
                        <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${statusBadge(o.status)}`}>
                          {t('status.' + o.status)}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right font-headline-sm text-headline-sm text-primary">${parseFloat(o.total_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}