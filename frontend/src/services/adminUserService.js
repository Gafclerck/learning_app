import api from "./api"

export const listUsers = async () => {
  const response = await api.get("/api/users/private/all-users")
  return response.data
}

export const toggleUserActive = async (userId) => {
  const response = await api.get(`/api/users/private/${userId}/toggle-active`)
  return response.data
}

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/users/private/${userId}/delete`)
  return response.data
}

export const createUser = async ({ name, email, password, role }) => {
  const response = await api.post("/api/users/private/create-account", {
    name,
    email,
    password,
    role,
  })
  return response.data
}

export const updateUser = async (userId, { name, password, is_active, role }) => {
  const response = await api.put(`/api/users/private/${userId}/update`, {
    name,
    password,
    is_active,
    role,
  })
  return response.data
}

