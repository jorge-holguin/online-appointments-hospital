# 🏥 Sistema de Reserva de Citas Online

Sistema web para la solicitud de citas médicas en línea con integración a servicios externos.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Sistema de Logging](#-sistema-de-logging)
- [Flujos de Usuario](#-flujos-de-usuario)
- [API Endpoints](#-api-endpoints)
- [Seguridad](#-seguridad)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)

## ✨ Características

### Funcionalidades Principales
- ✅ **Registro de Pacientes** con validación de datos
- ✅ **Selección de Especialidades** médicas disponibles
- ✅ **Búsqueda de Doctores** por especialidad
- ✅ **Calendario de Disponibilidad** con horarios en tiempo real
- ✅ **Confirmación de Citas** con código de reserva
- ✅ **Soporte para SIS y Pagantes** con flujos diferenciados
- ✅ **Subida de Archivos** para referencias SIS
- ✅ **Sistema de Logging** con Pino para auditoría

### UX/UI Mejorado
- 🎨 Diseño moderno y responsive
- 🎨 Modales con animaciones suaves
- 🎨 Grid de especialidades con iconos
- 🎨 Calendario visual de disponibilidad
- 🎨 Estados de carga y error informativos
- 🎨 Feedback visual en cada paso

## 🛠️ Tecnologías

- **Framework**: Next.js 14.2.16 (React 18)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS 4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **Iconos**: Lucide React
- **Fechas**: date-fns 4.1.0
- **Logging**: Pino 9.5.0 + Pino Pretty
- **Validación**: Zod + React Hook Form
- **Sanitización**: DOMPurify

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o pnpm

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd S038-SistemaExternalServices-Frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local`:
```env
NEXT_PUBLIC_API_APP_CITAS_URL=https://api.example.com
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Configuración de Fechas (`/public/app-config.json`)

El sistema usa un archivo JSON centralizado para gestionar las fechas de disponibilidad:

```json
{
  "dateRange": {
    "startDate": "2025-08-01",
    "endDate": "2025-08-31"
  }
}
```

**Características:**
- ✅ Modificable sin reconstruir la aplicación
- ✅ Una sola llamada HTTP con caché automático
- ✅ Puede ser servido dinámicamente por el backend
- ✅ Valores por defecto si falla la carga

**Para cambiar las fechas:**
1. Edita `/public/app-config.json`
2. Recarga la aplicación
3. Los cambios se aplican inmediatamente

### Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_APP_CITAS_URL` | URL base de la API de citas | ✅ Sí |
| `LOG_LEVEL` | Nivel de logging (info, debug, warn, error) | ❌ No (default: info) |

## 📁 Estructura del Proyecto

```
S038-SistemaExternalServices-Frontend/
├── app/                          # App Router de Next.js
│   ├── page.tsx                  # Página principal
│   └── layout.tsx                # Layout global
├── components/                   # Componentes React
│   ├── ui/                       # Componentes UI base (shadcn)
│   ├── patient-registration-modal.tsx
│   ├── specialty-selection-modal.tsx
│   ├── doctor-selection-modal.tsx
│   ├── date-time-selection-modal.tsx
│   ├── confirmation-modal.tsx
│   └── final-confirmation-modal.tsx
├── hooks/                        # Custom hooks
│   └── use-app-config.ts         # Hook para configuración
├── lib/                          # Utilidades
│   ├── logger.ts                 # Sistema de logging con Pino
│   ├── navigation.ts             # Helpers de navegación
│   └── appointment-utils.ts      # Utilidades de citas
├── context/                      # React Context
│   └── date-context.tsx          # Contexto de fechas (legacy)
├── public/                       # Archivos estáticos
│   ├── app-config.json           # ⚠️ Configuración centralizada
│   └── ...
├── styles/                       # Estilos globales
└── types/                        # Definiciones de tipos TypeScript
```

## 📊 Sistema de Logging

El proyecto usa **Pino** para logging estructurado de alto rendimiento.

### Eventos Registrados

| Evento | Descripción | Cuándo |
|--------|-------------|--------|
| `BOOKING_ATTEMPT` | Intento de reserva | Al confirmar cita |
| `BOOKING_SUCCESS` | Reserva exitosa | Cuando la API responde OK |
| `BOOKING_ERROR` | Error en reserva | Cuando falla la reserva |
| `FILE_UPLOAD_START` | Inicio subida archivo | Al subir referencia SIS |
| `FILE_UPLOAD_SUCCESS` | Archivo subido | Cuando se sube correctamente |
| `API_ERROR` | Error de API | Cuando falla una llamada |

### Ejemplo de Log

**Reserva Exitosa:**
```
[INFO] Reserva exitosa
  event: "BOOKING_SUCCESS"
  patientId: "12345678"
  patientName: "Juan Pérez"
  specialty: "Cardiología"
  doctor: "Dr. García"
  appointmentId: "CITA-2025-001"
  date: "2025-08-15"
  time: "10:00"
```

**Error:**
```
[ERROR] Error en reserva: Error al enviar la solicitud: 500
  event: "BOOKING_ERROR"
  step: "CONFIRMATION"
  error: "Error al enviar la solicitud: 500"
  stack: "Error: ..."
```

### Uso en Código

```typescript
import { logSuccessfulBooking, logBookingError } from '@/lib/logger'

// Log de éxito
logSuccessfulBooking({
  patientId: "12345678",
  patientName: "Juan Pérez",
  specialty: "Cardiología",
  // ...
})

// Log de error
logBookingError(error, {
  step: 'CONFIRMATION',
  patientId: "12345678",
  // ...
})
```

## 🔄 Flujos de Usuario

### 1. Flujo Principal de Reserva

```
Inicio
  ↓
Registro de Paciente
  ├─ Tipo de Documento
  ├─ Número de Documento
  ├─ Nombre Completo
  ├─ Teléfono
  ├─ Email
  └─ Tipo de Atención (SIS/Pagante)
  ↓
Selección de Especialidad
  ├─ Búsqueda
  └─ Grid de especialidades
  ↓
Tipo de Búsqueda
  ├─ Por Doctor
  └─ Por Rango de Fechas
  ↓
Selección de Doctor (si aplica)
  ↓
Selección de Fecha y Hora
  ├─ Calendario de disponibilidad
  ├─ Turno (Mañana/Tarde)
  └─ Horarios disponibles
  ↓
Confirmación
  ├─ Revisión de datos
  └─ Confirmación final
  ↓
Código de Reserva
```

### 2. Flujo SIS (Sistema Integral de Salud)

Para pacientes SIS se requiere:
1. Verificación de afiliación SIS
2. Subida de archivo de referencia (PDF/Imagen)
3. Validación del archivo
4. Confirmación de cita

### 3. Flujo Pagante

Para pacientes pagantes:
1. Registro directo
2. Selección de especialidad y doctor
3. Confirmación de cita

## 🔌 API Endpoints

### Base URL
```
${NEXT_PUBLIC_API_APP_CITAS_URL}
```

### Endpoints Utilizados

#### 1. Obtener Especialidades
```
GET /v1/app-citas/especialidades?fechaInicio={start}&fechaFin={end}
```

#### 2. Obtener Doctores
```
GET /v1/app-citas/medicos?fechaInicio={start}&fechaFin={end}&idEspecialidad={id}
```

#### 3. Obtener Citas Disponibles
```
GET /v1/app-citas/citas?fechaInicio={start}&fechaFin={end}&medicoId={id}&turnoConsulta={M|T}
```

#### 4. Crear Solicitud de Cita
```
POST /v1/solicitudes
Content-Type: application/json

{
  "tipoDocumento": "D  ",
  "numeroDocumento": "12345678",
  "citaId": "CITA-001",
  "consultorio": "205",
  "nombres": "Juan Pérez",
  "celular": "987654321",
  "correo": "juan@example.com",
  "especialidad": "0001",
  "especialidadNombre": "Cardiología",
  "medico": "MED-001",
  "medicoNombre": "Dr. García",
  "fecha": "2025-08-15",
  "hora": "10:00",
  "turno": "M",
  "tipoAtencion": "PAGANTE"
}
```

#### 5. Subir Archivo de Referencia SIS
```
POST /v1/solicitudes/{codigo}/archivo
Content-Type: multipart/form-data

file: [archivo]
```

## 🔒 Seguridad

### Medidas Implementadas

1. **Sanitización de Inputs**
   - DOMPurify para prevenir XSS
   - Validación de tipos de documento
   - Normalización de emails y teléfonos

2. **Validación de Archivos**
   - Tipos permitidos: PDF, JPG, JPEG, PNG
   - Tamaño máximo: 5MB
   - Validación en cliente y servidor

3. **Protección de Datos**
   - No se registran datos sensibles en logs
   - Solo IDs y nombres para auditoría
   - Cumplimiento con políticas de privacidad

4. **Prevención de Console Injection**
   - Bloqueador de consola en producción
   - Protección contra manipulación del DOM

### Variables Sensibles

⚠️ **NUNCA** commitear:
- Archivos `.env` o `.env.local`
- Tokens de API
- Credenciales de base de datos

## 🚀 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run start        # Inicia servidor de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint
```

### Agregar Logging a Nuevos Componentes

```typescript
import { logEvent, logApiError } from '@/lib/logger'

// Log de evento
logEvent('SPECIALTY_SELECTED', { 
  specialtyId: specialty.id,
  specialtyName: specialty.name 
})

// Log de error de API
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) throw new Error('API Error')
} catch (error) {
  logApiError('/api/endpoint', error, { requestData })
}
```

### Extender Configuración

Para agregar más campos al config:

1. Edita `/public/app-config.json`:
```json
{
  "dateRange": { ... },
  "newField": "value"
}
```

2. Actualiza la interfaz en `/hooks/use-app-config.ts`:
```typescript
interface AppConfig {
  dateRange: { ... }
  newField: string
}
```

## 📦 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Docker

```bash
# Construir imagen
docker build -t reserva-citas .

# Ejecutar contenedor
docker run -p 3000:3000 -e NEXT_PUBLIC_API_APP_CITAS_URL=https://api.example.com reserva-citas
```

### Build Manual

```bash
npm run build
npm run start
```

## 📈 Métricas y Análisis

Con los logs de Pino puedes rastrear:

1. **Tasa de conversión**: BOOKING_ATTEMPT vs BOOKING_SUCCESS
2. **Errores más comunes**: Agrupar por mensaje de error
3. **Especialidades populares**: Contar por specialty
4. **Horarios más demandados**: Analizar date y time
5. **Problemas con archivos**: Rastrear FILE_UPLOAD_ERROR

### Integración con Servicios de Logging

Los logs en formato JSON se pueden enviar a:
- **Datadog**: Monitoreo en tiempo real
- **CloudWatch**: Si usas AWS
- **Elasticsearch**: Búsquedas avanzadas
- **Grafana Loki**: Visualización

## 🐛 Troubleshooting

### Error: "Cannot find module 'pino'"

```bash
npm install pino pino-pretty
```

### Error: 404 en app-config.json

Verifica que el archivo esté en `/public/app-config.json` (no en `/config`)

### Múltiples llamadas al config

El hook `use-app-config` implementa caché automático. Si ves múltiples llamadas, verifica que estés usando la última versión del hook.

### Errores de CORS

Configura los headers CORS en tu API backend para permitir el origen de tu frontend.

## 📝 Notas Importantes

- ✅ El archivo de configuración **DEBE** estar en `/public/app-config.json`
- ✅ Solo se hace **1 llamada HTTP** al config gracias al sistema de caché
- ✅ Los logs NO incluyen información sensible
- ✅ Todos los componentes tienen valores por defecto si falla la configuración

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📞 Soporte

Para soporte técnico o consultas, contacta al equipo de desarrollo.

---

**Última actualización**: Octubre 2025
**Versión**: 1.0.0
