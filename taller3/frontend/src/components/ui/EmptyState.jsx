export default function EmptyState({ icon = 'bi-inbox', children }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`}></i>
      {children}
    </div>
  )
}
