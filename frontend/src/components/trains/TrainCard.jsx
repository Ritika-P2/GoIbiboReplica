import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const CLASS_LABELS = {
  SL:  'Sleeper',
  '3A':'AC 3 Tier',
  '2A':'AC 2 Tier',
  '1A':'AC 1st',
  CC:  'Chair Car',
  EC:  'Exec CC',
}

const CLASS_STYLES = {
  SL:  'border-blue-300 text-blue-700 hover:bg-blue-50',
  '3A':'border-purple-300 text-purple-700 hover:bg-purple-50',
  '2A':'border-indigo-300 text-indigo-700 hover:bg-indigo-50',
  '1A':'border-yellow-400 text-yellow-700 hover:bg-yellow-50',
  CC:  'border-green-300 text-green-700 hover:bg-green-50',
  EC:  'border-teal-300 text-teal-700 hover:bg-teal-50',
}

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function fmtDur(mins) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function AvailBadge({ seats }) {
  if (seats > 50) return <span className="text-xs text-green-600 font-semibold">{seats} avail</span>
  if (seats > 10) return <span className="text-xs text-amber-600 font-semibold">{seats} avail</span>
  if (seats > 0)  return <span className="text-xs text-red-500 font-semibold">{seats} avail</span>
  return <span className="text-xs text-red-500 font-semibold">WL</span>
}

function TrainTypeBadge({ name }) {
  const n = name?.toLowerCase() || ''
  if (n.includes('rajdhani')) return <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">RAJDHANI</span>
  if (n.includes('shatabdi')) return <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">SHATABDI</span>
  if (n.includes('vande') || n.includes('vandebharat')) return <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">VANDE BHARAT</span>
  if (n.includes('duronto')) return <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">DURONTO</span>
  if (n.includes('garib') || n.includes('rath')) return <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">GARIB RATH</span>
  return null
}

export default function TrainCard({ train, date, quota }) {
  const navigate = useNavigate()
  const classes   = train.classes && typeof train.classes === 'object' ? train.classes : {}
  const classKeys = Object.keys(classes)
  const cheapest  = classKeys.reduce((min, k) => !min || classes[k].price < classes[min].price ? k : min, null)
  const isTatkal  = quota === 'TQ' || quota === 'PT'

  function book(cls) {
    navigate(ROUTES.TRAIN_BOOKING, {
      state: {
        train,
        selectedClass: cls,
        classPrice: classes[cls].price,
        classSeats: classes[cls].seats,
        date,
        quota: quota || 'GN',
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-visible">

      {/* Main row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">

        {/* Train name + number */}
        <div className="sm:w-52 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-base">{train.trainName}</p>
            <TrainTypeBadge name={train.trainName} />
            {isTatkal && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">TATKAL</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">#{train.trainNumber}</p>
          <p className="text-xs text-gray-400 mt-1">Runs: {train.runningDays || 'Daily'}</p>
        </div>

        {/* Route + timing */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="text-center shrink-0">
            <p className="text-2xl font-bold text-gray-900 leading-tight">{fmtTime(train.departureTime)}</p>
            <p className="text-sm font-bold text-gray-700">{train.originCode || train.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center px-2">
            <p className="text-xs text-gray-400 mb-1">{fmtDur(train.duration)}</p>
            <div className="relative w-full flex items-center">
              <div className="h-px flex-1 bg-gray-300" />
              <div className="mx-1.5 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
              <div className="h-px flex-1 bg-gray-300" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Non-stop</p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-2xl font-bold text-gray-900 leading-tight">{fmtTime(train.arrivalTime)}</p>
            <p className="text-sm font-bold text-gray-700">{train.destinationCode || train.destination}</p>
          </div>
        </div>

        {/* Starting price */}
        {cheapest && (
          <div className="sm:w-32 text-right shrink-0">
            <p className="text-xs text-gray-400">Starts from</p>
            <p className="text-2xl font-bold text-orange-500">₹{classes[cheapest].price.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400">{CLASS_LABELS[cheapest] || cheapest}</p>
          </div>
        )}
      </div>

      {/* Class buttons row */}
      {classKeys.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/70">
          <div className="flex flex-wrap gap-2 items-center">
            {classKeys.map(cls => (
              <button key={cls}
                onClick={() => book(cls)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 bg-white transition-all hover:shadow-sm min-w-[72px] ${CLASS_STYLES[cls] || 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                <span className="text-xs font-bold uppercase leading-tight">{cls}</span>
                <span className="text-sm font-bold leading-tight mt-0.5">₹{classes[cls].price.toLocaleString('en-IN')}</span>
                <AvailBadge seats={classes[cls].seats} />
              </button>
            ))}
            <div className="ml-auto">
              <button onClick={() => cheapest && book(cheapest)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors">
                Book Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
