function Alert({ tone = "danger", children, className = "" }) {
  const map = {
    danger: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  }

  return (
    <div className={`border rounded-xl px-4 py-3 text-sm ${map[tone] || map.danger} ${className}`}>
      {children}
    </div>
  )
}

export default Alert

