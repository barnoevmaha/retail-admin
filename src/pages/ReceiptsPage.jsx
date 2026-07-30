import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([])

  useEffect(() => {
    api.get('/receipts/history', { params: { limit: 100 } }).then((r) => setReceipts(r.data)).catch(() => {})
  }, [])

  const printReceipt = (id) => window.open(`/api/receipts/${id}`, '_blank')
  const downloadReceipt = (id) => window.open(`/api/receipts/${id}/download`, '_blank')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('receipts.title')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left">
            <tr>
              <th className="p-3 dark:text-gray-300">{t('receipts.receipt')}</th>
              <th className="p-3 dark:text-gray-300">{t('receipts.date')}</th>
              <th className="p-3 dark:text-gray-300">{t('receipts.total')}</th>
              <th className="p-3 dark:text-gray-300">{t('receipts.payment')}</th>
              <th className="p-3 dark:text-gray-300">{t('receipts.status')}</th>
              <th className="p-3 dark:text-gray-300">{t('receipts.items')}</th>
              <th className="p-3 dark:text-gray-300">{t('receipts.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 font-medium dark:text-gray-200">#{r.id}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3 font-bold dark:text-gray-200">${r.total.toFixed(2)}</td>
                <td className="p-3 dark:text-gray-300">{r.payment_method || '-'}</td>
                <td className="p-3 dark:text-gray-300">{r.status}</td>
                <td className="p-3 dark:text-gray-300">{r.item_count}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => printReceipt(r.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">{t('receipts.view')}</button>
                  <button onClick={() => downloadReceipt(r.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600">{t('receipts.download')}</button>
                </td>
              </tr>
            ))}
            {receipts.length === 0 && (
              <tr><td colSpan="7" className="p-3 text-center text-gray-400 dark:text-gray-500">{t('receipts.no_receipts')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
