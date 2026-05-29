import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { hotelService } from '../services/hotelService'
import { ROUTES } from '../constants/routes'
import Loader from '../components/common/Loader'
import { getHotelHeroPhotos, getRoomPhotos, getAmenityPhoto } from '../utils/hotelImages'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=500&fit=crop&q=80&auto=format'

function imgErr(e) { e.currentTarget.src = FALLBACK_IMG }

function RatingBadge({ rating }) {
  if (!rating) return null
  const color = rating >= 4.5 ? 'bg-green-600' : rating >= 4 ? 'bg-green-500' : 'bg-yellow-500'
  const label = rating >= 4.5 ? 'Fabulous' : rating >= 4 ? 'Very Good' : 'Good'
  return (
    <span className={`${color} text-white text-sm font-bold px-2.5 py-1 rounded`}>
      {rating} · {label}
    </span>
  )
}

// ── Hero 5-photo grid ─────────────────────────────────────────────────────────
function HeroGallery({ photos, hotelName, onViewAll }) {
  const imgs = photos.slice(0, 5)
  while (imgs.length < 5) imgs.push(FALLBACK_IMG)

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-1 h-[340px] sm:h-[420px] rounded-xl overflow-hidden">
      {/* Main large photo – spans 2 cols × 2 rows */}
      <div className="col-span-2 row-span-2 relative">
        <img src={imgs[0]} alt={hotelName} className="w-full h-full object-cover" onError={imgErr} />
      </div>
      {/* 4 small thumbnails */}
      {imgs.slice(1, 5).map((src, i) => (
        <div key={i} className="relative overflow-hidden">
          <img src={src} alt={`${hotelName} view ${i + 2}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            onError={imgErr}
            onClick={onViewAll}
          />
          {i === 3 && (
            <button
              onClick={onViewAll}
              className="absolute inset-0 bg-black/50 text-white text-sm font-semibold flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              View all photos
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Full-screen photo lightbox ────────────────────────────────────────────────
function PhotoLightbox({ photos, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length)
  const next = () => setIdx(i => (i + 1) % photos.length)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <span className="text-white text-sm">{idx + 1} / {photos.length}</span>
        <button onClick={onClose} className="text-white text-2xl leading-none">✕</button>
      </div>
      <div className="flex-1 flex items-center justify-center relative px-12">
        <button onClick={prev} className="absolute left-2 text-white text-3xl p-2 hover:bg-white/10 rounded-full">‹</button>
        <img src={photos[idx]} alt="Hotel photo" className="max-h-full max-w-full object-contain rounded-lg" onError={imgErr} />
        <button onClick={next} className="absolute right-2 text-white text-3xl p-2 hover:bg-white/10 rounded-full">›</button>
      </div>
      <div className="flex gap-2 overflow-x-auto p-4 justify-center">
        {photos.map((src, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${i === idx ? 'border-orange-400' : 'border-transparent'}`}>
            <img src={src} alt="" className="w-full h-full object-cover" onError={imgErr} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Gallery tab section ───────────────────────────────────────────────────────
const GALLERY_TABS = ['Location', 'Rooms', 'Amenities']

function GallerySection({ hotel, rooms, amenities }) {
  const [tab, setTab] = useState('Location')
  const [lightbox, setLightbox] = useState(null)

  const locationPhotos = getHotelHeroPhotos(hotel)

  const roomPhotos = (() => {
    const seen = new Set()
    return rooms.flatMap(r => {
      const key = r.type?.split(' ')[0]
      if (seen.has(key)) return []
      seen.add(key)
      return getRoomPhotos(r.type).map(src => ({ src, label: r.type }))
    })
  })()

  const amenityPhotos = amenities
    .map(a => ({ src: getAmenityPhoto(a), label: a }))
    .filter(x => x.src)

  const currentPhotos =
    tab === 'Location' ? locationPhotos.map(src => ({ src, label: hotel.city })) :
    tab === 'Rooms'    ? roomPhotos :
    amenityPhotos

  const allSrcs = currentPhotos.map(p => p.src)

  if (currentPhotos.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Photos</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {GALLERY_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${tab === t ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {currentPhotos.map(({ src, label }, i) => (
          <div key={i} className="relative group overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
            onClick={() => setLightbox(i)}>
            <img src={src} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={imgErr} loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <span className="absolute bottom-1.5 left-2 text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
              {label}
            </span>
          </div>
        ))}
      </div>

      {lightbox !== null && (
        <PhotoLightbox photos={allSrcs} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}

// ── Amenities with photos ─────────────────────────────────────────────────────
function AmenitiesSection({ amenities }) {
  const withPhoto = amenities.filter(a => getAmenityPhoto(a))
  const withoutPhoto = amenities.filter(a => !getAmenityPhoto(a))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Hotel Amenities</h2>

      {withPhoto.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {withPhoto.map(a => (
            <div key={a} className="relative rounded-lg overflow-hidden h-24 group">
              <img src={getAmenityPhoto(a)} alt={a}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={imgErr} loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2.5 text-white text-xs font-semibold drop-shadow">{a}</span>
            </div>
          ))}
        </div>
      )}

      {withoutPhoto.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {withoutPhoto.map(a => (
            <span key={a} className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-sm font-medium">
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const checkIn  = searchParams.get('checkIn')  || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests   = searchParams.get('guests')   || '1'
  const rooms    = searchParams.get('rooms')    || '1'

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1

  const [hotel,      setHotel]      = useState(null)
  const [hotelRooms, setHotelRooms] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showLightbox, setShowLightbox] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null)
      try {
        const [hRes, rRes] = await Promise.all([
          hotelService.getById(id),
          hotelService.getRooms(id, { capacity: guests }),
        ])
        setHotel(hRes.data.hotel)
        setHotelRooms(rRes.data.rooms || [])
      } catch {
        setError('Failed to load hotel details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, guests])

  function handleSelectRoom(room) {
    navigate(ROUTES.HOTEL_BOOKING, {
      state: { hotel, room, checkIn, checkOut, guests: Number(guests), rooms: Number(rooms), nights }
    })
  }

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  }

  if (loading) return <Loader fullPage text="Loading hotel details..." />

  if (error || !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 text-lg">{error || 'Hotel not found.'}</p>
        <button className="mt-4 text-orange-500 hover:underline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    )
  }

  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : (hotel.amenities ? [hotel.amenities] : [])
  const avgRating = hotel.reviews?.length
    ? (hotel.reviews.reduce((s, r) => s + r.rating, 0) / hotel.reviews.length).toFixed(1)
    : hotel.avgRating || null

  const heroPhotos = getHotelHeroPhotos(hotel)
  const allHeroSrcs = heroPhotos

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-orange-500 text-sm flex items-center gap-1 transition-colors">
            ← Back to results
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-800 truncate">{hotel.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* Hero photo gallery */}
        <HeroGallery photos={heroPhotos} hotelName={hotel.name} onViewAll={() => setShowLightbox(true)} />

        {showLightbox && (
          <PhotoLightbox photos={allHeroSrcs} startIndex={0} onClose={() => setShowLightbox(false)} />
        )}

        {/* Hotel info card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-3 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{hotel.address}, {hotel.city}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-yellow-400 text-lg tracking-tight">
                  {'★'.repeat(hotel.starRating || 0)}{'☆'.repeat(5 - (hotel.starRating || 0))}
                </span>
                <RatingBadge rating={avgRating ? Number(avgRating) : null} />
                {hotel.reviews?.length > 0 && (
                  <span className="text-xs text-gray-400">{hotel.reviews.length} reviews</span>
                )}
              </div>
            </div>
            {hotelRooms[0] && (
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">Starting from</p>
                <p className="text-3xl font-bold text-orange-500">₹{Number(hotelRooms[0].pricePerNight).toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400">per night</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: content */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Photo gallery section */}
            <GallerySection hotel={hotel} rooms={hotelRooms} amenities={amenities} />

            {/* Amenities with photos */}
            {amenities.length > 0 && (
              <AmenitiesSection amenities={amenities} />
            )}

            {/* Rooms */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Available Rooms</h2>
              {hotelRooms.length === 0 ? (
                <p className="text-gray-500">No rooms available for your selection.</p>
              ) : (
                <div className="space-y-3">
                  {hotelRooms.map(room => {
                    const roomImgs = getRoomPhotos(room.type)
                    return (
                      <div key={room.id}
                        className="border border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition-colors overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          {/* Room photo */}
                          <div className="sm:w-44 h-32 sm:h-auto shrink-0 overflow-hidden">
                            <img src={roomImgs[0]} alt={room.type}
                              className="w-full h-full object-cover"
                              onError={imgErr} loading="lazy" />
                          </div>
                          {/* Room info */}
                          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{room.type}</h3>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Up to {room.capacity} guests ·{' '}
                                <span className={room.availableRooms <= 3 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                                  {room.availableRooms} room{room.availableRooms !== 1 ? 's' : ''} left
                                </span>
                              </p>
                              {room.amenities && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {(Array.isArray(room.amenities) ? room.amenities : [room.amenities]).map(a => (
                                    <span key={a} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{a}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right sm:w-40 shrink-0">
                              <p className="text-2xl font-bold text-orange-500">₹{Number(room.pricePerNight).toLocaleString('en-IN')}</p>
                              <p className="text-xs text-gray-400">per night</p>
                              {nights > 1 && (
                                <p className="text-xs text-gray-500 font-medium">
                                  ₹{(Number(room.pricePerNight) * nights).toLocaleString('en-IN')} for {nights} nights
                                </p>
                              )}
                              <button onClick={() => handleSelectRoom(room)}
                                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                                Select
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Reviews */}
            {hotel.reviews?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Guest Reviews <span className="text-gray-400 font-normal text-sm">({hotel.reviews.length})</span>
                </h2>
                <div className="space-y-4">
                  {hotel.reviews.slice(0, 5).map(r => (
                    <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-800 text-sm">{r.user?.name || 'Guest'}</p>
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                          {r.rating} ★
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking summary */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-16">
              <h3 className="font-bold text-gray-900 mb-4">Your Stay</h3>
              {checkIn && checkOut ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-semibold">{fmtDate(checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-semibold">{fmtDate(checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-semibold">{guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rooms</span>
                    <span className="font-semibold">{rooms}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No dates selected.</p>
              )}
              <p className="text-xs text-gray-400 mt-4 bg-orange-50 rounded-lg p-3">
                Select a room above to complete your booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
