import { useState, useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import {
  getLessonById,
  getCourseProgress,
  completeLesson,
} from "../services/courseService"

function LessonPage() {
  const { id: courseId }          = useParams()
  // useSearchParams lit les query params dans l'URL
  // /courses/1/learn?lesson=3  →  lessonId = "3"
  const [searchParams, setSearchParams] = useSearchParams()
  const lessonId                  = searchParams.get("lesson")
  const navigate                  = useNavigate()

  const [lesson, setLesson]       = useState(null)
  const [progress, setProgress]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError]         = useState(null)
  const [alreadyDone, setAlreadyDone] = useState(false)

  useEffect(() => {
    if (!lessonId) {
      navigate(`/courses/${courseId}`)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        // On charge la leçon ET la progression en parallèle
        // Promise.all attend que les deux requêtes finissent avant de continuer
        const [lessonData, progressData] = await Promise.all([
          getLessonById(lessonId),
          getCourseProgress(courseId),
        ])

        setLesson(lessonData)
        setProgress(progressData)

        // On vérifie si cette leçon est déjà complétée
        const currentNode = progressData.roadmap.find(
          (node) => node.lesson_id === parseInt(lessonId)
        )
        setAlreadyDone(currentNode?.is_completed ?? false)

      } catch (err) {
        setError("Failed to load lesson.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lessonId, courseId])

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await completeLesson(courseId, lessonId)

      // Recharge la progression pour avoir le roadmap mis à jour
      const updatedProgress = await getCourseProgress(courseId)
      setProgress(updatedProgress)
      setAlreadyDone(true)

    } catch (err) {
      setError(err.response?.data?.detail || "Failed to mark as complete.")
    } finally {
      setCompleting(false)
    }
  }

  // Navigue vers la leçon suivante dans le roadmap
  const goToNext = () => {
    if (!progress) return

    const roadmap = progress.roadmap
    const currentIndex = roadmap.findIndex(
      (node) => node.lesson_id === parseInt(lessonId)
    )

    const nextNode = roadmap[currentIndex + 1]

    if (nextNode && nextNode.is_unlocked) {
      // On change juste le query param ?lesson=X — la page se recharge via useEffect
      setSearchParams({ lesson: nextNode.lesson_id })
    } else if (!nextNode) {
      // Dernière leçon — on retourne au cours
      navigate(`/courses/${courseId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-20 text-red-500">
        {error || "Lesson not found."}
      </div>
    )
  }

  // Trouve la leçon suivante pour afficher/désactiver le bouton
  const roadmap    = progress?.roadmap ?? []
  const currentIdx = roadmap.findIndex((n) => n.lesson_id === parseInt(lessonId))
  const nextNode   = roadmap[currentIdx + 1]
  const hasNext    = !!nextNode
  const nextLocked = hasNext && !nextNode.is_unlocked

  return (
    <div className="max-w-3xl mx-auto">

      {/* Breadcrumb navigation */}
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="text-sm text-gray-500 hover:text-blue-600 mb-6 inline-flex items-center gap-1"
      >
        ← Back to roadmap
      </button>

      {/* Header de la leçon */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Lesson {lesson.order}
          </span>
          {alreadyDone && (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✓ Completed
            </span>
          )}
          {lesson.duration && (
            <span className="text-xs text-gray-400">
              {lesson.duration} min
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
      </div>

      {/* Contenu de la leçon */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        {lesson.content ? (
          // On utilise whitespace-pre-wrap pour respecter les sauts de ligne du contenu
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {lesson.content}
          </div>
        ) : (
          <p className="text-gray-400 italic">No content available for this lesson.</p>
        )}
      </div>

      {/* Barre de progression du cours */}
      {progress && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Course progress</span>
            <span className="font-semibold text-blue-600">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">

        {/* Bouton Mark as complete */}
        {!alreadyDone ? (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {completing ? "Saving..." : "✓ Mark as complete"}
          </button>
        ) : (
          <div className="flex-1 bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl font-medium text-center">
            ✓ Lesson completed
          </div>
        )}

        {/* Bouton Next */}
        {hasNext && (
          <button
            onClick={goToNext}
            disabled={nextLocked}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nextLocked ? "🔒 Complete this lesson first" : "Next lesson →"}
          </button>
        )}

        {/* Dernière leçon */}
        {!hasNext && alreadyDone && (
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            🎉 Course completed! Back to overview
          </button>
        )}

      </div>

    </div>
  )
}

export default LessonPage
