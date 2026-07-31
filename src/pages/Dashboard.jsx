import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/analytics/dashboard').then((r) => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <div className="font-body-md text-body-md text-on-surface-variant">{t('common.loading')}</div>

  const kpis = [
    { key: 'dashboard.revenue', value: `$${data.total_revenue.toLocaleString()}`, icon: 'payments', tone: 'secondary' },
    { key: 'dashboard.today', value: `$${(data.today_revenue || 0).toLocaleString()}`, icon: 'today', tone: 'secondary' },
    { key: 'dashboard.this_week', value: `$${(data.weekly_revenue || 0).toLocaleString()}`, icon: 'date_range', tone: 'secondary' },
    { key: 'dashboard.this_month', value: `$${(data.monthly_revenue || 0).toLocaleString()}`, icon: 'calendar_month', tone: 'secondary' },
    { key: 'dashboard.profit', value: `$${data.total_profit.toLocaleString()}`, icon: 'trending_up', tone: 'secondary' },
    { key: 'dashboard.margin', value: `${data.profit_margin}%`, icon: 'percent', tone: 'secondary' },
    { key: 'dashboard.orders', value: data.total_orders, icon: 'shopping_bag', tone: 'secondary' },
    { key: 'dashboard.customers', value: data.total_customers, icon: 'person_add', tone: 'secondary' },
    { key: 'dashboard.products', value: data.total_products, icon: 'checkroom', tone: 'secondary' },
    { key: 'dashboard.low_stock', value: data.low_stock, icon: 'warning', tone: 'error' },
    { key: 'dashboard.out_of_stock', value: data.out_of_stock, icon: 'block', tone: 'error' },
  ]

  const alerts = [
    { n: data.out_of_stock, labelKey: 'dashboard.out_of_stock_label', icon: 'block' },
    { n: data.low_stock, labelKey: 'dashboard.low_stock_label', icon: 'warning' },
    { n: data.pending_orders, labelKey: 'dashboard.pending_orders_label', icon: 'hourglass_top' },
    { n: data.failed_sms, labelKey: 'dashboard.failed_sms_label', icon: 'sms_failed' },
    { n: data.failed_notifications, labelKey: 'dashboard.failed_notifications_label', icon: 'notifications_off' },
  ].filter((a) => a.n > 0)

  const tables = [
    { key: 'dashboard.top_products', rows: data.top_products?.map((p) => ({ left: p.name, right: `${p.sold} ${t('common.sold')} · $${p.profit.toLocaleString()}` })) },
    { key: 'dashboard.fast_moving', rows: data.fast_moving?.map((p) => ({ left: p.name, right: `${p.sold} ${t('common.sold')}` })) },
    { key: 'dashboard.popular_categories', rows: data.popular_categories?.map((c) => ({ left: c.name, right: `${c.count} ${t('common.products')}` })) },
    { key: 'dashboard.popular_brands', rows: data.popular_brands?.map((b) => ({ left: b.name, right: `${b.count} ${t('common.products')}` })) },
    { key: 'dashboard.best_customers', rows: data.best_customers?.map((c) => ({ left: c.name, right: `$${c.spent.toLocaleString()}` })) },
    { key: 'dashboard.slow_moving', rows: data.slow_moving?.map((p) => ({ left: p.name, right: null })) },
  ]

  const panel = (p) => (
    <section key={p.key} className="glass-panel rounded-lg p-6 flex flex-col h-full">
      <h3 className="font-headline-sm text-headline-sm text-primary mb-4">{t(p.key)}</h3>
      {(!p.rows || p.rows.length === 0) && p.key === 'dashboard.slow_moving' ? (
        <div className="font-body-md text-body-md text-on-surface-variant">{t('dashboard.no_slow_moving')}</div>
      ) : (
        <div className="divide-y divide-outline-variant/50">
          {(p.rows || []).map((r, j) => (
            <div key={j} className="flex justify-between items-center py-3 font-body-md text-body-md gap-4">
              <span className="text-primary">{r.left}</span>
              {r.right && <span className="text-on-surface-variant shrink-0">{r.right}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  )

  return (
    <div className="flex flex-col gap-gutter">
      {alerts.length > 0 && (
        <div className="bg-error-container/30 border border-error/40 rounded-[4px] p-4 flex flex-wrap gap-x-8 gap-y-2 font-body-md text-body-md">
          {alerts.map((a) => (
            <span key={a.labelKey} className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
              {a.n} {t(a.labelKey)}
            </span>
          ))}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <div key={k.key} className="glass-panel rounded-lg p-6 flex flex-col gap-2 relative overflow-hidden group hover:border-secondary transition-colors duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <span className={`material-symbols-outlined text-[64px] ${k.tone === 'error' ? 'text-error' : 'text-secondary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t(k.key)}</span>
            <span className="font-headline-md text-headline-md text-primary mt-2">{k.value}</span>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter mt-4">
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {tables.slice(0, 4).map((p) => panel(p))}
        </div>
        <div className="flex flex-col gap-gutter">
          {tables.slice(4).map((p) => panel(p))}
        </div>

        <section className="glass-panel rounded-lg p-6 lg:col-span-2">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-6">{t('dashboard.recent_activity')}</h3>
          <div className="divide-y divide-outline-variant/50">
            {data.recent_activity?.map((a) => (
              <div key={a.id} className="flex justify-between items-center py-3 font-body-md text-body-md gap-4">
                <span>
                  <span className="text-secondary capitalize">{a.operation.replace('_', ' ')}</span>
                  <span className="text-on-surface-variant ml-2">{t('dashboard.variant')} #{a.variant_id}</span>
                </span>
                <div className="text-primary shrink-0">
                  <span>{a.quantity > 0 ? `+${a.quantity}` : a.quantity}</span>
                  <span className="text-on-surface-variant/70 ml-2 text-[12px]">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
