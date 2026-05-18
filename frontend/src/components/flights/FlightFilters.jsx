export default function FlightFilters({ filters, onChange }) {
  const { stops, maxPrice, airline } = filters

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
      <h3 className="font-bold text-gray-900">Filters</h3>

      {/* Stops */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Stops</p>
        {[{ label: 'Non-stop', value: '0' }, { label: '1 Stop', value: '1' }, { label: 'Any', value: '' }].map(opt => (
          <label key={opt.label} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="radio" name="stops" value={opt.value}
              checked={stops === opt.value}
              onChange={() => onChange({ ...filters, stops: opt.value })}
              className="accent-blue-600" />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Max Price */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Max Price: <span className="text-blue-600">₹{Number(maxPrice).toLocaleString('en-IN')}</span>
        </p>
        <input type="range" min={1000} max={50000} step={500} value={maxPrice}
          onChange={e => onChange({ ...filters, maxPrice: e.target.value })}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹1,000</span><span>₹50,000</span>
        </div>
      </div>

      {/* Airline */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Airline</p>
        {['IndiGo', 'Air India', 'Vistara', 'GoAir', 'SpiceJet'].map(a => (
          <label key={a} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="checkbox"
              checked={airline.includes(a)}
              onChange={e => onChange({
                ...filters,
                airline: e.target.checked ? [...airline, a] : airline.filter(x => x !== a)
              })}
              className="accent-blue-600 rounded" />
            <span className="text-sm text-gray-700">{a}</span>
          </label>
        ))}
      </div>

      <button onClick={() => onChange({ stops: '', maxPrice: 50000, airline: [] })}
        className="text-sm text-blue-600 hover:underline">
        Clear all filters
      </button>
    </div>
  )
}