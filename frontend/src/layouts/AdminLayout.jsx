import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const LINKS = [
  { to: ROUTES.ADMIN,          label: 'Dashboard',  icon: '🏠', exact: true },
  { to: ROUTES.ADMIN_FLIGHTS,  label: 'Flights',    icon: '✈️' },
  { to: ROUTES.ADMIN_HOTELS,   label: 'Hotels',     icon: '🏨' },
  { to: ROUTES.ADMIN_TRAINS,   label: 'Trains',     icon: '🚂' },
  { to: ROUTES.ADMIN_BUSES,    label: 'Buses',      icon: '🚌' },
  { to: ROUTES.ADMIN_HOLIDAYS, label: 'Holidays',   icon: '🏖️' },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }>
              <span className="text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
