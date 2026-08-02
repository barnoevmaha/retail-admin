import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function ColorList() {
  const [colors, setColors] = useState([])
  const [name, setName] = useState('')
  const [hex, setHex] = useState('')

  useEffect(() => { api.get('/colors/').then((r) => setColors(r.data)).catch(() => {}) }, [])

  const refresh = () => api.get('/colors/').then((r) => setColors(r.data))

  const add = async () => {
    if (!name) return
    await api.post('/colors/', { name, hex_value: hex || null })
    setName(''); setHex('')
    refresh()
  }

  const remove = async (id) => {
    if (!window.confirm(t('colors.delete_confirm'))) return
    await api.delete(`/colors/${id}`)
    refresh()
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body-md text-body-md text-primary focus:ring-0 focus:outline-none focus:border-secondary transition-colors placeholder:text-on-surface-variant'

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">{t('common.attribute_editor')}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">{t('common.attribute_subtitle')}</p>
      </div>

      <section className="bg-surface border border-outline-variant rounded-xl p-8 flex flex-col max-w-2xl h-[560px]">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
          <h3 className="font-headline-sm text-headline-sm text-primary">{t('colors.title')}</h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{t('common.active_count', { count: colors.length })}</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {colors.map((c) => (
            <div key={c.id} className="group flex items-center justify-between p-3 rounded-[4px] hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full border border-outline-variant" style={{ backgroundColor: c.hex_value || '#1c1b1b' }} />
                <span className="font-body-md text-body-md text-primary">{c.name}</span>
              </div>
              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{c.hex_value}</span>
                <button onClick={() => remove(c.id)} className="text-on-surface-variant hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          ))}
          {colors.length === 0 && (
            <div className="py-12 text-center font-body-md text-body-md text-on-surface-variant">{t('colors.no_yet')}</div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-outline-variant">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <input className={inputClass} placeholder={t("colors.new_placeholder")} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="w-24">
              <input className={inputClass + ' font-label-sm text-label-sm uppercase'} placeholder={t("colors.hex")} value={hex} onChange={(e) => setHex(e.target.value)} />
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
