import { useState, useEffect, useCallback } from 'react'
import { adminFlightAPI } from '../../services/adminService'

const EMPTY = {
  flightNumber: '', airline: '', origin: '', destination: '',
  departureTime: '', arrivalTime: '', duration: '', price: '',
  totalSeats: '', availableSeats: '', cabinClass: 'ECONOMY', stops: '0',
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminFlightsPage() {
  const [flights, setFlights]     = useState([])
  const [meta, setMeta]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFlightAPI.list({ limit: 50 })
      setFlights(res.data?.flights || [])
      setMeta(res.meta)
    } catch { setError('Failed to load flights.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(EMPTY); setError(''); setShowForm(true) }
  function openEdit(f) {
    setEditing(f.id)
    setForm({
      flightNumber: f.flightNumber, airline: f.airline,
      origin: f.origin, destination: f.destination,
      departureTime: f.departureTime?.slice(0, 16) || '',
      arrivalTime:   f.arrivalTime?.slice(0, 16) || '',
      duration: String(f.duration), price: String(f.price),
      totalSeats: String(f.totalSeats), availableSeats: String(f.availableSeats),
      cabinClass: f.cabinClass, stops: String(f.stops),
    })
    setError('')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editing) await adminFlightAPI.update(editing, form)
      else await adminFlightAPI.create(form)
      setSuccess(editing ? 'Flight updated!' : 'Flight added!')
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this flight?')) return
    try { await adminFlightAPI.remove(id); setSuccess('Deleted.'); load() }
    catch { setError('Delete failed.') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flight Schedules</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} total flights in database</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          + Add Flight
        </button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Flight' : 'Add New Flight'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Field label="Flight Number" value={form.flightNumber} onChange={v => setForm(f => ({ ...f, flightNumber: v }))} required />
            <Field label="Airline"       value={form.airline}      onChange={v => setForm(f => ({ ...f, airline: v }))} required />
            <Field label="Origin (IATA)" value={form.origin}       onChange={v => setForm(f => ({ ...f, origin: v.toUpperCase() }))} required placeholder="e.g. DEL" />
            <Field label="Destination"   value={form.destination}  onChange={v => setForm(f => ({ ...f, destination: v.toUpperCase() }))} required placeholder="e.g. BOM" />
            <Field label="Departure Time" type="datetime-local" value={form.departureTime} onChange={v => setForm(f => ({ ...f, departureTime: v }))} required />
            <Field label="Arrival Time"   type="datetime-local" value={form.arrivalTime}   onChange={v => setForm(f => ({ ...f, arrivalTime: v }))} required />
            <Field label="Duration (mins)" type="number" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} required />
            <Field label="Price (₹)"      type="number" value={form.price}    onChange={v => setForm(f => ({ ...f, price: v }))} required />
            <Field label="Total Seats"    type="number" value={form.totalSeats}     onChange={v => setForm(f => ({ ...f, totalSeats: v }))} required />
            <Field label="Available Seats" type="number" value={form.availableSeats} onChange={v => setForm(f => ({ ...f, availableSeats: v }))} required />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cabin Class</label>
              <select value={form.cabinClass} onChange={e => setForm(f => ({ ...f, cabinClass: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                {['ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Field label="Stops" type="number" value={form.stops} onChange={v => setForm(f => ({ ...f, stops: v }))} required />
            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Update Flight' : 'Add Flight'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : flights.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No flights yet. Add one above.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Flight','Airline','Route','Departure','Arrival','Price','Seats','Class','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flights.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-800">{f.flightNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{f.airline}</td>
                  <td className="px-4 py-3 text-gray-700">{f.origin} → {f.destination}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(f.departureTime)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(f.arrivalTime)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(f.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{f.availableSeats}/{f.totalSeats}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{f.cabinClass}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(f)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(f.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}{required && ' *'}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
    </div>
  )
}
