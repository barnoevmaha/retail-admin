import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'
import { slugify } from '../utils/slugify'

const imgSrc = (b) => (typeof b.logo_url === 'string' ? b.logo_url : typeof b.logo === 'string' ? b.logo : null)

export default function Brands() {
  const [brands, setBrands] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDirty, setSlugDirty] = useState(false)

  useEffect(() => { api.get('/brands/').then((r) => setBrands(r.data)).catch(() => {}) }, [])

  const refresh = () => api.get('/brands/').then((r) => setBrands(r.data))

  const add = async () => {
    if (!name) return
    await api.post('/brands/', { name, slug })
    setName(''); setSlug(''); setSlugDirty(false); setFormOpen(false)
    refresh()
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this brand?')) return
    await api.delete(`/brands/${id}`)
    refresh()
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-lg text-body-lg py-2 px-0 focus:ring-0 focus:outline-none focus:border-secondary transition-colors duration-300'

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-6">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase">{t('brands.title')}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('brands.subtitle')}</p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="group px-6 py-3 border border-outline-variant rounded-[4px] hover:border-secondary hover:text-secondary transition-colors duration-300 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">{t('common.create')}</span>
        </button>
      </div>

      {formOpen && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] items-end gap-6 border border-outline-variant rounded-[4px] bg-surface-container-low p-6">
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('brands.name')}
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
            {t('brands.slug')}
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
          <button
            onClick={add}
            className="px-6 py-2 border border-outline-variant rounded-[4px] font-label-sm text-label-sm text-on-surface hover:border-secondary hover:text-secondary transition-colors duration-300"
          >
            {t('common.add')}
          </button>
        </div>
      )}

      <div className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
        <div className="grid grid-cols-[100px_1fr_auto] md:grid-cols-[120px_2fr_1fr_auto] gap-4 p-6 border-b border-outline-variant bg-surface-container">
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('brands.logo')}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('brands.name')}</div>
          <div className="hidden md:block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">{t('common.products')}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right w-8"></div>
        </div>
        {brands.length === 0 ? (
          <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{t('brands.no_yet')}</div>
        ) : (
          brands.map((b) => (
            <div key={b.id} className="grid grid-cols-[100px_1fr_auto] md:grid-cols-[120px_2fr_1fr_auto] gap-4 p-6 items-center border-b border-outline-variant/50 hover:bg-surface-container transition-colors duration-200 group">
              <div className="w-16 h-16 bg-surface-container-high rounded-[4px] flex items-center justify-center border border-outline-variant overflow-hidden p-2">
                {imgSrc(b) ? (
                  <img className="max-w-full max-h-full object-contain grayscale opacity-80 group-hover:opacity-100 transition-opacity" src={imgSrc(b)} alt={b.name} />
                ) : (
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant/60">{b.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="font-body-lg text-body-lg text-primary uppercase tracking-wide">{b.name}</div>
              <div className="hidden md:block font-body-md text-body-md text-on-surface-variant text-right">{b.products_count ?? '—'} items</div>
              <div className="text-right flex items-center justify-end gap-2">
                <button onClick={() => remove(b.id)} className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                <button className="text-on-surface-variant hover:text-secondary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 flex justify-between items-center text-on-surface-variant">
        <span className="font-body-md text-body-md">Showing {brands.length} of {brands.length} brands</span>
        <div className="flex gap-2">
          <button disabled className="p-2 border border-outline-variant rounded-[4px] disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
          <button disabled className="p-2 border border-outline-variant rounded-[4px] disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
        </div>
      </div>
    </div>
  )
}
