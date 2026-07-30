import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function InventoryHistory() {
  const [movements, setMovements] = useState([])
  const [operation, setOperation] = useState('')
  const [variantId, setVariantId] = useState('')

  const fetch = () => {
    const params = { limit: 100 }
    if (operation) params.operation = operation
    if (variantId) params.variant_id = variantId
    api.get('/inventory-history', { params }).then((r) => setMovements(r.data)).catch(() => {})
  }

  useEffect(() => { fetch() }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('inventory.title')}</h1>
      <div className="flex gap-4 mb-4">
        <input type="text" placeholder={t('inventory.variant_id')} value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-1 text-sm w-32" />
        <select value={operation} onChange={(e) => setOperation(e.target.value)} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-1 text-sm">
          <option value="">{t('inventory.all_ops')}</option>
          {['receiving', 'sale', 'return', 'write_off', 'adjustment', 'transfer'].map((o) => (
            <option key={o} value={o}>{o.replace('_', ' ')}</option>
          ))}
        </select>
        <button onClick={fetch} className="bg-blue-600 text-white px-4 py-1 rounded text-sm">{t('common.search')}</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left">
            <tr>
              <th className="p-3 dark:text-gray-300">{t('inventory.time')}</th>
              <th className="p-3 dark:text-gray-300">{t('inventory.product')}</th>
              <th className="p-3 dark:text-gray-300">SKU</th>
              <th className="p-3 dark:text-gray-300">{t('inventory.operation')}</th>
              <th className="p-3 dark:text-gray-300">{t('inventory.qty')}</th>
              <th className="p-3 dark:text-gray-300">{t('inventory.warehouse')}</th>
              <th className="p-3 dark:text-gray-300">{t('inventory.by')}</th>
              <th className="p-3 dark:text-gray-300">{t('inventory.doc')}</th>
              <th className="p-3 dark:text-gray-300">{t('inventory.reason')}</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-t dark:border-gray-700">
                <td className="p-3 whitespace-nowrap dark:text-gray-300">{new Date(m.created_at).toLocaleString()}</td>
                <td className="p-3 dark:text-gray-300">{m.product_name || '-'}</td>
                <td className="p-3 dark:text-gray-300">{m.variant_sku || '-'}</td>
                <td className="p-3">
                  <span className={`font-medium ${m.operation === 'receiving' ? 'text-green-600 dark:text-green-400' : m.operation === 'sale' ? 'text-red-600 dark:text-red-400' : m.operation === 'return' ? 'text-blue-600 dark:text-blue-400' : m.operation === 'write_off' ? 'text-orange-600 dark:text-orange-400' : 'text-purple-600 dark:text-purple-400'}`}>
                    {m.operation.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3 dark:text-gray-300">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                <td className="p-3 dark:text-gray-300">{m.warehouse_name || '-'}</td>
                <td className="p-3 dark:text-gray-300">{m.performed_by_name || '-'}</td>
                <td className="p-3 dark:text-gray-300">{m.document_number || '-'}</td>
                <td className="p-3 max-w-xs truncate dark:text-gray-300">{m.reason || '-'}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr><td colSpan="9" className="p-3 text-center text-gray-400 dark:text-gray-500">{t('inventory.no_movements')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
