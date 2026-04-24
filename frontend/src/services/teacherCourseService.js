import api from "./api"

export const getMyCourses = async () => {
  const response = await api.get("/api/courses/my")
  return response.data
}

export const createCourse = async ({ title, description, level, price, is_free }) => {
  const response = await api.post("/api/courses", {
    title,
    description,
    level,
    price,
    is_free,
  })
  return response.data
}

export const updateCourse = async (courseId, payload) => {
  const response = await api.patch(`/api/courses/${courseId}`, payload)
  return response.data
}

export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/api/courses/${courseId}`)
  return response.data
}

export const addLesson = async (courseId, { title, content, order, duration, is_preview }) => {
  const response = await api.post(`/api/courses/${courseId}/lessons`, {
    title,
    content,
    order,
    duration,
    is_preview,
  })
  return response.data
}

export const updateLesson = async (lessonId, payload) => {
  const response = await api.patch(`/api/courses/lessons/${lessonId}`, payload)
  return response.data
}

export const deleteLesson = async (lessonId) => {
  const response = await api.delete(`/api/courses/lessons/${lessonId}`)
  return response.data
}

