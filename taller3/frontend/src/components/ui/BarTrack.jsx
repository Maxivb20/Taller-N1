export default function BarTrack({ value, color }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${pct}%`, background: color }}></div>
    </div>
  )
}
