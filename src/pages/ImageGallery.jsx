import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import { t } from '../i18n'

export default function ImageGallery() {
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [images, setImages] = useState([])
  const fileRef = useRef()

  useEffect(() => {
    api.get('/products/', { params: { limit: 200 } }).then((r) => setProducts(r.data.items)).catch(() => {})
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
    const res = await api.post(`/products/${productId}/images/upload`, fd)
    setImages((prev) => [...prev, res.data])
    fileRef.current.value = ''
  }

  const remove = async (imageId) => {
    await api.delete(`/products/${productId}/images/${imageId}`)
    setImages((prev) => prev.filter((i) => i.id !== imageId))
  }

  const setMain = async (imageId) => {
    const { data } = await api.patch(`/products/${productId}/images/${imageId}`, { is_main: true })
    setImages((prev) => prev.map((i) => ({ ...i, is_main: i.id === imageId })))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{t('images.title')}</h1>

      <select
        className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded w-full mb-4"
        value={productId} onChange={(e) => setProductId(e.target.value)}
      >
        <option value="">{t('images.select_product')}</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {productId && (
        <>
          <div className="flex gap-2 mb-4">
            <input type="file" ref={fileRef} accept="image/*" className="border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2 rounded flex-1" />
            <button onClick={upload} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {t('images.upload')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-2">
                <img src={img.image_url} alt="" className="w-full h-40 object-cover rounded mb-2" />
                <div className="flex gap-1">
                  {!img.is_main && (
                    <button onClick={() => setMain(img.id)}
                      className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                      {t('images.set_main')}
                    </button>
                  )}
                  <button onClick={() => remove(img.id)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                    {t('common.delete')}
                  </button>
                </div>
                {img.is_main && <span className="text-xs text-green-600 dark:text-green-400 font-bold mt-1 block">{t('images.main')}</span>}
              </div>
            ))}
            {images.length === 0 && (
              <p className="col-span-full text-gray-400 dark:text-gray-500 text-center py-8">{t('images.no_images')}</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
