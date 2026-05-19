import { useNavigate } from 'react-router-dom'
import TrainSearch from '../components/trains/TrainSearch'
import { ROUTES } from '../constants/routes'

const POPULAR_ROUTES = [
  { from: 'NDLS', to: 'BCT',  fromName: 'New Delhi',  toName: 'Mumbai Central', icon: '🚆', trains: '42 trains' },
  { from: 'NDLS', to: 'HWH',  fromName: 'New Delhi',  toName: 'Howrah',         icon: '🚆', trains: '28 trains' },
  { from: 'NDLS', to: 'MAS',  fromName: 'New Delhi',  toName: 'Chennai',        icon: '🚆', trains: '18 trains' },
  { from: 'BCT',  to: 'MAS',  fromName: 'Mumbai',     toName: 'Chennai',        icon: '🚆', trains: '15 trains' },
  { from: 'SBC',  to: 'SC',   fromName: 'Bangalore',  toName: 'Hyderabad',      icon: '🚆', trains: '12 trains' },
  { from: 'NDLS', to: 'JP',   fromName: 'New Delhi',  toName: 'Jaipur',         icon: '🚆', trains: '24 trains' },
]

const FEATURES = [
  { icon: '🎫', title: 'Confirmed Tickets',   desc: 'Book confirmed and waitlisted tickets instantly with real-time availability.' },
  { icon: '🔄', title: 'Easy Cancellation',   desc: 'Cancel up to 4 hours before departure and get a refund.' },
  { icon: '📱', title: 'E-Tickets',           desc: 'Travel paperless with digital tickets on your phone — no printout needed.' },
  { icon: '⚡', title: 'Tatkal Booking',      desc: 'Book Tatkal tickets 1 day before departure for last-minute travel.' },
  { icon: '💺', title: 'Seat Preference',     desc: 'Choose lower, middle, or upper berth while booking your ticket.' },
  { icon: '🛡️', title: 'Travel Insurance',   desc: 'Protect your journey with affordable travel insurance coverage.' },
]

const today = new Date().toISOString().split('T')[0]

export default function TrainsPage() {
  const navigate = useNavigate()

  function goRoute(from, to) {
    const params = new URLSearchParams({ origin: from, destination: to, date: today, quota: 'GN' }).toString()
    navigate(`${ROUTES.TRAIN_RESULTS}?${params}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Orange hero */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Book Train Tickets</h1>
            <p className="mt-2 text-orange-100 text-base">Check availability and book confirmed rail tickets across India</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <TrainSearch />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16 space-y-8">

        {/* Popular Routes */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Train Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POPULAR_ROUTES.map(r => (
              <button key={r.from + r.to}
                onClick={() => goRoute(r.from, r.to)}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all text-left group">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-2xl group-hover:bg-orange-200 transition-colors">
                  {r.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{r.fromName} → {r.toName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.from} → {r.to}</p>
                  <p className="text-xs text-orange-500 font-medium mt-0.5">{r.trains} →</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Why Goibibo Trains */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Why Book Trains on Goibibo?</h2>
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

        {/* IRCTC note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Powered by IRCTC</span> — Book directly through the official rail network.
            All bookings are confirmed instantly on the IRCTC platform.
          </p>
        </div>
      </div>
    </div>
  )
}
