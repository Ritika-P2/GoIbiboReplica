import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { ROUTES } from '../constants/routes'

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [localError, setLocalError] = useState('')

  function set(k, v) { clearError(); setLocalError(''); setForm(f => ({ ...f, [k]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    const { confirmPassword, ...data } = form
    register(data)
  }

  const displayError = localError || error

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <Link to={ROUTES.HOME} className="text-3xl font-bold text-blue-600">
          Go<span className="text-orange-500">ibibo</span>
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 mt-4">Create your account</h2>
        <p className="text-gray-500 text-sm mt-1">Start booking your next trip</p>
      </div>

      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" placeholder="Ritika Purohit"
          value={form.name} onChange={e => set('name', e.target.value)} required autoFocus />
        <Input label="Email address" type="email" placeholder="you@example.com"
          value={form.email} onChange={e => set('email', e.target.value)} required />
        <Input label="Phone number" type="tel" placeholder="9876543210"
          value={form.phone} onChange={e => set('phone', e.target.value)} />
        <Input label="Password" type="password" placeholder="Min. 8 characters"
          value={form.password} onChange={e => set('password', e.target.value)} required />
        <Input label="Confirm password" type="password" placeholder="Re-enter password"
          value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-blue-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )
}