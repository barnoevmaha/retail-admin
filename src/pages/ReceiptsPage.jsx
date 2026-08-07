import { useState, useEffect } from 'react'
import api, { openReceipt, downloadReceipt } from '../api/client'
import { t } from '../i18n'

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([])

  useEffect(() => {
    api.get('/receipts/history', { params: { limit: 100 } }).then((r) => setReceipts(r.data)).catch(() => {})
  }, [])

  const printReceipt = (id) => openReceipt(`/receipts/${id}`)
  const downloadReceiptCb = (id) => downloadReceipt(`/receipts/${id}/download`)

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          {t('receipts.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('receipts.subtitle')}</p>
      </header>

      <div className="bg-surface-container-low border border-outline-variant">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="border-b border-outline-variant">
                {[t('receipts.receipt'), t('receipts.date'), t('receipts.total'), t('receipts.payment'), t('receipts.status'), t('receipts.items'), t('receipts.actions')].map((h, i) => (
                  <th key={h} className={`py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ${i >= 2 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 font-body-md text-body-md text-primary font-medium">#{r.id}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-4 px-6 text-right font-headline-sm text-headline-sm text-primary font-bold">${r.total.toFixed(2)}</td>
                  <td className="py-4 px-6 text-right font-body-md text-body-md text-on-surface-variant">{r.payment_method || '—'}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${
                      r.status === 'paid' || r.status === 'completed'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {t('status.' + r.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-body-md text-body-md text-on-surface-variant">{r.item_count}</td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button onClick={() => printReceipt(r.id)} className="px-4 py-1.5 border border-outline-variant font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant hover:border-secondary hover:text-secondary transition-all duration-300 mr-2">
                      {t('receipts.view')}
                    </button>
                    <button onClick={() => downloadReceiptCb(r.id)} className="px-4 py-1.5 border border-outline-variant font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant hover:border-secondary hover:text-secondary transition-all duration-300">
                      {t('receipts.download')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {receipts.length === 0 && (
            <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{t('receipts.no_yet')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
