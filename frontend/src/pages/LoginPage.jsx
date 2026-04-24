import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login, getCurrentUser } from "../services/authService"
import useAuthStore from "../store/authStore"

function LoginPage() {
  // useState gère les valeurs du formulaire et les états UI
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState(null)   // message d'erreur à afficher
  const [loading, setLoading]   = useState(false)  // désactive le bouton pendant la requête

  const { login: storeLogin } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    // e.preventDefault() empêche le harecrgement de page
    // comportement par défaut d'un formulaire HTML
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Étape 1 — login → on reçoit le token
      const { access_token } = await login(email, password)

      // Étape 2 — on sauvegarde le token dans localStorage
      // avant d'appeler /me, car l'intercepteur Axios en a besoin
      localStorage.setItem("token", access_token)

      // Étape 3 — on récupère les infos complètes de l'utilisateur
      const user = await getCurrentUser()

      // Étape 4 — on met tout dans le store Zustand
      storeLogin(access_token, user)

      // Étape 5 — redirect
      navigate("/courses")

    } catch (err) {
      // err.response.data.detail → c'est le message d'erreur de FastAPI
      setError(err.response?.data?.detail || "Login failed. Please try again.")
    } finally {
      // finally s'exécute toujours, succès ou erreur
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to continue learning</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>

        {/* Lien vers register */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage
