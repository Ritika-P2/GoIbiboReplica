const DEPARTURE_SLOTS = [
  { id: 'early',     label: 'Early Morning', sub: '12am – 6am',  icon: '🌙' },
  { id: 'morning',   label: 'Morning',       sub: '6am – 12pm',  icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon',     sub: '12pm – 6pm',  icon: '☀️' },
  { id: 'evening',   label: 'Evening',       sub: '6pm – 12am',  icon: '🌆' },
]

const BUS_TYPE_OPTIONS = [
  { id: 'ac_sleeper',     label: 'AC Sleeper' },
  { id: 'non_ac_sleeper', label: 'Non-AC Sleeper' },
  { id: 'ac_seater',      label: 'AC Seater' },
  { id: 'volvo',          label: 'Volvo' },
  { id: 'sleeper',        label: 'Sleeper' },
  { id: 'seater',         label: 'Seater' },
]

const AMENITY_OPTIONS = [
  { id: 'AC',            label: 'AC' },
  { id: 'WiFi',          label: 'WiFi' },
  { id: 'Charging Port', label: 'Charging Port' },
  { id: 'Blanket',       label: 'Blanket' },
  { id: 'Water Bottle',  label: 'Water Bottle' },
]

function CheckBox({ checked, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
        checked ? 'bg-orange-500 border-orange-500' : 'border-gray-300 hover:border-orange-400'
      }`}>
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
          <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

export default function BusFilters({ filters, onChange, operators = [] }) {
  function setDeparture(id) {
    onChange({ ...filters, departureRange: filters.departureRange === id ? '' : id })
  }
  function toggleBusType(id) {
    const cur = filters.busTypes || []
    onChange({ ...filters, busTypes: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] })
  }
  function toggleOperator(op) {
    const cur = filters.operators || []
    onChange({ ...filters, operators: cur.includes(op) ? cur.filter(x => x !== op) : [...cur, op] })
  }
  function toggleAmenity(id) {
    const cur = filters.amenities || []
    onChange({ ...filters, amenities: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] })
  }
  function setAvailability(val) {
    onChange({ ...filters, availability: filters.availability === val ? '' : val })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
        <button
          onClick={() => onChange({ departureRange: '', busTypes: [], operators: [], amenities: [], availability: '' })}
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

      {/* Bus Type */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Bus Type</p>
        <div className="space-y-2">
          {BUS_TYPE_OPTIONS.map(t => (
            <label key={t.id} className="flex items-center gap-2.5 cursor-pointer">
              <CheckBox
                checked={(filters.busTypes || []).includes(t.id)}
                onClick={() => toggleBusType(t.id)}
              />
              <span className="text-sm text-gray-700">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Operators (dynamic from results) */}
      {operators.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Operators</p>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {operators.map(op => (
              <label key={op} className="flex items-center gap-2.5 cursor-pointer">
                <CheckBox
                  checked={(filters.operators || []).includes(op)}
                  onClick={() => toggleOperator(op)}
                />
                <span className="text-sm text-gray-700 truncate">{op}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Amenities</p>
        <div className="space-y-2">
          {AMENITY_OPTIONS.map(a => (
            <label key={a.id} className="flex items-center gap-2.5 cursor-pointer">
              <CheckBox
                checked={(filters.amenities || []).includes(a.id)}
                onClick={() => toggleAmenity(a.id)}
              />
              <span className="text-sm text-gray-700">{a.label}</span>
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
            { id: 'limited',   label: 'Limited (≤ 10 seats)' },
          ].map(a => (
            <label key={a.id} className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setAvailability(a.id)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  filters.availability === a.id
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 hover:border-orange-400'
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
