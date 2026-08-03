import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function ImageGallery() {
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [images, setImages] = useState([])
  const fileRef = useRef()

  useEffect(() => {
    api.get('/products/', { params: { limit: 100 } }).then((r) => setProducts(r.data.items)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!productId) { setImages([]); return }
    api.get(`/products/${productId}/images/`).then((r) => setImages(r.data)).catch(() => {})
  }, [productId])

  const upload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !productId) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post(`/products/${productId}/images/upload`, fd)
      setImages((prev) => [...prev, res.data])
      fileRef.current.value = ''
    } catch {}
  }

  const remove = async (imageId) => {
    try {
      await api.delete(`/products/${productId}/images/${imageId}`)
      setImages((prev) => prev.filter((i) => i.id !== imageId))
    } catch {}
  }

  const setMain = async (imageId) => {
    try {
      await api.patch(`/products/${productId}/images/${imageId}`, { is_main: true })
      setImages((prev) => prev.map((i) => ({ ...i, is_main: i.id === imageId })))
    } catch {}
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-wide">
          {t('images.title')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('images.subtitle')}</p>
      </header>

      <div className="p-8 bg-surface-container-low border border-outline-variant">
        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest block mb-2">{t('images.product')}</label>
        <select
          className="w-full md:w-96 bg-transparent border-b border-outline-variant focus:border-secondary outline-none py-2 text-body-lg font-body-lg cursor-pointer"
          value={productId} onChange={(e) => setProductId(e.target.value)}
        >
          <option value="" className="bg-surface-container">{t('images.select_placeholder')}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id} className="bg-surface-container">{p.name}</option>
          ))}
        </select>
      </div>

      {productId && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="file" ref={fileRef} accept="image/*"
              className="flex-1 min-w-60 bg-transparent border border-outline-variant focus:border-secondary outline-none px-3 py-2 font-body-md text-body-md text-on-surface-variant file:mr-4 file:px-4 file:py-2 file:border-0 file:bg-surface-container-high file:text-secondary file:font-label-sm file:text-label-sm file:uppercase file:tracking-widest file:cursor-pointer"
            />
            <button onClick={upload} className="px-8 py-3 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.99] transition-all">
              {t('images.upload_image')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img.id} className="border border-outline-variant bg-surface-container-low p-3 group">
                <div className="relative aspect-square overflow-hidden mb-3">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {img.is_main && (
                    <span className="absolute top-2 left-2 px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-[2px] bg-secondary text-on-secondary">
                      {t('images.main')}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!img.is_main && (
                    <button onClick={() => setMain(img.id)} className="flex-1 py-1.5 border border-outline-variant font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant hover:border-secondary hover:text-secondary transition-all duration-300">
                      {t('images.set_main')}
                    </button>
                  )}
                  <button onClick={() => remove(img.id)} className="flex-1 py-1.5 border border-error/50 text-error font-label-sm text-label-sm uppercase tracking-widest hover:bg-error hover:text-on-error transition-all duration-300">
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-full py-16 border border-dashed border-outline-variant flex flex-col items-center gap-3 text-center">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl">add_photo_alternate</span>
                <p className="font-body-md text-body-md text-on-surface-variant/60">{t('images.no_images_yet')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
