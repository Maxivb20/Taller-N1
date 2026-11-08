import mongoose from 'mongoose'

// Colección audit_events: bitácora de eventos del sistema (altas, pagos, inscripciones, accesos).
// Usa un campo payload libre porque cada evento guarda datos distintos.
const AuditEventSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      index: true,
      enum: [
        'SOCIO_CREADO',
        'SOCIO_ACTUALIZADO',
        'SOCIO_ELIMINADO',
        'MEMBRESIA_CREADA',
        'MEMBRESIA_RENOVADA',
        'PAGO_REGISTRADO',
        'PAGO_CONFIRMADO',
        'INSCRIPCION_CONFIRMADA',
        'INSCRIPCION_CANCELADA',
        'CHECKIN_AUTORIZADO',
        'CHECKIN_DENEGADO',
        'SISTEMA_SEED',
      ],
    },
    modulo: {
      type: String,
      required: true,
      enum: ['socios', 'planes', 'membresias', 'actividades', 'inscripciones', 'asistencia', 'pagos', 'sistema'],
    },
    descripcion: { type: String, required: true },
    actor: { type: String, default: 'Recepción' },
    entidadId: { type: String, default: null },
    socioId: { type: String, default: null, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'audit_events',
  },
)

export const AuditEvent = mongoose.model('AuditEvent', AuditEventSchema)
