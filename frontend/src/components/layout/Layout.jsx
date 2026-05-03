import { useState, useRef, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import useAuthStore from "../../store/authStore"

// Ferme un dropdown quand on clique en dehors
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler()
    }
    document.addEventListener("mousedown", listener)
    return () => document.removeEventListener("mousedown", listener)
  }, [ref, handler])
}

function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

// Lien desktop avec indicateur actif
function NavLink({ to, children, onClick }) {
  const location = useLocation()
  const active = location.pathname.startsWith(to)
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm font-medium transition-colors ${
        active ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
      }`}
    >
      {children}
    </Link>
  )
}

// Lien dans le menu mobile — plus grand, avec padding
function MobileNavLink({ to, children, onClick }) {
  const location = useLocation()
  const active = location.pathname.startsWith(to)
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  )
}

function Navbar() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()

  // État du menu mobile (ouvert/fermé)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Dropdown desktop admin
  const [adminOpen, setAdminOpen] = useState(false)
  const adminRef = useRef(null)
  useClickOutside(adminRef, () => setAdminOpen(false))

  // Dropdown desktop user/avatar
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef(null)
  useClickOutside(userRef, () => setUserOpen(false))

  // Ferme le menu mobile quand on navigue
  const closeMenu = () => setMobileOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    setUserOpen(false)
    navigate("/login")
  }

  return (
    // relative + z-40 pour que les dropdowns s'affichent au-dessus du contenu
    <div className="relative z-40">
      <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">

        {/* Logo */}
        <Link to="/courses" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
            L
          </span>
          <span>LearnHub</span>
        </Link>

        {/* ── DESKTOP : liens centraux (cachés sur mobile) ── */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/courses">Courses</NavLink>

          {token && (
            <>
              <NavLink to="/chat">Chat</NavLink>

              {user?.role === "teacher" && (
                <NavLink to="/teacher">My Courses</NavLink>
              )}

              {/* Dropdown Admin desktop */}
              {user?.role === "admin" && (
                <div className="relative" ref={adminRef}>
                  <button
                    onClick={() => setAdminOpen(v => !v)}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                  >
                    Admin
                    <svg className={`w-4 h-4 transition-transform ${adminOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {adminOpen && (
                    <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      <Link to="/admin/users" onClick={() => setAdminOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        👥 Manage Users
                      </Link>
                      <Link to="/admin/teacher-requests" onClick={() => setAdminOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        📋 Teacher Requests
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── DESKTOP : zone auth (cachée sur mobile) ── */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen(v => !v)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {getInitials(user?.name)}
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${userOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <Link to="/dashboard" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    🎓 My Learning
                  </Link>
                  {user?.role === "student" && (
                    <Link to="/become-teacher" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      ✏️ Become a Teacher
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── MOBILE : bouton hamburger (visible seulement sur mobile) ── */}
        {/* md:hidden = visible uniquement en dessous de 768px */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            // Icône X — fermer
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Icône hamburger — 3 lignes
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* ── MENU MOBILE — panneau vertical ── */}
      {/* On affiche seulement si mobileOpen = true */}
      {/* md:hidden = ce panneau n'apparaît jamais sur desktop */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg px-4 py-4 space-y-1">

          {/* Infos utilisateur en haut si connecté */}
          {token && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          )}

          {/* Liens de navigation */}
          <MobileNavLink to="/courses" onClick={closeMenu}>📚 Courses</MobileNavLink>

          {token && (
            <>
              <MobileNavLink to="/dashboard" onClick={closeMenu}>🎓 My Learning</MobileNavLink>
              <MobileNavLink to="/chat" onClick={closeMenu}>💬 Chat</MobileNavLink>

              {user?.role === "student" && (
                <MobileNavLink to="/become-teacher" onClick={closeMenu}>✏️ Become a Teacher</MobileNavLink>
              )}

              {user?.role === "teacher" && (
                <MobileNavLink to="/teacher" onClick={closeMenu}>📖 My Courses</MobileNavLink>
              )}

              {user?.role === "admin" && (
                <>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Admin
                  </div>
                  <MobileNavLink to="/admin/users" onClick={closeMenu}>👥 Manage Users</MobileNavLink>
                  <MobileNavLink to="/admin/teacher-requests" onClick={closeMenu}>📋 Teacher Requests</MobileNavLink>
                </>
              )}

              {/* Séparateur */}
              <div className="border-t border-gray-100 my-2" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                🚪 Logout
              </button>
            </>
          )}

          {/* Non connecté */}
          {!token && (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={closeMenu}
                className="block text-center py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="block text-center py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
