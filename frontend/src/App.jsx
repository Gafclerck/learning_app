import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import CoursesPage from "./pages/CoursesPage"
import CourseDetailPage from "./pages/CourseDetailPage"
import LessonPage from "./pages/LessonPage"
import PaymentSuccessPage from "./pages/PaymentSuccessPage"
import PaymentCancelPage from "./pages/PaymentCancelPage"
import DashboardPage from "./pages/DashboardPage"
import TeacherRequestPage from "./pages/TeacherRequestPage"
import ChatPage from "./pages/ChatPage"
import AdminUsersPage from "./pages/admin/AdminUsersPage"
import AdminTeacherRequestsPage from "./pages/admin/AdminTeacherRequestsPage"
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage"
import TeacherCourseEditorPage from "./pages/teacher/TeacherCourseEditorPage"

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

        {/* Courses — publiques */}
        <Route path="/courses"     element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />

        {/* Lesson — protégée */}
        <Route path="/courses/:id/learn" element={
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        } />

        {/* Payments (Stripe redirects) */}
        <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="/payment/cancel" element={
          <ProtectedRoute>
            <PaymentCancelPage />
          </ProtectedRoute>
        } />

        {/* Dashboard étudiant */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* Become teacher */}
        <Route path="/become-teacher" element={
          <ProtectedRoute>
            <TeacherRequestPage />
          </ProtectedRoute>
        } />

        {/* Chat */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />

        {/* Teacher */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/courses/new" element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherCourseEditorPage mode="new" />
          </ProtectedRoute>
        } />
        <Route path="/teacher/courses/:id/edit" element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherCourseEditorPage mode="edit" />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Placeholder name="Admin Dashboard" />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/teacher-requests" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTeacherRequestsPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/courses" replace />} />

      </Route>
    </Routes>
  )
}

export default App
