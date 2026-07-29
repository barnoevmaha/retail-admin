import { useState, useEffect } from 'react'
import api from '../api/client'

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
      <h1 className="text-2xl font-bold mb-4">Colors</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder="Name" className="border p-2 rounded flex-1" value={name}
          onChange={(e) => setName(e.target.value)} />
        <input placeholder="#HEX" className="border p-2 rounded w-32" value={hex}
          onChange={(e) => setHex(e.target.value)} />
        <button onClick={add} className="bg-gray-900 text-white px-4 rounded hover:bg-gray-800">Add</button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {colors.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 border-b text-sm">
            <div className="w-6 h-6 rounded border" style={{ backgroundColor: c.hex_value || '#ccc' }} />
            <span className="font-medium">{c.name}</span>
            <span className="text-gray-500">{c.hex_value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
