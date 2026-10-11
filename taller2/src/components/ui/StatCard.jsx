export default function StatCard({ label, value, sub, tone = 'court' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="delta">{sub}</div>}
    </div>
  )
}
