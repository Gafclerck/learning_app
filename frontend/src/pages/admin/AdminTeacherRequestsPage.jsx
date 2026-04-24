import { useEffect, useMemo, useState } from "react"
import {
  approveTeacherRequest,
  listTeacherRequests,
  rejectTeacherRequest,
} from "../../services/teacherRequestService"
import Button from "../../components/ui/Button"
import Pill from "../../components/ui/Pill"
import Spinner from "../../components/ui/Spinner"
import Alert from "../../components/ui/Alert"

function toneForStatus(status) {
  if (status === "approved") return "green"
  if (status === "rejected") return "red"
  if (status === "pending") return "yellow"
  return "gray"
}

function AdminTeacherRequestsPage() {
  const [status, setStatus] = useState("pending") // pending | approved | rejected | all
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const effectiveStatus = useMemo(() => (status === "all" ? undefined : status), [status])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listTeacherRequests({ status: effectiveStatus })
      setItems(data || [])
    } catch (e) {
      setError("Failed to load teacher requests.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [effectiveStatus])

  const onApprove = async (id) => {
    setBusyId(id)
    try {
      await approveTeacherRequest(id)
      await refresh()
    } catch (e) {
      setError("Failed to approve request.")
    } finally {
      setBusyId(null)
    }
  }

  const onReject = async (id) => {
    setBusyId(id)
    try {
      await rejectTeacherRequest(id)
      await refresh()
    } catch (e) {
      setError("Failed to reject request.")
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
          <h1 className="text-3xl font-bold text-gray-900">Teacher requests</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Review and approve or reject teacher role requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
            <option value="all">all</option>
          </select>
          <Button variant="secondary" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert>{error}</Alert>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-medium px-6 py-3">Applicant</th>
                <th className="text-left font-medium px-6 py-3">Details</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
                <th className="text-right font-medium px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((r) => (
                <tr key={r.id} className="align-top hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{r.user?.name}</div>
                    <div className="text-gray-500">{r.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">
                      <span className="text-gray-500">Field:</span> {r.field}
                    </div>
                    <div className="text-gray-900 mt-1">
                      <span className="text-gray-500">Education:</span> {r.education_level}
                    </div>
                    <div className="text-gray-500 mt-2 whitespace-pre-wrap line-clamp-4">
                      {r.motivation}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Pill tone={toneForStatus(r.status)}>{r.status}</Pill>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onReject(r.id)}
                        disabled={busyId === r.id || r.status !== "pending"}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onApprove(r.id)}
                        disabled={busyId === r.id || r.status !== "pending"}
                      >
                        Approve
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-gray-400" colSpan={4}>
                    No requests found.
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

export default AdminTeacherRequestsPage

