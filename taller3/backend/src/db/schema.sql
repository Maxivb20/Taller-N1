-- Esquema PostgreSQL para ClubTrack (Entrega 3)

CREATE TABLE IF NOT EXISTS instructores (
  id VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(40) NOT NULL,
  bio TEXT DEFAULT '',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS socios (
  id VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(40) NOT NULL,
  fecha_ingreso DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planes (
  id VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT '',
  precio INTEGER NOT NULL CHECK (precio > 0),
  duracion_dias INTEGER NOT NULL CHECK (duracion_dias > 0),
  actividades JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS actividades (
  id VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(60) NOT NULL DEFAULT 'Fitness',
  instructor_id VARCHAR(20) REFERENCES instructores(id) ON DELETE SET NULL,
  instructor VARCHAR(120) NOT NULL DEFAULT 'Staff de sala',
  horario VARCHAR(120) NOT NULL,
  ubicacion VARCHAR(100) NOT NULL DEFAULT 'Sala Principal',
  cupo INTEGER NOT NULL CHECK (cupo > 0),
  exterior BOOLEAN NOT NULL DEFAULT FALSE,
  publicada BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS membresias (
  id VARCHAR(20) PRIMARY KEY,
  socio_id VARCHAR(20) NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  plan_id VARCHAR(20) NOT NULL REFERENCES planes(id) ON DELETE RESTRICT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  actividad_preferida VARCHAR(20) REFERENCES actividades(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_fechas_membresia CHECK (fecha_fin >= fecha_inicio)
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id VARCHAR(20) PRIMARY KEY,
  socio_id VARCHAR(20) NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  actividad_id VARCHAR(20) NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  fecha_inscripcion DATE NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'en_espera', 'cancelada')),
  notas TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pagos (
  id VARCHAR(20) PRIMARY KEY,
  socio_id VARCHAR(20) NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  membresia_id VARCHAR(20) REFERENCES membresias(id) ON DELETE SET NULL,
  monto INTEGER NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL,
  metodo VARCHAR(40) NOT NULL DEFAULT '—',
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
  comprobante VARCHAR(40) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_membresias_socio ON membresias(socio_id);
CREATE INDEX IF NOT EXISTS idx_pagos_socio ON pagos(socio_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_actividad ON inscripciones(actividad_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_socio ON inscripciones(socio_id);
