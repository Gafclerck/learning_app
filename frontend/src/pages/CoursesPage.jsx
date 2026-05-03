import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { getCourses } from "../services/courseService"

// Image de bibliothèque depuis Unsplash — pas besoin de télécharger
const HERO_IMAGE = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80"

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

function CourseCard({ course, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Initiale du cours */}
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600 font-bold text-xl flex-shrink-0">
        {course.title.charAt(0).toUpperCase()}
      </div>

      <div className="flex items-start justify-between mb-3">
        <LevelBadge level={course.level} />
        {course.is_free ? (
          <span className="text-green-600 font-semibold text-sm bg-green-50 px-2 py-0.5 rounded-full">
            Free
          </span>
        ) : (
          <span className="text-gray-700 font-semibold text-sm">
            {course.price.toLocaleString()} FCFA
          </span>
        )}
      </div>

      <h3 className="text-gray-900 font-semibold text-base mb-2 leading-snug flex-1">
        {course.title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
        {course.description}
      </p>

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-blue-600 text-sm font-medium">View roadmap →</span>
        <span className="text-xs text-gray-400 capitalize">{course.level}</span>
      </div>
    </div>
  )
}

function FilterTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {label}
    </button>
  )
}

function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [filter, setFilter]   = useState("all")

  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch {
        setError("Failed to load courses. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const filtered = useMemo(() => {
    if (filter === "all")  return courses
    if (filter === "free") return courses.filter(c => c.is_free)
    return courses.filter(c => c.level === filter)
  }, [courses, filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div>

      {/* ── HERO ── */}
      {/*
        relative → pour positionner l'overlay et le texte par-dessus l'image
        overflow-hidden → l'image ne déborde pas du conteneur arrondi
        rounded-3xl → coins arrondis
      */}
      <div className="relative rounded-3xl overflow-hidden mb-10 h-72 md:h-96">

        {/* Image de fond */}
        <img
          src={HERO_IMAGE}
          alt="Library"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/*
          Overlay sombre semi-transparent
          Sans dégradé — juste une couleur uniforme noire à 55% d'opacité
          Ça assure que le texte blanc soit lisible sur n'importe quelle image
        */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Contenu texte — au-dessus de l'overlay */}
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <span className="text-sm font-medium bg-white/20 border border-white/30 px-4 py-1.5 rounded-full mb-4">
            📚 {courses.length} courses available
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl">
            Learn anything, at your own pace
          </h1>
          <p className="text-white/80 mt-4 text-base md:text-lg max-w-xl">
            Follow structured roadmaps designed to take you from beginner to expert.
          </p>
        </div>
      </div>

      {/* ── FILTRES ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <FilterTab label="All"          active={filter === "all"}          onClick={() => setFilter("all")} />
        <FilterTab label="Free"         active={filter === "free"}         onClick={() => setFilter("free")} />
        <FilterTab label="Beginner"     active={filter === "beginner"}     onClick={() => setFilter("beginner")} />
        <FilterTab label="Intermediate" active={filter === "intermediate"} onClick={() => setFilter("intermediate")} />
        <FilterTab label="Advanced"     active={filter === "advanced"}     onClick={() => setFilter("advanced")} />
      </div>

      {/* Compteur résultats */}
      <p className="text-sm text-gray-500 mb-6">
        {filtered.length} course{filtered.length !== 1 ? "s" : ""}
        {filter !== "all" ? ` · "${filter}"` : ""}
      </p>

      {/* ── GRILLE ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">No courses match this filter.</p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 text-blue-600 text-sm hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
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
