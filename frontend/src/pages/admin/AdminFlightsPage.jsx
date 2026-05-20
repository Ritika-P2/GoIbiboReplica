import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { adminFlightAPI, approvalAPI } from '../../services/adminService'

const EMPTY = {
  flightNumber: '', airline: '', origin: '', destination: '',
  departureTime: '', arrivalTime: '', duration: '', price: '',
  totalSeats: '', availableSeats: '', cabinClass: 'ECONOMY', stops: '0',
}

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }) {
  const styles = {
    PENDING:  'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

export default function AdminFlightsPage() {
  const user = useSelector(s => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  const [flights, setFlights]         = useState([])
  const [meta, setMeta]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showForm, setShowForm]       = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 50 }
      if (statusFilter !== 'ALL') params.status = statusFilter
      const res = await adminFlightAPI.list(params)
      setFlights(res.data?.flights || [])
      setMeta(res.meta)
    } catch { setError('Failed to load flights.') }
    finally { setLoading(false) }
  }, [statusFilter])

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
      setSuccess(editing ? 'Flight updated!' : 'Flight added! Pending approval.')
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

  async function handleApprove(id) {
    try { await approvalAPI.approve('flights', id); setSuccess('Flight approved.'); load() }
    catch { setError('Approval failed.') }
  }

  async function openReject(f) { setRejectModal(f); setRejectReason('') }

  async function handleReject() {
    try {
      await approvalAPI.reject('flights', rejectModal.id, rejectReason)
      setSuccess('Flight rejected.')
      setRejectModal(null)
      load()
    } catch { setError('Rejection failed.') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flight Schedules</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} entries</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Add Flight
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
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
        <div className="text-center py-12 text-gray-400">No flights found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Flight','Airline','Route','Departure','Price','Seats','Class','Status','Edit','Delete','Approve','Reject'].map(h => (
                  <th key={h} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
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
                  <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(f.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{f.availableSeats}/{f.totalSeats}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{f.cabinClass}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={f.status} />
                      {f.status === 'REJECTED' && f.rejectionReason && (
                        <span className="text-xs text-red-500 italic">{f.rejectionReason}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(f)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(f.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isAdmin && f.status === 'PENDING'
                      ? <button onClick={() => handleApprove(f.id)} title="Approve" className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-600 font-bold text-base flex items-center justify-center mx-auto">✓</button>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isAdmin && f.status === 'PENDING'
                      ? <button onClick={() => openReject(f)} title="Reject" className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold text-base flex items-center justify-center mx-auto">✕</button>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Reject Flight</h3>
            <p className="text-sm text-gray-500 mb-3">{rejectModal.flightNumber} — {rejectModal.airline}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-red-400" />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reject</button>
              <button onClick={() => setRejectModal(null)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
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
