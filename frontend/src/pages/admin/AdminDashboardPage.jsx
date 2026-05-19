import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const CARDS = [
  { to: ROUTES.ADMIN_FLIGHTS,  label: 'Flight Schedules', icon: '✈️',  desc: 'Add or manage flight routes and schedules', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { to: ROUTES.ADMIN_HOTELS,   label: 'Hotels',           icon: '🏨',  desc: 'Add hotel listings with rooms and amenities', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { to: ROUTES.ADMIN_TRAINS,   label: 'Train Schedules',  icon: '🚂',  desc: 'Manage train routes and class pricing', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { to: ROUTES.ADMIN_BUSES,    label: 'Bus Schedules',    icon: '🚌',  desc: 'Add bus operators and route schedules', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { to: ROUTES.ADMIN_HOLIDAYS, label: 'Holiday Packages', icon: '🏖️', desc: 'Create and publish holiday packages', color: 'bg-rose-50 border-rose-200 text-rose-700' },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Manager Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Manage travel inventory visible to all users.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(card => (
          <Link key={card.to} to={card.to}
            className={`border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${card.color}`}>
            <span className="text-4xl">{card.icon}</span>
            <div>
              <p className="font-bold text-gray-900 text-base">{card.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
            </div>
            <span className="text-xs font-semibold mt-auto">Manage →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
