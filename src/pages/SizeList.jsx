import { useState, useEffect } from 'react'
import api from '../api/client'

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
      <h1 className="text-2xl font-bold mb-4">Sizes</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder="Name" className="border p-2 rounded flex-1" value={name}
          onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="Sort" className="border p-2 rounded w-24" value={order}
          onChange={(e) => setOrder(parseInt(e.target.value) || 0)} />
        <button onClick={add} className="bg-gray-900 text-white px-4 rounded hover:bg-gray-800">Add</button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {sizes.map((s) => (
          <div key={s.id} className="flex justify-between p-3 border-b text-sm">
            <span className="font-medium">{s.name}</span>
            <span className="text-gray-500">Order: {s.sort_order}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
