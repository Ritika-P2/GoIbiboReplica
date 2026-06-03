import { analytics } from '../../services/analyticsService'

const CATEGORY_LABEL = {
  FLIGHTS: 'Flights',
  HOTELS:  'Hotels',
  TRAINS:  'Trains',
  BUS:     'Bus',
  BANK:    'Bank Offers',
}

export default function OfferCard({ offer, onClick }) {
  function handleClick() {
    analytics.offerClicked(offer)
    onClick(offer)
  }

  return (
    <div
      onClick={handleClick}
      className="group rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
    >
      {/* Gradient banner */}
      <div className={`bg-gradient-to-br ${offer.color} h-28 flex items-center justify-center text-6xl relative`}>
        {offer.emoji}
        {/* Discount badge */}
        <span className="absolute top-2 right-2 bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          {offer.discountPercent}% OFF
        </span>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100">
          <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1 rounded-full">
            View Details →
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">
          {CATEGORY_LABEL[offer.category] || offer.category}
        </span>
        <p className="text-sm font-bold text-gray-900 mt-1 leading-tight">{offer.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{offer.description}</p>
        <p className="text-[10px] text-blue-500 font-semibold mt-2">
          Code: <span className="font-bold tracking-wide">{offer.offerCode}</span>
        </p>
      </div>
    </div>
  )
}
