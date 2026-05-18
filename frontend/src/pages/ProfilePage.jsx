import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'
import { API } from '../constants/apiEndpoints'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'

export default function ProfilePage() {
  const authUser = useSelector(s => s.auth.user)

  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)
  const [error,   setError]     = useState(null)
  const [success, setSuccess]   = useState('')

  const [form, setForm] = useState({ name: '', phone: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError,   setPwError]   = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwSaving,  setPwSaving]  = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await api.get(API.USER.PROFILE)
        const u = res.data.user
        setProfile(u)
        setForm({ name: u.name || '', phone: u.phone || '' })
      } catch {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess('')
    try {
      const res = await api.put(API.USER.UPDATE, { name: form.name, phone: form.phone })
      setProfile(res.data.user)
      setSuccess('Profile updated successfully.')
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    setPwSaving(true)
    try {
      await api.put(API.USER.UPDATE, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwSuccess('Password changed successfully.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e) {
      setPwError(e.response?.data?.message || 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <Loader fullPage text="Loading profile..." />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-600 uppercase">
              {(profile?.name || authUser?.name || '?').charAt(0)}
            </div>
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <h2 className="text-xl font-semibold text-gray-900">{profile?.name || authUser?.name}</h2>
          <p className="text-gray-500 text-sm">{profile?.email || authUser?.email}</p>
          <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-medium ${profile?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {profile?.role || 'USER'}
          </span>
        </div>
      </div>

      {/* Edit profile form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="John Doe" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input disabled value={profile?.email || ''} readOnly
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <Input label="Phone Number" type="tel" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+91 98765 43210" />

          {error   && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Current Password" type="password" value={pwForm.currentPassword}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="••••••••" />
          <Input label="New Password" type="password" value={pwForm.newPassword}
            onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="Min. 8 characters" />
          <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword}
            onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="Re-enter new password" />

          {pwError   && <p className="text-red-500 text-sm">{pwError}</p>}
          {pwSuccess && <p className="text-green-600 text-sm">{pwSuccess}</p>}

          <Button type="submit" variant="secondary" loading={pwSaving}>Change Password</Button>
        </form>
      </div>
    </div>
  )
}