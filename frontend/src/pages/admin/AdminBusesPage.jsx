import { useState, useEffect, useCallback } from 'react'
import { adminBusAPI } from '../../services/adminService'

const EMPTY = {
  operator: '', busType: '', origin: '', destination: '',
  departureTime: '', arrivalTime: '', duration: '', price: '',
  totalSeats: '', availableSeats: '', amenities: '',
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const BUS_TYPES = ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Non-AC Seater', 'Volvo AC', 'Volvo Multi-Axle', 'Sleeper', 'Seater']

export default function AdminBusesPage() {
  const [buses, setBuses]     = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminBusAPI.list({ limit: 50 })
      setBuses(res.data?.buses || [])
      setMeta(res.meta)
    } catch { setError('Failed to load buses.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(EMPTY); setError(''); setShowForm(true) }
  function openEdit(b) {
    setEditing(b.id)
    setForm({
      operator: b.operator, busType: b.busType,
      origin: b.origin, destination: b.destination,
      departureTime: b.departureTime?.slice(0, 16) || '',
      arrivalTime:   b.arrivalTime?.slice(0, 16) || '',
      duration: String(b.duration), price: String(b.price),
      totalSeats: String(b.totalSeats), availableSeats: String(b.availableSeats),
      amenities: (b.amenities || []).join(', '),
    })
    setError(''); setShowForm(true)
  }

  const f = (key) => (v) => setForm(p => ({ ...p, [key]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editing) await adminBusAPI.update(editing, form)
      else await adminBusAPI.create(form)
      setSuccess(editing ? 'Bus updated!' : 'Bus added!')
      setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this bus?')) return
    try { await adminBusAPI.remove(id); setSuccess('Deleted.'); load() }
    catch { setError('Delete failed.') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bus Schedules</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} buses in database</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add Bus</button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Bus' : 'Add New Bus Schedule'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <F label="Operator *"    value={form.operator}    onChange={f('operator')}    required placeholder="e.g. RedBus, MSRTC" />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Bus Type *</label>
              <select value={form.busType} onChange={e => setForm(p => ({ ...p, busType: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Select type</option>
                {BUS_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <F label="Origin *"      value={form.origin}      onChange={f('origin')}      required placeholder="e.g. Mumbai" />
            <F label="Destination *" value={form.destination} onChange={f('destination')} required placeholder="e.g. Pune" />
            <F label="Departure *" type="datetime-local" value={form.departureTime} onChange={f('departureTime')} required />
            <F label="Arrival *"   type="datetime-local" value={form.arrivalTime}   onChange={f('arrivalTime')}   required />
            <F label="Duration (mins) *" type="number" value={form.duration}       onChange={f('duration')}       required />
            <F label="Price (₹) *"       type="number" value={form.price}          onChange={f('price')}          required />
            <F label="Total Seats *"     type="number" value={form.totalSeats}     onChange={f('totalSeats')}     required />
            <F label="Available Seats *" type="number" value={form.availableSeats} onChange={f('availableSeats')} required />
            <div className="col-span-2">
              <F label="Amenities (comma-separated)" value={form.amenities} onChange={f('amenities')} placeholder="WiFi, Charging, Water Bottle, Blanket" />
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Update Bus' : 'Add Bus'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : buses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No buses yet. Add one above.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Operator','Type','Route','Departure','Arrival','Price','Seats','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {buses.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{b.operator}</td>
                  <td className="px-4 py-3"><span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">{b.busType}</span></td>
                  <td className="px-4 py-3 text-gray-600">{b.origin} → {b.destination}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(b.departureTime)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(b.arrivalTime)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(b.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{b.availableSeats}/{b.totalSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(b)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
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

function F({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
    </div>
  )
}
