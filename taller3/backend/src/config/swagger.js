/**
 * Especificación OpenAPI 3.0.3 para ClubTrack API REST (Hito 3).
 * Expuesta interactivamente en /api/docs mediante swagger-ui-express.
 */

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ClubTrack — API REST Full Stack (Hito 3)',
    version: '2.0.0',
    description:
      'API REST del sistema ClubTrack (Desarrollo Web y Móvil — Hito 3). Gestiona socios, instructores/organizadores, planes, membresías, actividades, inscripciones con control de cupos, pagos con comprobantes (PostgreSQL) y registros de acceso / check-in QR y bitácora de auditoría (MongoDB).',
  },
  servers: [
    {
      url: 'http://localhost:4000/api',
      description: 'Servidor local / Docker Compose',
    },
  ],
  tags: [
    { name: 'Sistema', description: 'Estado de salud, carga inicial (bootstrap) y reinicio de datos semilla' },
    { name: 'Socios', description: 'CRUD de socios en PostgreSQL e historial consolidado' },
    { name: 'Instructores', description: 'CRUD de instructores / organizadores de actividades (PostgreSQL)' },
    { name: 'Planes', description: 'Catálogo y administración de planes de membresía (PostgreSQL)' },
    { name: 'Actividades', description: 'Gestión de actividades/eventos, categorías, ubicaciones y cupos (PostgreSQL)' },
    { name: 'Membresías', description: 'Alta y renovación transaccional de membresías con generación de pago (PostgreSQL)' },
    { name: 'Inscripciones', description: 'Inscripción de socios a actividades con control estricto de cupos (PostgreSQL)' },
    { name: 'Pagos', description: 'Registro de pagos, control de morosidad y emisión de comprobantes (PostgreSQL)' },
    { name: 'Asistencia y NoSQL (MongoDB)', description: 'Check-in QR/Manual, registros de acceso y bitácora documental en MongoDB' },
  ],
  components: {
    schemas: {
      SocioInput: {
        type: 'object',
        required: ['nombre', 'email', 'telefono'],
        properties: {
          nombre: { type: 'string', example: 'Lucas Valdés' },
          email: { type: 'string', example: 'lucas.valdes@mail.com' },
          telefono: { type: 'string', example: '+56 9 9123 4567' },
        },
      },
      InstructorInput: {
        type: 'object',
        required: ['nombre', 'especialidad', 'email', 'telefono'],
        properties: {
          nombre: { type: 'string', example: 'Martina Gómez' },
          especialidad: { type: 'string', example: 'Pilates & Core' },
          email: { type: 'string', example: 'martina.gomez@clubtrack.cl' },
          telefono: { type: 'string', example: '+56 9 7700 1199' },
          bio: { type: 'string', example: 'Especialista en rehabilitación y fortalecimiento postural.' },
          activo: { type: 'boolean', example: true },
        },
      },
      PlanInput: {
        type: 'object',
        required: ['nombre', 'precio', 'duracionDias'],
        properties: {
          nombre: { type: 'string', example: 'Plan Pro Anual' },
          descripcion: { type: 'string', example: 'Acceso total anual con evaluación nutricional.' },
          precio: { type: 'integer', example: 299990 },
          duracionDias: { type: 'integer', example: 365 },
          actividades: { type: 'array', items: { type: 'string' }, example: ['Musculación', 'Funcional', 'Yoga'] },
        },
      },
      ActividadInput: {
        type: 'object',
        required: ['nombre', 'cupo', 'horario'],
        properties: {
          nombre: { type: 'string', example: 'Boxeo Técnico' },
          categoria: { type: 'string', example: 'Combate & Cardio' },
          instructorId: { type: 'string', nullable: true, example: 'I01' },
          instructor: { type: 'string', example: 'Rodrigo Paredes' },
          horario: { type: 'string', example: 'Lun / Mié · 20:00' },
          ubicacion: { type: 'string', example: 'Sala Multiuso 2' },
          cupo: { type: 'integer', example: 16 },
          exterior: { type: 'boolean', example: false },
          publicada: { type: 'boolean', example: true },
        },
      },
      MembresiaInput: {
        type: 'object',
        required: ['socioId', 'planId'],
        properties: {
          socioId: { type: 'string', example: 'S001' },
          planId: { type: 'string', example: 'P02' },
          inicio: { type: 'string', format: 'date', example: '2026-11-05' },
          actividadPreferida: { type: 'string', nullable: true, example: 'A02' },
        },
      },
      InscripcionInput: {
        type: 'object',
        required: ['socioId', 'actividadId'],
        properties: {
          socioId: { type: 'string', example: 'S001' },
          actividadId: { type: 'string', example: 'A04' },
          notas: { type: 'string', example: 'Asiste con mat propio' },
        },
      },
      PagoInput: {
        type: 'object',
        required: ['socioId', 'monto'],
        properties: {
          socioId: { type: 'string', example: 'S001' },
          membresiaId: { type: 'string', nullable: true, example: 'M001' },
          monto: { type: 'integer', example: 39990 },
          metodo: { type: 'string', example: 'Transferencia' },
          estado: { type: 'string', enum: ['pagado', 'pendiente'], example: 'pagado' },
        },
      },
      CheckinInput: {
        type: 'object',
        required: ['codigo'],
        properties: {
          codigo: { type: 'string', example: 'S001', description: 'ID del socio (ej. S001) o correo electrónico' },
          actividadId: { type: 'string', example: 'A02' },
          metodo: { type: 'string', enum: ['QR', 'Manual'], example: 'QR' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica estado del servidor, PostgreSQL y MongoDB',
        responses: {
          200: { description: 'Estado de los servicios y conexiones a bases de datos' },
        },
      },
    },
    '/bootstrap': {
      get: {
        tags: ['Sistema'],
        summary: 'Obtiene todos los datos operacionales desde PostgreSQL y MongoDB',
        responses: {
          200: { description: 'Estado global consolidado del club' },
        },
      },
    },
    '/reset': {
      post: {
        tags: ['Sistema'],
        summary: 'Restaura los datos de ejemplo iniciales en PostgreSQL y MongoDB',
        responses: {
          200: { description: 'Datos semilla restaurados exitosamente' },
        },
      },
    },
    '/socios': {
      get: {
        tags: ['Socios'],
        summary: 'Lista todos los socios registrados en PostgreSQL',
        responses: { 200: { description: 'Lista de socios' } },
      },
      post: {
        tags: ['Socios'],
        summary: 'Registra un nuevo socio en PostgreSQL y audita en MongoDB',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SocioInput' } } },
        },
        responses: {
          201: { description: 'Socio creado exitosamente' },
          400: { description: 'Error de validación en los datos de entrada' },
          409: { description: 'El correo electrónico ya está registrado' },
        },
      },
    },
    '/socios/{id}': {
      get: {
        tags: ['Socios'],
        summary: 'Obtiene la ficha e historial completo de un socio (SQL + NoSQL)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'S001' } }],
        responses: {
          200: { description: 'Detalle del socio con membresías, pagos, inscripciones y logs de acceso' },
          404: { description: 'Socio no encontrado' },
        },
      },
      put: {
        tags: ['Socios'],
        summary: 'Actualiza los datos de contacto de un socio',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'S001' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SocioInput' } } },
        },
        responses: {
          200: { description: 'Socio actualizado' },
          404: { description: 'Socio no encontrado' },
        },
      },
      delete: {
        tags: ['Socios'],
        summary: 'Elimina un socio en cascada (membresías, pagos, inscripciones y logs)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'S009' } }],
        responses: {
          200: { description: 'Socio eliminado' },
          404: { description: 'Socio no encontrado' },
        },
      },
    },
    '/instructores': {
      get: {
        tags: ['Instructores'],
        summary: 'Lista todos los instructores / organizadores del club',
        responses: { 200: { description: 'Lista de instructores' } },
      },
      post: {
        tags: ['Instructores'],
        summary: 'Crea un nuevo instructor / organizador',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InstructorInput' } } },
        },
        responses: {
          201: { description: 'Instructor creado' },
          400: { description: 'Datos inválidos' },
        },
      },
    },
    '/instructores/{id}': {
      put: {
        tags: ['Instructores'],
        summary: 'Actualiza un instructor existente',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'I01' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InstructorInput' } } },
        },
        responses: { 200: { description: 'Instructor actualizado' } },
      },
      delete: {
        tags: ['Instructores'],
        summary: 'Elimina un instructor',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'I04' } }],
        responses: { 200: { description: 'Instructor eliminado' } },
      },
    },
    '/planes': {
      get: {
        tags: ['Planes'],
        summary: 'Lista el catálogo de planes de membresía',
        responses: { 200: { description: 'Lista de planes' } },
      },
      post: {
        tags: ['Planes'],
        summary: 'Crea un nuevo plan de membresía',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PlanInput' } } },
        },
        responses: { 201: { description: 'Plan creado' } },
      },
    },
    '/planes/{id}': {
      put: {
        tags: ['Planes'],
        summary: 'Edita un plan de membresía',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'P01' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PlanInput' } } },
        },
        responses: { 200: { description: 'Plan actualizado' } },
      },
      delete: {
        tags: ['Planes'],
        summary: 'Elimina un plan si no tiene membresías asociadas',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'P04' } }],
        responses: {
          200: { description: 'Plan eliminado' },
          409: { description: 'No se puede eliminar porque tiene membresías asociadas' },
        },
      },
    },
    '/actividades': {
      get: {
        tags: ['Actividades'],
        summary: 'Lista todas las actividades y eventos del club',
        responses: { 200: { description: 'Lista de actividades' } },
      },
      post: {
        tags: ['Actividades'],
        summary: 'Crea una nueva actividad o clase',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ActividadInput' } } },
        },
        responses: { 201: { description: 'Actividad creada' } },
      },
    },
    '/actividades/{id}': {
      put: {
        tags: ['Actividades'],
        summary: 'Actualiza una actividad existente',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'A02' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ActividadInput' } } },
        },
        responses: { 200: { description: 'Actividad actualizada' } },
      },
      delete: {
        tags: ['Actividades'],
        summary: 'Elimina una actividad',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'A04' } }],
        responses: { 200: { description: 'Actividad eliminada' } },
      },
    },
    '/membresias': {
      get: {
        tags: ['Membresías'],
        summary: 'Lista todas las membresías registradas',
        responses: { 200: { description: 'Lista de membresías' } },
      },
      post: {
        tags: ['Membresías'],
        summary: 'Da de alta una membresía y genera automáticamente su pago pendiente con comprobante',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MembresiaInput' } } },
        },
        responses: { 201: { description: 'Membresía y pago pendiente creados en transacción SQL' } },
      },
    },
    '/membresias/{id}/renovar': {
      post: {
        tags: ['Membresías'],
        summary: 'Renueva una membresía existente por la duración de su plan y genera nuevo pago pendiente',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'M003' } }],
        responses: { 201: { description: 'Membresía renovada' } },
      },
    },
    '/inscripciones': {
      get: {
        tags: ['Inscripciones'],
        summary: 'Lista las inscripciones de socios a actividades',
        responses: { 200: { description: 'Lista de inscripciones' } },
      },
      post: {
        tags: ['Inscripciones'],
        summary: 'Inscribe a un socio en una actividad validando membresía vigente, duplicidad y cupo disponible',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InscripcionInput' } } },
        },
        responses: {
          201: { description: 'Inscripción confirmada' },
          409: { description: 'El socio ya está inscrito en la actividad' },
          422: { description: 'Regla de negocio: Membresía vencida o cupo máximo alcanzado' },
        },
      },
    },
    '/inscripciones/{id}/estado': {
      patch: {
        tags: ['Inscripciones'],
        summary: 'Cambia el estado de una inscripción (confirmada, en_espera, cancelada)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'IN001' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { estado: { type: 'string', enum: ['confirmada', 'en_espera', 'cancelada'] } },
              },
            },
          },
        },
        responses: { 200: { description: 'Estado de inscripción actualizado' } },
      },
    },
    '/inscripciones/{id}': {
      delete: {
        tags: ['Inscripciones'],
        summary: 'Elimina una inscripción y libera el cupo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'IN001' } }],
        responses: { 200: { description: 'Inscripción eliminada' } },
      },
    },
    '/pagos': {
      get: {
        tags: ['Pagos'],
        summary: 'Lista todos los pagos y sus números de comprobante',
        responses: { 200: { description: 'Lista de pagos' } },
      },
      post: {
        tags: ['Pagos'],
        summary: 'Registra un nuevo pago manual emitiendo comprobante único',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PagoInput' } } },
        },
        responses: { 201: { description: 'Pago registrado con comprobante' } },
      },
    },
    '/pagos/{id}/pagar': {
      patch: {
        tags: ['Pagos'],
        summary: 'Marca un pago pendiente como pagado y actualiza su método de pago',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'PG003' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { metodo: { type: 'string', example: 'Transferencia' } } },
            },
          },
        },
        responses: { 200: { description: 'Pago confirmado' } },
      },
    },
    '/asistencias': {
      get: {
        tags: ['Asistencia y NoSQL (MongoDB)'],
        summary: 'Consulta los registros de acceso almacenados en MongoDB (access_logs)',
        parameters: [
          { name: 'fecha', in: 'query', required: false, schema: { type: 'string', example: '2026-11-05' } },
          {
            name: 'incluirRechazos',
            in: 'query',
            required: false,
            schema: { type: 'boolean', example: true },
            description: 'Si es true, incluye también intentos de check-in denegados',
          },
        ],
        responses: { 200: { description: 'Lista de documentos de acceso desde MongoDB' } },
      },
    },
    '/asistencias/checkin': {
      post: {
        tags: ['Asistencia y NoSQL (MongoDB)'],
        summary: 'Valida vigencia en PostgreSQL y persiste el evento de check-in (autorizado o denegado) en MongoDB',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckinInput' } } },
        },
        responses: {
          201: { description: 'Acceso autorizado y registrado en MongoDB' },
          404: { description: 'Socio no encontrado' },
          422: { description: 'Acceso denegado por membresía vencida (el intento fallido queda registrado en MongoDB)' },
        },
      },
    },
    '/bitacora': {
      get: {
        tags: ['Asistencia y NoSQL (MongoDB)'],
        summary: 'Consulta la bitácora documental de eventos operacionales en MongoDB (audit_events)',
        parameters: [
          { name: 'modulo', in: 'query', required: false, schema: { type: 'string', example: 'asistencia' } },
          { name: 'limite', in: 'query', required: false, schema: { type: 'integer', example: 50 } },
        ],
        responses: { 200: { description: 'Eventos de auditoría almacenados en MongoDB' } },
      },
    },
  },
}
