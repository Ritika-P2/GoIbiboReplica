import FlightSearch from '../components/flights/FlightSearch'

const popularRoutes = [
  { from: 'DEL', to: 'BOM', label: 'Delhi → Mumbai',     price: '₹3,999' },
  { from: 'BOM', to: 'GOI', label: 'Mumbai → Goa',        price: '₹2,599' },
  { from: 'DEL', to: 'BLR', label: 'Delhi → Bangalore',  price: '₹3,999' },
  { from: 'BLR', to: 'DEL', label: 'Bangalore → Delhi',  price: '₹4,799' },
  { from: 'DEL', to: 'CCU', label: 'Delhi → Kolkata',    price: '₹4,200' },
  { from: 'DEL', to: 'GOI', label: 'Delhi → Goa',        price: '₹5,200' },
  { from: 'BOM', to: 'DEL', label: 'Mumbai → Delhi',     price: '₹3,799' },
  { from: 'MAA', to: 'BOM', label: 'Chennai → Mumbai',   price: '₹4,100' },
]

const today = new Date().toISOString().split('T')[0]

export default function FlightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Orange hero */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <h1 className="text-white text-2xl font-bold text-center mb-6">Domestic and International Flights</h1>
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <FlightSearch />
          </div>
        </div>
      </div>

      {/* Popular routes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Flight Routes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularRoutes.map(route => (
              <a key={route.label}
                href={`/flights/results?origin=${route.from}&destination=${route.to}&date=${today}&passengers=1&cabin=ECONOMY&specialFare=REGULAR`}
                className="group flex flex-col p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-700">{route.label}</span>
                <span className="text-xs text-orange-500 font-bold mt-1">from {route.price}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '💰', title: 'Best Price Guarantee', desc: 'We match or beat any price you find elsewhere.' },
            { icon: '⚡', title: 'Instant Confirmation',  desc: 'Your booking is confirmed in seconds, no waiting.' },
            { icon: '🛡️', title: 'Secure Payments',       desc: 'Your payment information is always safe with us.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
