import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { t, setLanguage, getLanguage, getLanguages } from '../i18n'
import Dashboard from '../pages/Dashboard'
import Products from '../pages/Products'
import Categories from '../pages/Categories'
import Brands from '../pages/Brands'
import Colors from '../pages/ColorList'
import Sizes from '../pages/SizeList'
import Orders from '../pages/Orders'
import OrderDetail from '../pages/OrderDetail'
import Customers from '../pages/Customers'
import Suppliers from '../pages/Suppliers'
import Warehouse from '../pages/Warehouse'
import ReceivingPage from '../pages/ReceivingPage'
import ReturnsPage from '../pages/ReturnsPage'
import WriteOffsPage from '../pages/WriteOffsPage'
import AdjustmentsPage from '../pages/AdjustmentsPage'
import POS from '../pages/POS'
import Analytics from '../pages/Analytics'
import AuditLog from '../pages/AuditLog'
import InventoryHistory from '../pages/InventoryHistory'
import NotificationsPage from '../pages/NotificationsPage'
import ReceiptsPage from '../pages/ReceiptsPage'
import SettingsPage from '../pages/SettingsPage'
import ChangePassword from '../pages/ChangePassword'
import CompanyPage from '../pages/CompanyPage'
import ImageGallery from '../pages/ImageGallery'

const groups = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/', key: 'nav.dashboard', icon: 'grid_view' },
      { to: '/analytics', key: 'nav.analytics', icon: 'analytics' },
      { to: '/audit-log', key: 'nav.audit_log', icon: 'fact_check' },
      { to: '/inventory-history', key: 'nav.inventory_history', icon: 'history' },
    ],
  },
  {
    label: 'CATALOG',
    items: [
      { to: '/products', key: 'nav.products', icon: 'checkroom' },
      { to: '/brands', key: 'nav.brands', icon: 'diamond' },
    ],
  },
  {
    label: 'INVENTORY',
    items: [
      { to: '/warehouse', key: 'nav.warehouse', icon: 'warehouse' },
      { to: '/receiving', key: 'nav.receiving', icon: 'local_shipping' },
      { to: '/returns', key: 'nav.returns', icon: 'assignment_return' },
      { to: '/writeoffs', key: 'nav.writeoffs', icon: 'delete_sweep' },
      { to: '/adjustments', key: 'nav.adjustments', icon: 'tune' },
    ],
  },
  {
    label: 'SALES',
    items: [
      { to: '/orders', key: 'nav.orders', icon: 'shopping_cart' },
      { to: '/pos', key: 'nav.pos', icon: 'point_of_sale' },
      { to: '/receipts', key: 'nav.receipts', icon: 'receipt_long' },
    ],
  },
  {
    label: 'CUSTOMERS',
    items: [
      { to: '/customers', key: 'nav.customers', icon: 'group' },
      { to: '/suppliers', key: 'nav.suppliers', icon: 'handshake' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/notifications', key: 'nav.notifications', icon: 'notifications' },
      { to: '/settings', key: 'nav.settings', icon: 'settings' },
      { to: '/settings/change-password', key: 'nav.change_password', icon: 'lock' },
      { to: '/company', key: 'nav.company', icon: 'apartment' },
    ],
  },
]

const itemClass = (active) =>
  `flex items-center gap-4 px-4 py-3 rounded-[4px] border-l-2 font-label-sm text-label-sm uppercase tracking-wider transition-all duration-300 ease-in-out ${
    active
      ? 'text-primary border-secondary bg-surface-container-high'
      : 'text-on-surface-variant border-transparent hover:bg-surface-container hover:text-primary'
  }`

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const langs = getLanguages()

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md text-body-md antialiased overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 md:left-sidebar-width z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant h-topbar-height">
        <div className="flex justify-between items-center h-full px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <div className="md:hidden font-headline-sm text-headline-sm tracking-widest uppercase text-primary">AURELIUS</div>
          <div className="hidden md:flex items-center relative w-64">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full bg-transparent border-0 border-b border-outline-variant pl-8 py-2 text-primary font-body-md text-body-md focus:ring-0 focus:outline-none focus:border-secondary transition-colors placeholder:text-on-surface-variant"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Link to="/notifications" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">notifications</Link>
            </div>
            <span className="h-6 w-px bg-outline-variant hidden sm:block"></span>
            <select
              value={getLanguage()}
              onChange={(e) => setLanguage(e.target.value)}
              title="Language"
              className="bg-transparent font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary transition-colors focus:outline-none"
            >
              {langs.map((l) => (
                <option key={l.code} value={l.code} className="bg-surface-container">{l.label}</option>
              ))}
            </select>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high" title={user?.email}>
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwm53Fcm-99WN9fzN68rAoLmcz-LejOy5cB3QEejMt9d-NciRe-7EyMRa8aGYB_naufnAqrmOwCeajPIjpi-Coz5RWe8IaW8VJ7vhFhzXaY28V7m-NAMQdXj8fe5jB_6B4X-nBUkitN5at-4BThDWTSo0thV3e1oCSmLc9G93E22ajBa2cZZN5ASD4tx6eHCnU_Hxp3-p1gDJ61vEhB8CQlKVpeG4lzjm0sfOTZK0o8GrWDiqwk7yGkA" alt="avatar" />
            </div>
          </div>
        </div>
      </header>

      <aside className="hidden md:flex flex-col py-gutter gap-4 bg-surface-container-low fixed left-0 top-0 h-full w-sidebar-width border-r border-outline-variant z-40">
        <div className="px-6 mb-4 mt-2">
          <h1 className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">AURELIUS</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto">
          {groups.map((g) => (
            <div key={g.label} className="flex flex-col gap-1 mb-2">
              <div className="px-4 pt-3 pb-1 font-label-sm text-label-sm text-on-surface-variant/60 uppercase tracking-wider">{g.label}</div>
              {g.items.map((item) => (
                <Link key={item.to} to={item.to} className={itemClass(location.pathname === item.to)}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{t(item.key)}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto px-4 pt-4 border-t border-outline-variant flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              alt="Admin Avatar"
              className="w-8 h-8 rounded-full object-cover outline outline-1 outline-outline-variant"
              src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-body-md text-body-md text-on-surface truncate">{user?.email || 'Admin User'}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Curator</span>
            </div>
          </div>
          <button onClick={logout} title={t('nav.logout')} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors shrink-0">logout</button>
        </div>
      </aside>

      <main className="md:ml-sidebar-width pt-topbar-height min-h-screen">
        <div className="px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-max-width mx-auto w-full">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="brands" element={<Brands />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="warehouse" element={<Warehouse />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="receiving" element={<ReceivingPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="writeoffs" element={<WriteOffsPage />} />
            <Route path="adjustments" element={<AdjustmentsPage />} />
            <Route path="colors" element={<Colors />} />
            <Route path="sizes" element={<Sizes />} />
            <Route path="pos" element={<POS />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit-log" element={<AuditLog />} />
            <Route path="inventory-history" element={<InventoryHistory />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/change-password" element={<ChangePassword />} />
            <Route path="company" element={<CompanyPage />} />
            <Route path="product-images" element={<ImageGallery />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
