import { useState, useEffect } from 'react'
import api from '../api/client'

const opBadge = {
  receiving: 'bg-secondary-container text-on-secondary-container',
  sale: 'bg-error-container text-on-error-container',
  return: 'bg-surface-container-highest text-on-surface',
  write_off: 'bg-surface-container-highest text-on-surface-variant',
  adjustment: 'bg-surface-container-highest text-on-surface-variant',
  transfer: 'bg-surface-container-highest text-on-surface-variant',
}

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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
            Inventory History
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Full audit trail of every stock movement.</p>
        </div>
        <button onClick={fetch} className="flex items-center gap-2 px-6 py-2 border border-outline-variant hover:border-secondary hover:text-secondary transition-all duration-300 font-label-sm text-label-sm uppercase tracking-widest w-fit">
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-4 py-4 border-y border-outline-variant">
        <input
          type="text" placeholder="Variant ID"
          className="w-32 bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 font-body-md text-body-md placeholder:text-on-surface-variant/40"
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
        />
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="bg-transparent border border-outline-variant focus:border-secondary outline-none px-3 py-2 text-label-sm text-label-sm uppercase tracking-widest cursor-pointer"
        >
          <option value="" className="bg-surface-container">All operations</option>
          {['receiving', 'sale', 'return', 'write_off', 'adjustment', 'transfer'].map((o) => (
            <option key={o} value={o} className="bg-surface-container">{o.replace('_', ' ')}</option>
          ))}
        </select>
        <button onClick={fetch} className="px-6 py-2 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 transition-all">
          Search
        </button>
        <span className="font-label-sm text-label-sm text-on-surface-variant ml-auto">{movements.length} entries</span>
      </div>

      <div className="bg-surface-container-low border border-outline-variant">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1080px]">
            <thead>
              <tr className="border-b border-outline-variant">
                {['Time', 'Product', 'SKU', 'Operation', 'Qty', 'Warehouse', 'By', 'Document', 'Reason'].map((h) => (
                  <th key={h} className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap text-on-surface-variant font-body-md text-body-md">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface">{m.product_name || '-'}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{m.variant_sku || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] ${opBadge[m.operation] || 'bg-surface-container-highest text-on-surface-variant'}`}>
                      {m.operation.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`py-4 px-6 font-body-md text-body-md font-bold ${m.quantity > 0 ? 'text-secondary' : 'text-error'}`}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{m.warehouse_name || '-'}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{m.performed_by_name || '-'}</td>
                  <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{m.document_number || '-'}</td>
                  <td className="py-4 px-6 max-w-xs truncate font-body-md text-body-md text-on-surface-variant">{m.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 && (
            <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">No movements found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
