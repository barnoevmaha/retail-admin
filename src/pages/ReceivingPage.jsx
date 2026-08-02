import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function ReceivingPage() {
  const [receivings, setReceivings] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [startForm, setStartForm] = useState({ supplier_id: '', invoice_number: '', notes: '' })
  const [activeId, setActiveId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [barcode, setBarcode] = useState('')
  const [itemQty, setItemQty] = useState(1)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/receiving/').then((r) => setReceivings(r.data)).catch(() => {})
    api.get('/suppliers/').then((r) => setSuppliers(r.data.items)).catch(() => {})
  }, [])

  const loadDetail = async (id) => {
    setActiveId(id)
    try {
      const r = await api.get(`/receiving/${id}`)
      setDetail(r.data)
      setMsg('')
    } catch { setDetail(null) }
  }

  const startReceiving = async () => {
    const body = {
      supplier_id: startForm.supplier_id ? parseInt(startForm.supplier_id) : null,
      invoice_number: startForm.invoice_number || null,
      notes: startForm.notes || null,
    }
    try {
      const r = await api.post('/receiving/start', body)
      setStartForm({ supplier_id: '', invoice_number: '', notes: '' })
      loadDetail(r.data.id)
      api.get('/receiving/').then((res) => setReceivings(res.data))
    } catch (err) {
      setMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const addByBarcode = async () => {
    if (!barcode || !activeId) return
    try {
      const r = await api.post(`/receiving/${activeId}/add-by-barcode`, {
        barcode, quantity: itemQty, purchase_price: 0,
      })
      setBarcode('')
      setItemQty(1)
      setMsg(t('common.added_msg', { qty: r.data.quantity, barcode: r.data.barcode }))
      loadDetail(activeId)
    } catch (err) {
      setMsg(err.response?.status === 404
        ? `${t('receiving.barcode_not_found')} "${barcode}"`
        : 'Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const confirm = async () => {
    if (!activeId) return
    try {
      const r = await api.post(`/receiving/${activeId}/confirm`)
      setMsg(t('common.confirmed_msg', { id: r.data.id, count: r.data.total_quantity }))
      loadDetail(activeId)
      api.get('/receiving/').then((res) => setReceivings(res.data))
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          {t('receiving.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('receiving.subtitle')}</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Start new + recent */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">{t('receiving.start')}</h2>
            <div className="space-y-5">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('common.supplier')}</label>
                <select
                  className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md text-on-surface cursor-pointer"
                  value={startForm.supplier_id}
                  onChange={(e) => setStartForm({ ...startForm, supplier_id: e.target.value })}
                >
                  <option value="" className="bg-surface-container">{t('receiving.select_supplier')}</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id} className="bg-surface-container">{s.company_name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('receiving.invoice_number')}</label>
                <input
                  type="text" placeholder={t("receiving.invoice_placeholder")}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
                  value={startForm.invoice_number}
                  onChange={(e) => setStartForm({ ...startForm, invoice_number: e.target.value })}
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('common.notes')}</label>
                <input
                  type="text" placeholder={t("common.optional")}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
                  value={startForm.notes}
                  onChange={(e) => setStartForm({ ...startForm, notes: e.target.value })}
                />
              </div>
              <button onClick={startReceiving} className="w-full py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
                {t('receiving.start')}
              </button>
            </div>
          </div>

          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">{t('receiving.recent')}</h2>
            {receivings.map((r) => (
              <div
                key={r.id}
                onClick={() => loadDetail(r.id)}
                className={`flex justify-between items-center py-3 px-3 border-b border-outline-variant/30 cursor-pointer transition-colors ${
                  activeId === r.id ? 'bg-surface-container bg-surface-container-high' : 'hover:bg-surface-container'
                }`}
              >
                <div className="min-w-0">
                  <span className="font-body-md text-body-md text-primary font-medium">#{r.id}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant ml-2 truncate">{r.supplier_name || t('receiving.no_supplier')}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${
                    r.status === 'confirmed'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {t('status.' + r.status)}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{r.items_count} {t('common.items')}</span>
                </div>
              </div>
            ))}
            {receivings.length === 0 && (
              <div className="py-8 text-center font-body-md text-body-md text-on-surface-variant/60">{t('receiving.no_yet')}</div>
            )}
          </div>
        </section>

        {/* Right: Active session */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {detail ? (
            <>
              <div className="p-8 bg-surface-container-low border border-outline-variant">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">{t('receiving.receiving')} #{detail.id}</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      {detail.supplier_name || t('receiving.no_supplier')} · {detail.invoice_number || t('common.no_invoice')} · {t('status.' + detail.status)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${
                    detail.status === 'confirmed'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {t('status.' + detail.status)}
                  </span>
                </div>

                {detail.status === 'draft' && (
                  <div className="flex gap-3">
                    <input
                      type="text" placeholder={t("common.scan_item")}
                      className="flex-1 bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addByBarcode()}
                      autoFocus
                    />
                    <input
                      type="number" min="1"
                      className="w-20 bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-center text-body-md"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    />
                    <button onClick={addByBarcode} className="px-6 py-2 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined">add</span>
                      {t('common.add')}
                    </button>
                  </div>
                )}
                {msg && <p className="mt-3 text-sm text-secondary">{msg}</p>}
              </div>

              <div className="bg-surface-container-low border border-outline-variant">
                <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest px-6 pt-6 pb-4">{t('common.items_cap')}</h2>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[520px]">
                    <thead>
                      <tr className="border-t border-outline-variant">
                        {[t('common.product'), t('common.sku'), t('common.qty'), t('common.unit_price'), t('common.total')].map((h, i) => (
                          <th key={h} className={`py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ${i >= 3 ? 'text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {detail.items.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container transition-colors">
                          <td className="py-4 px-6 font-body-md text-body-md text-on-surface">{item.barcode || `#${item.variant_id}`}</td>
                          <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{item.sku}</td>
                          <td className="py-4 px-6 font-body-md text-body-md text-on-surface">x{item.quantity}</td>
                          <td className="py-4 px-6 text-right font-body-md text-body-md text-on-surface-variant">${parseFloat(item.purchase_price).toFixed(2)}</td>
                          <td className="py-4 px-6 text-right font-body-md text-body-md text-secondary">${(parseFloat(item.purchase_price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {detail.items.length === 0 && (
                    <div className="py-12 text-center font-body-md text-body-md text-on-surface-variant/60">{t('common.scan_hint')}</div>
                  )}
                </div>
              </div>

              {detail.status === 'draft' && detail.items.length > 0 && (
                <button onClick={confirm} className="w-full py-4 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
                  {t('receiving.confirm_btn')}
                </button>
              )}
            </>
          ) : (
            <div className="flex-1 p-16 border border-dashed border-outline-variant flex flex-col items-center justify-center text-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl">inventory_2</span>
              <p className="font-body-md text-body-md text-on-surface-variant/60">{t('receiving.select_hint')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
