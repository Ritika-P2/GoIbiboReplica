import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { ROUTES } from '../constants/routes'

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  function set(k, v) { clearError(); setForm(f => ({ ...f, [k]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    login(form)
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <Link to={ROUTES.HOME} className="text-3xl font-bold text-blue-600">
          Go<span className="text-orange-500">ibibo</span>
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 mt-4">Welcome back</h2>
        <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@example.com"
          value={form.email} onChange={e => set('email', e.target.value)} required autoFocus />
        <Input label="Password" type="password" placeholder="••••••••"
          value={form.password} onChange={e => set('password', e.target.value)} required />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-500 text-center">
        Demo: <span className="font-mono font-medium">ritika@goibibo.com</span> / <span className="font-mono font-medium">Test@1234</span>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-blue-600 font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  )
}