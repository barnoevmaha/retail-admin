import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { t, setLanguage, getLanguage, getLanguages } from '../i18n'
import Dashboard from '../pages/Dashboard'
import Products from '../pages/Products'
import Categories from '../pages/Categories'
import Brands from '../pages/Brands'
import Colors from '../pages/ColorList'
import Sizes from '../pages/SizeList'
import Orders from '../pages/Orders'
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

const nav = [
  { to: '/', labelKey: 'nav.dashboard' },
  { to: '/products', labelKey: 'nav.products' },
  { to: '/categories', labelKey: 'nav.categories' },
  { to: '/brands', labelKey: 'nav.brands' },
  { to: '/colors', labelKey: 'nav.colors' },
  { to: '/sizes', labelKey: 'nav.sizes' },
  { to: '/orders', labelKey: 'nav.orders' },
  { to: '/customers', labelKey: 'nav.customers' },
  { to: '/suppliers', labelKey: 'nav.suppliers' },
  { to: '/warehouse', labelKey: 'nav.warehouse' },
  { to: '/receiving', labelKey: 'nav.receiving' },
  { to: '/returns', labelKey: 'nav.returns' },
  { to: '/writeoffs', labelKey: 'nav.writeoffs' },
  { to: '/adjustments', labelKey: 'nav.adjustments' },
  { to: '/pos', labelKey: 'nav.pos' },
  { to: '/analytics', labelKey: 'nav.analytics' },
  { to: '/audit-log', labelKey: 'nav.audit_log' },
  { to: '/inventory-history', labelKey: 'nav.inventory_history' },
  { to: '/notifications', labelKey: 'nav.notifications' },
  { to: '/receipts', labelKey: 'nav.receipts' },
  { to: '/settings', labelKey: 'nav.settings' },
  { to: '/settings/change-password', labelKey: 'nav.change_password', indent: true },
  { to: '/company', labelKey: 'nav.company' },
  { to: '/product-images', labelKey: 'nav.images' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { mode, setTheme } = useTheme()
  const location = useLocation()
  const langs = getLanguages()

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 transition-colors">
      <aside className="w-56 bg-gray-900 dark:bg-gray-950 text-white flex flex-col shrink-0 border-r border-gray-800">
        <div className="p-4 font-bold text-lg border-b border-gray-700 dark:border-gray-800 flex items-center justify-between">
          <span>{t('app.name')}</span>
          <div className="flex items-center gap-1">
            <select
              value={getLanguage()}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-[10px] bg-gray-800 rounded px-1 py-0.5 text-gray-300 border border-gray-700"
            >
              {langs.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${item.indent ? 'pl-10' : ''} ${
                location.pathname === item.to
                  ? 'bg-gray-700 dark:bg-gray-800'
                  : 'hover:bg-gray-800 dark:hover:bg-gray-800'
              }`}>
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 dark:border-gray-800 text-sm space-y-2">
          <button
            onClick={() => setTheme(mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark')}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-xs"
          >
            {mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '💻'} {t(`theme.${mode}`)}
          </button>
          <div className="text-gray-400 truncate">{user?.email}</div>
          <button onClick={logout} className="text-red-400 hover:text-red-300 text-xs">{t('nav.logout')}</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 dark:text-gray-200">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="orders" element={<Orders />} />
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
      </main>
    </div>
  )
}
