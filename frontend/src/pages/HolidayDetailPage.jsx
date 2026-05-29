import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { holidayService } from '../services/holidayService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'

// Curated Unsplash photo IDs per destination.
// URLs use the direct CDN (images.unsplash.com/photo-{ID}) which works
// without an API key — unlike source.unsplash.com which is deprecated.
const DESTINATION_PHOTOS = {
  Goa: [
    '1512343879784-a960bf40e7f2', // aerial Goa beach
    '1507525428034-b723cf961d3e', // tropical sandy beach
    '1559494007-9f5847c49d94', // palm-lined shore
    '1519046904884-53103b34b206', // beach from above
    '1503756234508-e180b02012f6', // turquoise sea
    '1596436873906-f8e91aec7961', // beach sunset
  ],
  Kerala: [
    '1602216056096-3b40cc0c9944', // Kerala backwaters houseboat
    '1506905925346-21bda4d32df4', // lush green landscape
    '1501854140801-50d01698950b', // aerial green hillside
    '1527631120902-378417754324', // river through jungle
    '1544551763-46a013bb70d5', // clear tropical waters
    '1464822759023-fed622ff2c3b', // misty mountain valley
  ],
  Manali: [
    '1605649487212-47bdab064df7', // snow-covered Himalayan valley
    '1506905925346-21bda4d32df4', // mountain peaks
    '1464822759023-fed622ff2c3b', // mountain landscape with snow
    '1476514525535-07fb3b4ae5f1', // mountain lake
    '1519681393784-d120267933ba', // snowy mountains night
    '1491555103944-7c647fd857e6', // alpine meadow
  ],
  Shimla: [
    '1597069580476-e4e7b9e4e897', // Shimla hillside
    '1506905925346-21bda4d32df4', // mountain ridge
    '1476514525535-07fb3b4ae5f1', // mountain lake
    '1464822759023-fed622ff2c3b', // scenic valley
    '1519681393784-d120267933ba', // mountain night sky
    '1491555103944-7c647fd857e6', // meadow hills
  ],
  Ladakh: [
    '1605649487212-47bdab064df7', // high altitude barren mountains
    '1519681393784-d120267933ba', // starry sky over mountains
    '1476514525535-07fb3b4ae5f1', // mountain lake reflection
    '1464822759023-fed622ff2c3b', // rugged mountain valley
    '1506905925346-21bda4d32df4', // snow peaks
    '1491555103944-7c647fd857e6', // alpine plateau
  ],
  Darjeeling: [
    '1501854140801-50d01698950b', // green hillside aerial
    '1464822759023-fed622ff2c3b', // misty mountains
    '1506905925346-21bda4d32df4', // mountain scenery
    '1527631120902-378417754324', // river through greenery
    '1476514525535-07fb3b4ae5f1', // lake in hills
    '1491555103944-7c647fd857e6', // rolling hills
  ],
  Rajasthan: [
    '1477587458883-47145ed6979e', // Amber Fort Jaipur
    '1493770348161-369560ae357d', // sand dunes camel
    '1524492412937-b28074a5d7da', // palace/fort architecture
    '1526080652727-5b77f74e9b31', // desert landscape
    '1611262588024-d12430b98920', // ornate Indian architecture
    '1585468274952-66591eb14165', // Rajasthan fort
  ],
  Jaipur: [
    '1477587458883-47145ed6979e', // Amber Fort
    '1524492412937-b28074a5d7da', // palace
    '1611262588024-d12430b98920', // ornate architecture
    '1585468274952-66591eb14165', // fort walls
    '1493770348161-369560ae357d', // desert dunes
    '1526080652727-5b77f74e9b31', // landscape
  ],
  Udaipur: [
    '1524492412937-b28074a5d7da', // palace on lake
    '1477587458883-47145ed6979e', // fort
    '1476514525535-07fb3b4ae5f1', // lake reflection
    '1611262588024-d12430b98920', // heritage architecture
    '1585468274952-66591eb14165', // stone architecture
    '1493770348161-369560ae357d', // scenic landscape
  ],
  Varanasi: [
    '1561361058-c24cecae35ca', // Ganges ghats evening
    '1593693397690-362cb9666fc2', // aarti ceremony
    '1524492412937-b28074a5d7da', // temple architecture
    '1611262588024-d12430b98920', // old city architecture
    '1527631120902-378417754324', // river view
    '1585468274952-66591eb14165', // stone steps
  ],
  Agra: [
    '1548013146-72479768bada', // Taj Mahal
    '1524492412937-b28074a5d7da', // Mughal architecture
    '1477587458883-47145ed6979e', // fort
    '1611262588024-d12430b98920', // heritage monument
    '1585468274952-66591eb14165', // sandstone fort
    '1476514525535-07fb3b4ae5f1', // reflecting pool
  ],
  Amritsar: [
    '1611262588024-d12430b98920', // golden temple
    '1524492412937-b28074a5d7da', // sacred architecture
    '1585468274952-66591eb14165', // stone temple
    '1477587458883-47145ed6979e', // heritage site
    '1527631120902-378417754324', // sacred waters
    '1493770348161-369560ae357d', // landscape
  ],
  Rishikesh: [
    '1527631120902-378417754324', // river rapids
    '1476514525535-07fb3b4ae5f1', // mountain river
    '1501854140801-50d01698950b', // green valley aerial
    '1464822759023-fed622ff2c3b', // hillside nature
    '1506905925346-21bda4d32df4', // mountain view
    '1491555103944-7c647fd857e6', // meadow yoga
  ],
  Andaman: [
    '1544551763-46a013bb70d5', // clear tropical sea
    '1507525428034-b723cf961d3e', // pristine white beach
    '1519046904884-53103b34b206', // aerial island
    '1559494007-9f5847c49d94', // coral reef waters
    '1503756234508-e180b02012f6', // turquoise lagoon
    '1596436873906-f8e91aec7961', // tropical sunset
  ],
  Coorg: [
    '1501854140801-50d01698950b', // coffee plantation hills
    '1464822759023-fed622ff2c3b', // misty green hills
    '1506905925346-21bda4d32df4', // western ghats
    '1527631120902-378417754324', // forest river
    '1491555103944-7c647fd857e6', // green meadow
    '1476514525535-07fb3b4ae5f1', // lake in forest
  ],
  Meghalaya: [
    '1527631120902-378417754324', // waterfall / living root bridge
    '1501854140801-50d01698950b', // green hills aerial
    '1464822759023-fed622ff2c3b', // misty northeast landscape
    '1476514525535-07fb3b4ae5f1', // mountain lake
    '1491555103944-7c647fd857e6', // lush meadow
    '1506905925346-21bda4d32df4', // mountain range
  ],
  'Jim Corbett': [
    '1474511320723-9a56873867b5', // tiger wildlife
    '1501854140801-50d01698950b', // jungle aerial
    '1527631120902-378417754324', // forest river
    '1464822759023-fed622ff2c3b', // dense forest
    '1491555103944-7c647fd857e6', // grassland
    '1476514525535-07fb3b4ae5f1', // forest lake
  ],
  // International
  Bali: [
    '1537996008257-5e31e4d9e2f8', // Bali rice terraces
    '1518548419970-58e3b4079ab2', // Bali temple
    '1552465011-b4e21bf6e79a', // Bali beach
    '1559494007-9f5847c49d94', // tropical waters
    '1507525428034-b723cf961d3e', // beach
    '1596436873906-f8e91aec7961', // tropical sunset
  ],
  Thailand: [
    '1528360983277-13d401cdc186', // Thai temple
    '1518548419970-58e3b4079ab2', // Buddhist temple
    '1503756234508-e180b02012f6', // turquoise bay
    '1507525428034-b723cf961d3e', // Thai beach
    '1544551763-46a013bb70d5', // clear waters
    '1527631120902-378417754324', // river/jungle
  ],
  Singapore: [
    '1525625293133-d4ba63190030', // Marina Bay Sands
    '1565967511849-76a60a516170', // Singapore skyline
    '1508964942454-1a56651d54ac', // Gardens by the Bay
    '1518998053901-5348d3961a04', // city lights
    '1524492412937-b28074a5d7da', // architecture
    '1519046904884-53103b34b206', // aerial city
  ],
  Maldives: [
    '1544551763-46a013bb70d5', // overwater bungalow crystal water
    '1507525428034-b723cf961d3e', // white sand beach
    '1519046904884-53103b34b206', // aerial island
    '1503756234508-e180b02012f6', // lagoon
    '1559494007-9f5847c49d94', // coral reef
    '1596436873906-f8e91aec7961', // sunset over ocean
  ],
  Switzerland: [
    '1506905925346-21bda4d32df4', // Swiss Alps
    '1476514525535-07fb3b4ae5f1', // alpine lake
    '1464822759023-fed622ff2c3b', // mountain valley
    '1519681393784-d120267933ba', // snowy peaks
    '1491555103944-7c647fd857e6', // alpine meadow flowers
    '1605649487212-47bdab064df7', // snow mountains
  ],
  Dubai: [
    '1518998053901-5348d3961a04', // Dubai skyline night
    '1565967511849-76a60a516170', // city lights
    '1525625293133-d4ba63190030', // modern architecture
    '1493770348161-369560ae357d', // desert dunes
    '1526080652727-5b77f74e9b31', // desert landscape
    '1508964942454-1a56651d54ac', // city building
  ],
}

// Returns 6 gallery photo URLs for a destination using direct Unsplash CDN IDs.
// Falls back to picsum (seeded by city+index) for unmapped cities.
function getGalleryImages(city) {
  const photos = DESTINATION_PHOTOS[city]
  if (photos) {
    return photos.map(id =>
      `https://images.unsplash.com/photo-${id}?w=600&h=400&fit=crop&q=80&auto=format`
    )
  }
  // Fallback: try partial match
  const match = Object.keys(DESTINATION_PHOTOS).find(k =>
    city?.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(city?.toLowerCase())
  )
  if (match) {
    return DESTINATION_PHOTOS[match].map(id =>
      `https://images.unsplash.com/photo-${id}?w=600&h=400&fit=crop&q=80&auto=format`
    )
  }
  // Last resort: picsum seeded by city name
  return Array.from({ length: 6 }, (_, i) =>
    `https://picsum.photos/seed/${encodeURIComponent(city || 'travel')}-${i + 1}/600/400`
  )
}

const TAG_COLORS = {
  Beach:       'bg-cyan-100 text-cyan-700',
  Honeymoon:   'bg-pink-100 text-pink-700',
  Adventure:   'bg-orange-100 text-orange-700',
  Family:      'bg-green-100 text-green-700',
  Heritage:    'bg-amber-100 text-amber-700',
  Culture:     'bg-purple-100 text-purple-700',
  Nature:      'bg-emerald-100 text-emerald-700',
  Spiritual:   'bg-indigo-100 text-indigo-700',
  Wellness:    'bg-teal-100 text-teal-700',
  Luxury:      'bg-yellow-100 text-yellow-700',
  Hill:        'bg-blue-100 text-blue-700',
  'Hill Station': 'bg-blue-100 text-blue-700',
  International: 'bg-rose-100 text-rose-700',
}

function StarRating({ rating }) {
  const n = Number(rating) || 4.2
  const full = Math.floor(n)
  const half = n - full >= 0.5 ? 1 : 0
  return (
    <span className="text-yellow-400 text-lg tracking-tight">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - half)}
    </span>
  )
}

export default function HolidayDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [pkg, setPkg]       = useState(location.state?.pkg || null)
  const [loading, setLoading] = useState(!location.state?.pkg)
  const [error, setError]   = useState(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (pkg) return
    setLoading(true)
    holidayService.getById(id)
      .then(res => setPkg(res.data?.package || res.package))
      .catch(() => setError('Could not load package details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader text="Loading package…" /></div>
  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">{error || 'Package not found.'}</p>
        <button onClick={() => navigate(ROUTES.HOLIDAYS)} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
          Browse Packages
        </button>
      </div>
    )
  }

  const price         = Number(pkg.price)
  const originalPrice = pkg.originalPrice ? Number(pkg.originalPrice) : null
  const discount      = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  const rating        = Number(pkg.rating || 4.2)
  const reviews       = Number(pkg.reviewCount || 1200)
  const heroImg       = (!imgError && (pkg.images?.[0] || `https://picsum.photos/seed/${encodeURIComponent(pkg.title)}/1200/500`))

  const galleryImages = getGalleryImages(pkg.city)

  function handleBook() {
    navigate(ROUTES.HOLIDAY_BOOKING, { state: { pkg } })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="relative h-80 md:h-[420px] overflow-hidden">
        {heroImg ? (
          <img
            src={heroImg}
            alt={pkg.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-300 to-orange-400" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {pkg.tags?.map(tag => (
                <span key={tag} className="text-xs font-semibold bg-white/20 text-white backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
              {pkg.title}
            </h1>
            <p className="text-white/80 mt-2 text-sm md:text-base flex items-center gap-3">
              <span>📍 {pkg.city}</span>
              <span>·</span>
              <span>🗓 {pkg.duration}N / {pkg.duration + 1}D</span>
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-right min-w-[180px]">
            {originalPrice && (
              <p className="text-white/60 text-sm line-through">₹{originalPrice.toLocaleString('en-IN')}</p>
            )}
            <p className="text-3xl font-extrabold text-white">₹{price.toLocaleString('en-IN')}</p>
            <p className="text-white/70 text-xs mb-3">per person</p>
            {discount > 0 && (
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-3">
                {discount}% OFF
              </span>
            )}
            <button
              onClick={handleBook}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              Book This Package
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* Left: main details */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* About */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About This Package</h2>
            {pkg.description ? (
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">{pkg.description}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">No description available.</p>
            )}
            {pkg.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {pkg.tags.map(tag => (
                  <span key={tag} className={`text-xs font-semibold px-3 py-1 rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Highlights */}
          {pkg.highlights?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Highlights</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 font-bold text-xs">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Destination Gallery */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Destination Gallery
            </h2>
            <p className="text-sm text-gray-500 mb-4">Explore {pkg.city} — images from this destination</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryImages.map((src, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden group bg-gray-100">
                  <img
                    src={src}
                    alt={`${pkg.city} tourist spot ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: sticky booking card */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">{pkg.title}</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>📍 Destination</span>
                <span className="font-semibold text-gray-800">{pkg.city}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>🗓 Duration</span>
                <span className="font-semibold text-gray-800">{pkg.duration}N / {pkg.duration + 1}D</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>⭐ Rating</span>
                <span className="flex items-center gap-1">
                  <StarRating rating={rating} />
                  <span className="text-xs text-gray-400 font-medium">({reviews.toLocaleString('en-IN')})</span>
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              {originalPrice && (
                <p className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')} / person</p>
              )}
              <p className="text-3xl font-extrabold text-orange-500">₹{price.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400 mb-1">per person, all inclusive</p>
              {discount > 0 && (
                <p className="text-xs text-green-600 font-semibold mb-3">
                  You save ₹{(originalPrice - price).toLocaleString('en-IN')} ({discount}% off)
                </p>
              )}
            </div>

            <button
              onClick={handleBook}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Book This Package
            </button>
            <p className="text-xs text-gray-400 text-center">No hidden charges · Instant confirmation</p>

            {pkg.tags?.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Package Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.tags.map(tag => (
                    <span key={tag} className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
