import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { adminBusAPI, approvalAPI } from '../../services/adminService'

const EMPTY = {
  operator: '', busType: '', origin: '', destination: '',
  departureTime: '', arrivalTime: '', duration: '', price: '',
  totalSeats: '', availableSeats: '', amenities: '',
}

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']
const BUS_TYPES = ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Non-AC Seater', 'Volvo AC', 'Volvo Multi-Axle', 'Sleeper', 'Seater']

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

export default function AdminBusesPage() {
  const user = useSelector(s => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  const [buses, setBuses]             = useState([])
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
      const res = await adminBusAPI.list(params)
      setBuses(res.data?.buses || [])
      setMeta(res.meta)
    } catch { setError('Failed to load buses.') }
    finally { setLoading(false) }
  }, [statusFilter])

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

  const fld = (key) => (v) => setForm(p => ({ ...p, [key]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editing) await adminBusAPI.update(editing, form)
      else await adminBusAPI.create(form)
      setSuccess(editing ? 'Bus updated!' : 'Bus added! Pending approval.')
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

  async function handleApprove(id) {
    try { await approvalAPI.approve('buses', id); setSuccess('Bus approved.'); load() }
    catch { setError('Approval failed.') }
  }

  async function handleReject() {
    try {
      await approvalAPI.reject('buses', rejectModal.id, rejectReason)
      setSuccess('Bus rejected.')
      setRejectModal(null)
      load()
    } catch { setError('Rejection failed.') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bus Schedules</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} entries</p>
        </div>
        <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add Bus</button>
      </div>

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

      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Bus' : 'Add New Bus Schedule'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <F label="Operator *"    value={form.operator}    onChange={fld('operator')}    required placeholder="e.g. RedBus, MSRTC" />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Bus Type *</label>
              <select value={form.busType} onChange={e => setForm(p => ({ ...p, busType: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Select type</option>
                {BUS_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <F label="Origin *"      value={form.origin}      onChange={fld('origin')}      required placeholder="e.g. Mumbai" />
            <F label="Destination *" value={form.destination} onChange={fld('destination')} required placeholder="e.g. Pune" />
            <F label="Departure *" type="datetime-local" value={form.departureTime} onChange={fld('departureTime')} required />
            <F label="Arrival *"   type="datetime-local" value={form.arrivalTime}   onChange={fld('arrivalTime')}   required />
            <F label="Duration (mins) *" type="number" value={form.duration}       onChange={fld('duration')}       required />
            <F label="Price (₹) *"       type="number" value={form.price}          onChange={fld('price')}          required />
            <F label="Total Seats *"     type="number" value={form.totalSeats}     onChange={fld('totalSeats')}     required />
            <F label="Available Seats *" type="number" value={form.availableSeats} onChange={fld('availableSeats')} required />
            <div className="col-span-2">
              <F label="Amenities (comma-separated)" value={form.amenities} onChange={fld('amenities')} placeholder="WiFi, Charging, Water Bottle, Blanket" />
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
        <div className="text-center py-12 text-gray-400">No buses found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Operator','Type','Route','Departure','Price','Seats','Status','Actions'].map(h => (
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
                  <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(b.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{b.availableSeats}/{b.totalSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={b.status} />
                      {b.status === 'REJECTED' && b.rejectionReason && (
                        <span className="text-xs text-red-500 italic">{b.rejectionReason}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEdit(b)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                      {isAdmin && b.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(b.id)} className="text-xs text-green-600 hover:underline font-medium">Approve</button>
                          <button onClick={() => { setRejectModal(b); setRejectReason('') }} className="text-xs text-red-600 hover:underline font-medium">Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Reject Bus</h3>
            <p className="text-sm text-gray-500 mb-3">{rejectModal.operator} — {rejectModal.origin} → {rejectModal.destination}</p>
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
