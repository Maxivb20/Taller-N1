/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (mensaje, tipo = 'success') => {
      const id = ++counter.current
      setToasts((prev) => [...prev, { id, mensaje, tipo }])
      setTimeout(() => remove(id), 3000)
    },
    [remove],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-area">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-${t.tipo}`} role="status">
            <i
              className={`bi ${
                t.tipo === 'error' ? 'bi-x-circle-fill' : 'bi-check-circle-fill'
              } me-2`}
            ></i>
            {t.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
