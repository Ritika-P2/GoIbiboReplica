import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../constants/routes'

export default function AuthLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Outlet />
    </div>
  )
}
