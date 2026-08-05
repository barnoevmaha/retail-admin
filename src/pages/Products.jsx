import { useState, useEffect } from 'react'
import api, { fileUrl } from '../api/client'
import { t } from '../i18n'

const imgSrc = (p) =>
  fileUrl(p.images?.[0]?.image_url || (typeof p.image_url === 'string' ? p.image_url : null))

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
  const [form, setForm] = useState({ name: '', description: '', category_id: '', brand_id: '', purchase_price: '', selling_price: '' })
  const [files, setFiles] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [pickSizes, setPickSizes] = useState([])
  const [pickColors, setPickColors] = useState([])
  const [customColor, setCustomColor] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [openId, setOpenId] = useState(null)
  const [vf, setVf] = useState({ sizes: [], colors: [], customColor: '', purchase: '', selling: '' })
  const [descDraft, setDescDraft] = useState('')
  const [wizStep, setWizStep] = useState(0)
  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')
  const [mainImg, setMainImg] = useState(0)
  const [confirmDel, setConfirmDel] = useState(null)
  const [urlImages, setUrlImages] = useState([])
  const [newUrl, setNewUrl] = useState('')
  const [bulkQty, setBulkQty] = useState('')
  const [bulkQtyPanel, setBulkQtyPanel] = useState('')
  const [includeQty, setIncludeQty] = useState(false)
  const [includeQtyPanel, setIncludeQtyPanel] = useState(false)

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
    api.get('/sizes/').then((r) => setSizes(r.data)).catch(() => {})
    api.get('/colors/').then((r) => setColors(r.data)).catch(() => {})
  }, [])

  const cycleSize = (s) => setPickSizes((prev) => {
    const pick = prev.find((x) => x.id === s.id)
    if (!pick) return [...prev, { ...s, qty: '', inc: false }]
    if (!pick.inc) return prev.map((x) => x.id === s.id ? { ...x, inc: true, qty: bulkQty } : x)
    return prev.filter((x) => x.id !== s.id)
  })

  const cycleSizePanel = (s) => setVf((prev) => {
    const pick = prev.sizes.find((x) => x.id === s.id)
    if (!pick) return { ...prev, sizes: [...prev.sizes, { ...s, qty: '', inc: false }] }
    if (!pick.inc) return { ...prev, sizes: prev.sizes.map((x) => x.id === s.id ? { ...x, inc: true, qty: bulkQtyPanel } : x) }
    return { ...prev, sizes: prev.sizes.filter((x) => x.id !== s.id) }
  })

  const addSize = async () => {
    if (!newSize.trim()) return
    try {
      const { data } = await api.post('/sizes/', { name: newSize.trim() })
      setSizes((prev) => [...prev, data])
      setPickSizes((prev) => [...prev, { ...data, qty: '' }])
      setNewSize('')
    } catch (err) {
      setSaveMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const addColor = async () => {
    if (!newColor.trim()) return
    try {
      const { data } = await api.post('/colors/', { name: newColor.trim() })
      setColors((prev) => [...prev, data])
      setPickColors([data])
      setNewColor('')
    } catch (err) {
      setSaveMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

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
      const urls = urlImages.map((u) => u.trim()).filter(Boolean)
      const total = files.length + urls.length
      await Promise.all(files.map((f, i) => {
        const fd = new FormData()
        fd.append('file', f)
        fd.append('sort_order', String(i))
        fd.append('is_main', String(total > 0 && i === mainImg))
        return api.post(`/products/${data.id}/images/upload`, fd).catch(() => {})
      }))
      await Promise.all(urls.map((url, j) => {
        const pos = files.length + j
        return api.post(`/products/${data.id}/images/`, { image_url: url, is_main: total > 0 && pos === mainImg }).catch(() => {})
      }))
      const color = pickColors[0]?.name || null
      const created = []
      for (const s of pickSizes) {
        const v = await api.post('/variants/', {
          product_id: data.id,
          size_id: s.id,
          size: s.name,
          color,
          purchase_price: Number(form.purchase_price) || 0,
          selling_price: Number(form.selling_price) || 0,
        }).catch(() => null)
        if (v) created.push({ id: v.data.id, qty: Number(s.qty) || 0 })
      }
      if (created.length) {
        const adj = await api.post('/adjustments/', { reason: 'initial_balance', notes: 'Initial stock' })
        await Promise.all(created.map((c) =>
          api.post(`/adjustments/${adj.data.id}/items`, { variant_id: c.id, expected_quantity: 0, actual_quantity: c.qty })
        ))
        await api.post(`/adjustments/${adj.data.id}/confirm`).catch(() => {})
      }
      setFormOpen(false)
      setWizStep(0)
      setForm({ name: '', description: '', category_id: '', brand_id: '', purchase_price: '', selling_price: '' })
      setFiles([])
      setUrlImages([])
      setNewUrl('')
      setMainImg(0)
      setBulkQty('')
      setBulkQtyPanel('')
      setIncludeQty(false)
      setIncludeQtyPanel(false)
      setPickSizes([])
      setPickColors([])
      setCustomColor('')
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

  const removeFile = (i) => setFiles((prev) => {
    const next = prev.filter((_, idx) => idx !== i)
    setMainImg((m) => Math.min(m, next.length + urlImages.length - 1))
    return next
  })

  const addUrl = () => {
    const u = newUrl.trim()
    if (!u) return
    setUrlImages((prev) => [...prev, u])
    setNewUrl('')
  }

  const removeUrl = (i) => setUrlImages((prev) => {
    const next = prev.filter((_, idx) => idx !== i)
    setMainImg((m) => Math.min(m, files.length + next.length - 1))
    return next
  })

  const toggle = (id) => setSel((prev) => {
    const s = new Set(prev)
    if (s.has(id)) s.delete(id); else s.add(id)
    return s
  })

  const toggleAll = () => {
    const allIds = products.map((p) => p.id)
    setSel((prev) => (prev.size === allIds.length && allIds.every((id) => prev.has(id)) ? new Set() : new Set(allIds)))
  }

  const delVariant = (vid) => setConfirmDel({ type: 'variant', id: vid })

  const del = (id) => setConfirmDel({ type: 'product', id })

  const delSelected = () => {
    if (!sel.size) return
    setConfirmDel({ type: 'many' })
  }

  const runDelete = async () => {
    const c = confirmDel
    setConfirmDel(null)
    if (!c) return
    try {
      if (c.type === 'variant') await api.delete(`/variants/${c.id}`)
      if (c.type === 'product') await api.delete(`/products/${c.id}`)
      if (c.type === 'many') await Promise.all([...sel].map((id) => api.delete(`/products/${id}`)))
      setSaveMsg('')
      load()
    } catch (err) {
      setSaveMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const addVariant = async (productId) => {
    if (!vf.sizes.length && !vf.colors.length) {
      setSaveMsg(t('products.variant_size_required'))
      return
    }
    try {
      const color = vf.colors[0]?.name || null
      const created = []
      for (const s of vf.sizes) {
        const v = await api.post('/variants/', {
          product_id: productId,
          size_id: s.id,
          size: s.name,
          color,
          purchase_price: Number(vf.purchase) || 0,
          selling_price: Number(vf.selling) || 0,
        })
        created.push({ id: v.data.id, qty: Number(s.qty) || 0 })
      }
      if (created.length) {
        const adj = await api.post('/adjustments/', { reason: 'initial_balance', notes: 'Initial stock' })
        await Promise.all(created.map((c) =>
          api.post(`/adjustments/${adj.data.id}/items`, { variant_id: c.id, expected_quantity: 0, actual_quantity: c.qty })
        ))
        await api.post(`/adjustments/${adj.data.id}/confirm`)
      }
      setVf({ sizes: [], colors: [], customColor: '', purchase: '', selling: '' })
      setBulkQtyPanel('')
      setIncludeQtyPanel(false)
      setSaveMsg('')
      load()
    } catch (err) {
      setSaveMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const saveDescription = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { description: descDraft.trim() || null })
      setSaveMsg('')
      load()
    } catch (err) {
      setSaveMsg(t('common.error_msg', { detail: err.response?.data?.detail || t('common.unknown') }))
    }
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-outline-variant text-on-surface font-body-lg text-body-lg py-2 px-0 focus:ring-0 focus:outline-none focus:border-secondary transition-colors duration-300'

  const steps = [t('products.wiz_basics'), t('products.wiz_sizes'), t('products.wiz_colors'), t('products.wiz_images'), t('products.wiz_review')]

  const wizField = 'block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest'

  const chipBtn = (on) =>
    `px-4 py-1.5 border rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider transition-colors ${on ? 'border-secondary bg-secondary text-on-secondary' : 'border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary'}`

  const renderWizard = () => (
    <div className="border border-outline-variant rounded-lg bg-surface-container-low overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container">
        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">{t('products.wizard')}</span>
        <button onClick={() => { setFormOpen(false); setSaveMsg('') }} className="text-on-surface-variant hover:text-error transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 px-6 pt-5">
        {steps.map((label, i) => (
          <button key={i} onClick={() => setWizStep(i)} className={`flex-1 min-w-32 flex items-center gap-2 px-3 py-2 rounded-[4px] border transition-colors text-left ${i === wizStep ? 'border-secondary bg-surface-container-high' : i < wizStep ? 'border-secondary/40' : 'border-outline-variant'}`}>
            <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-label-sm text-label-sm border ${i === wizStep ? 'bg-secondary border-secondary text-on-secondary' : i < wizStep ? 'border-secondary/60 text-secondary' : 'border-outline-variant text-on-surface-variant'}`}>
              {i < wizStep ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
            </span>
            <span className={`font-label-sm text-label-sm uppercase tracking-wider ${i === wizStep ? 'text-secondary' : 'text-on-surface-variant'}`}>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {wizStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className={wizField + ' md:col-span-2'}>
              {t('products.name')}
              <input className={inputClass + ' mt-2'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className={wizField}>
              {t('products.brand')}
              <div className="mt-2">
                <Dropdown value={form.brand_id} onChange={(v) => setForm({ ...form, brand_id: v })}
                  options={[{ value: '', label: '—' }, ...brands.map((b) => ({ value: String(b.id), label: b.name }))]} />
              </div>
            </label>
            <label className={wizField}>
              {t('products.category')}
              <div className="mt-2">
                <Dropdown value={form.category_id} onChange={(v) => setForm({ ...form, category_id: v })}
                  options={[{ value: '', label: '—' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]} />
              </div>
            </label>
            <label className={wizField}>
              {t('products.variant_purchase')}
              <input className={inputClass + ' mt-2'} type="number" min="0" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
            </label>
            <label className={wizField}>
              {t('products.variant_selling')}
              <input className={inputClass + ' mt-2'} type="number" min="0" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
            </label>
            <label className={wizField + ' md:col-span-2'}>
              {t('products.description')}
              <textarea rows={3} className={inputClass + ' mt-2 resize-y'} value={form.description} placeholder={t('products.description_placeholder')} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>
        )}

        {wizStep === 1 && (
          <div>
            <span className={wizField + ' block mb-3'}>{t('products.pick_sizes')}</span>
            <div className="flex flex-wrap gap-2 items-center">
              {sizes.map((s) => {
                const pick = pickSizes.find((x) => x.id === s.id)
                const showQty = pick && (pick.inc || includeQty)
                return (
                  <span key={s.id} className="flex items-center gap-1.5">
                    <button type="button" onClick={() => cycleSize(s)} className={chipBtn(!!pick)}>{s.name}</button>
                    {showQty && (
                      <input type="number" min="0" value={pick.qty} placeholder={t('products.qty')}
                        onChange={(e) => setPickSizes((prev) => prev.map((x) => x.id === s.id ? { ...x, qty: e.target.value } : x))}
                        className="w-16 bg-transparent border border-outline-variant rounded-[4px] text-center text-body-md font-body-md text-primary py-1 focus:border-secondary focus:outline-none" />
                    )}
                  </span>
                )
              })}
              {sizes.length === 0 && <span className="font-body-md text-body-md text-on-surface-variant">{t('products.no_sizes')}</span>}
            </div>
            <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{t('products.qty_hint')}</p>
            {pickSizes.length > 1 && (
              <label className="mt-4 flex items-center gap-3 cursor-pointer w-fit">
                <input type="checkbox" className="custom-checkbox" checked={includeQty} onChange={(e) => { setIncludeQty(e.target.checked); setPickSizes((prev) => prev.map((x) => ({ ...x, inc: e.target.checked }))) }} />
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('products.include_qty')}</span>
              </label>
            )}
            <div className="mt-4 flex items-center gap-3 max-w-xl">
              <input type="number" min="0" value={bulkQty} placeholder={t('products.qty')}
                onChange={(e) => {
                  const v = e.target.value
                  setBulkQty(v)
                  setPickSizes((prev) => prev.map((x) => ({ ...x, qty: v })))
                }}
                className="w-20 bg-transparent border border-outline-variant rounded-[4px] text-center text-body-md font-body-md text-primary py-1.5 focus:border-secondary focus:outline-none" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">{t('products.bulk_qty_hint')}</span>
            </div>
            <div className="mt-5 flex gap-2 max-w-sm">
              <input value={newSize} placeholder={t('sizes.new_placeholder')} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSize()}
                className="flex-1 bg-transparent border border-outline-variant rounded-[4px] px-3 py-1.5 text-body-md font-body-md text-primary focus:border-secondary focus:outline-none placeholder:text-on-surface-variant" />
              <button onClick={addSize} className="px-4 py-1.5 border border-outline-variant rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors">
                {t('products.add_size')}
              </button>
            </div>
          </div>
        )}

        {wizStep === 2 && (
          <div>
            <span className={wizField + ' block mb-3'}>{t('products.pick_color')}</span>
            <div className="flex flex-wrap gap-2 items-center">
              {colors.map((c) => {
                const on = pickColors[0]?.id === c.id
                return (
                  <button key={c.id} type="button" onClick={() => setPickColors(on ? [] : [c])} className={chipBtn(on)}>{c.name}</button>
                )
              })}
              {colors.length === 0 && <span className="font-body-md text-body-md text-on-surface-variant">{t('products.no_colors')}</span>}
            </div>
            <div className="mt-5 flex gap-2 max-w-sm">
              <input value={newColor} placeholder={t('colors.new_placeholder')} onChange={(e) => setNewColor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addColor()}
                className="flex-1 bg-transparent border border-outline-variant rounded-[4px] px-3 py-1.5 text-body-md font-body-md text-primary focus:border-secondary focus:outline-none placeholder:text-on-surface-variant" />
              <button onClick={addColor} className="px-4 py-1.5 border border-outline-variant rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors">
                {t('products.add_color')}
              </button>
            </div>
          </div>
        )}

        {wizStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={wizField}>
              {t('products.image_urls')}
              <div className="mt-2 flex gap-2">
                <input value={newUrl} placeholder="https://..." onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                  className="flex-1 bg-transparent border border-outline-variant rounded-[4px] px-3 py-1.5 text-body-md font-body-md text-primary focus:border-secondary focus:outline-none placeholder:text-on-surface-variant" />
                <button onClick={addUrl} className="px-4 py-1.5 border border-outline-variant rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors">
                  {t('common.add')}
                </button>
              </div>
            </div>
            <label className={wizField}>
              {t('products.photos')}
              <input type="file" accept="image/*" multiple onChange={addFiles}
                className="mt-2 text-sm text-on-surface file:mr-3 file:px-3 file:py-1.5 file:border-0 file:rounded-[4px] file:bg-surface-container-highest file:text-primary file:font-label-sm file:text-label-sm cursor-pointer" />
            </label>
            {files.length + urlImages.length > 0 && (
              <div className="md:col-span-2">
                <span className={wizField + ' block mb-3'}>{t('products.main_image')}</span>
                <div className="flex flex-wrap gap-3">
                  {files.map((f, i) => (
                    <div key={i} className="relative w-20 h-24 border border-outline-variant rounded-[4px] overflow-hidden">
                      <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-background/70 text-error rounded-full text-xs leading-none flex items-center justify-center hover:bg-error hover:text-on-error transition-colors">×</button>
                      <button type="button" onClick={() => setMainImg(i)} title={t('products.main_image')}
                        className={`absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${i === mainImg ? 'bg-secondary text-on-secondary' : 'bg-background/70 text-on-surface-variant hover:text-secondary'}`}>
                        <span className="material-symbols-outlined text-sm">star</span>
                      </button>
                    </div>
                  ))}
                  {urlImages.map((u, j) => {
                    const pos = files.length + j
                    return (
                      <div key={u + j} className="relative w-20 h-24 border border-outline-variant rounded-[4px] overflow-hidden bg-surface-container-high">
                        <img src={u} className="w-full h-full object-cover" alt="" onError={(e) => { e.currentTarget.classList.add('opacity-40'); e.currentTarget.removeAttribute('src') }} />
                        <button type="button" onClick={() => removeUrl(j)}
                          className="absolute top-1 right-1 w-5 h-5 bg-background/70 text-error rounded-full text-xs leading-none flex items-center justify-center hover:bg-error hover:text-on-error transition-colors">×</button>
                        <button type="button" onClick={() => setMainImg(pos)} title={t('products.main_image')}
                          className={`absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${pos === mainImg ? 'bg-secondary text-on-secondary' : 'bg-background/70 text-on-surface-variant hover:text-secondary'}`}>
                          <span className="material-symbols-outlined text-sm">star</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {wizStep === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
            <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest">{t('products.name')}</span><span className="font-body-md text-body-md text-primary">{form.name || '—'}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest">{t('products.brand')}</span><span className="font-body-md text-body-md text-primary">{brands.find((b) => String(b.id) === form.brand_id)?.name || '—'}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest">{t('products.category')}</span><span className="font-body-md text-body-md text-primary">{categories.find((c) => String(c.id) === form.category_id)?.name || '—'}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest">{t('products.price')}</span><span className="font-body-md text-body-md text-primary">{form.selling_price ? `$${Number(form.selling_price).toLocaleString()}` : '—'}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest">{t('products.sizes')}</span>
            <span className="font-body-md text-body-md text-primary">{pickSizes.map((s) => `${s.name}${s.qty ? ` ×${s.qty}` : ''}`).join(', ') || '—'}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest">{t('products.colors')}</span><span className="font-body-md text-body-md text-primary">{pickColors[0]?.name || '—'}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-widest">{t('products.photos')}</span><span className="font-body-md text-body-md text-primary">{files.length + urlImages.length ? `${files.length + urlImages.length} ${t('common.products')}` : '—'}</span>
          </div>
        )}
      </div>

      {saveMsg && <p className="px-6 pb-2 font-body-sm text-body-sm text-error">{saveMsg}</p>}

      <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-surface-container">
        {wizStep > 0 ? (
          <button onClick={() => { setWizStep(wizStep - 1); setSaveMsg('') }} className="px-6 py-2 border border-outline-variant rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider text-on-surface hover:border-secondary hover:text-secondary transition-colors">
            {t('common.back')}
          </button>
        ) : <span />}
        {wizStep < 4 ? (
          <button onClick={() => { setWizStep(wizStep + 1); setSaveMsg('') }} className="px-8 py-2 bg-secondary text-on-secondary rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
            {t('common.next')}
          </button>
        ) : (
          <button onClick={create} className="px-8 py-2 bg-secondary text-on-secondary rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
            {t('products.create_product')}
          </button>
        )}
      </div>
    </div>
  )

  const price = (p) => {
    const prices = (p.variants || []).map((v) => Number(v.selling_price) || 0)
    const min = prices.length ? Math.min(...prices) : 0
    return min ? `$${min.toLocaleString()}` : '—'
  }

  const stock = (p) => (p.variants || []).reduce((s, v) => s + (Number(v.quantity) || 0), 0)

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

      {formOpen && renderWizard()}

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-surface-container border border-outline-variant rounded-lg p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-error text-3xl leading-none">warning</span>
              <div>
                <h3 className="font-label-lg text-label-lg text-primary uppercase tracking-widest">{t('products.delete_title')}</h3>
                <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                  {confirmDel.type === 'variant' && t('products.variant_delete_confirm')}
                  {confirmDel.type === 'product' && t('products.delete_confirm')}
                  {confirmDel.type === 'many' && t('products.delete_many_confirm', { n: sel.size })}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDel(null)}
                className="px-5 py-2 border border-outline-variant rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider text-on-surface hover:border-secondary hover:text-secondary transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={runDelete}
                className="px-5 py-2 bg-error text-on-error rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
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
                <>
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
                  <td className="py-3 px-4 align-middle font-body-md text-body-md text-primary">
                    <button onClick={() => { setOpenId(openId === p.id ? null : p.id); setSaveMsg(''); setDescDraft(p.description || '') }} className="text-left hover:text-secondary transition-colors">
                      {p.name}
                    </button>
                  </td>
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
                      className="w-8 h-8 flex items-center justify-center rounded-[4px] text-on-surface-variant hover:text-error hover:bg-surface-container-highest transition-all"
                      title={t('common.delete')}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </td>
                </tr>
                {openId === p.id && (
                  <tr className="bg-surface-container-lowest/50">
                    <td colSpan={9} className="py-6 px-6">
                      <div className="flex flex-col gap-6">
                        <div>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">{t('products.variants')}</span>
                          <div className="mt-3 flex flex-col gap-2">
                            {(p.variants || []).length === 0 && (
                              <span className="font-body-md text-body-md text-on-surface-variant">{t('products.variant_no')}</span>
                            )}
                            {(p.variants || []).map((v) => (
                              <div key={v.id} className="flex items-center gap-6 border border-outline-variant/40 rounded-[4px] px-4 py-2.5">
                                <span className="font-body-md text-body-md text-primary w-32">{[v.size, v.color].filter(Boolean).join(' / ') || '—'}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">{v.barcode}</span>
                                <span className="font-body-md text-body-md text-primary ml-auto">${(Number(v.selling_price) || 0).toLocaleString()}</span>
                                <span className={`font-label-sm text-label-sm px-2 py-1 rounded-[4px] uppercase tracking-wider ${(Number(v.quantity) || 0) > 0 ? 'text-secondary border border-secondary/30' : 'text-on-surface-variant border border-outline-variant/40'}`}>
                                  {(Number(v.quantity) || 0)} {t('products.variant_stock')}
                                </span>
                                <button
                                  onClick={() => delVariant(v.id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-[4px] text-on-surface-variant hover:text-error hover:bg-surface-container-highest transition-all"
                                  title={t('common.delete')}
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">{t('products.description')}</span>
                          <div className="mt-3 flex items-start gap-3">
                            <textarea
                              rows={3}
                              value={descDraft}
                              placeholder={t('products.description_placeholder')}
                              onChange={(e) => setDescDraft(e.target.value)}
                              className="flex-1 bg-transparent border border-outline-variant rounded-[4px] px-3 py-2 text-body-md font-body-md text-primary focus:border-secondary focus:outline-none placeholder:text-on-surface-variant"
                            />
                            <button
                              onClick={() => saveDescription(p)}
                              className="px-6 py-2 border border-secondary/60 rounded-[4px] font-label-sm text-label-sm text-secondary hover:bg-secondary hover:text-on-secondary transition-colors uppercase tracking-wider whitespace-nowrap"
                            >
                              {t('common.save')}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">{t('products.add_variant')}</span>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
                            <div className="sm:col-span-3 md:col-span-2">
                              <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{t('products.variant_size')}</span>
                              <div className="mt-1.5 flex flex-wrap gap-2">
                                {sizes.map((s) => {
                                  const pick = vf.sizes.find((x) => x.id === s.id)
                                  const on = !!pick
                                  const showQty = pick && (pick.inc || includeQtyPanel)
                                  return (
                                    <span key={s.id} className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => cycleSizePanel(s)}
                                        className={`px-3 py-1 border rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider transition-colors ${on ? 'border-secondary bg-secondary text-on-secondary' : 'border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary'}`}
                                      >
                                        {s.name}
                                      </button>
                                      {showQty && (
                                        <input
                                          type="number"
                                          min="0"
                                          value={pick.qty}
                                          placeholder={t('products.qty')}
                                          onChange={(e) => setVf((prev) => ({ ...prev, sizes: prev.sizes.map((x) => x.id === s.id ? { ...x, qty: e.target.value } : x) }))}
                                          className="w-16 bg-transparent border border-outline-variant rounded-[4px] text-center text-body-md font-body-md text-primary py-1 focus:border-secondary focus:outline-none"
                                        />
                                      )}
                                    </span>
                                  )
                                })}
                              </div>
                              {vf.sizes.length > 1 && (
                                <label className="mt-2.5 flex items-center gap-2 cursor-pointer w-fit">
                                  <input type="checkbox" className="custom-checkbox" checked={includeQtyPanel} onChange={(e) => { setIncludeQtyPanel(e.target.checked); setVf((prev) => ({ ...prev, sizes: prev.sizes.map((x) => ({ ...x, inc: e.target.checked })) })) }} />
                                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('products.include_qty')}</span>
                                </label>
                              )}
                              {vf.sizes.length > 0 && (
                                <div className="mt-2.5 flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={bulkQtyPanel}
                                    placeholder={t('products.qty')}
                                    onChange={(e) => {
                                      const v = e.target.value
                                      setBulkQtyPanel(v)
                                      setVf((prev) => ({ ...prev, sizes: prev.sizes.map((x) => ({ ...x, qty: v })) }))
                                    }}
                                    className="w-16 bg-transparent border border-outline-variant rounded-[4px] text-center text-body-md font-body-md text-primary py-1 focus:border-secondary focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="sm:col-span-2 md:col-span-2">
                              <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{t('products.colors')}</span>
                              <div className="mt-1.5 flex flex-wrap gap-2">
                                {colors.map((c) => {
                                  const on = vf.colors.some((x) => x.id === c.id)
                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => setVf((prev) => on ? { ...prev, colors: prev.colors.filter((x) => x.id !== c.id) } : { ...prev, colors: [...prev.colors, c] })}
                                      className={`px-3 py-1 border rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider transition-colors ${on ? 'border-secondary bg-secondary text-on-secondary' : 'border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary'}`}
                                    >
                                      {c.name}
                                    </button>
                                  )
                                })}
                                {vf.colors.filter((c) => !c.id).map((c) => (
                                  <span key={c.name} className="flex items-center gap-1.5 px-3 py-1 border border-secondary bg-secondary text-on-secondary rounded-[4px]">
                                    <span className="font-label-sm text-label-sm uppercase tracking-wider">{c.name}</span>
                                    <button type="button" onClick={() => setVf((prev) => ({ ...prev, colors: prev.colors.filter((x) => x.name !== c.name) }))} className="text-on-secondary/70 hover:text-on-secondary">×</button>
                                  </span>
                                ))}
                              </div>
                              <div className="mt-2 flex gap-2">
                                <input
                                  value={vf.customColor}
                                  placeholder={t('products.custom_color')}
                                  onChange={(e) => setVf({ ...vf, customColor: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && vf.customColor.trim()) {
                                      setVf((prev) => ({ ...prev, colors: [...prev.colors, { name: vf.customColor.trim() }], customColor: '' }))
                                    }
                                  }}
                                  className="flex-1 min-w-24 bg-transparent border border-outline-variant rounded-[4px] px-3 py-1.5 text-body-md font-body-md text-primary focus:border-secondary focus:outline-none placeholder:text-on-surface-variant"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (vf.customColor.trim()) {
                                      setVf((prev) => ({ ...prev, colors: [...prev.colors, { name: vf.customColor.trim() }], customColor: '' }))
                                    }
                                  }}
                                  className="px-3 py-1.5 border border-outline-variant rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
                                >
                                  {t('products.add_color')}
                                </button>
                              </div>
                            </div>
                            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                              {t('products.variant_purchase')}
                              <input className={inputClass + ' mt-1'} type="number" min="0" value={vf.purchase} onChange={(e) => setVf({ ...vf, purchase: e.target.value })} />
                            </label>
                            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                              {t('products.variant_selling')}
                              <input className={inputClass + ' mt-1'} type="number" min="0" value={vf.selling} onChange={(e) => setVf({ ...vf, selling: e.target.value })} />
                            </label>
                            <button
                              onClick={() => addVariant(p.id)}
                              className="px-6 py-2 border border-secondary/60 rounded-[4px] font-label-sm text-label-sm text-secondary hover:bg-secondary hover:text-on-secondary transition-colors uppercase tracking-wider"
                            >
                              {t('common.add')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </>
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