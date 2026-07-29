import { useState, useEffect } from 'react'
import api from '../api/client'

const actionColors = {
  login: 'text-green-600',
  logout: 'text-orange-600',
  create: 'text-blue-600',
  update: 'text-yellow-600',
  delete: 'text-red-600',
  inventory_change: 'text-purple-600',
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')

  const fetch = () => {
    const params = {}
    if (entity) params.entity = entity
    if (action) params.action = action
    api.get('/audit-logs', { params }).then((r) => setLogs(r.data)).catch(() => {})
  }

  useEffect(() => { fetch() }, [entity, action])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      <div className="flex gap-4 mb-4">
        <select value={entity} onChange={(e) => setEntity(e.target.value)} className="border rounded px-3 py-1 text-sm">
          <option value="">All Entities</option>
          {['user', 'product', 'variant', 'order', 'category', 'brand'].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="border rounded px-3 py-1 text-sm">
          <option value="">All Actions</option>
          {['login', 'logout', 'create', 'update', 'delete', 'inventory_change'].map((a) => (
            <option key={a} value={a}>{a.replace('_', ' ')}</option>
          ))}
        </select>
        <button onClick={fetch} className="bg-blue-600 text-white px-4 py-1 rounded text-sm">Refresh</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Entity ID</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3">{log.user_email || '-'}</td>
                <td className={`p-3 font-medium ${actionColors[log.action] || ''}`}>{log.action.replace('_', ' ')}</td>
                <td className="p-3">{log.entity}</td>
                <td className="p-3">{log.entity_id ?? '-'}</td>
                <td className="p-3 max-w-xs truncate">
                  {log.old_values && <span className="text-red-500 text-xs">Old: {JSON.stringify(log.old_values)} </span>}
                  {log.new_values && <span className="text-green-500 text-xs">New: {JSON.stringify(log.new_values)}</span>}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="6" className="p-3 text-center text-gray-400">No audit logs found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
