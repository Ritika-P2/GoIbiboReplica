import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { ROUTES } from '../../constants/routes'

const NAV_LINKS = [
  { label: 'Flights',   to: ROUTES.FLIGHTS,   icon: '✈️' },
  { label: 'Hotels',    to: ROUTES.HOTELS,    icon: '🏨' },
  { label: 'Trains',    to: ROUTES.TRAINS,    icon: '🚂' },
  { label: 'Cabs',      to: ROUTES.CABS,      icon: '🚖' },
  { label: 'Bus',       to: ROUTES.BUSES,     icon: '🚌' },
  { label: 'Holidays',  to: ROUTES.HOLIDAYS,  icon: '🏖️' },
  { label: 'Forex',     to: '#',              icon: '💱' },
  { label: 'Insurance', to: '#',              icon: '🛡️' },
]

export default function Navbar() {
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  function handleLogout() {
    dispatch(logout())
    setProfileOpen(false)
    navigate(ROUTES.HOME)
  }

  const initials = user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-1 shrink-0">
            <span className="text-2xl font-extrabold leading-none">
              <span className="text-blue-600">go</span><span className="text-orange-500">ibibo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center h-full">
            {NAV_LINKS.map(link => (
              <NavLink key={link.to + link.label} to={link.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center h-full px-3 text-xs font-semibold border-b-2 transition-colors gap-0.5 ${
                    isActive && link.to !== '#'
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-600 hover:text-orange-500 hover:border-orange-300'
                  }`
                }>
                <span className="text-base leading-none">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Manage Booking / My Trips */}
                <Link to={ROUTES.MY_BOOKINGS}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-orange-500 transition-colors">
                  <span className="text-base">🧳</span>
                  <div className="leading-tight">
                    <p className="text-[10px] text-gray-400">Manage Booking</p>
                    <p className="font-bold text-gray-800 text-xs">My Trips</p>
                  </div>
                </Link>

                {/* GoCash / Profile */}
                <div className="relative">
                  <button onClick={() => setProfileOpen(o => !o)}
                    className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-100 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {initials}
                    </div>
                    <div className="leading-tight text-left">
                      <p className="text-[10px] font-bold text-gray-800">{user?.name?.split(' ')[0] || 'Account'}</p>
                      <p className="text-[10px] text-gray-500">GoCash · ₹0</p>
                    </div>
                    <span className="text-gray-400 text-xs">▾</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                      <Link to={ROUTES.MY_BOOKINGS} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                        🧳 My Bookings
                      </Link>
                      <Link to={ROUTES.PROFILE} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                        👤 Profile
                      </Link>
                      {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                        <Link to={ROUTES.ADMIN} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-600 font-semibold hover:bg-orange-50">
                          ⚙️ Manager Panel
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to={ROUTES.MY_BOOKINGS}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-orange-500 transition-colors">
                  <span className="text-base">🧳</span>
                  <div className="leading-tight">
                    <p className="text-[10px] text-gray-400">Manage Booking</p>
                    <p className="font-bold text-gray-800 text-xs">My Trips</p>
                  </div>
                </Link>
                <Link to={ROUTES.LOGIN}
                  className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs">👤</div>
                  <div className="leading-tight">
                    <p className="font-bold text-gray-800">Login / Signup</p>
                    <p className="text-[10px] text-gray-400">GoCash · ₹0</p>
                  </div>
                  <span className="text-gray-400">▾</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-orange-500"
            onClick={() => setMenuOpen(o => !o)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {NAV_LINKS.map(link => (
              <NavLink key={link.to + link.label} to={link.to} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-semibold ${isActive && link.to !== '#' ? 'bg-orange-50 text-orange-500' : 'text-gray-600 hover:bg-gray-50'}`
                }>
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </div>
          <hr className="border-gray-100 mb-3" />
          {isAuthenticated ? (
            <div className="space-y-1">
              <Link to={ROUTES.MY_BOOKINGS} onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">🧳 My Bookings</Link>
              <Link to={ROUTES.PROFILE} onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">👤 Profile</Link>
              {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                <Link to={ROUTES.ADMIN} onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-orange-600 font-semibold hover:bg-orange-50 rounded-lg">⚙️ Manager Panel</Link>
              )}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">🚪 Logout</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to={ROUTES.LOGIN} onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-bold border-2 border-orange-500 text-orange-500 px-4 py-2 rounded-full hover:bg-orange-50">Login</Link>
              <Link to={ROUTES.REGISTER} onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-bold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
