import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'
import { slugify } from '../utils/slugify'

const imgSrc = (c) => (typeof c.image_url === 'string' ? c.image_url : typeof c.image === 'string' ? c.image : null)

export default function Categories() {
  const [cats, setCats] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDirty, setSlugDirty] = useState(false)
  const [sizeSystem, setSizeSystem] = useState('')
  const [sizeSystems, setSizeSystems] = useState([])

  useEffect(() => {
    api.get('/categories/').then((r) => setCats(r.data)).catch(() => {})
    api.get('/categories/size-systems').then((r) => setSizeSystems(r.data)).catch(() => {})
  }, [])

  const refresh = () => api.get('/categories/').then((r) => setCats(r.data))

  const save = async () => {
    if (!name) return
    const payload = { name, slug, size_system: sizeSystem || null }
    if (editing) await api.put(`/categories/${editing}`, payload)
    else await api.post('/categories/', payload)
    setName(''); setSlug(''); setSlugDirty(false); setSizeSystem(''); setEditing(null); setFormOpen(false)
    refresh()
  }

  const edit = (c) => {
    setEditing(c.id)
    setName(c.name)
    setSlug(c.slug || '')
    setSizeSystem(c.size_system || '')
    setSlugDirty(true)
    setFormOpen(true)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return
    await api.delete(`/categories/${id}`)
    refresh()
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-lg text-body-lg py-2 px-0 focus:ring-0 focus:outline-none focus:border-secondary transition-colors duration-300'

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">{t('categories.title')}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('categories.subtitle')}</p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-[4px] hover:border-secondary hover:text-secondary transition-colors duration-300 text-primary font-label-sm text-label-sm uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {t('common.create')}
        </button>
      </div>

      {formOpen && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] items-end gap-6 border border-outline-variant rounded-[4px] bg-surface-container-low p-6">
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('categories.name')}
            <input
              className={inputClass + ' mt-2'}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slugDirty) setSlug(slugify(e.target.value))
              }}
            />
          </label>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('categories.slug')}
            <input
              className={inputClass + ' mt-2'}
              value={slug}
              onChange={(e) => {
                setSlugDirty(true)
                setSlug(e.target.value)
              }}
            />
            <span className="mt-1 block font-body-sm text-body-sm text-on-surface-variant normal-case tracking-normal">{t('common.used_in_urls')}</span>
          </label>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('categories.size_system')}
            <select
              className={inputClass + ' mt-2 cursor-pointer'}
              value={sizeSystem}
              onChange={(e) => setSizeSystem(e.target.value)}
            >
              <option value="">{t('categories.size_system_none')}</option>
              {sizeSystems.map((s) => (
                <option key={s.key} value={s.key}>{s.sizes.join(', ')}</option>
              ))}
            </select>
          </label>
          <button
            onClick={save}
            className="px-6 py-2 border border-outline-variant rounded-[4px] font-label-sm text-label-sm text-on-surface hover:border-secondary hover:text-secondary transition-colors duration-300"
          >
            {editing ? t('common.save') : t('common.add')}
          </button>
        </div>
      )}

      <div className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-12"></th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-24">{t('categories.image')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('categories.name')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('categories.slug')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('categories.sizes')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">{t('common.products')}</th>
              <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right w-28">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {cats.map((c) => (
              <tr key={c.id} className="hover:bg-surface-container/50 transition-colors duration-200 group">
                <td className="py-4 px-6 text-center cursor-move text-on-surface-variant group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                </td>
                <td className="py-4 px-6">
                  <div className="w-12 h-12 rounded-[4px] bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden">
                    {imgSrc(c) ? (
                      <img className="w-full h-full object-cover" src={imgSrc(c)} alt={c.name} />
                    ) : (
                      <span className="font-headline-sm text-headline-sm text-on-surface-variant/60">{c.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 font-body-lg text-body-lg text-primary">{c.name}</td>
                <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">/{c.slug}</td>
                <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">
                  {c.size_system ? sizeSystems.find((s) => s.key === c.size_system)?.sizes.join(', ') || c.size_system : '—'}
                </td>
                <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant text-right">{c.products_count ?? '-'}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => edit(c)} className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    <button onClick={() => remove(c.id)} className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cats.length === 0 && (
          <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{t('categories.no_yet')}</div>
        )}
      </div>
    </div>
  )
}
