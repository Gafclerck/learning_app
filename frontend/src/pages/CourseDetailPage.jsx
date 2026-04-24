import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getCourseById, getCourseProgress, enrollInCourse } from "../services/courseService"
import useAuthStore from "../store/authStore"

// Icône cadenas SVG inline — pas besoin de librairie externe
function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
  )
}

// Icône check SVG
function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

// Un noeud de la roadmap = une leçon
function RoadmapNode({ lesson, index, isLast, onSelect }) {
  const { is_unlocked, is_completed } = lesson

  // Styles dynamiques selon l'état de la leçon
  const nodeStyle = is_completed
    ? "bg-green-500 border-green-500 text-white"           // complétée → vert
    : is_unlocked
    ? "bg-blue-600 border-blue-600 text-white cursor-pointer hover:bg-blue-700" // débloquée → bleu
    : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"            // locked → gris

  const cardStyle = is_unlocked && !is_completed
    ? "border-blue-200 bg-blue-50 cursor-pointer hover:shadow-md"
    : is_completed
    ? "border-green-200 bg-green-50"
    : "border-gray-200 bg-gray-50 opacity-60"

  return (
    <div className="flex gap-6">
      {/* Colonne gauche — cercle + ligne verticale */}
      <div className="flex flex-col items-center">
        {/* Cercle numéroté */}
        <div
          onClick={is_unlocked ? () => onSelect(lesson) : undefined}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${nodeStyle}`}
        >
          {is_completed ? <CheckIcon /> : lesson.order}
        </div>

        {/* Ligne verticale entre les noeuds — cachée pour le dernier */}
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 min-h-8 ${
            is_completed ? "bg-green-300" : "bg-gray-200"
          }`} />
        )}
      </div>

      {/* Colonne droite — carte de la leçon */}
      <div
        onClick={is_unlocked ? () => onSelect(lesson) : undefined}
        className={`flex-1 border rounded-xl p-4 mb-6 transition-all ${cardStyle}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {lesson.duration} min
              {is_completed && (
                <span className="ml-2 text-green-600 font-medium">✓ Completed</span>
              )}
            </p>
          </div>

          {/* Icône état */}
          <div className={`${
            is_completed ? "text-green-500" :
            is_unlocked  ? "text-blue-500"  :
                           "text-gray-400"
          }`}>
            {is_unlocked ? (
              is_completed ? <CheckIcon /> : <span className="text-xs font-medium">Start →</span>
            ) : (
              <LockIcon />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CourseDetailPage() {
  const { id } = useParams()    // récupère l'id dans l'URL /courses/:id
  const navigate  = useNavigate()
  const { token } = useAuthStore()

  const [course, setCourse]     = useState(null)
  const [progress, setProgress] = useState(null)  // null = pas inscrit ou pas connecté
  const [loading, setLoading]   = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Appel 1 — toujours : récupérer le cours et ses leçons
        const courseData = await getCourseById(id)
        setCourse(courseData)

        // Appel 2 — seulement si connecté : récupérer la progression
        // Si l'utilisateur n'est pas inscrit, le backend renvoie 404
        // On attrape l'erreur silencieusement — ce n'est pas une vraie erreur
        if (token) {
          try {
            const progressData = await getCourseProgress(id)
            setProgress(progressData)
          } catch {
            // 404 = pas inscrit → progress reste null, c'est normal
          }
        }
      } catch (err) {
        setError("Failed to load course.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, token])

  const handleEnroll = async () => {
    if (!token) {
      navigate("/login")
      return
    }

    setEnrolling(true)
    try {
      await enrollInCourse(id)
      // Après inscription, on recharge la progression
      const progressData = await getCourseProgress(id)
      setProgress(progressData)
    } catch (err) {
      setError(err.response?.data?.detail || "Enrollment failed.")
    } finally {
      setEnrolling(false)
    }
  }

  const handleLessonSelect = (lesson) => {
    navigate(`/courses/${id}/learn?lesson=${lesson.lesson_id}`)
  }

  // Construit la roadmap à afficher selon l'état
  // Si inscrit → on utilise progress.roadmap (avec is_unlocked réel)
  // Si non inscrit → on construit depuis course.lessons (tout locked)
  const buildRoadmap = () => {
    if (progress) {
      return progress.roadmap
    }
    // Pas inscrit → on formate les leçons comme des noeuds locked
    return course.lessons.map((lesson) => ({
      lesson_id:    lesson.id,
      title:        lesson.title,
      order:        lesson.order,
      duration:     lesson.duration,
      is_unlocked:  lesson.is_preview, // seules les previews sont accessibles
      is_completed: false,
      completed_at: null,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !course) {
    return <div className="text-center py-20 text-red-500">{error || "Course not found."}</div>
  }

  const roadmap  = buildRoadmap()
  const enrolled = !!progress

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header du cours */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/courses")}
          className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-flex items-center gap-1"
        >
          ← Back to courses
        </button>

        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-500 mt-2">{course.description}</p>

        {/* Stats du cours */}
        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          <span>📚 {course.lessons.length} lessons</span>
          <span>📊 {course.level}</span>
          <span>{course.is_free ? "🆓 Free" : `💰 ${course.price.toLocaleString()} FCFA`}</span>
        </div>
      </div>

      {/* Barre de progression — visible seulement si inscrit */}
      {enrolled && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Your progress</span>
            <span className="text-blue-600 font-semibold">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {progress.completed_lessons} / {progress.total_lessons} lessons completed
          </p>
        </div>
      )}

      {/* Bouton d'enrollment — si pas inscrit */}
      {!enrolled && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Ready to start?</p>
            <p className="text-sm text-gray-500">
              {course.is_free ? "This course is free" : `${course.price.toLocaleString()} FCFA`}
            </p>
          </div>
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {enrolling ? "Enrolling..." : "Enroll now"}
          </button>
        </div>
      )}

      {/* La Roadmap */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Course Roadmap</h2>
        <div>
          {roadmap.map((lesson, index) => (
            <RoadmapNode
              key={lesson.lesson_id}
              lesson={lesson}
              index={index}
              isLast={index === roadmap.length - 1}
              onSelect={handleLessonSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
