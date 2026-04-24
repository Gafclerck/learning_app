import api from "./api"

// Récupère tous les cours — route publique, pas besoin de token
export const getCourses = async () => {
  const response = await api.get("/api/courses")
  return response.data // tableau de cours
}

// Récupère un cours avec ses leçons — route publique
export const getCourseById = async (id) => {
  const response = await api.get(`/api/courses/${id}`)
  return response.data // objet cours + lessons[]
}

// Récupère la progression d'un étudiant dans un cours
// ⚠️ Route protégée — nécessite d'être connecté ET inscrit
// Si l'utilisateur n'est pas inscrit, le backend renvoie une erreur 404
export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/api/enrollments/${courseId}/progress`)
  return response.data // { course_id, roadmap[], percentage, ... }
}

// Inscrire l'utilisateur connecté à un cours
export const enrollInCourse = async (courseId) => {
  const response = await api.post(`/api/enrollments/${courseId}/enroll`)
  return response.data
}

// Marquer une leçon comme complétée
export const completeLesson = async (courseId, lessonId) => {
  const response = await api.post(
    `/api/enrollments/${courseId}/lessons/${lessonId}/complete`
  )
  return response.data
}
