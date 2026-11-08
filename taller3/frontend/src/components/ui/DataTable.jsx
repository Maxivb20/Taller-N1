// Tabla reutilizable: recibe las columnas y las filas como children (<tr>).
import EmptyState from './EmptyState'

export default function DataTable({ columns, children, isEmpty, emptyIcon, emptyText }) {
  return (
    <div className="table-responsive">
      <table className="table-club">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState icon={emptyIcon}>{emptyText}</EmptyState>
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}
