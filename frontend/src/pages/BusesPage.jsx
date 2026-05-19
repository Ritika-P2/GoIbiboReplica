import { useNavigate } from 'react-router-dom'
import BusSearch from '../components/buses/BusSearch'
import { ROUTES } from '../constants/routes'

const POPULAR_ROUTES = [
  { from: 'Mumbai',    to: 'Pune',      icon: '🚌', buses: '80+ buses daily' },
  { from: 'Delhi',     to: 'Jaipur',    icon: '🚌', buses: '60+ buses daily' },
  { from: 'Bangalore', to: 'Chennai',   icon: '🚌', buses: '50+ buses daily' },
  { from: 'Hyderabad', to: 'Bangalore', icon: '🚌', buses: '45+ buses daily' },
  { from: 'Mumbai',    to: 'Goa',       icon: '🚌', buses: '30+ buses daily' },
  { from: 'Delhi',     to: 'Agra',      icon: '🚌', buses: '55+ buses daily' },
]

const FEATURES = [
  { icon: '🛋️', title: 'Comfortable Seating',    desc: 'Choose from AC Sleeper, Volvo, Semi-Sleeper or Seater — all with guaranteed comfort.' },
  { icon: '🌙', title: 'Overnight Journeys',     desc: "Save on hotel costs with overnight buses. Board at night, arrive refreshed at dawn." },
  { icon: '📍', title: 'Live Bus Tracking',      desc: 'Know exactly where your bus is with real-time GPS tracking from pickup to drop.' },
  { icon: '❄️', title: 'AC & Non-AC Options',   desc: 'Choose fully air-conditioned Volvo coaches or budget-friendly non-AC buses.' },
  { icon: '🔄', title: 'Easy Cancellation',      desc: 'Cancel up to 2 hours before departure and get a refund as per operator policy.' },
  { icon: '📱', title: 'M-Ticket',               desc: 'Travel paperless — show your e-ticket on your phone at the boarding point.' },
]

const today = new Date().toISOString().split('T')[0]

export default function BusesPage() {
  const navigate = useNavigate()

  function goRoute(from, to) {
    const params = new URLSearchParams({ origin: from, destination: to, date: today }).toString()
    navigate(`${ROUTES.BUS_RESULTS}?${params}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Orange hero */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Book Bus Tickets</h1>
            <p className="mt-2 text-orange-100 text-base">Safe, comfortable and affordable bus travel across India</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <BusSearch />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16 space-y-8">

        {/* Popular Routes */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Bus Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POPULAR_ROUTES.map(r => (
              <button
                key={r.from + r.to}
                onClick={() => goRoute(r.from, r.to)}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all text-left group">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-2xl group-hover:bg-orange-200 transition-colors">
                  {r.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{r.from} → {r.to}</p>
                  <p className="text-xs text-orange-500 font-medium mt-0.5">{r.buses} →</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Why Goibibo Buses */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Why Book Buses on Goibibo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
                <div className="text-3xl shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operator note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">500+ Bus Operators</span> — Book from KSRTC, MSRTC, RedBus partners,
            Volvo, and private operators with instant confirmation.
          </p>
        </div>
      </div>
    </div>
  )
}
