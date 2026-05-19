const BUDGET_RANGES = [
  { label: 'Under ₹1,000',      min: 0,     max: 1000  },
  { label: '₹1,000 – ₹2,500',   min: 1000,  max: 2500  },
  { label: '₹2,500 – ₹5,000',   min: 2500,  max: 5000  },
  { label: '₹5,000 – ₹10,000',  min: 5000,  max: 10000 },
  { label: 'Above ₹10,000',      min: 10000, max: 999999 },
]

const RATING_OPTIONS = [
  { label: 'Fabulous 4.5+',  value: 4.5 },
  { label: 'Very Good 4+',   value: 4.0 },
  { label: 'Good 3.5+',      value: 3.5 },
]

export default function HotelFilters({ filters, onChange }) {
  const { starRating, maxPrice, minRating, budgetRange } = filters

  function toggleStar(s) {
    onChange({
      ...filters,
      starRating: starRating.includes(s) ? starRating.filter(x => x !== s) : [...starRating, s],
    })
  }

  return (
    <div className="space-y-4">
      {/* Popular Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-3">Popular Filters</h3>
        <div className="space-y-1">
          {[5, 4, 3].map(s => (
            <label key={s} className="flex items-center justify-between py-1.5 cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={starRating.includes(s)} onChange={() => toggleStar(s)}
                  className="accent-orange-500 rounded" />
                <span className="text-yellow-400 text-sm">{'★'.repeat(s)}</span>
                <span className="text-sm text-gray-700 group-hover:text-orange-600">{s} Star</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-3">Budget per Night</h3>
        <div className="space-y-1">
          {BUDGET_RANGES.map(r => (
            <label key={r.label} className="flex items-center gap-2 py-1.5 cursor-pointer group">
              <input type="radio" name="budget" checked={budgetRange === r.label}
                onChange={() => onChange({ ...filters, budgetRange: r.label, maxPrice: r.max })}
                className="accent-orange-500" />
              <span className="text-sm text-gray-700 group-hover:text-orange-600">{r.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 py-1.5 cursor-pointer group">
            <input type="radio" name="budget" checked={budgetRange === ''}
              onChange={() => onChange({ ...filters, budgetRange: '', maxPrice: 100000 })}
              className="accent-orange-500" />
            <span className="text-sm text-gray-700 group-hover:text-orange-600">Any budget</span>
          </label>
        </div>
      </div>

      {/* User Rating */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-3">User Rating</h3>
        <div className="space-y-1">
          {RATING_OPTIONS.map(r => (
            <label key={r.value} className="flex items-center gap-2 py-1.5 cursor-pointer group">
              <input type="checkbox" checked={minRating === r.value}
                onChange={e => onChange({ ...filters, minRating: e.target.checked ? r.value : 0 })}
                className="accent-orange-500 rounded" />
              <span className="text-sm text-gray-700 group-hover:text-orange-600">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price slider */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-3">Max Price / Night</h3>
        <p className="text-sm text-gray-600 mb-2">
          Up to <span className="font-bold text-orange-600">₹{Number(maxPrice).toLocaleString('en-IN')}</span>
        </p>
        <input type="range" min={500} max={100000} step={500} value={maxPrice}
          onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value), budgetRange: '' })}
          className="w-full accent-orange-500" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹500</span><span>₹1,00,000</span>
        </div>
      </div>

      {(starRating.length > 0 || Number(maxPrice) < 100000 || minRating > 0 || budgetRange) && (
        <button onClick={() => onChange({ starRating: [], maxPrice: 100000, minRating: 0, budgetRange: '' })}
          className="w-full text-sm text-orange-600 hover:underline font-medium">
          Clear all filters
        </button>
      )}
    </div>
  )
}
