import { useEffect, useMemo, useState } from "react"
import {
  createUser,
  deleteUser,
  listUsers,
  toggleUserActive,
  updateUser,
} from "../../services/adminUserService"
import Button from "../../components/ui/Button"
import Pill from "../../components/ui/Pill"
import Modal from "../../components/ui/Modal"
import Spinner from "../../components/ui/Spinner"
import Alert from "../../components/ui/Alert"

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null) // user
  const [busyId, setBusyId] = useState(null)

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" })
  const [editForm, setEditForm] = useState({ name: "", password: "", role: "", is_active: undefined })
  const [formError, setFormError] = useState(null)

  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.is_active).length
    return { total, active }
  }, [users])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listUsers()
      setUsers(data || [])
    } catch (e) {
      setError("Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const onToggle = async (id) => {
    setBusyId(id)
    try {
      await toggleUserActive(id)
      await refresh()
    } catch (e) {
      setError("Failed to toggle user status.")
    } finally {
      setBusyId(null)
    }
  }

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this user? This action cannot be undone.")
    if (!ok) return
    setBusyId(id)
    try {
      await deleteUser(id)
      await refresh()
    } catch (e) {
      setError("Failed to delete user.")
    } finally {
      setBusyId(null)
    }
  }

  const openCreate = () => {
    setFormError(null)
    setForm({ name: "", email: "", password: "", role: "student" })
    setCreating(true)
  }

  const submitCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    try {
      await createUser(form)
      setCreating(false)
      await refresh()
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to create user.")
    }
  }

  const openEdit = (u) => {
    setFormError(null)
    setEditing(u)
    setEditForm({ name: u.name, password: "", role: u.role, is_active: u.is_active })
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    setFormError(null)
    try {
      await updateUser(editing.id, {
        name: editForm.name,
        password: editForm.password || undefined,
        is_active: editForm.is_active,
        role: editForm.role,
      })
      setEditing(null)
      await refresh()
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to update user.")
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
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Manage accounts, roles, and status.
          </p>
        </div>
        <Button onClick={openCreate}>
          + Create user
        </Button>
      </div>

      {error && (
        <Alert>{error}</Alert>
      )}

      <div className="flex items-center gap-3">
        <Pill tone="blue">{stats.total} users</Pill>
        <Pill tone="green">{stats.active} active</Pill>
        <Pill tone="gray">{stats.total - stats.active} inactive</Pill>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-medium px-6 py-3">User</th>
                <th className="text-left font-medium px-6 py-3">Role</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
                <th className="text-right font-medium px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Pill tone={u.role === "admin" ? "yellow" : u.role === "teacher" ? "blue" : "gray"}>
                      {u.role}
                    </Pill>
                  </td>
                  <td className="px-6 py-4">
                    {u.is_active ? <Pill tone="green">active</Pill> : <Pill tone="red">inactive</Pill>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(u)}>
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onToggle(u.id)}
                        disabled={busyId === u.id}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(u.id)}
                        disabled={busyId === u.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-gray-400" colSpan={4}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {creating && (
        <Modal title="Create user" onClose={() => setCreating(false)}>
          {formError && (
            <Alert className="mb-4">{formError}</Alert>
          )}
          <form onSubmit={submitCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Min 6 characters (backend validation).</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setCreating(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
              >
                Create
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title="Edit user" onClose={() => setEditing(null)}>
          {formError && (
            <Alert className="mb-4">{formError}</Alert>
          )}
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password (optional)</label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!editForm.is_active}
                  onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                Active
              </label>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => setEditing(null)}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                >
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default AdminUsersPage

