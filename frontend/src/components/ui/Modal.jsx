import Button from "./Button"

function Modal({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ×
          </Button>
        </div>
        <div className="p-6">{children}</div>
        {footer ? <div className="px-6 pb-6">{footer}</div> : null}
      </div>
    </div>
  )
}

export default Modal

