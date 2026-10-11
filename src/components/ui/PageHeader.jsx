export default function PageHeader({ kicker, title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        {kicker && <div className="kicker">{kicker}</div>}
        <h1>{title}</h1>
        {subtitle && <p className="lead-sub">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
