import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/products/', { params: { q: search, limit: 50 } })
      .then((r) => setProducts(r.data.items))
      .catch(() => {})
  }, [search])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <input
        type="text" placeholder="Search products..."
        className="border p-2 rounded w-full mb-4"
        value={search} onChange={(e) => setSearch(e.target.value)}
      />
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Active</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-gray-500">{p.slug}</td>
                <td className="p-3">{p.is_active ? '✅' : '❌'}</td>
                <td className="p-3 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
