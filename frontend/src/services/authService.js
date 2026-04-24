import api from "./api"

// REGISTER
// Envoie du JSON classique — le backend attend { name, email, password }
export const register = async (name, email, password) => {
  const response = await api.post("/api/auth/register", {
    name,
    email,
    password,
  })
  return response.data // retourne l'objet user créé
}

// LOGIN
// ⚠️ Attention : FastAPI OAuth2 attend du FORM DATA, pas du JSON
// On utilise URLSearchParams pour construire le bon format
// URLSearchParams produit : "username=...&password=..."
export const login = async (email, password) => {
  const formData = new URLSearchParams()
  formData.append("username", email) // FastAPI appelle ça "username" même si c'est l'email
  formData.append("password", password)

  const response = await api.post("/api/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })

  return response.data // retourne { access_token, token_type }
}

// GET CURRENT USER
// Appelé juste après le login pour récupérer les infos complètes de l'utilisateur
// Le token est ajouté automatiquement par l'intercepteur dans api.js
export const getCurrentUser = async () => {
  const response = await api.get("/api/auth/me")
  return response.data // retourne { id, name, email, role, is_active, created_at }
}
