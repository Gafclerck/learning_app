import api from "./api"

// Récupère tous les cours — route publique, pas besoin de token
export const getCourses = async () => {
  const response = await api.get("/api/courses")
  return response.data
}

// Récupère un cours avec ses leçons — route publique
export const getCourseById = async (id) => {
  const response = await api.get(`/api/courses/${id}`)
  return response.data
}

// Récupère le contenu d'une leçon individuelle
export const getLessonById = async (lessonId) => {
  const response = await api.get(`/api/courses/lessons/${lessonId}`)
  return response.data
}

// Récupère la progression d'un étudiant dans un cours
export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/api/enrollments/${courseId}/progress`)
  return response.data
}

// Marquer une leçon comme complétée
export const completeLesson = async (courseId, lessonId) => {
  const response = await api.post(
    `/api/enrollments/${courseId}/lessons/${lessonId}/complete`
  )
  return response.data
}
