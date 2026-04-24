import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getCourseById } from "../../services/courseService"
import {
  addLesson,
  createCourse,
  updateCourse,
  updateLesson,
  deleteLesson,
} from "../../services/teacherCourseService"
import Button from "../../components/ui/Button"
import Pill from "../../components/ui/Pill"
import Spinner from "../../components/ui/Spinner"
import Alert from "../../components/ui/Alert"

function TeacherCourseEditorPage({ mode }) {
  const navigate = useNavigate()
  const params = useParams()
  const courseId = params.id

  const isNew = mode === "new"

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [course, setCourse] = useState(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    is_free: false,
    price: 0,
    is_published: false,
  })

  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    duration: 10,
    is_preview: false,
  })

  const lessons = useMemo(() => (course?.lessons || []).slice().sort((a, b) => a.order - b.order), [course])

  useEffect(() => {
    if (isNew) return
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getCourseById(courseId)
        setCourse(data)
        setForm({
          title: data.title || "",
          description: data.description || "",
          level: data.level,
          is_free: !!data.is_free,
          price: Number(data.price || 0),
          is_published: !!data.is_published,
        })
      } catch (e) {
        setError("Failed to load course.")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [courseId, isNew])

  const saveCourse = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isNew) {
        const created = await createCourse({
          title: form.title,
          description: form.description || null,
          level: form.level,
          price: form.is_free ? 0 : Number(form.price || 0),
          is_free: !!form.is_free,
        })
        // Publishing is done via PATCH (since create schema doesn't include is_published)
        if (form.is_published) {
          await updateCourse(created.id, { is_published: true })
        }
        navigate(`/teacher/courses/${created.id}/edit`)
      } else {
        await updateCourse(courseId, {
          title: form.title,
          description: form.description || null,
          level: form.level,
          is_free: !!form.is_free,
          price: form.is_free ? 0 : Number(form.price || 0),
          is_published: !!form.is_published,
        })
        const refreshed = await getCourseById(courseId)
        setCourse(refreshed)
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save course.")
    } finally {
      setSaving(false)
    }
  }

  const addNewLesson = async (e) => {
    e.preventDefault()
    if (!courseId) return
    setSaving(true)
    setError(null)
    try {
      const nextOrder = lessons.length ? Math.max(...lessons.map((l) => l.order)) + 1 : 1
      await addLesson(courseId, {
        title: lessonForm.title,
        content: lessonForm.content || null,
        order: nextOrder,
        duration: Number(lessonForm.duration || 0) || null,
        is_preview: !!lessonForm.is_preview,
      })
      setLessonForm({ title: "", content: "", duration: 10, is_preview: false })
      const refreshed = await getCourseById(courseId)
      setCourse(refreshed)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add lesson.")
    } finally {
      setSaving(false)
    }
  }

  const updateLessonField = async (lessonId, payload) => {
    setSaving(true)
    setError(null)
    try {
      await updateLesson(lessonId, payload)
      const refreshed = await getCourseById(courseId)
      setCourse(refreshed)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update lesson.")
    } finally {
      setSaving(false)
    }
  }

  const removeLesson = async (lessonId) => {
    const ok = window.confirm("Delete this lesson?")
    if (!ok) return
    setSaving(true)
    setError(null)
    try {
      await deleteLesson(lessonId)
      const refreshed = await getCourseById(courseId)
      setCourse(refreshed)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete lesson.")
    } finally {
      setSaving(false)
    }
  }

  const moveLesson = async (idx, dir) => {
    const a = lessons[idx]
    const b = lessons[idx + dir]
    if (!a || !b) return
    // swap orders
    setSaving(true)
    setError(null)
    try {
      await updateLesson(a.id, { order: b.order })
      await updateLesson(b.id, { order: a.order })
      const refreshed = await getCourseById(courseId)
      setCourse(refreshed)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reorder lessons.")
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <button
            onClick={() => navigate("/teacher")}
            className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-flex items-center gap-1"
          >
            ← Back to dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? "New course" : "Manage course"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Keep it minimal: clear title, concise description, structured lessons.
          </p>
        </div>
        {!isNew && (
          <div className="flex items-center gap-2">
            {form.is_published ? <Pill tone="green">Published</Pill> : <Pill tone="yellow">Draft</Pill>}
          </div>
        )}
      </div>

      {error && (
        <Alert>{error}</Alert>
      )}

      <form onSubmit={saveCourse} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!form.is_free}
                onChange={(e) => setForm((f) => ({ ...f, is_free: e.target.checked }))}
              />
              Free course
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              />
              Published
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (FCFA)</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              disabled={form.is_free}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            onClick={() => navigate("/teacher")}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>

      {!isNew && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
              <p className="text-sm text-gray-500 mt-1">
                Order controls the roadmap progression.
              </p>
            </div>
            <Pill tone="blue">{lessons.length} lessons</Pill>
          </div>

          {/* Existing lessons */}
          <div className="space-y-3">
            {lessons.map((l, idx) => (
              <div key={l.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Pill>#{l.order}</Pill>
                      {l.is_preview && <Pill tone="yellow">Preview</Pill>}
                      <h3 className="font-semibold text-gray-900 truncate">{l.title}</h3>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {l.duration ? `${l.duration} min` : "No duration"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveLesson(idx, -1)}
                      disabled={saving || idx === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveLesson(idx, +1)}
                      disabled={saving || idx === lessons.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        updateLessonField(l.id, { is_preview: !l.is_preview })
                      }
                      disabled={saving}
                    >
                      {l.is_preview ? "Unpreview" : "Preview"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeLesson(l.id)}
                      disabled={saving}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <details className="mt-3">
                  <summary className="text-sm text-blue-600 cursor-pointer select-none">
                    Edit content
                  </summary>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        defaultValue={l.title}
                        onBlur={(e) => {
                          const v = e.target.value.trim()
                          if (v && v !== l.title) updateLessonField(l.id, { title: v })
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                        <input
                          type="number"
                          min={0}
                          defaultValue={l.duration ?? ""}
                          onBlur={(e) => {
                            const val = e.target.value === "" ? null : Number(e.target.value)
                            updateLessonField(l.id, { duration: val })
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                        <input
                          type="number"
                          min={1}
                          defaultValue={l.order}
                          onBlur={(e) => {
                            const val = Number(e.target.value)
                            if (Number.isFinite(val) && val > 0 && val !== l.order) {
                              updateLessonField(l.id, { order: val })
                            }
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Avoid duplicates; backend rejects duplicate orders.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        defaultValue={l.content || ""}
                        rows={6}
                        onBlur={(e) => updateLessonField(l.id, { content: e.target.value || null })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </details>
              </div>
            ))}

            {lessons.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No lessons yet. Add your first lesson below.
              </div>
            )}
          </div>

          {/* Add lesson */}
          <form onSubmit={addNewLesson} className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Add lesson</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  min={0}
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm((f) => ({ ...f, duration: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!lessonForm.is_preview}
                    onChange={(e) => setLessonForm((f) => ({ ...f, is_preview: e.target.checked }))}
                  />
                  Preview lesson
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add lesson"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default TeacherCourseEditorPage

