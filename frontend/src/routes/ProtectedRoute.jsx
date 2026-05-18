import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return children
}
