import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

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
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('products.title')}</h1>
      <input
        type="text" placeholder={t('common.search')}
        className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full mb-4"
        value={search} onChange={(e) => setSearch(e.target.value)}
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left">
            <tr>
              <th className="p-3 dark:text-gray-300">{t('products.name')}</th>
              <th className="p-3 dark:text-gray-300">{t('products.slug')}</th>
              <th className="p-3 dark:text-gray-300">{t('products.active')}</th>
              <th className="p-3 dark:text-gray-300">{t('products.created')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 font-medium dark:text-gray-200">{p.name}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{p.slug}</td>
                <td className="p-3 dark:text-gray-200">{p.is_active ? '✅' : '❌'}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
