import { NavLink, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../constants/routes'

const ALL_LINKS = [
  { to: ROUTES.ADMIN,          label: 'Dashboard',  icon: '🏠', module: null,       exact: true },
  { to: ROUTES.ADMIN_FLIGHTS,  label: 'Flights',    icon: '✈️', module: 'FLIGHTS' },
  { to: ROUTES.ADMIN_HOTELS,   label: 'Hotels',     icon: '🏨', module: 'HOTELS'  },
  { to: ROUTES.ADMIN_TRAINS,   label: 'Trains',     icon: '🚂', module: 'TRAINS'  },
  { to: ROUTES.ADMIN_BUSES,    label: 'Buses',      icon: '🚌', module: 'BUSES'   },
  { to: ROUTES.ADMIN_HOLIDAYS, label: 'Holidays',   icon: '🏖️', module: 'HOLIDAYS' },
]

export default function AdminLayout() {
  const { user } = useSelector((s) => s.auth)

  // ADMIN sees all links; MANAGER sees Dashboard + their assigned module only
  const visibleLinks = ALL_LINKS.filter((link) => {
    if (!link.module) return true
    if (user?.role === 'ADMIN') return true
    return link.module === user?.managerModule
  })

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Manager Panel</p>
          {user?.managerModule && (
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{user.managerModule.toLowerCase()} module</p>
          )}
        </div>
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {visibleLinks.map(link => (
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
