import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { deleteCourse, getMyCourses } from "../../services/teacherCourseService"
import Button from "../../components/ui/Button"
import Pill from "../../components/ui/Pill"
import Spinner from "../../components/ui/Spinner"
import Alert from "../../components/ui/Alert"

function TeacherDashboardPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const stats = useMemo(() => {
    const total = courses.length
    const published = courses.filter((c) => c.is_published).length
    return { total, published, drafts: total - published }
  }, [courses])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyCourses()
      setCourses(data || [])
    } catch (e) {
      setError("Failed to load your courses.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this course? This cannot be undone.")
    if (!ok) return
    setBusyId(id)
    try {
      await deleteCourse(id)
      await refresh()
    } catch (e) {
      setError("Failed to delete course.")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Create, publish, and manage lessons.
          </p>
        </div>
        <Link to="/teacher/courses/new">
          <Button>+ New course</Button>
        </Link>
      </div>

      {error && (
        <Alert>{error}</Alert>
      )}

      <div className="flex items-center gap-3">
        <Pill tone="blue">{stats.total} total</Pill>
        <Pill tone="green">{stats.published} published</Pill>
        <Pill tone="yellow">{stats.drafts} drafts</Pill>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-medium px-6 py-3">Course</th>
                <th className="text-left font-medium px-6 py-3">Level</th>
                <th className="text-left font-medium px-6 py-3">Pricing</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
                <th className="text-right font-medium px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{c.title}</div>
                    {c.description && (
                      <div className="text-gray-500 line-clamp-1">{c.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Pill>{c.level}</Pill>
                  </td>
                  <td className="px-6 py-4">
                    {c.is_free ? (
                      <Pill tone="green">Free</Pill>
                    ) : (
                      <span className="text-gray-900 font-medium">
                        {Number(c.price).toLocaleString()} FCFA
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.is_published ? <Pill tone="green">Published</Pill> : <Pill tone="yellow">Draft</Pill>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/courses/${c.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/teacher/courses/${c.id}/edit`)}
                      >
                        Manage
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(c.id)}
                        disabled={busyId === c.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {courses.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-gray-400" colSpan={5}>
                    No courses yet. Create your first course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboardPage

