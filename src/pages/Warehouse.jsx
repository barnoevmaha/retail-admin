import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function Warehouse() {
  const [barcode, setBarcode] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [variant, setVariant] = useState(null)
  const [movements, setMovements] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/warehouse/movements', { params: { limit: 20 } }).then((r) => setMovements(r.data)).catch(() => {})
  }, [])

  const refresh = () =>
    api.get('/warehouse/movements', { params: { limit: 20 } }).then((r) => setMovements(r.data)).catch(() => {})

  const lookupBarcode = async () => {
    if (!barcode) return
    try {
      const r = await api.get(`/variants/barcode/${barcode}`)
      setVariant(r.data)
      setMsg('')
    } catch {
      setVariant(null)
      setMsg(t('common.not_found'))
    }
  }

  const receive = async () => {
    if (!variant) return
    try {
      await api.post('/warehouse/receive', { variant_id: variant.id, quantity, operation: 'receiving' })
      setMsg(t('warehouse.received_msg', { qty: quantity, barcode: variant.barcode }))
      setQuantity(1)
      setBarcode('')
      setVariant(null)
      refresh()
    } catch (err) {
      setMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
            {t('warehouse.title')}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('warehouse.subtitle')}</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-6 py-2 border border-outline-variant hover:border-secondary hover:text-secondary transition-all duration-300 font-label-sm text-label-sm uppercase tracking-widest w-fit">
          <span className="material-symbols-outlined">refresh</span>
          {t('common.refresh')}
        </button>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Barcode Lookup */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">{t('warehouse.lookup_title')}</h2>
            <div className="relative mb-2">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder={t("warehouse.scan_barcode")}
                className="w-full bg-transparent border-b border-outline-variant focus:border-secondary focus:ring-0 pl-8 pr-4 py-2 text-body-md transition-all outline-none placeholder:text-on-surface-variant/40"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()}
                autoFocus
              />
            </div>

            {variant ? (
              <div className="mt-6">
                <div className="aspect-[4/5] w-32 h-44 bg-surface-container overflow-hidden border border-outline-variant mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant opacity-40">checkroom</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">{variant.sku || t('common.product')}</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                  {variant.barcode}{variant.size ? ` · ${variant.size}` : ''}{variant.color ? ` / ${variant.color}` : ''}
                </p>
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{t('common.on_hand')}</span>
                  <span className="font-headline-md text-headline-md text-secondary">{variant.quantity ?? '—'}</span>
                </div>

                <div className="mt-8 flex items-end gap-3">
                  <div className="flex-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('common.quantity')}</label>
                    <input
                      type="number" min="1"
                      className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-lg font-body-lg"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <button onClick={receive} className="px-8 py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 transition-all">
                    {t('warehouse.receive_stock')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-10 text-center font-body-md text-body-md text-on-surface-variant/60">{t('warehouse.lookup_hint')}</p>
            )}

            {msg && <p className="mt-4 text-sm text-secondary">{msg}</p>}
          </div>
        </section>

        {/* Right: Movements */}
        <section className="col-span-12 lg:col-span-7 bg-surface-container-low border border-outline-variant">
          <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest px-6 pt-6 pb-4">{t('warehouse.recent_movements')}</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-t border-outline-variant">
                  {[t('inventory.operation'), t('common.variant'), t('inventory.qty'), t('common.date')].map((h, i) => (
                    <th key={h} className={`py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ${i === 3 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-container transition-colors">
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${m.quantity > 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {t('op.' + m.operation)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface">#{m.variant_id}</td>
                    <td className={`py-4 px-6 font-body-md text-body-md ${m.quantity > 0 ? 'text-secondary' : 'text-error'}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-4 px-6 text-right text-on-surface-variant font-body-md text-body-md">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 && (
              <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{t('warehouse.no_movements')}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
