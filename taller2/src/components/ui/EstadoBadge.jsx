import { ESTADO_LABEL } from '../../utils/business'

export default function EstadoBadge({ estado }) {
  return <span className={`badge-estado badge-${estado}`}>{ESTADO_LABEL[estado] || estado}</span>
}
