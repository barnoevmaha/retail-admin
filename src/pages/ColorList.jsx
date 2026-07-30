import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function ColorList() {
  const [colors, setColors] = useState([])
  const [name, setName] = useState('')
  const [hex, setHex] = useState('')

  useEffect(() => { api.get('/colors/').then((r) => setColors(r.data)).catch(() => {}) }, [])

  const add = async () => {
    if (!name) return
    await api.post('/colors/', { name, hex_value: hex || null })
    setName(''); setHex('')
    api.get('/colors/').then((r) => setColors(r.data))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('colors.title')}</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder={t('colors.name')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1" value={name}
          onChange={(e) => setName(e.target.value)} />
        <input placeholder="#HEX" className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-32" value={hex}
          onChange={(e) => setHex(e.target.value)} />
        <button onClick={add} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('common.create')}</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50">
        {colors.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 border-b dark:border-gray-700 text-sm">
            <div className="w-6 h-6 rounded border dark:border-gray-600" style={{ backgroundColor: c.hex_value || '#ccc' }} />
            <span className="font-medium dark:text-gray-200">{c.name}</span>
            <span className="text-gray-500 dark:text-gray-400">{c.hex_value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
