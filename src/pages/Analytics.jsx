import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [extended, setExtended] = useState(null)

  useEffect(() => {
    api.get('/analytics/dashboard').then((r) => setData(r.data)).catch(() => {})
    api.get('/analytics/extended').then((r) => setExtended(r.data)).catch(() => {})
  }, [])

  if (!data || !extended) return <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('analytics.title')}</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('analytics.overview')}</h2>
          <div className="space-y-3">
            {[
              [t('analytics.total_revenue'), `$${data.total_revenue.toLocaleString()}`],
              [t('analytics.total_profit'), `$${data.total_profit.toLocaleString()}`, 'text-green-600 dark:text-green-400'],
              [t('analytics.profit_margin'), `${data.profit_margin}%`, 'text-blue-600 dark:text-blue-400'],
              [t('analytics.total_orders'), data.total_orders],
              [t('analytics.total_customers'), data.total_customers],
              [t('analytics.total_products'), data.total_products],
              [t('analytics.low_stock_items'), data.low_stock],
            ].map(([label, value, cls]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className={`font-bold ${cls || ''} dark:text-gray-100`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('analytics.daily_sales')}</h2>
          <div className="space-y-1">
            {extended.daily_sales.map((d, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{d.date}</span>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 mr-2">{d.qty} {t('common.items')}</span>
                  <span className="font-bold dark:text-gray-100">${d.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('analytics.sales_by_category')}</h2>
          {extended.sales_by_category.map((c, i) => (
            <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
              <span className="dark:text-gray-200">{c.name}</span>
              <div className="text-right">
                <span className="text-gray-500 dark:text-gray-400">{c.qty} {t('common.sold')}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">${c.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('analytics.sales_by_brand')}</h2>
          {extended.sales_by_brand.map((b, i) => (
            <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
              <span className="dark:text-gray-200">{b.name}</span>
              <div className="text-right">
                <span className="text-gray-500 dark:text-gray-400">{b.qty} {t('common.sold')}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">${b.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('analytics.sales_by_size')}</h2>
          {extended.sales_by_size.map((s, i) => (
            <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
              <span className="dark:text-gray-200">{s.name}</span>
              <div className="text-right">
                <span className="text-gray-500 dark:text-gray-400">{s.qty} {t('common.sold')}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">${s.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('analytics.sales_by_color')}</h2>
          {extended.sales_by_color.map((c, i) => (
            <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
              <span className="dark:text-gray-200">{c.name}</span>
              <div className="text-right">
                <span className="text-gray-500 dark:text-gray-400">{c.qty} {t('common.sold')}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">${c.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('analytics.monthly_sales')}</h2>
          {extended.monthly_sales.map((m, i) => (
            <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
              <span className="dark:text-gray-200">{m.month}</span>
              <div className="text-right">
                <span className="text-gray-500 dark:text-gray-400 mr-2">{m.qty} {t('common.items')}</span>
                <span className="font-bold dark:text-gray-100">${m.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('dashboard.top_products')}</h2>
          {data.top_products.map((p, i) => (
            <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
              <span className="dark:text-gray-200">{i + 1}. {p.name}</span>
              <div className="text-right">
                <span className="text-gray-500 dark:text-gray-400">{p.sold} {t('common.sold')}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">${p.profit.toLocaleString()} {t('analytics.profit')}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('dashboard.best_customers')}</h2>
          {data.best_customers.map((c, i) => (
            <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
              <span className="dark:text-gray-200">{c.name}</span>
              <span className="text-gray-500 dark:text-gray-400">${c.spent.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('dashboard.popular_categories')}</h2>
          {data.popular_categories.map((c, i) => (
            <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
              <span className="dark:text-gray-200">{c.name}</span>
              <span className="text-gray-500 dark:text-gray-400">{c.count} {t('common.products')}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold text-lg mb-3 dark:text-white">{t('analytics.products_no_sales')}</h2>
          {extended.products_no_sales.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-500">{t('analytics.all_sold')}</div>
          ) : (
            extended.products_no_sales.map((p, i) => (
              <div key={i} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
                <span className="dark:text-gray-200">{p.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
