import { Navigate } from "react-router-dom"
import useAuthStore from "../../store/authStore"

// allowedRoles est optionnel - si non fourni, 
// on vérifie juste que l'utilisateur est connecté
function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuthStore()

  // Pas connecté → redirect vers login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Connecté mais pas le bon rôle → redirect vers accueil
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/courses" replace />
  }

  // Tout est bon → on affiche la page demandée
  return children
}

export default ProtectedRoute
