import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import Button from '../components/common/Button'
import api from '../services/api'

const themes = [
  { icon: '🏖️', label: 'Beach' },
  { icon: '🏔️', label: 'Adventure' },
  { icon: '🏛️', label: 'Heritage' },
  { icon: '🌿', label: 'Nature' },
  { icon: '🙏', label: 'Spiritual' },
  { icon: '🛶', label: 'Leisure' },
]

export default function HolidaysPage() {
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/holidays')
      .then(res => setPackages(res.data?.packages || []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
          <div className="text-center">
            <div className="text-5xl mb-4">🌴</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Holiday Packages</h1>
            <p className="mt-3 text-pink-100 text-lg max-w-2xl mx-auto">
              Handcrafted holiday packages with flights, hotels, sightseeing and more — all in one price.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {themes.map(t => (
                <span key={t.label} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  {t.icon} {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Packages grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Packages</h2>
          {!loading && <span className="text-sm text-gray-500">{packages.length} packages available</span>}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-lg">Loading packages…</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏖️</div>
            <p className="text-gray-500 text-lg">No holiday packages available right now.</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon — new packages are being added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => {
              const discount = pkg.originalPrice
                ? Math.round((1 - Number(pkg.price) / Number(pkg.originalPrice)) * 100)
                : 0
              const img = (pkg.images && pkg.images[0]) || null

              return (
                <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  {/* Image / emoji placeholder */}
                  <div className="h-40 bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center text-7xl relative overflow-hidden">
                    {img
                      ? <img src={img} alt={pkg.title} className="w-full h-full object-cover" />
                      : '🌴'}
                    {discount > 0 && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-pink-600 transition-colors">{pkg.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{pkg.duration}N · {pkg.city}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        {pkg.originalPrice && (
                          <p className="text-xs text-gray-400 line-through">₹{Number(pkg.originalPrice).toLocaleString()}</p>
                        )}
                        <p className="text-xl font-bold text-pink-600">₹{Number(pkg.price).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">per person</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {pkg.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {pkg.tags.map(tag => (
                          <span key={tag} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Highlights */}
                    {pkg.highlights?.length > 0 && (
                      <ul className="space-y-1 mb-4">
                        {pkg.highlights.slice(0, 3).map(h => (
                          <li key={h} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="text-green-500 shrink-0">✓</span> {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700"
                      onClick={() => navigate(ROUTES.HOLIDAY_BOOKING, { state: { pkg } })}>
                      Book Now
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-pink-600 to-orange-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Need a Custom Package?</h2>
          <p className="text-pink-100 mb-6">Tell us your dream destination and we will plan the perfect trip for you.</p>
          <Button variant="secondary" size="lg" className="bg-white text-pink-600 hover:bg-pink-50 border-0">
            Talk to a Travel Expert
          </Button>
        </div>
      </div>
    </div>
  )
}
