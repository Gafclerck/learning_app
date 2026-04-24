import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { getCourseProgress } from "../services/courseService"

function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const courseId = useMemo(() => {
    // We store the course id before redirecting to Stripe
    return localStorage.getItem("pending_checkout_course_id")
  }, [])

  const [status, setStatus] = useState("checking") // checking | enrolled | waiting | error
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      if (!courseId) {
        setStatus("error")
        setError("Missing course context. Please go back to courses.")
        return
      }

      // Enrollment happens via Stripe webhook; it may take a moment.
      // We poll progress a few times to confirm the user is enrolled.
      const attempts = 10
      for (let i = 0; i < attempts; i++) {
        try {
          await getCourseProgress(courseId)
          if (!isMounted) return
          localStorage.removeItem("pending_checkout_course_id")
          setStatus("enrolled")
          // Give a short moment so the UI feels intentional, then navigate.
          setTimeout(() => navigate(`/courses/${courseId}`), 800)
          return
        } catch (e) {
          // 403 means not enrolled yet; keep waiting
          await new Promise((r) => setTimeout(r, 800))
        }
      }

      if (!isMounted) return
      setStatus("waiting")
    }

    run().catch(() => {
      if (!isMounted) return
      setStatus("error")
      setError("Failed to verify payment. Please try again.")
    })

    return () => {
      isMounted = false
    }
  }, [courseId, navigate])

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
            <p className="text-gray-500 mt-2 text-sm">
              {sessionId ? `Stripe session: ${sessionId}` : "Thanks — we’re preparing your access."}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
            ✓
          </div>
        </div>

        <div className="mt-6">
          {status === "checking" && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Confirming enrollment…
            </div>
          )}

          {status === "enrolled" && (
            <p className="text-sm text-gray-700">
              You’re enrolled. Redirecting to your roadmap…
            </p>
          )}

          {status === "waiting" && (
            <div className="text-sm text-gray-700 space-y-2">
              <p>Payment is confirmed, but enrollment is still syncing.</p>
              <p className="text-gray-500">
                Please refresh in a moment or return to the course page.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error || "Something went wrong."}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          {courseId && (
            <Link
              to={`/courses/${courseId}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Go to course
            </Link>
          )}
          <Link
            to="/courses"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage

