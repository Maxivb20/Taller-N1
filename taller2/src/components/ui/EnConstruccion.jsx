import PageHeader from './PageHeader'
import EmptyState from './EmptyState'

export default function EnConstruccion({ kicker, title, subtitle, icon }) {
  return (
    <>
      <PageHeader kicker={kicker} title={title} subtitle={subtitle} />
      <div className="card-flat p-3">
        <EmptyState icon={icon || 'bi-tools'}>
          <strong>Módulo en construcción.</strong>
          <div className="text-steel mt-1">
            Este módulo se completa en la Parte 2 (rama <code>feature/control-docs</code>).
          </div>
        </EmptyState>
      </div>
    </>
  )
}
