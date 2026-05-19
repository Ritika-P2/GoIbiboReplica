import { useState, useEffect, useCallback } from 'react'
import { adminTrainAPI } from '../../services/adminService'

const EMPTY = {
  trainNumber: '', trainName: '', origin: '', destination: '',
  departureTime: '', arrivalTime: '', duration: '',
  totalSeats: '', availableSeats: '',
  sleeperPrice: '', acThreePrice: '', acTwoPrice: '', acFirstPrice: '',
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminTrainsPage() {
  const [trains, setTrains]   = useState([])
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
      const res = await adminTrainAPI.list({ limit: 50 })
      setTrains(res.data?.trains || [])
      setMeta(res.meta)
    } catch { setError('Failed to load trains.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(EMPTY); setError(''); setShowForm(true) }
  function openEdit(t) {
    const c = t.classes || {}
    setEditing(t.id)
    setForm({
      trainNumber: t.trainNumber, trainName: t.trainName,
      origin: t.origin, destination: t.destination,
      departureTime: t.departureTime?.slice(0, 16) || '',
      arrivalTime:   t.arrivalTime?.slice(0, 16) || '',
      duration: String(t.duration),
      totalSeats: String(t.totalSeats), availableSeats: String(t.availableSeats),
      sleeperPrice:  String(c.Sleeper?.price  || ''),
      acThreePrice:  String(c['3A']?.price    || ''),
      acTwoPrice:    String(c['2A']?.price    || ''),
      acFirstPrice:  String(c['1A']?.price    || ''),
    })
    setError(''); setShowForm(true)
  }

  function buildClasses() {
    const c = {}
    if (form.sleeperPrice) c['Sleeper'] = { price: Number(form.sleeperPrice), available: Number(form.availableSeats) }
    if (form.acThreePrice) c['3A']      = { price: Number(form.acThreePrice), available: Math.floor(Number(form.availableSeats) * 0.4) }
    if (form.acTwoPrice)   c['2A']      = { price: Number(form.acTwoPrice),   available: Math.floor(Number(form.availableSeats) * 0.3) }
    if (form.acFirstPrice) c['1A']      = { price: Number(form.acFirstPrice), available: Math.floor(Number(form.availableSeats) * 0.1) }
    return c
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = {
        trainNumber: form.trainNumber, trainName: form.trainName,
        origin: form.origin, destination: form.destination,
        departureTime: form.departureTime, arrivalTime: form.arrivalTime,
        duration: form.duration, totalSeats: form.totalSeats,
        availableSeats: form.availableSeats,
        classes: buildClasses(),
      }
      if (editing) await adminTrainAPI.update(editing, payload)
      else await adminTrainAPI.create(payload)
      setSuccess(editing ? 'Train updated!' : 'Train added!')
      setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this train?')) return
    try { await adminTrainAPI.remove(id); setSuccess('Deleted.'); load() }
    catch { setError('Delete failed.') }
  }

  const f = (key) => (v) => setForm(p => ({ ...p, [key]: v }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Train Schedules</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} trains in database</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add Train</button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Train' : 'Add New Train'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <F label="Train Number *" value={form.trainNumber} onChange={f('trainNumber')} required placeholder="e.g. 12301" />
            <F label="Train Name *"   value={form.trainName}   onChange={f('trainName')}   required placeholder="e.g. Rajdhani Express" />
            <F label="Origin *"       value={form.origin}      onChange={f('origin')}       required placeholder="e.g. New Delhi" />
            <F label="Destination *"  value={form.destination} onChange={f('destination')}  required placeholder="e.g. Mumbai CST" />
            <F label="Departure *" type="datetime-local" value={form.departureTime} onChange={f('departureTime')} required />
            <F label="Arrival *"   type="datetime-local" value={form.arrivalTime}   onChange={f('arrivalTime')}   required />
            <F label="Duration (mins) *" type="number" value={form.duration}      onChange={f('duration')}       required />
            <F label="Total Seats *"     type="number" value={form.totalSeats}    onChange={f('totalSeats')}     required />
            <F label="Available Seats *" type="number" value={form.availableSeats} onChange={f('availableSeats')} required />
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-600 mb-2 mt-1">Class Prices (₹) — leave blank to skip that class</p>
              <div className="grid grid-cols-4 gap-3">
                <F label="Sleeper" type="number" value={form.sleeperPrice} onChange={f('sleeperPrice')} placeholder="e.g. 450" />
                <F label="3A (AC 3-Tier)" type="number" value={form.acThreePrice} onChange={f('acThreePrice')} placeholder="e.g. 900" />
                <F label="2A (AC 2-Tier)" type="number" value={form.acTwoPrice}   onChange={f('acTwoPrice')}   placeholder="e.g. 1350" />
                <F label="1A (AC First)"  type="number" value={form.acFirstPrice} onChange={f('acFirstPrice')} placeholder="e.g. 2200" />
              </div>
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                {saving ? 'Saving…' : editing ? 'Update Train' : 'Add Train'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : trains.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No trains yet. Add one above.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Train No.','Name','Route','Departure','Arrival','Seats','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trains.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-800">{t.trainNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{t.trainName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.origin} → {t.destination}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(t.departureTime)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(t.arrivalTime)}</td>
                  <td className="px-4 py-3 text-gray-600">{t.availableSeats}/{t.totalSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
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
