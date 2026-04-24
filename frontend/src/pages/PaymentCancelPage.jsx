import { Link } from "react-router-dom"

function PaymentCancelPage() {
  const courseId = localStorage.getItem("pending_checkout_course_id")

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment canceled</h1>
            <p className="text-gray-500 mt-2 text-sm">
              No worries — you can try again anytime.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold">
            ×
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          {courseId && (
            <Link
              to={`/courses/${courseId}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Back to course
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

export default PaymentCancelPage

