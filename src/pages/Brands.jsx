import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function Brands() {
  const [brands, setBrands] = useState([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => { api.get('/brands/').then((r) => setBrands(r.data)) }, [])

  const add = async () => {
    if (!name || !slug) return
    await api.post('/brands/', { name, slug })
    setName(''); setSlug('')
    api.get('/brands/').then((r) => setBrands(r.data))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('brands.title')}</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder={t('brands.name')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder={t('brands.slug')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button onClick={add} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('common.create')}</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50">
        {brands.map((b) => (
          <div key={b.id} className="flex justify-between p-3 border-b dark:border-gray-700 text-sm">
            <span className="dark:text-gray-200">{b.name}</span>
            <span className="text-gray-500 dark:text-gray-400">{b.slug}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
