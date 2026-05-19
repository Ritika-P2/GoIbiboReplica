const DEPARTURE_SLOTS = [
  { id: 'early',     label: 'Early Morning', sub: '12am - 6am',  icon: '🌙' },
  { id: 'morning',   label: 'Morning',       sub: '6am - 12pm',  icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon',     sub: '12pm - 6pm',  icon: '☀️' },
  { id: 'evening',   label: 'Evening',       sub: '6pm - 12am',  icon: '🌆' },
]

const TRAIN_TYPES = [
  { id: 'rajdhani',  label: 'Rajdhani' },
  { id: 'shatabdi',  label: 'Shatabdi' },
  { id: 'express',   label: 'Express' },
  { id: 'superfast', label: 'Superfast' },
]

export default function TrainFilters({ filters, onChange }) {
  function toggle(key, val) {
    const cur = filters[key] || []
    onChange({ ...filters, [key]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] })
  }

  function setDeparture(id) {
    onChange({ ...filters, departureRange: filters.departureRange === id ? '' : id })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
        <button
          onClick={() => onChange({ departureRange: '', trainTypes: [], availability: '' })}
          className="text-xs text-orange-500 hover:underline">
          Clear All
        </button>
      </div>

      {/* Departure Time */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Departure Time</p>
        <div className="grid grid-cols-2 gap-2">
          {DEPARTURE_SLOTS.map(s => (
            <button key={s.id} type="button"
              onClick={() => setDeparture(s.id)}
              className={`flex flex-col items-center py-2 px-1 rounded-lg border-2 text-center transition-all ${
                filters.departureRange === s.id
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:border-orange-300'
              }`}>
              <span className="text-base">{s.icon}</span>
              <span className="text-xs font-semibold leading-tight mt-0.5">{s.label}</span>
              <span className="text-[10px] text-gray-400 leading-tight">{s.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Train Type */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Train Type</p>
        <div className="space-y-2">
          {TRAIN_TYPES.map(t => (
            <label key={t.id} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggle('trainTypes', t.id)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  (filters.trainTypes || []).includes(t.id)
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-300 group-hover:border-orange-400'
                }`}>
                {(filters.trainTypes || []).includes(t.id) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Availability</p>
        <div className="space-y-2">
          {[
            { id: 'available', label: 'Available' },
            { id: 'rac',       label: 'RAC' },
            { id: 'waitlist',  label: 'Waitlist' },
          ].map(a => (
            <label key={a.id} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => onChange({ ...filters, availability: filters.availability === a.id ? '' : a.id })}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  filters.availability === a.id
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 group-hover:border-orange-400'
                }`}>
                {filters.availability === a.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span className="text-sm text-gray-700">{a.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
