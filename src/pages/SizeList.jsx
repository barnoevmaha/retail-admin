import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function SizeList() {
  const [sizes, setSizes] = useState([])
  const [name, setName] = useState('')

  useEffect(() => { api.get('/sizes/').then((r) => setSizes(r.data)).catch(() => {}) }, [])

  const refresh = () => api.get('/sizes/').then((r) => setSizes(r.data))

  const add = async () => {
    if (!name) return
    await api.post('/sizes/', { name, sort_order: sizes.length })
    setName('')
    refresh()
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this size?')) return
    await api.delete(`/sizes/${id}`)
    refresh()
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Attribute Editor</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Define and manage global product variations. These attributes form the foundation of inventory permutations.</p>
      </div>

      <section className="bg-surface border border-outline-variant rounded-xl p-8 flex flex-col max-w-2xl h-[560px]">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
          <h3 className="font-headline-sm text-headline-sm text-primary">{t('sizes.title')}</h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{sizes.length} Active</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="flex flex-wrap gap-3">
            {sizes.map((s) => (
              <div key={s.id} className="group relative bg-surface-container-high border border-outline-variant rounded-[4px] flex items-center justify-center min-w-[3rem] h-12 px-4 hover:border-secondary transition-colors cursor-default">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">{s.name}</span>
                <button
                  onClick={() => remove(s.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-surface rounded-full border border-outline-variant flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-error hover:text-error transition-all"
                >
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </div>
            ))}
          </div>
          {sizes.length === 0 && (
            <div className="py-12 text-center font-body-md text-body-md text-on-surface-variant">No sizes yet.</div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-outline-variant">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body-md text-body-md text-primary uppercase focus:ring-0 focus:outline-none focus:border-secondary transition-colors placeholder:text-on-surface-variant"
                placeholder="New size identifier..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button
              onClick={add}
              className="w-10 h-10 flex items-center justify-center rounded-[4px] bg-surface-container-highest hover:bg-secondary hover:text-on-secondary text-primary transition-colors border border-outline-variant hover:border-secondary"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
