# Sistema de Gestión de Empleados

Sistema web para la gestión de empleados y solicitudes, desarrollado con React (frontend) y Express.js (backend).

## Estructura del Proyecto

```
employee-management/
├── backend/           # Servidor Express.js
├── frontend/         # Aplicación React
├── docker-compose.yml
└── README.md
```

## Requisitos Previos

- Node.js (v20.16.0 o superior)
- PostgreSQL (v14 o superior)
- Docker y Docker Compose (opcional)

## Configuración del Entorno

### Backend (.env)

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Servidor
JWT_SECRET=0ae34fb2c91d471980ebf8e4f9ad2e8e42c1f2f9b5d6a6c372915c8c739e8962
DB_PORT=5432
DATABASE_URL="postgresql://postgres.nptnzladqyqdtpocjovu:nj0Z0h0Bp2fszV73@aws-0-us-east-1.pooler.supabase.com:5432/postgres?connect_timeout=600&pgbouncer=true&options=-c%20search_path%3Dkonecta,public"
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdG56bGFkcXlxZHRwb2Nqb3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU5NzE5NSwiZXhwIjoyMDUzMTczMTk1fQ.PQN9mNPd0Eplwun1t9TGj2fFHz1Nmq0eiedccGWJmKc
NODE_ENV=development
```

### Base de Datos

Ejecuta el siguiente script SQL sólo si cambias la base de datos configurada en la aplicación. 
(La actual ya tiene las tablas creadas):

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('empleado', 'administrador')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_contratacion DATE NOT NULL,
    salario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE solicitudes (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER REFERENCES empleados(id),
    tipo_solicitud VARCHAR(50) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE empleados DROP CONSTRAINT empleados_usuario_id_fkey;
```

## Instalación y Ejecución

### Método 1: Instalación Local

1. **Backend**
```bash
cd backend
npm install
npm run dev
```

2. **Frontend**
```bash
cd frontend
npm install
npm start
```

### Método 2: Usando Docker

El proyecto incluye configuración para Docker. Cada componente (frontend y backend) tiene su propio Dockerfile, y existe un docker-compose.yml en la raíz del proyecto.

Para ejecutar la aplicación con Docker:

```bash
docker-compose up --build
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Ejecución de Tests

### Backend Tests
```bash
cd backend

# Ejecutar todos los tests
npm test

```

### Frontend Tests
```bash
cd frontend

# Ejecutar todos los tests
npm test

```

## Mejores Prácticas

### Arquitectura
- **Separación de Responsabilidades**: La aplicación sigue el patrón MVC en el backend y una arquitectura basada en componentes en el frontend.
- **Modularización**: Código organizado en módulos pequeños y reutilizables para mejor mantenibilidad.
- **DRY (Don't Repeat Yourself)**: Implementación de utilidades y componentes compartidos para evitar duplicación de código.

### Código
- **Convenciones de Nombrado**: Uso consistente de camelCase para variables/funciones y PascalCase para componentes React.
- **ESLint y Prettier**: Configurados para mantener un estilo de código consistente.

### Testing
- Tests unitarios para componentes y servicios
- Tests de integración para APIs
- Tests end-to-end para flujos críticos

## Seguridad

### Autenticación y Autorización
- **JWT**: Implementación de JSON Web Tokens para manejo seguro de sesiones.
- **Roles**: Sistema de permisos basado en roles (empleado/administrador).
- **Middleware de Autorización**: Verificación de permisos en cada endpoint protegido.

### Protección de Datos
- **Encriptación**: Passwords hasheados usando bcrypt.
- **Sanitización**: Validación y sanitización de inputs para prevenir XSS y SQL Injection.
- **Rate Limiting**: Implementación de límites de solicitudes para prevenir ataques de fuerza bruta.

### Seguridad en la Infraestructura
- **CORS**: Configuración apropiada de Cross-Origin Resource Sharing.
- **Helmet**: Implementación de headers de seguridad HTTP.
- **ENV Variables**: Gestión segura de secretos y configuraciones sensibles.
- **Logs**: Sistema de logging para auditoría y monitoreo de seguridad.

## Notas Adicionales

- El frontend se ejecuta en el puerto 3000 por defecto
- El backend se ejecuta en el puerto 4000 por defecto
- Asegúrate de que los puertos necesarios estén disponibles antes de ejecutar la aplicación
- Para detener los contenedores Docker, ejecuta: `docker-compose down`