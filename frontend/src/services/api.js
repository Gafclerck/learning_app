import axios from "axios"

// Instance axios configurée pour ton API FastAPI
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json"
  }
})

// Intercepteur — ajoute automatiquement le token JWT
// à chaque requête qui en a besoin
api.interceptors.request.use((config) => {
  // Récupère le token depuis localStorage
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Intercepteur — gère les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le token est expiré — déconnecter l'utilisateur
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api