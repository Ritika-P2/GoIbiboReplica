import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginStart, loginSuccess, loginFailure, logout, clearError } from '../store/slices/authSlice'
import { authService } from '../services/authService'
import { ROUTES } from '../constants/routes'

export function useAuth() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const authState = useSelector((s) => s.auth)

  async function login(credentials) {
    dispatch(loginStart())
    try {
      const res = await authService.login(credentials)
      dispatch(loginSuccess(res.data))
      navigate(ROUTES.HOME)
    } catch (err) {
      dispatch(loginFailure(err.message || 'Login failed.'))
    }
  }

  async function register(data) {
    dispatch(loginStart())
    try {
      const res = await authService.register(data)
      dispatch(loginSuccess(res.data))
      navigate(ROUTES.HOME)
    } catch (err) {
      dispatch(loginFailure(err.message || 'Registration failed.'))
    }
  }

  function logoutUser() {
    dispatch(logout())
    navigate(ROUTES.HOME)
  }

  return { ...authState, login, register, logoutUser, clearError: () => dispatch(clearError()) }
}