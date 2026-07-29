import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/analytics/dashboard').then((r) => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <div className="text-gray-500">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Alerts */}
      {(data.low_stock > 0 || data.out_of_stock > 0 || data.pending_orders > 0 || data.failed_sms > 0 || data.failed_notifications > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex flex-wrap gap-3 text-sm">
          {data.out_of_stock > 0 && <span className="text-red-700 font-medium">🔴 {data.out_of_stock} out of stock</span>}
          {data.low_stock > 0 && <span className="text-orange-700 font-medium">🟠 {data.low_stock} low stock</span>}
          {data.pending_orders > 0 && <span className="text-blue-700 font-medium">🔵 {data.pending_orders} pending orders</span>}
          {data.failed_sms > 0 && <span className="text-red-700">📱 {data.failed_sms} failed SMS</span>}
          {data.failed_notifications > 0 && <span className="text-red-700">🔔 {data.failed_notifications} failed notifications</span>}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          ['Revenue', `$${data.total_revenue.toLocaleString()}`, 'text-green-600'],
          ['Today', `$${(data.today_revenue || 0).toLocaleString()}`, 'text-emerald-600'],
          ['This Week', `$${(data.weekly_revenue || 0).toLocaleString()}`, 'text-blue-600'],
          ['This Month', `$${(data.monthly_revenue || 0).toLocaleString()}`, 'text-indigo-600'],
          ['Profit', `$${data.total_profit.toLocaleString()}`, 'text-green-600'],
          ['Margin', `${data.profit_margin}%`, 'text-blue-600'],
          ['Orders', data.total_orders, 'text-blue-600'],
          ['Customers', data.total_customers, 'text-purple-600'],
          ['Products', data.total_products, 'text-orange-600'],
          ['Low Stock', data.low_stock, 'text-red-600'],
          ['Out of Stock', data.out_of_stock, 'text-red-700'],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Top Products</h2>
          {data.top_products.map((p, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span>{p.name}</span>
              <div>
                <span className="text-gray-500">{p.sold} sold</span>
                <span className="text-gray-500 ml-2">${p.profit.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Fast Moving (30d)</h2>
          {data.fast_moving?.map((p, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span>{p.name}</span>
              <span className="text-gray-500">{p.sold} sold</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Best Customers</h2>
          {data.best_customers.map((c, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span>{c.name}</span>
              <span className="text-gray-500">${c.spent.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Popular Categories</h2>
          {data.popular_categories.map((c, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span>{c.name}</span>
              <span className="text-gray-500">{c.count} products</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Popular Brands</h2>
          {data.popular_brands?.map((b, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span>{b.name}</span>
              <span className="text-gray-500">{b.count} products</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">Slow Moving Products</h2>
          {data.slow_moving?.map((p, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span>{p.name}</span>
            </div>
          ))}
          {(!data.slow_moving || data.slow_moving.length === 0) && (
            <div className="text-sm text-gray-400">No slow moving products</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h2 className="font-bold mb-3">Recent Activity</h2>
        <div className="text-sm space-y-2">
          {data.recent_activity?.map((a) => (
            <div key={a.id} className="flex justify-between border-b py-1">
              <span>
                <span className={`font-medium ${a.operation === 'receiving' ? 'text-green-600' : a.operation === 'sale' ? 'text-red-600' : 'text-blue-600'}`}>
                  {a.operation.replace('_', ' ')}
                </span>
                <span className="text-gray-500 ml-2">variant #{a.variant_id}</span>
              </span>
              <div>
                <span className="text-gray-500">{a.quantity > 0 ? `+${a.quantity}` : a.quantity}</span>
                <span className="text-gray-400 ml-2 text-xs">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
