import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

const actionColors = {
  login: 'text-green-600 dark:text-green-400',
  logout: 'text-orange-600 dark:text-orange-400',
  create: 'text-blue-600 dark:text-blue-400',
  update: 'text-yellow-600 dark:text-yellow-400',
  delete: 'text-red-600 dark:text-red-400',
  inventory_change: 'text-purple-600 dark:text-purple-400',
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
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('audit.title')}</h1>
      <div className="flex gap-4 mb-4">
        <select value={entity} onChange={(e) => setEntity(e.target.value)} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-1 text-sm">
          <option value="">{t('audit.all_entities')}</option>
          {['user', 'product', 'variant', 'order', 'category', 'brand'].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-1 text-sm">
          <option value="">{t('audit.all_actions')}</option>
          {['login', 'logout', 'create', 'update', 'delete', 'inventory_change'].map((a) => (
            <option key={a} value={a}>{a.replace('_', ' ')}</option>
          ))}
        </select>
        <button onClick={fetch} className="bg-blue-600 text-white px-4 py-1 rounded text-sm">{t('audit.refresh')}</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left">
            <tr>
              <th className="p-3 dark:text-gray-300">{t('audit.time')}</th>
              <th className="p-3 dark:text-gray-300">{t('audit.user')}</th>
              <th className="p-3 dark:text-gray-300">{t('audit.action')}</th>
              <th className="p-3 dark:text-gray-300">{t('audit.entity')}</th>
              <th className="p-3 dark:text-gray-300">{t('audit.entity_id')}</th>
              <th className="p-3 dark:text-gray-300">{t('audit.details')}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t dark:border-gray-700">
                <td className="p-3 whitespace-nowrap dark:text-gray-300">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3 dark:text-gray-300">{log.user_email || '-'}</td>
                <td className={`p-3 font-medium ${actionColors[log.action] || ''}`}>{log.action.replace('_', ' ')}</td>
                <td className="p-3 dark:text-gray-300">{log.entity}</td>
                <td className="p-3 dark:text-gray-300">{log.entity_id ?? '-'}</td>
                <td className="p-3 max-w-xs truncate dark:text-gray-300">
                  {log.old_values && <span className="text-red-500 dark:text-red-400 text-xs">{t('audit.old')}: {JSON.stringify(log.old_values)} </span>}
                  {log.new_values && <span className="text-green-500 dark:text-green-400 text-xs">{t('audit.new')}: {JSON.stringify(log.new_values)}</span>}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="6" className="p-3 text-center text-gray-400 dark:text-gray-500">{t('audit.no_logs')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
