export default function Loading({ label = 'Cargando…' }) {
  return (
    <div className="d-flex align-items-center gap-3 text-steel py-4">
      <div className="spinner-club"></div>
      <span>{label}</span>
    </div>
  )
}
