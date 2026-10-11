import { useEffect } from 'react'

// Modal accesible y reutilizable (sin depender del JS de Bootstrap).
export default function Modal({ open, onClose, title, children, footer, size }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={size === 'lg' ? { maxWidth: 720 } : undefined}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header>
          <h3 className="mb-0">{title}</h3>
          <button type="button" className="btn-ghost-sm" onClick={onClose} aria-label="Cerrar">
            <i className="bi bi-x-lg"></i>
          </button>
        </header>
        <div className="body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>
  )
}
