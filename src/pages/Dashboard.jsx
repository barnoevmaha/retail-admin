import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/analytics/dashboard').then((r) => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>

  const kpis = [
    { key: 'dashboard.revenue', value: `$${data.total_revenue.toLocaleString()}`, color: 'text-green-600 dark:text-green-400' },
    { key: 'dashboard.today', value: `$${(data.today_revenue || 0).toLocaleString()}`, color: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'dashboard.this_week', value: `$${(data.weekly_revenue || 0).toLocaleString()}`, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'dashboard.this_month', value: `$${(data.monthly_revenue || 0).toLocaleString()}`, color: 'text-indigo-600 dark:text-indigo-400' },
    { key: 'dashboard.profit', value: `$${data.total_profit.toLocaleString()}`, color: 'text-green-600 dark:text-green-400' },
    { key: 'dashboard.margin', value: `${data.profit_margin}%`, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'dashboard.orders', value: data.total_orders, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'dashboard.customers', value: data.total_customers, color: 'text-purple-600 dark:text-purple-400' },
    { key: 'dashboard.products', value: data.total_products, color: 'text-orange-600 dark:text-orange-400' },
    { key: 'dashboard.low_stock', value: data.low_stock, color: 'text-red-600 dark:text-red-400' },
    { key: 'dashboard.out_of_stock', value: data.out_of_stock, color: 'text-red-700 dark:text-red-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('dashboard.title')}</h1>

      {(data.low_stock > 0 || data.out_of_stock > 0 || data.pending_orders > 0 || data.failed_sms > 0 || data.failed_notifications > 0) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6 flex flex-wrap gap-3 text-sm">
          {data.out_of_stock > 0 && <span className="text-red-700 dark:text-red-300 font-medium">🔴 {data.out_of_stock} {t('dashboard.out_of_stock_label')}</span>}
          {data.low_stock > 0 && <span className="text-orange-700 dark:text-orange-300 font-medium">🟠 {data.low_stock} {t('dashboard.low_stock_label')}</span>}
          {data.pending_orders > 0 && <span className="text-blue-700 dark:text-blue-300 font-medium">🔵 {data.pending_orders} {t('dashboard.pending_orders_label')}</span>}
          {data.failed_sms > 0 && <span className="text-red-700 dark:text-red-300">📱 {data.failed_sms} {t('dashboard.failed_sms_label')}</span>}
          {data.failed_notifications > 0 && <span className="text-red-700 dark:text-red-300">🔔 {data.failed_notifications} {t('dashboard.failed_notifications_label')}</span>}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.key} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">{t(k.key)}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('dashboard.top_products')}</h2>
          {data.top_products.map((p, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span className="dark:text-gray-200">{p.name}</span>
              <div>
                <span className="text-gray-500 dark:text-gray-400">{p.sold} {t('common.sold')}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">${p.profit.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('dashboard.fast_moving')}</h2>
          {data.fast_moving?.map((p, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span className="dark:text-gray-200">{p.name}</span>
              <span className="text-gray-500 dark:text-gray-400">{p.sold} {t('common.sold')}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('dashboard.best_customers')}</h2>
          {data.best_customers.map((c, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span className="dark:text-gray-200">{c.name}</span>
              <span className="text-gray-500 dark:text-gray-400">${c.spent.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('dashboard.popular_categories')}</h2>
          {data.popular_categories.map((c, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span className="dark:text-gray-200">{c.name}</span>
              <span className="text-gray-500 dark:text-gray-400">{c.count} {t('common.products')}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('dashboard.popular_brands')}</h2>
          {data.popular_brands?.map((b, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span className="dark:text-gray-200">{b.name}</span>
              <span className="text-gray-500 dark:text-gray-400">{b.count} {t('common.products')}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('dashboard.slow_moving')}</h2>
          {data.slow_moving?.map((p, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span className="dark:text-gray-200">{p.name}</span>
            </div>
          ))}
          {(!data.slow_moving || data.slow_moving.length === 0) && (
            <div className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.no_slow_moving')}</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mt-6">
        <h2 className="font-bold mb-3 dark:text-white">{t('dashboard.recent_activity')}</h2>
        <div className="text-sm space-y-2">
          {data.recent_activity?.map((a) => (
            <div key={a.id} className="flex justify-between border-b dark:border-gray-700 py-1">
              <span>
                <span className={`font-medium ${a.operation === 'receiving' ? 'text-green-600 dark:text-green-400' : a.operation === 'sale' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {a.operation.replace('_', ' ')}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">{t('dashboard.variant')} #{a.variant_id}</span>
              </span>
              <div className="dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">{a.quantity > 0 ? `+${a.quantity}` : a.quantity}</span>
                <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
