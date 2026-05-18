export default function HotelFilters({ filters, onChange }) {
  const { starRating, maxPrice } = filters

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
      <h3 className="font-bold text-gray-900">Filters</h3>

      {/* Star Rating */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Star Rating</p>
        {[5, 4, 3, 2, 1].map(s => (
          <label key={s} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="checkbox"
              checked={starRating.includes(s)}
              onChange={e => onChange({
                ...filters,
                starRating: e.target.checked ? [...starRating, s] : starRating.filter(x => x !== s)
              })}
              className="accent-blue-600 rounded" />
            <span className="text-sm text-yellow-400">{'★'.repeat(s)}</span>
            <span className="text-sm text-gray-600">{s} Star{s > 1 ? 's' : ''}</span>
          </label>
        ))}
      </div>

      {/* Max Price */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Max Price: <span className="text-blue-600">₹{Number(maxPrice).toLocaleString('en-IN')}/night</span>
        </p>
        <input type="range" min={500} max={100000} step={500} value={maxPrice}
          onChange={e => onChange({ ...filters, maxPrice: e.target.value })}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹500</span><span>₹1,00,000</span>
        </div>
      </div>

      <button onClick={() => onChange({ starRating: [], maxPrice: 100000 })}
        className="text-sm text-blue-600 hover:underline">
        Clear all filters
      </button>
    </div>
  )
}