import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary-600">Loading...</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/auth" replace />
}

export default ProtectedRoute

