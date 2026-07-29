import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Dashboard from '../pages/Dashboard'
import Products from '../pages/Products'
import Categories from '../pages/Categories'
import Brands from '../pages/Brands'
import Orders from '../pages/Orders'
import Customers from '../pages/Customers'
import Warehouse from '../pages/Warehouse'
import ReceivingPage from '../pages/ReceivingPage'
import Suppliers from '../pages/Suppliers'
import ReturnsPage from '../pages/ReturnsPage'
import WriteOffsPage from '../pages/WriteOffsPage'
import AdjustmentsPage from '../pages/AdjustmentsPage'
import ColorList from '../pages/ColorList'
import SizeList from '../pages/SizeList'
import POS from '../pages/POS'
import Analytics from '../pages/Analytics'
import AuditLog from '../pages/AuditLog'
import InventoryHistory from '../pages/InventoryHistory'
import NotificationsPage from '../pages/NotificationsPage'
import ReceiptsPage from '../pages/ReceiptsPage'
import SettingsPage from '../pages/SettingsPage'
import CompanyPage from '../pages/CompanyPage'
import ImageGallery from '../pages/ImageGallery'

const nav = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/products', label: 'Products', icon: '👕' },
  { to: '/categories', label: 'Categories', icon: '📁' },
  { to: '/brands', label: 'Brands', icon: '🏷️' },
  { to: '/colors', label: 'Colors', icon: '🎨' },
  { to: '/sizes', label: 'Sizes', icon: '📏' },
  { to: '/orders', label: 'Orders', icon: '📦' },
  { to: '/customers', label: 'Customers', icon: '👤' },
  { to: '/suppliers', label: 'Suppliers', icon: '🚚' },
  { to: '/warehouse', label: 'Warehouse', icon: '🏭' },
  { to: '/receiving', label: 'Receiving', icon: '📥' },
  { to: '/returns', label: 'Returns', icon: '↩️' },
  { to: '/writeoffs', label: 'Write-Offs', icon: '🗑️' },
  { to: '/adjustments', label: 'Adjustments', icon: '⚖️' },
  { to: '/pos', label: 'POS', icon: '🛒' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/audit-log', label: 'Audit Log', icon: '📋' },
  { to: '/inventory-history', label: 'Inventory History', icon: '📜' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/receipts', label: 'Receipts', icon: '🧾' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/company', label: 'Company', icon: '🏢' },
  { to: '/product-images', label: 'Images', icon: '🖼️' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 font-bold text-lg border-b border-gray-700">Admin Panel</div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                location.pathname === to ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm">
          <div className="text-gray-400">{user?.email}</div>
          <button onClick={logout} className="mt-1 text-red-400 hover:text-red-300">Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
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
          <Route path="colors" element={<ColorList />} />
          <Route path="sizes" element={<SizeList />} />
          <Route path="pos" element={<POS />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="inventory-history" element={<InventoryHistory />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="receipts" element={<ReceiptsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="product-images" element={<ImageGallery />} />
        </Routes>
      </main>
    </div>
  )
}
