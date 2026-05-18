import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-8xl font-bold text-blue-600">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">Page not found</h2>
      <p className="mt-2 text-gray-500">The page you are looking for does not exist.</p>
      <Link
        to={ROUTES.HOME}
        className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
