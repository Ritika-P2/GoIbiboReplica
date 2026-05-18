import HotelSearch from '../components/hotels/HotelSearch'

const destinations = [
  { city: 'Goa',       img: '🏖️', hotels: 48,  from: '₹650' },
  { city: 'Mumbai',    img: '🌆', hotels: 120, from: '₹1,200' },
  { city: 'Delhi',     img: '🏛️', hotels: 95,  from: '₹1,200' },
  { city: 'Bangalore', img: '🌿', hotels: 76,  from: '₹3,200' },
  { city: 'Jaipur',    img: '🏰', hotels: 55,  from: '₹900' },
  { city: 'Udaipur',   img: '🛶', hotels: 32,  from: '₹2,000' },
  { city: 'Manali',    img: '🏔️', hotels: 44,  from: '₹1,500' },
  { city: 'Kochi',     img: '⛵', hotels: 38,  from: '₹1,800' },
]

const today    = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

export default function HotelsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">🏨</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Find Your Perfect Stay</h1>
            <p className="mt-3 text-purple-100 text-lg">Browse thousands of hotels, resorts and homestays across India.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <HotelSearch />
          </div>
        </div>
      </div>

      {/* Popular destinations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Popular Destinations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {destinations.map(d => (
              <a key={d.city}
                href={`/hotels/results?city=${d.city}&checkIn=${today}&checkOut=${tomorrow}&guests=1&rooms=1`}
                className="group flex flex-col items-center p-5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all text-center">
                <span className="text-4xl mb-2">{d.img}</span>
                <span className="font-semibold text-gray-800 group-hover:text-purple-700">{d.city}</span>
                <span className="text-xs text-gray-500 mt-0.5">{d.hotels} hotels</span>
                <span className="text-xs text-purple-600 font-bold mt-1">from {d.from}/night</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🏆', title: 'Top-Rated Hotels', desc: 'Every property is rated by verified guests.' },
            { icon: '🔓', title: 'Free Cancellation', desc: 'Flexible bookings with no cancellation fees.' },
            { icon: '🎁', title: 'Exclusive Deals', desc: 'Members get access to special member-only rates.' },
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