import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

const REASONS = ['damaged', 'lost', 'expired', 'manual']

export default function WriteOffsPage() {
  const [writeoffs, setWriteoffs] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [reason, setReason] = useState('damaged')
  const [notes, setNotes] = useState('')
  const [barcode, setBarcode] = useState('')
  const [itemQty, setItemQty] = useState(1)
  const [msg, setMsg] = useState('')

  useEffect(() => { api.get('/writeoffs/').then((r) => setWriteoffs(r.data)).catch(() => {}) }, [])

  const loadDetail = async (id) => {
    setActiveId(id)
    const r = await api.get(`/writeoffs/${id}`)
    setDetail(r.data)
    setMsg('')
  }

  const create = async () => {
    const r = await api.post('/writeoffs/', { reason, notes: notes || null })
    setReason('damaged')
    setNotes('')
    loadDetail(r.data.id)
    api.get('/writeoffs/').then((res) => setWriteoffs(res.data))
  }

  const addItem = async () => {
    if (!barcode || !activeId) return
    try {
      const v = await api.get(`/variants/barcode/${barcode}`)
      await api.post(`/writeoffs/${activeId}/items`, { variant_id: v.data.id, quantity: itemQty })
      setBarcode('')
      setItemQty(1)
      setMsg(`${t('writeoffs.added')} ${itemQty} x ${v.data.barcode}`)
      loadDetail(activeId)
    } catch (err) {
      setMsg(err.response?.data?.detail || t('toast.error'))
    }
  }

  const confirm = async () => {
    if (!activeId) return
    const r = await api.post(`/writeoffs/${activeId}/confirm`)
    setMsg(`${t('writeoffs.confirmed')} #${r.data.id} — ${r.data.total_quantity} ${t('writeoffs.items')}`)
    loadDetail(activeId)
    api.get('/writeoffs/').then((res) => setWriteoffs(res.data))
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('writeoffs.title')}</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('writeoffs.new')}</h2>
          <select className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full mb-2" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input type="text" placeholder={t('suppliers.notes')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full mb-2"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button onClick={create} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200">{t('writeoffs.create')}</button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <h2 className="font-bold mb-3 dark:text-white">{t('writeoffs.list')}</h2>
          {writeoffs.map((w) => (
            <div key={w.id} onClick={() => loadDetail(w.id)}
              className={`flex justify-between py-2 px-2 border-b dark:border-gray-700 text-sm cursor-pointer rounded ${
                activeId === w.id ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              <div>
                <span className="font-medium dark:text-gray-200">#{w.id}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">{w.reason}</span>
              </div>
              <div className="flex gap-3">
                <span className={`px-2 rounded text-xs font-medium ${
                  w.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                }`}>{w.status}</span>
                <span className="text-gray-500 dark:text-gray-400">{w.items_count} {t('writeoffs.items')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4 dark:text-white">{detail ? `${t('writeoffs.writeoff')} #${detail.id}` : t('writeoffs.select')}</h2>
        {detail && (
          <div>
            {detail.status === 'draft' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
                <div className="flex gap-2">
                  <input type="text" placeholder={t('warehouse.scan_barcode')} className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1"
                    value={barcode} onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()} autoFocus />
                  <input type="number" min="1" className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-20" value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)} />
                  <button onClick={addItem} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">{t('common.create')}</button>
                </div>
                {msg && <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{msg}</div>}
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-4">
              <h3 className="font-bold mb-2 dark:text-white">{t('writeoffs.items')}</h3>
              {detail.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b dark:border-gray-700 text-sm">
                  <span className="font-medium dark:text-gray-200">{item.barcode || `#${item.variant_id}`}</span>
                  <span className="text-red-600 dark:text-red-400">-{item.quantity}</span>
                </div>
              ))}
              {detail.items.length === 0 && <div className="text-gray-400 dark:text-gray-500 text-center py-4">{t('writeoffs.no_items')}</div>}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('returns.reason')}: {detail.reason} | {detail.notes || ''}</div>
            {detail.status === 'draft' && detail.items.length > 0 && (
              <button onClick={confirm}
                className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700">{t('writeoffs.confirm_btn')}</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
