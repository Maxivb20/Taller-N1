export default function ErrorState({ message, onRetry }) {
  return (
    <div className="scan-result fail d-flex flex-wrap align-items-center justify-content-between gap-2">
      <span>
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {message || 'Ocurrió un error inesperado.'}
      </span>
      {onRetry && (
        <button type="button" className="btn-outline-club" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-1"></i>Reintentar
        </button>
      )}
    </div>
  )
}
