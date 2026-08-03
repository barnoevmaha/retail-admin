import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

const imgSrc = (p) =>
  p.images?.[0]?.image_url || (typeof p.image_url === 'string' ? p.image_url : null)

const Dropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-[4px] border border-outline-variant cursor-pointer hover:border-secondary transition-colors"
      >
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</span>
        <span className="font-body-md text-body-md text-primary">{options.find((o) => o.value === value)?.label}</span>
        <span className="material-symbols-outlined text-on-surface-variant text-sm">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 min-w-full max-h-72 overflow-auto bg-surface-container border border-outline-variant rounded-[4px] shadow-lg py-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2 font-body-md text-body-md hover:bg-surface-container-high transition-colors ${o.value === value ? 'text-secondary' : 'text-primary'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [catId, setCatId] = useState('')
  const [status, setStatus] = useState('')
  const [sel, setSel] = useState(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category_id: '', brand_id: '', image_url: '' })
  const [files, setFiles] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [saveMsg, setSaveMsg] = useState('')

  const load = () => {
    api.get('/products/', {
      params: {
        q: search,
        limit: 50,
        category_id: catId || undefined,
        is_active: status === '' ? undefined : status === 'active',
      },
    })
      .then((r) => { setProducts(r.data.items); setSel((s) => new Set([...s].filter((id) => r.data.items.some((p) => p.id === id)))) })
      .catch(() => {})
  }

  useEffect(() => { load() }, [search, catId, status])

  useEffect(() => {
    api.get('/categories/').then((r) => setCategories(r.data)).catch(() => {})
    api.get('/brands/').then((r) => setBrands(r.data)).catch(() => {})
  }, [])

  const create = async () => {
    if (!form.name.trim()) {
      setSaveMsg(t('products.name_required'))
      return
    }
    try {
      const { data } = await api.post('/products/', {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        brand_id: form.brand_id ? Number(form.brand_id) : null,
      })
      const url = form.image_url.trim()
      if (url) {
        await api.post(`/products/${data.id}/images/`, { image_url: url, is_main: true }).catch(() => {})
      }
      if (files.length) {
        await Promise.all(files.map((f, i) => {
          const fd = new FormData()
          fd.append('file', f)
          fd.append('sort_order', String(i))
          fd.append('is_main', String(i === 0 && !url))
          return api.post(`/products/${data.id}/images/upload`, fd).catch(() => {})
        }))
      }
      setFormOpen(false)
      setForm({ name: '', description: '', category_id: '', brand_id: '', image_url: '' })
      setFiles([])
      setSaveMsg('')
      load()
    } catch (err) {
      setSaveMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const addFiles = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
    e.target.value = ''
  }

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const toggle = (id) => setSel((prev) => {
    const s = new Set(prev)
    if (s.has(id)) s.delete(id); else s.add(id)
    return s
  })

  const toggleAll = () => {
    const allIds = products.map((p) => p.id)
    setSel((prev) => (prev.size === allIds.length && allIds.every((id) => prev.has(id)) ? new Set() : new Set(allIds)))
  }

  const del = async (id) => {
    if (!window.confirm(t('products.delete_confirm'))) return
    try {
      await api.delete(`/products/${id}`)
      setSaveMsg('')
      load()
    } catch (err) {
      setSaveMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const delSelected = async () => {
    if (!sel.size) return
    if (!window.confirm(t('products.delete_many_confirm', { n: sel.size }))) return
    try {
      await Promise.all([...sel].map((id) => api.delete(`/products/${id}`)))
      load()
    } catch (err) {
      setSaveMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-lg text-body-lg py-2 px-0 focus:ring-0 focus:outline-none focus:border-secondary transition-colors duration-300'

  const price = (p) => {
    const prices = (p.variants || []).map((v) => Number(v.selling_price) || 0)
    const min = prices.length ? Math.min(...prices) : 0
    return min ? `$${min.toLocaleString()}` : '—'
  }

  const stock = (p) => (p.variants || []).reduce((s, v) => s + (Number(v.stock_quantity) || 0), 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-2">{t('products.subtitle')}</span>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">{t('products.title')}</h2>
        </div>
        <button
          onClick={() => { setFormOpen(!formOpen); setSaveMsg('') }}
          className="px-6 py-3 border border-outline-variant rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider text-primary hover:border-secondary hover:text-secondary transition-all duration-300 w-fit"
        >
          {t('products.new')}
        </button>
      </div>

      {formOpen && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] items-end gap-6 border border-outline-variant rounded-[4px] bg-surface-container-low p-6">
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('products.name')}
            <input
              className={inputClass + ' mt-2'}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('products.category')}
            <select
              className={inputClass + ' mt-2 cursor-pointer'}
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value=""></option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('products.brand')}
            <select
              className={inputClass + ' mt-2 cursor-pointer'}
              value={form.brand_id}
              onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
            >
              <option value=""></option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('products.image_url')}
            <input
              className={inputClass + ' mt-2'}
              value={form.image_url}
              placeholder="https://..."
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </label>
          <div className="flex gap-3 items-end">
            <button
              onClick={create}
              className="px-6 py-2 border border-outline-variant rounded-[4px] font-label-sm text-label-sm text-on-surface hover:border-secondary hover:text-secondary transition-colors duration-300 uppercase tracking-wider"
            >
              {t('common.save')}
            </button>
          </div>
          <label className="block col-span-full font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            {t('products.photos')}
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-2 text-sm text-on-surface file:mr-3 file:px-3 file:py-1.5 file:border-0 file:rounded-[4px] file:bg-surface-container-highest file:text-primary file:font-label-sm file:text-label-sm cursor-pointer"
              onChange={addFiles}
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {files.map((f, i) => (
                  <div key={i} className="relative w-14 h-14 border border-outline-variant rounded-[4px] overflow-hidden">
                    <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error rounded-full text-[10px] leading-none flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </label>
          {saveMsg && <p className="col-span-full font-body-sm text-body-sm text-error">{saveMsg}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-outline-variant/50">
        <Dropdown
          label={t('products.category_label')}
          value={catId}
          onChange={setCatId}
          options={[{ value: '', label: t('common.all') }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]}
        />
        <Dropdown
          label={t('products.status_label')}
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: t('common.all') },
            { value: 'active', label: t('products.active') },
            { value: 'inactive', label: t('products.inactive') },
          ]}
        />
        <div className="ml-auto relative group hidden sm:block w-64">
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">search</span>
          <input
            type="text"
            placeholder={t("products.search_placeholder")}
            className="w-full bg-transparent border-0 border-b border-outline-variant pl-8 py-1.5 text-primary font-body-md text-body-md focus:ring-0 focus:outline-none focus:border-secondary transition-colors placeholder:text-on-surface-variant"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {sel.size > 0 && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-surface-container-high border border-outline-variant rounded-[4px]">
          <span className="font-body-md text-body-md text-primary">{t('products.selected', { n: sel.size })}</span>
          <button
            onClick={delSelected}
            className="flex items-center gap-2 px-4 py-2 border border-error/50 text-error font-label-sm text-label-sm uppercase tracking-wider hover:bg-error hover:text-on-error transition-colors rounded-[4px]"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            {t('products.delete_selected')}
          </button>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-outline-variant/50">
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal w-12">
                <input className="custom-checkbox" type="checkbox" checked={products.length > 0 && products.every((p) => sel.has(p.id))} onChange={toggleAll} />
              </th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal w-20">{t('products.item')}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal">{t('products.name')}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal">{t('products.category')}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal">{t('products.brand')}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal text-right">{t('products.price')}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal text-right">{t('products.stock')}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal text-center">{t('common.status')}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal text-center w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {products.map((p) => {
              const s = stock(p)
              return (
                <tr key={p.id} className="group hover:bg-surface-container-high transition-colors duration-200">
                  <td className="py-3 px-4 align-middle"><input className="custom-checkbox" type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} /></td>
                  <td className="py-3 px-4 align-middle">
                    <div className="w-12 h-16 bg-surface-container-highest rounded-[4px] border border-outline-variant/30 overflow-hidden relative flex items-center justify-center">
                      {imgSrc(p) ? (
                        <img className="w-full h-full object-cover" src={imgSrc(p)} alt={p.name} />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant opacity-50">image</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-middle font-body-md text-body-md text-primary">{p.name}</td>
                  <td className="py-3 px-4 align-middle font-body-md text-body-md text-on-surface-variant">{p.category_name || '—'}</td>
                  <td className="py-3 px-4 align-middle font-body-md text-body-md text-on-surface-variant">{p.brand_name || '—'}</td>
                  <td className="py-3 px-4 align-middle font-body-md text-body-md text-primary text-right">{price(p)}</td>
                  <td className="py-3 px-4 align-middle font-body-md text-body-md text-primary text-right">{s}</td>
                  <td className="py-3 px-4 align-middle text-center">
                    {s === 0 ? (
                      <span className="inline-block px-2 py-1 bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 rounded-[4px] font-label-sm text-[10px] uppercase tracking-wider">{t('dashboard.out_of_stock')}</span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-surface-container-highest text-secondary border border-secondary/20 rounded-[4px] font-label-sm text-[10px] uppercase tracking-wider">{p.is_active ? t('products.active') : t('products.inactive')}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-middle text-center">
                    <button
                      onClick={() => del(p.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-[4px] text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error hover:bg-surface-container-highest transition-all"
                      title={t('common.delete')}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{t('products.no_yet')}</div>
        )}
      </div>

      <div className="flex items-center justify-between py-4 border-t border-outline-variant/50 mt-auto">
        <span className="font-body-md text-body-md text-on-surface-variant">{t('products.showing', { shown: products.length, total: products.length })}</span>
        <div className="flex items-center gap-2">
          <button disabled className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-[4px] text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-secondary bg-surface-container-high rounded-[4px] text-secondary font-label-sm text-label-sm">1</button>
          <button disabled className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-[4px] text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}