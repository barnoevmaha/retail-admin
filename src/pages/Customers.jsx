import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Customers() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    api.get('/customers/').then((r) => setCustomers(r.data)).catch(() => {})
  }, [])

  const toggleBlock = async (id) => {
    try {
      await api.put(`/customers/${id}/block`)
      setCustomers(customers.map((c) => c.id === id ? { ...c, is_blocked: !c.is_blocked } : c))
    } catch {}
  }

  const verified = (c) => {
    const v = []
    if (c.email_verified) v.push('email')
    if (c.phone_verified) v.push('phone')
    return v
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          Customers
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage your customer base, verification, and loyalty.</p>
      </header>

      <div className="bg-surface-container-low border border-outline-variant">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1080px]">
            <thead>
              <tr className="border-b border-outline-variant">
                {['Name', 'Email', 'Phone', 'Verified', 'Last Login', 'Orders', 'Spent', 'Loyalty', 'Status'].map((h, i) => (
                  <th key={h} className={`py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ${i >= 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {customers.map((c) => {
                const v = verified(c)
                return (
                  <tr key={c.id} className={`hover:bg-surface-container transition-colors ${c.is_blocked ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-6 font-body-md text-body-md text-primary font-medium">{c.first_name} {c.last_name}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{c.email || '—'}</td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{c.phone || '—'}</td>
                    <td className="py-4 px-6">
                      {v.length === 0 ? (
                        <span className="text-on-surface-variant/60 font-body-md text-body-md">—</span>
                      ) : (
                        <div className="flex gap-1">
                          {v.map((x) => (
                            <span key={x} className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] bg-secondary-container text-on-secondary-container">{x}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{c.last_login ? new Date(c.last_login).toLocaleDateString() : '—'}</td>
                    <td className="py-4 px-6 text-right font-body-md text-body-md text-on-surface">{c.total_purchases}</td>
                    <td className="py-4 px-6 text-right font-body-md text-body-md text-secondary font-bold">${parseFloat(c.total_spent).toFixed(2)}</td>
                    <td className="py-4 px-6 text-right font-body-md text-body-md text-on-surface-variant">{c.loyalty_level}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => toggleBlock(c.id)}
                        className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-[2px] border transition-all duration-300 ${
                          c.is_blocked
                            ? 'border-secondary text-secondary hover:bg-secondary hover:text-on-secondary'
                            : 'border-error/60 text-error hover:bg-error hover:text-on-error'
                        }`}
                      >
                        {c.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">No customers yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
