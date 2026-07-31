import { useState, useEffect } from 'react'
import api from '../api/client'

const REASONS = ['inventory_count', 'correction', 'initial_balance']

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [reason, setReason] = useState('inventory_count')
  const [notes, setNotes] = useState('')
  const [barcode, setBarcode] = useState('')
  const [actualQty, setActualQty] = useState(0)
  const [msg, setMsg] = useState('')

  useEffect(() => { api.get('/adjustments/').then((r) => setAdjustments(r.data)).catch(() => {}) }, [])

  const loadDetail = async (id) => {
    setActiveId(id)
    try {
      const r = await api.get(`/adjustments/${id}`)
      setDetail(r.data)
      setMsg('')
    } catch { setDetail(null) }
  }

  const create = async () => {
    try {
      const r = await api.post('/adjustments/', { reason, notes: notes || null })
      setReason('inventory_count')
      setNotes('')
      loadDetail(r.data.id)
      api.get('/adjustments/').then((res) => setAdjustments(res.data))
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const addItem = async () => {
    if (!barcode || !activeId) return
    try {
      const v = await api.get(`/variants/barcode/${barcode}`)
      await api.post(`/adjustments/${activeId}/items`, {
        variant_id: v.data.id,
        expected_quantity: v.data.quantity,
        actual_quantity: actualQty,
      })
      setBarcode('')
      setActualQty(0)
      setMsg(`${v.data.barcode}: expected ${v.data.quantity} → actual ${actualQty}`)
      loadDetail(activeId)
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error')
    }
  }

  const confirm = async () => {
    if (!activeId) return
    try {
      const r = await api.post(`/adjustments/${activeId}/confirm`)
      setMsg(`Confirmed #${r.data.id} — ${r.data.items_count} items`)
      loadDetail(activeId)
      api.get('/adjustments/').then((res) => setAdjustments(res.data))
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.detail || 'Unknown'))
    }
  }

  const diffColor = (d) => (d > 0 ? 'text-secondary' : d < 0 ? 'text-error' : 'text-on-surface-variant')

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          Adjustments
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Reconcile expected stock against actual counts.</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Create + list */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">Create Adjustment</h2>
            <div className="space-y-5">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">Reason</label>
                <div className="flex flex-wrap gap-2">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`px-4 py-2 font-label-sm text-label-sm rounded-[4px] uppercase tracking-widest transition-colors ${
                        reason === r
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:border-secondary'
                      }`}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">Notes</label>
                <input
                  type="text" placeholder="Optional"
                  className="w-full bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <button onClick={create} className="w-full py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
                Create Adjustment
              </button>
            </div>
          </div>

          <div className="p-8 bg-surface-container-low border border-outline-variant">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">Adjustments</h2>
            {adjustments.map((a) => (
              <div
                key={a.id}
                onClick={() => loadDetail(a.id)}
                className={`flex justify-between items-center py-3 px-3 border-b border-outline-variant/30 cursor-pointer transition-colors ${
                  activeId === a.id ? 'bg-surface-container bg-surface-container-high' : 'hover:bg-surface-container'
                }`}
              >
                <div className="min-w-0">
                  <span className="font-body-md text-body-md text-primary font-medium">#{a.id}</span>
                  <span className="font-body-md text-body-md text-on-surface-variant ml-2">{a.reason.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${
                    a.status === 'confirmed'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {a.status}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{a.items_count} items</span>
                </div>
              </div>
            ))}
            {adjustments.length === 0 && (
              <div className="py-8 text-center font-body-md text-body-md text-on-surface-variant/60">No adjustments yet.</div>
            )}
          </div>
        </section>

        {/* Right: Detail */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {detail ? (
            <>
              <div className="p-8 bg-surface-container-low border border-outline-variant">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">Adjustment #{detail.id}</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      {detail.reason.replace('_', ' ')}{detail.notes ? ` · ${detail.notes}` : ''}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${
                    detail.status === 'confirmed'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {detail.status}
                  </span>
                </div>

                {detail.status === 'draft' && (
                  <div className="flex gap-3">
                    <input
                      type="text" placeholder="Scan barcode..."
                      className="flex-1 bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-md placeholder:text-on-surface-variant/40"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addItem()}
                      autoFocus
                    />
                    <input
                      type="number" min="0"
                      placeholder="Actual qty"
                      className="w-28 bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-center text-body-md placeholder:text-on-surface-variant/40"
                      value={actualQty}
                      onChange={(e) => setActualQty(parseInt(e.target.value) || 0)}
                    />
                    <button onClick={addItem} className="px-6 py-2 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined">add</span>
                      Record
                    </button>
                  </div>
                )}
                {msg && <p className="mt-3 text-sm text-secondary">{msg}</p>}
              </div>

              <div className="bg-surface-container-low border border-outline-variant">
                <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest px-6 pt-6 pb-4">Items</h2>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[520px]">
                    <thead>
                      <tr className="border-t border-outline-variant">
                        {['Product', 'Expected', 'Actual', 'Diff'].map((h, i) => (
                          <th key={h} className={`py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ${i >= 1 ? 'text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {detail.items.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container transition-colors">
                          <td className="py-4 px-6 font-body-md text-body-md text-on-surface">{item.barcode || `#${item.variant_id}`}</td>
                          <td className="py-4 px-6 text-right font-body-md text-body-md text-on-surface-variant">{item.expected_quantity}</td>
                          <td className="py-4 px-6 text-right font-body-md text-body-md text-on-surface">{item.actual_quantity}</td>
                          <td className={`py-4 px-6 text-right font-body-md text-body-md font-bold ${diffColor(item.difference)}`}>
                            {item.difference > 0 ? `+${item.difference}` : item.difference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {detail.items.length === 0 && (
                    <div className="py-12 text-center font-body-md text-body-md text-on-surface-variant/60">No items yet — scan a barcode above.</div>
                  )}
                </div>
              </div>

              {detail.status === 'draft' && detail.items.length > 0 && (
                <button onClick={confirm} className="py-4 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
                  Confirm Adjustment
                </button>
              )}
            </>
          ) : (
            <div className="flex-1 p-16 border border-dashed border-outline-variant flex flex-col items-center justify-center text-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl">rule</span>
              <p className="font-body-md text-body-md text-on-surface-variant/60">Select an adjustment or create a new one.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
