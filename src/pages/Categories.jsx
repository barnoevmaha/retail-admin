import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function Categories() {
  const [cats, setCats] = useState([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => { api.get('/categories/').then((r) => setCats(r.data)) }, [])

  const add = async () => {
    if (!name || !slug) return
    await api.post('/categories/', { name, slug })
    setName(''); setSlug('')
    api.get('/categories/').then((r) => setCats(r.data))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('categories.title')}</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder={t('categories.name')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder={t('categories.slug')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button onClick={add} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('common.create')}</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50">
        {cats.map((c) => (
          <div key={c.id} className="flex justify-between p-3 border-b dark:border-gray-700 text-sm">
            <span className="dark:text-gray-200">{c.name}</span>
            <span className="text-gray-500 dark:text-gray-400">{c.slug}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
