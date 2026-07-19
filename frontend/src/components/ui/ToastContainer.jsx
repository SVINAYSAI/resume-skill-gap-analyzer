import Toast from './Toast.jsx'

export default function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast id={toast.id} message={toast.message} type={toast.type} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}