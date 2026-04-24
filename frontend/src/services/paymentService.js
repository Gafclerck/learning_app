import api from "./api"

// Create a Stripe checkout session (or free enrollment) for a course.
// Backend response:
// - { type: "paid", checkout_url: string }
// - { type: "free", message: string, enrollment: {...} }
export const checkoutCourse = async (courseId) => {
  const response = await api.post(`/api/payments/checkout/${courseId}`)
  return response.data
}

