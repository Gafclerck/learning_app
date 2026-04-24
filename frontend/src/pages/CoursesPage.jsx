import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCourses } from "../services/courseService"

// Badge coloré selon le niveau du cours
function LevelBadge({ level }) {
  const styles = {
    beginner:     "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced:     "bg-red-100 text-red-700",
  }
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[level] || "bg-gray-100 text-gray-600"}`}>
      {level}
    </span>
  )
}

// Carte d'un cours individuel
function CourseCard({ course, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
    >
      {/* Header de la carte */}
      <div className="flex items-start justify-between mb-3">
        <LevelBadge level={course.level} />
        {course.is_free ? (
          <span className="text-green-600 font-semibold text-sm">Free</span>
        ) : (
          <span className="text-gray-900 font-semibold text-sm">
            {course.price.toLocaleString()} FCFA
          </span>
        )}
      </div>

      {/* Titre et description */}
      <h3 className="text-gray-900 font-semibold text-lg mb-2 leading-snug">
        {course.title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
        {course.description}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-blue-600 text-sm font-medium">
          View roadmap →
        </span>
      </div>
    </div>
  )
}

function CoursesPage() {
  // État local pour les cours, le loading et les erreurs
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const navigate = useNavigate()

  // useEffect — s'exécute une seule fois au montage du composant
  // C'est ici qu'on fait les appels API en React
  // Le tableau vide [] en 2ème argument = "exécute seulement au montage"
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch (err) {
        setError("Failed to load courses. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header de la page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
        <p className="text-gray-500 mt-2">
          {courses.length} course{courses.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Grille de cours */}
      {courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No courses available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => navigate(`/courses/${course.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CoursesPage
