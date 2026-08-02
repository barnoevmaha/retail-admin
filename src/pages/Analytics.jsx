import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1)
  const rows = Math.ceil(data.length / 12)
  const today = new Date()
  const days = [...Array(data.length)]
    .map((_, i) => new Date(today.getTime() - (data.length - 1 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }))
  return (
    <div className="flex items-end gap-2 h-44">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <span className="font-label-sm text-label-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">${d.revenue}</span>
          <div
            className="w-full bg-secondary/70 hover:bg-secondary transition-colors"
            style={{ height: `${Math.max((d.revenue / max) * 100, 3)}%` }}
            title={`${days[i]} — $${d.revenue}`}
          />
          <span className="font-label-sm text-label-sm text-on-surface-variant/50 hidden md:block">{days[i].split(' ')[0]}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ icon, label, value, sub, delay = 0 }) {
  return (
    <div className="glass-panel p-6 flex items-start gap-4">
      <span className="w-12 h-12 flex items-center justify-center bg-surface-container-high border border-outline-variant shrink-0">
        <span className="material-symbols-outlined text-secondary">{icon}</span>
      </span>
      <div className="min-w-0">
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{label}</p>
        <p className="font-headline-md text-headline-md text-primary mt-1 truncate">{value}</p>
        {sub && <p className="font-label-sm text-label-sm text-secondary mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function SimpleTable({ title, rows, rightAlign = false, empty = 'No data yet.' }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant">
      <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest px-6 pt-6 pb-4">{title}</h2>
      {rows.length === 0 ? (
        <div className="px-6 pb-6 text-center font-body-md text-body-md text-on-surface-variant/60">{empty}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-outline-variant/30">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-surface-container transition-colors">
                  <td className="py-3 px-6 font-body-md text-body-md text-on-surface">{r[0]}</td>
                  {r.length > 1 && (
                    <td className={`py-3 px-6 font-body-md text-body-md ${rightAlign ? 'text-right ' : ''}${r[2] || 'text-on-surface-variant'}`}>{r[1]}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [extended, setExtended] = useState(null)

  useEffect(() => {
    api.get('/analytics/dashboard').then((r) => setData(r.data)).catch(() => {})
    api.get('/analytics/extended').then((r) => setExtended(r.data)).catch(() => {})
  }, [])

  if (!data || !extended) {
    return <div className="py-24 text-center font-body-md text-body-md text-on-surface-variant">{t('common.loading')}</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          {t('analytics.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('analytics.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon="payments" label={t('analytics.total_revenue')} value={`$${data.total_revenue.toLocaleString()}`} />
        <StatCard icon="trending_up" label={t('analytics.total_profit')} value={`$${data.total_profit.toLocaleString()}`} sub={t('analytics.margin', { margin: data.profit_margin })} />
        <StatCard icon="receipt_long" label={t('analytics.total_orders')} value={data.total_orders.toLocaleString()} sub={t('analytics.customers', { count: data.total_customers })} />
        <StatCard icon="inventory_2" label={t('analytics.low_stock_items')} value={data.low_stock} />
      </div>

      <div className="bg-surface-container-low border border-outline-variant p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">{t('analytics.daily_sales')}</h2>
          <span className="font-body-md text-body-md text-on-surface-variant">
            {t('analytics.items_sold', { count: extended.daily_sales.reduce((s, d) => s + d.revenue, 0).toLocaleString() })}
          </span>
        </div>
        {extended.daily_sales.length === 0 ? (
          <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant/60">{t('analytics.no_data_yet')}</div>
        ) : (
          <BarChart data={extended.daily_sales} />
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <SimpleTable title={t("analytics.sales_by_category")} rows={extended.sales_by_category.map((c) => [c.name, t("analytics.sold", { qty: c.qty, revenue: `$${c.revenue.toLocaleString()}` })])} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <SimpleTable title={t("analytics.sales_by_brand")} rows={extended.sales_by_brand.map((b) => [b.name, t("analytics.sold", { qty: b.qty, revenue: `$${b.revenue.toLocaleString()}` })])} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <SimpleTable title={t("analytics.sales_by_size")} rows={extended.sales_by_size.map((s) => [s.name, t("analytics.sold", { qty: s.qty, revenue: `$${s.revenue.toLocaleString()}` })])} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <SimpleTable title={t("analytics.sales_by_color")} rows={extended.sales_by_color.map((c) => [c.name, t("analytics.sold", { qty: c.qty, revenue: `$${c.revenue.toLocaleString()}` })])} />
        </div>

        <div className="col-span-12 md:col-span-6">
          <SimpleTable title={t("analytics.monthly_sales")} rows={extended.monthly_sales.map((m) => [m.month, t("analytics.monthly_row", { qty: m.qty, revenue: `$${m.revenue.toLocaleString()}` }), 'text-secondary'])} rightAlign />
        </div>
        <div className="col-span-12 md:col-span-6">
          <SimpleTable title={t("analytics.top_products")} rows={data.top_products.map((p) => [`${p.name}`, t("analytics.sold_profit", { sold: p.sold, profit: `$${p.profit.toLocaleString()}` }), 'text-secondary'])} rightAlign />
        </div>

        <div className="col-span-12 md:col-span-6">
          <SimpleTable title={t("analytics.best_customers")} rows={data.best_customers.map((c) => [c.name, `$${c.spent.toLocaleString()}`])} rightAlign />
        </div>
        <div className="col-span-12 md:col-span-6">
          <SimpleTable title={t("analytics.popular_categories")} rows={data.popular_categories.map((c) => [c.name, t("analytics.count_products", { count: c.count })])} rightAlign />
        </div>

        <div className="col-span-12">
          <SimpleTable title={t("analytics.products_no_sales")} rows={extended.products_no_sales.map((p) => [p.name])} empty={t("analytics.all_products_sold")} />
        </div>
      </div>
    </div>
  )
}
