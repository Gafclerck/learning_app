import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMyEnrollments } from "../services/enrollmentService"
import { getRecommendations } from "../services/aiService"
import Button from "../components/ui/Button"
import Pill from "../components/ui/Pill"
import Spinner from "../components/ui/Spinner"
import Alert from "../components/ui/Alert"

function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()

  const [enrollments, setEnrollments] = useState([])
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const enrolledCount = useMemo(() => enrollments.length, [enrollments.length])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const [enrolled, recommendations] = await Promise.all([
          getMyEnrollments(),
          getRecommendations(5),
        ])
        setEnrollments(enrolled || [])
        setRecs(recommendations || [])
      } catch (e) {
        setError("Failed to load your dashboard. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <Alert className="inline-block text-left">{error}</Alert>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {enrolledCount === 0
              ? "You’re not enrolled in any course yet."
              : `${enrolledCount} active course${enrolledCount !== 1 ? "s" : ""} in progress.`}
          </p>
        </div>
        <Link to="/courses">
          <Button>Explore courses</Button>
        </Link>
      </div>

      {/* Enrollments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Continue learning</h2>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-600">
              Pick a course and start from the roadmap. Your progress will appear here.
            </p>
            <div className="mt-5">
              <Link
                to="/courses"
              >
                <Button variant="secondary">Browse courses</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {enrollments.map((enr) => (
              <div key={enr.enrollment_id} className="p-6 flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {enr.course?.title}
                    </h3>
                    <Pill>{enr.course?.level}</Pill>
                  </div>
                  {enr.course?.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {enr.course.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {enr.completed_lessons} / {enr.total_lessons} lessons
                      </span>
                      <span className="font-medium text-blue-600">{enr.percentage}%</span>
                    </div>
                    <ProgressBar value={enr.percentage} />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/courses/${enr.course?.id}`)}
                  >
                    View roadmap
                  </Button>
                  {enr.next_lesson_id ? (
                    <Button
                      onClick={() =>
                        navigate(`/courses/${enr.course?.id}/learn?lesson=${enr.next_lesson_id}`)
                      }
                    >
                      Continue →
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">No next lesson</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI recommendations */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>

        {recs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-600">
              No recommendations yet. Enroll and complete lessons to improve suggestions.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {recs.map((course) => (
              <div key={course.id} className="p-6 flex items-center justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                    <Pill>{course.level}</Pill>
                  </div>
                  {course.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="flex-shrink-0"
                >
                  View roadmap →
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default DashboardPage

