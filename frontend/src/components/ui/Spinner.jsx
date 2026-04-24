function Spinner({ size = "md" }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
  }

  return (
    <div
      className={`${sizes[size] || sizes.md} border-blue-600 border-t-transparent rounded-full animate-spin`}
      aria-label="Loading"
    />
  )
}

export default Spinner

