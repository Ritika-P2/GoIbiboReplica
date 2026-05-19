import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') return <Navigate to={ROUTES.HOME} replace />

  return children
}
