import api from "./api"

export const getMyEnrollments = async () => {
  const response = await api.get("/api/enrollments/my")
  return response.data
}

