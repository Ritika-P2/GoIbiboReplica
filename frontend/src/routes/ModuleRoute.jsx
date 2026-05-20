import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

/**
 * Protects an admin page by module.
 * ADMIN passes unconditionally.
 * MANAGER must own the matching module; otherwise redirected to the
 * dashboard with an unauthorized flag so it can surface a message.
 */
export default function ModuleRoute({ module, children }) {
  const { user } = useSelector((s) => s.auth)

  if (user?.role === 'ADMIN') return children
  if (user?.role === 'MANAGER' && user?.managerModule === module) return children

  return (
    <Navigate
      to={ROUTES.ADMIN}
      state={{ unauthorized: true, deniedModule: module }}
      replace
    />
  )
}
