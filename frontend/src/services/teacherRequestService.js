import api from "./api"

export const getMyTeacherRequest = async () => {
  const response = await api.get("/api/teacher-requests/my-request")
  return response.data
}

export const createTeacherRequest = async ({ motivation, field, education_level }) => {
  const response = await api.post("/api/teacher-requests", {
    motivation,
    field,
    education_level,
  })
  return response.data
}

// Admin
export const listTeacherRequests = async ({ status } = {}) => {
  const response = await api.get("/api/teacher-requests", { params: status ? { status } : {} })
  return response.data
}

export const approveTeacherRequest = async (requestId) => {
  const response = await api.patch(`/api/teacher-requests/${requestId}/approve`)
  return response.data
}

export const rejectTeacherRequest = async (requestId) => {
  const response = await api.patch(`/api/teacher-requests/${requestId}/reject`)
  return response.data
}

