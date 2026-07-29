import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [extended, setExtended] = useState(null)

  useEffect(() => {
    api.get('/analytics/dashboard').then((r) => setData(r.data)).catch(() => {})
    api.get('/analytics/extended').then((r) => setExtended(r.data)).catch(() => {})
  }, [])

  if (!data || !extended) return <div className="text-gray-500">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Overview</h2>
          <div className="space-y-3">
            {[
              ['Total Revenue', `$${data.total_revenue.toLocaleString()}`],
              ['Total Profit', `$${data.total_profit.toLocaleString()}`, 'text-green-600'],
              ['Profit Margin', `${data.profit_margin}%`, 'text-blue-600'],
              ['Total Orders', data.total_orders],
              ['Total Customers', data.total_customers],
              ['Total Products', data.total_products],
              ['Low Stock Items', data.low_stock],
            ].map(([label, value, cls]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-600">{label}</span>
                <span className={`font-bold ${cls || ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Daily Sales (30d)</h2>
          <div className="space-y-1">
            {extended.daily_sales.map((d, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b">
                <span className="text-gray-600">{d.date}</span>
                <div>
                  <span className="text-gray-500 mr-2">{d.qty} items</span>
                  <span className="font-bold">${d.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Sales by Category</h2>
          {extended.sales_by_category.map((c, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>{c.name}</span>
              <div className="text-right">
                <span className="text-gray-500">{c.qty} sold</span>
                <span className="text-gray-500 ml-2">${c.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Sales by Brand</h2>
          {extended.sales_by_brand.map((b, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>{b.name}</span>
              <div className="text-right">
                <span className="text-gray-500">{b.qty} sold</span>
                <span className="text-gray-500 ml-2">${b.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Sales by Size</h2>
          {extended.sales_by_size.map((s, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>{s.name}</span>
              <div className="text-right">
                <span className="text-gray-500">{s.qty} sold</span>
                <span className="text-gray-500 ml-2">${s.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Sales by Color</h2>
          {extended.sales_by_color.map((c, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>{c.name}</span>
              <div className="text-right">
                <span className="text-gray-500">{c.qty} sold</span>
                <span className="text-gray-500 ml-2">${c.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Monthly Sales (12mo)</h2>
          {extended.monthly_sales.map((m, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>{m.month}</span>
              <div className="text-right">
                <span className="text-gray-500 mr-2">{m.qty} items</span>
                <span className="font-bold">${m.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Top Products</h2>
          {data.top_products.map((p, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>{i + 1}. {p.name}</span>
              <div className="text-right">
                <span className="text-gray-500">{p.sold} sold</span>
                <span className="text-gray-500 ml-2">${p.profit.toLocaleString()} profit</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Best Customers</h2>
          {data.best_customers.map((c, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>{c.name}</span>
              <span className="text-gray-500">${c.spent.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Popular Categories</h2>
          {data.popular_categories.map((c, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>{c.name}</span>
              <span className="text-gray-500">{c.count} products</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-3">Products with No Sales</h2>
          {extended.products_no_sales.length === 0 ? (
            <div className="text-sm text-gray-400">All products have been sold</div>
          ) : (
            extended.products_no_sales.map((p, i) => (
              <div key={i} className="flex justify-between py-2 border-b text-sm">
                <span>{p.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
