import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function SizeList() {
  const [sizes, setSizes] = useState([])
  const [name, setName] = useState('')
  const [order, setOrder] = useState(0)

  useEffect(() => { api.get('/sizes/').then((r) => setSizes(r.data)).catch(() => {}) }, [])

  const add = async () => {
    if (!name) return
    await api.post('/sizes/', { name, sort_order: order })
    setName(''); setOrder(0)
    api.get('/sizes/').then((r) => setSizes(r.data))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('sizes.title')}</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder={t('sizes.name')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1" value={name}
          onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder={t('sizes.sort')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-24" value={order}
          onChange={(e) => setOrder(parseInt(e.target.value) || 0)} />
        <button onClick={add} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('common.create')}</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50">
        {sizes.map((s) => (
          <div key={s.id} className="flex justify-between p-3 border-b dark:border-gray-700 text-sm">
            <span className="font-medium dark:text-gray-200">{s.name}</span>
            <span className="text-gray-500 dark:text-gray-400">{t('sizes.order')}: {s.sort_order}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
