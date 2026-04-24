import { useEffect, useMemo, useState } from "react"
import useAuthStore from "../store/authStore"
import { createTeacherRequest, getMyTeacherRequest } from "../services/teacherRequestService"
import Pill from "../components/ui/Pill"
import Button from "../components/ui/Button"
import Spinner from "../components/ui/Spinner"
import Alert from "../components/ui/Alert"

function StatusPill({ status }) {
  const tone =
    status === "approved" ? "green" : status === "rejected" ? "red" : status === "pending" ? "yellow" : "gray"
  return <Pill tone={tone}>{status || "unknown"}</Pill>
}

function TeacherRequestPage() {
  const { user } = useAuthStore()

  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [field, setField] = useState("")
  const [educationLevel, setEducationLevel] = useState("")
  const [motivation, setMotivation] = useState("")

  const isAlreadyTeacher = useMemo(() => user?.role === "teacher", [user?.role])
  const isAdmin = useMemo(() => user?.role === "admin", [user?.role])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getMyTeacherRequest()
        setRequest(data) // may be null
      } catch (e) {
        setError("Failed to load your request status.")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const created = await createTeacherRequest({
        field,
        education_level: educationLevel,
        motivation,
      })
      setRequest(created)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit request.")
    } finally {
      setSaving(false)
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Become a teacher</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Apply for a teacher role to create and manage courses. We review requests manually.
        </p>
      </div>

      {(isAlreadyTeacher || isAdmin) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-gray-700">
            Your account already has elevated permissions ({user?.role}). No request is needed.
          </p>
        </div>
      )}

      {error && (
        <Alert>{error}</Alert>
      )}

      {request ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your request</h2>
              <p className="text-sm text-gray-500 mt-1">
                Submitted for review. You’ll see updates here.
              </p>
            </div>
            <StatusPill status={request.status} />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-gray-500">Field</p>
              <p className="text-gray-900 font-medium mt-1">{request.field}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-gray-500">Education level</p>
              <p className="text-gray-900 font-medium mt-1">{request.education_level}</p>
            </div>
            <div className="sm:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-gray-500">Motivation</p>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{request.motivation}</p>
            </div>
          </div>

          {request.status === "rejected" && (
            <div className="mt-6 text-sm text-gray-600">
              You can submit a new request after improving the details.
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
              <input
                value={field}
                onChange={(e) => setField(e.target.value)}
                required
                placeholder="e.g., Web Development"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education level</label>
              <input
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                required
                placeholder="e.g., Bachelor"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivation</label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              required
              minLength={20}
              rows={6}
              placeholder="Share why you want to teach and what you can contribute."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 20 characters.</p>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      )}
    </div>
  )
}

export default TeacherRequestPage

