import { useState, useEffect } from 'react'
import api from '../api/client'

const actionBadge = {
  login: 'bg-surface-container-highest text-on-surface-variant',
  logout: 'bg-surface-container-highest text-on-surface-variant',
  create: 'bg-secondary-container text-on-secondary-container',
  update: 'bg-surface-container-highest text-on-surface',
  delete: 'bg-error-container text-on-error-container',
  inventory_change: 'bg-secondary-container text-on-secondary-container',
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

  const selectCls =
    'bg-transparent border border-outline-variant focus:border-secondary outline-none px-3 py-2 text-label-sm text-label-sm uppercase tracking-widest cursor-pointer'

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
            Audit Log
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Track every action taken across the system.</p>
        </div>
        <button onClick={fetch} className="flex items-center gap-2 px-6 py-2 border border-outline-variant hover:border-secondary hover:text-secondary transition-all duration-300 font-label-sm text-label-sm uppercase tracking-widest w-fit">
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-4 py-4 border-y border-outline-variant">
        <select value={entity} onChange={(e) => setEntity(e.target.value)} className={selectCls}>
          <option value="" className="bg-surface-container">All entities</option>
          {['user', 'product', 'variant', 'order', 'category', 'brand'].map((e) => (
            <option key={e} value={e} className="bg-surface-container">{e}</option>
          ))}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className={selectCls}>
          <option value="" className="bg-surface-container">All actions</option>
          {['login', 'logout', 'create', 'update', 'delete', 'inventory_change'].map((a) => (
            <option key={a} value={a} className="bg-surface-container">{a.replace('_', ' ')}</option>
          ))}
        </select>
        <span className="font-label-sm text-label-sm text-on-surface-variant ml-auto">{logs.length} entries</span>
      </div>

      <div className="bg-surface-container-low border border-outline-variant">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-outline-variant">
                {['Time', 'User', 'Action', 'Entity', 'Entity ID', 'Details'].map((h) => (
                  <th key={h} className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap text-on-surface-variant font-body-md text-body-md">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface">{log.user_email || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${actionBadge[log.action] || 'bg-surface-container-highest text-on-surface-variant'}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{log.entity}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{log.entity_id ?? '-'}</td>
                  <td className="py-4 px-6 max-w-xs">
                    {log.old_values && (
                      <span className="block text-xs text-error truncate">old: {JSON.stringify(log.old_values)}</span>
                    )}
                    {log.new_values && (
                      <span className="block text-xs text-secondary truncate">new: {JSON.stringify(log.new_values)}</span>
                    )}
                    {!log.old_values && !log.new_values && <span className="font-body-md text-body-md text-on-surface-variant/60">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">No log entries match.</div>
          )}
        </div>
      </div>
    </div>
  )
}
