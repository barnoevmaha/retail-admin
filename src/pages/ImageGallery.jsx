import { useState, useEffect, useRef } from 'react'
import api from '../api/client'

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
      <h1 className="text-2xl font-bold mb-4">Product Images Gallery</h1>

      <select
        className="border p-2 rounded w-full mb-4"
        value={productId} onChange={(e) => setProductId(e.target.value)}
      >
        <option value="">Select a product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {productId && (
        <>
          <div className="flex gap-2 mb-4">
            <input type="file" ref={fileRef} accept="image/*" className="border p-2 rounded flex-1" />
            <button onClick={upload} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Upload
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="bg-white rounded-lg shadow p-2">
                <img src={img.image_url} alt="" className="w-full h-40 object-cover rounded mb-2" />
                <div className="flex gap-1">
                  {!img.is_main && (
                    <button onClick={() => setMain(img.id)}
                      className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                      Set Main
                    </button>
                  )}
                  <button onClick={() => remove(img.id)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                    Delete
                  </button>
                </div>
                {img.is_main && <span className="text-xs text-green-600 font-bold mt-1 block">MAIN</span>}
              </div>
            ))}
            {images.length === 0 && (
              <p className="col-span-full text-gray-400 text-center py-8">No images for this product</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
