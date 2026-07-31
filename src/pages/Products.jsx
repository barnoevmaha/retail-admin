import { useState, useEffect } from 'react'
import api from '../api/client'
import { t } from '../i18n'

const imgSrc = (p) =>
  p.images?.[0]?.image_url || (typeof p.image_url === 'string' ? p.image_url : null)

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/products/', { params: { q: search, limit: 50 } })
      .then((r) => setProducts(r.data.items))
      .catch(() => {})
  }, [search])

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
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-2">Catalog</span>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">{t('products.title')}</h2>
        </div>
        <button className="px-6 py-3 border border-outline-variant rounded-[4px] font-label-sm text-label-sm uppercase tracking-wider text-primary hover:border-secondary hover:text-secondary transition-all duration-300 w-fit">
          New Product
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-outline-variant/50">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-[4px] border border-outline-variant cursor-pointer hover:border-secondary transition-colors">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Category:</span>
          <span className="font-body-md text-body-md text-primary">All</span>
          <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_more</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-[4px] border border-outline-variant cursor-pointer hover:border-secondary transition-colors">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status:</span>
          <span className="font-body-md text-body-md text-primary">Active</span>
          <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_more</span>
        </div>
        <div className="ml-auto relative group hidden sm:block w-64">
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors">search</span>
          <input
            type="text"
            placeholder="Search by SKU or Name..."
            className="w-full bg-transparent border-0 border-b border-outline-variant pl-8 py-1.5 text-primary font-body-md text-body-md focus:ring-0 focus:outline-none focus:border-secondary transition-colors placeholder:text-on-surface-variant"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-outline-variant/50">
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal w-12"><input className="custom-checkbox" type="checkbox" /></th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal w-20">Item</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal">{t('products.name')}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal">Category</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal">{'Brand'}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal text-right">{'Price'}</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal text-right">Stock</th>
              <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-normal text-center">{'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {products.map((p) => {
              const s = stock(p)
              return (
                <tr key={p.id} className="group hover:bg-surface-container-high transition-colors duration-200 cursor-pointer">
                  <td className="py-3 px-4 align-middle"><input className="custom-checkbox" type="checkbox" /></td>
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
                      <span className="inline-block px-2 py-1 bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 rounded-[4px] font-label-sm text-[10px] uppercase tracking-wider">Out of Stock</span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-surface-container-highest text-secondary border border-secondary/20 rounded-[4px] font-label-sm text-[10px] uppercase tracking-wider">{p.is_active ? 'Active' : 'Inactive'}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-16 text-center font-body-md text-body-md text-on-surface-variant">No products found.</div>
        )}
      </div>

      <div className="flex items-center justify-between py-4 border-t border-outline-variant/50 mt-auto">
        <span className="font-body-md text-body-md text-on-surface-variant">Showing {products.length} of {products.length} items</span>
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
