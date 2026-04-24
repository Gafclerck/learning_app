import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import CoursesPage from "./pages/CoursesPage"
import CourseDetailPage from "./pages/CourseDetailPage"

const Placeholder = ({ name }) => (
  <div className="text-center py-20 text-2xl font-semibold text-gray-400">
    {name} — Coming soon
  </div>
)

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        <Route path="/" element={<Navigate to="/courses" replace />} />

        {/* Auth */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Courses */}
        <Route path="/courses"     element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />

        {/* Protégées */}
        <Route path="/courses/:id/learn" element={
          <ProtectedRoute>
            <Placeholder name="Lesson" />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Placeholder name="My Dashboard" />
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute>
            <Placeholder name="Chat" />
          </ProtectedRoute>
        } />

        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Placeholder name="Teacher Dashboard" />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/courses" replace />} />

      </Route>
    </Routes>
  )
}

export default App
