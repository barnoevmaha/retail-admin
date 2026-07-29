import { useState, useEffect } from 'react'
import api from '../api/client'

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
      <h1 className="text-2xl font-bold mb-4">Brands</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder="Name" className="border p-2 rounded flex-1" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Slug" className="border p-2 rounded flex-1" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button onClick={add} className="bg-gray-900 text-white px-4 rounded hover:bg-gray-800">Add</button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {brands.map((b) => (
          <div key={b.id} className="flex justify-between p-3 border-b text-sm">
            <span>{b.name}</span>
            <span className="text-gray-500">{b.slug}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
