import { Outlet, Link, useNavigate } from "react-router-dom"
import useAuthStore from "../../store/authStore"

function Navbar() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/courses" className="text-xl font-bold text-blue-600">
        LearnHub
      </Link>

      {/* Navigation links */}
      <div className="flex items-center gap-6">
        <Link to="/courses" className="text-gray-600 hover:text-blue-600 transition-colors">
          Courses
        </Link>

        {/* Visible seulement si connecté */}
        {token && (
          <>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
              My Learning
            </Link>

            <Link to="/chat" className="text-gray-600 hover:text-blue-600 transition-colors">
              Chat
            </Link>

            {/* Visible seulement si teacher */}
            {user?.role === "teacher" && (
              <Link to="/teacher" className="text-gray-600 hover:text-blue-600 transition-colors">
                My Courses
              </Link>
            )}
          </>
        )}
      </div>

      {/* Auth buttons */}
      <div className="flex items-center gap-3">
        {token ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Hello, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Outlet = ici s'affiche la page courante */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
