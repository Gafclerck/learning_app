import api from "./api"

export const getRecommendations = async (limit = 5) => {
  const response = await api.get("/api/ai/recommendations", { params: { limit } })
  return response.data
}

