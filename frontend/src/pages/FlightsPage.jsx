import FlightSearch from '../components/flights/FlightSearch'

const popularRoutes = [
  { from: 'DEL', to: 'BOM', label: 'Delhi → Mumbai',    price: '₹3,999' },
  { from: 'BOM', to: 'GOI', label: 'Mumbai → Goa',       price: '₹2,599' },
  { from: 'DEL', to: 'BLR', label: 'Delhi → Bangalore', price: '₹3,999' },
  { from: 'BLR', to: 'DEL', label: 'Bangalore → Delhi', price: '₹4,799' },
  { from: 'DEL', to: 'CCU', label: 'Delhi → Kolkata',   price: '₹4,200' },
  { from: 'DEL', to: 'GOI', label: 'Delhi → Goa',       price: '₹5,200' },
  { from: 'BOM', to: 'DEL', label: 'Mumbai → Delhi',    price: '₹3,799' },
  { from: 'MAA', to: 'BOM', label: 'Chennai → Mumbai',  price: '₹4,100' },
]

const today = new Date().toISOString().split('T')[0]

export default function FlightsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">✈️</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Find Cheap Flights</h1>
            <p className="mt-3 text-blue-100 text-lg">Compare prices from hundreds of airlines and book your perfect trip.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <FlightSearch />
          </div>
        </div>
      </div>

      {/* Popular routes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Flight Routes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularRoutes.map(route => (
              <a key={route.label}
                href={`/flights/results?origin=${route.from}&destination=${route.to}&date=${today}&passengers=1&cabin=ECONOMY`}
                className="group flex flex-col p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{route.label}</span>
                <span className="text-xs text-blue-600 font-bold mt-1">from {route.price}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Why book with us */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '💰', title: 'Best Price Guarantee', desc: 'We match or beat any price you find elsewhere.' },
            { icon: '⚡', title: 'Instant Confirmation', desc: 'Your booking is confirmed in seconds, no waiting.' },
            { icon: '🛡️', title: 'Secure Payments', desc: 'Your payment information is always safe with us.' },
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