import mongoose from 'mongoose'

// Colección access_logs: guarda cada intento de check-in (QR o manual),
// tanto si fue autorizado como si se rechazó por membresía vencida.
const AccessLogSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, index: true },
    socioId: { type: String, required: true, index: true },
    socioNombre: { type: String, required: true },
    actividadId: { type: String, default: null },
    actividadNombre: { type: String, default: 'General' },
    fecha: { type: String, required: true, index: true },
    hora: { type: String, required: true },
    metodo: { type: String, enum: ['QR', 'Manual'], default: 'QR' },
    autorizado: { type: Boolean, required: true, default: true },
    motivo: { type: String, required: true },
    metadata: {
      estadoMembresia: { type: String, default: 'activa' },
      diasRestantes: { type: Number, default: null },
      dispositivo: { type: String, default: 'Recepción' },
      ubicacion: { type: String, default: 'Acceso Principal' },
    },
  },
  {
    timestamps: true,
    collection: 'access_logs',
  },
)

export const AccessLog = mongoose.model('AccessLog', AccessLogSchema)
