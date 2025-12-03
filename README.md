# 🏥 Sistema de Reserva de Citas Online - Hospital José Agurto Tello

Sistema web para la solicitud de citas médicas en línea con integración a servicios externos del Hospital José Agurto Tello de Chosica.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Arquitectura de Componentes](#-arquitectura-de-componentes)
- [Sistema de Contextos](#-sistema-de-contextos)
- [Hooks Personalizados](#-hooks-personalizados)
- [Utilidades (lib/)](#-utilidades-lib)
- [Sistema de Tipos](#-sistema-de-tipos)
- [Sistema de Logging](#-sistema-de-logging)
- [Flujos de Usuario](#-flujos-de-usuario)
- [Chatbot Asistente Virtual](#-chatbot-asistente-virtual)
- [API Endpoints](#-api-endpoints)
- [Seguridad](#-seguridad)
- [Desarrollo](#-desarrollo)
- [Guía de Modificación](#-guía-de-modificación)
- [Despliegue](#-despliegue)

## ✨ Características

### Funcionalidades Principales
- ✅ **Registro de Pacientes** con validación de datos usando Zod
- ✅ **Selección de Especialidades** médicas disponibles
- ✅ **Búsqueda de Doctores** por especialidad
- ✅ **Calendario de Disponibilidad** con horarios en tiempo real
- ✅ **Confirmación de Citas** con código de reserva
- ✅ **Soporte para SIS, SOAT y Pagantes** con flujos diferenciados
- ✅ **Subida de Archivos** para referencias SIS
- ✅ **Sistema de Logging** con Pino para auditoría
- ✅ **Chatbot Asistente Virtual** para solicitud de citas conversacional
- ✅ **Sesiones Efímeras** con temporizador de 10 minutos
- ✅ **Consulta de Estado de Solicitudes** por código de reserva

### UX/UI Mejorado
- 🎨 Diseño moderno y responsive
- 🎨 Modales con animaciones suaves
- 🎨 Grid de especialidades con iconos
- 🎨 Calendario visual de disponibilidad
- 🎨 Estados de carga y error informativos
- 🎨 Feedback visual en cada paso
- 🎨 Mascota animada (lobo) para el chatbot
- 🎨 CAPTCHA visual para seguridad

## 🛠️ Tecnologías

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Framework** | Next.js (App Router) | 14.2.16 |
| **Lenguaje** | TypeScript | 5.x |
| **Estilos** | TailwindCSS | 4.1.9 |
| **UI Components** | Radix UI + shadcn/ui | Múltiples |
| **Iconos** | Lucide React | 0.454.0 |
| **Fechas** | date-fns | 4.1.0 |
| **Logging** | Pino + Pino Pretty | 9.5.0 |
| **Validación** | Zod | 3.25.67 |
| **Formularios** | React Hook Form | 7.60.0 |
| **Sanitización** | DOMPurify | 3.2.7 |
| **CAPTCHA** | react-simple-captcha | 9.3.1 |
| **Fuentes** | Geist (Sans + Mono) | 1.3.1 |

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

### Configuración de Fechas

El sistema utiliza un **Centro Único de Configuración de Fechas** ubicado en `hooks/use-app-config.ts`.

Este hook centraliza toda la lógica para:
1. Definir si se usa modo de pruebas o producción
2. Calcular rangos de fechas dinámicos (ej: hoy hasta fin del próximo mes)
3. Bloquear visualmente fechas pasadas

**Para modificar las fechas:**

Editar `hooks/use-app-config.ts`:

```typescript
// ------------------------------------------------------
// CENTRO ÚNICO DE CONFIGURACIÓN DE FECHAS
// ------------------------------------------------------

// true = usar fechas fijas de prueba
// false = usar fechas dinámicas (hoy hasta mes siguiente)
const USE_TEST_DATES = false 

// Fechas de prueba (solo si USE_TEST_DATES = true)
const TEST_START_DATE = '2025-10-01'
const TEST_END_DATE = '2025-10-31'

// Bloqueo visual de fechas pasadas
export const BLOCK_PAST_DATES = true
```

**Características:**
- ✅ Lógica centralizada en un solo archivo
- ✅ Modo de pruebas (`USE_TEST_DATES = true`) para desarrollo
- ✅ Cálculo automático de fechas en producción
- ✅ Control de bloqueo visual de días pasados


### Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_APP_CITAS_URL` | URL base de la API de citas | ✅ Sí |

## 📁 Estructura del Proyecto

```
hospital-appointment-system/
├── app/                              # App Router de Next.js
│   ├── page.tsx                      # Página principal (HomePage)
│   ├── layout.tsx                    # Layout global con providers
│   ├── globals.css                   # Estilos globales TailwindCSS
│   ├── loading.tsx                   # Componente de carga
│   ├── [code]/                       # Ruta dinámica para códigos
│   ├── api/                          # API Routes
│   │   └── chatbot/                  # Endpoints del chatbot
│   └── chat/                         # Página del chatbot
│
├── components/                       # Componentes React
│   ├── ui/                           # 52 componentes UI base (shadcn/ui)
│   ├── chatbot/                      # Sistema de chatbot (14 archivos)
│   ├── security/                     # Componentes de seguridad
│   │
│   │ # Modales del flujo principal de citas:
│   ├── patient-registration-modal.tsx      # Paso 1: Registro de paciente
│   ├── sis-verification-modal.tsx          # Paso 2: Verificación SIS/Pagante
│   ├── specialty-selection-modal.tsx       # Paso 3: Selección de especialidad
│   ├── search-type-selection-modal.tsx     # Paso 4: Tipo de búsqueda
│   ├── doctor-selection-modal.tsx          # Paso 5a: Selección de doctor
│   ├── date-time-selection-modal.tsx       # Paso 5b: Selección fecha/hora (por doctor)
│   ├── date-time-range-selection-modal.tsx # Paso 5b: Selección fecha/hora (por rango)
│   ├── appointment-selection-modal.tsx     # Paso 6: Selección de cita disponible
│   ├── confirmation-modal.tsx              # Paso 7: Confirmación de datos
│   ├── final-confirmation-modal.tsx        # Paso 8: Código de reserva
│   │
│   │ # Modales auxiliares:
│   ├── appointment-lookup-modal.tsx        # Consulta de solicitud existente
│   ├── appointment-type-modal.tsx          # Tipo de cita (CITADO/INTERCONSULTA)
│   ├── appointment-unavailable-modal.tsx   # Error: cita no disponible
│   ├── duplicate-appointment-error-modal.tsx # Error: cita duplicada
│   │
│   │ # Otros componentes:
│   ├── session-timer.tsx                   # Temporizador de sesión
│   └── theme-provider.tsx                  # Proveedor de tema
│
├── hooks/                            # Custom hooks
│   ├── use-app-config.ts             # ⭐ Configuración centralizada de fechas
│   ├── use-mobile.ts                 # Detección de dispositivo móvil
│   └── use-toast.ts                  # Sistema de notificaciones toast
│
├── lib/                              # Utilidades y helpers
│   ├── logger.ts                     # Sistema de logging con Pino
│   ├── validation.ts                 # Validación con Zod
│   ├── sanitize.ts                   # Sanitización con DOMPurify
│   ├── hospital-utils.ts             # ⭐ Lógica de ubicaciones del hospital
│   ├── appointment-utils.ts          # Utilidades de citas
│   ├── navigation.ts                 # Helpers de navegación
│   ├── accessibility-utils.ts        # Utilidades de accesibilidad
│   └── utils.ts                      # Utilidades generales (cn)
│
├── context/                          # React Context
│   ├── session-context.tsx           # ⭐ Contexto de sesión efímera
│   └── date-context.tsx              # Contexto de fechas (legacy)
│
├── types/                            # Definiciones TypeScript
│   ├── chatbot.ts                    # Tipos del chatbot
│   └── react-simple-captcha.d.ts     # Declaraciones de tipos
│
├── public/                           # Archivos estáticos
│   ├── app-config.json               # ⚠️ Configuración de fechas
│   ├── hospital-logo.png             # Logo del hospital
│   ├── lobo.png                      # Mascota del chatbot
│   ├── lobo-completo1.png            # Animación lobo frame 1
│   ├── lobo-completo2.png            # Animación lobo frame 2
│   ├── programacion.jpg              # Imagen de programación mensual
│   └── js/                           # Scripts de seguridad
│       ├── console-blocker.js        # Bloqueador de consola
│       └── passive-events.js         # Eventos pasivos
│
├── middleware.ts                     # Middleware de seguridad
├── next.config.mjs                   # Configuración de Next.js
├── components.json                   # Configuración de shadcn/ui
└── tsconfig.json                     # Configuración de TypeScript
```

---

## 🧩 Arquitectura de Componentes

### Componentes del Flujo Principal

El flujo de solicitud de citas se maneja mediante una cadena de modales que se abren secuencialmente:

#### 1. `patient-registration-modal.tsx`
**Propósito**: Primer paso del flujo - registro de datos del paciente.

```typescript
interface PatientRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Funcionalidades**:
- Formulario con campos: nombre, teléfono, tipo documento, número documento, email
- Validación con Zod (`validatePatientData`)
- CAPTCHA visual con `react-simple-captcha`
- Carga dinámica de tipos de documento desde API
- Sanitización de inputs en tiempo real
- Inicia sesión efímera al completar

**Dependencias clave**:
- `@/lib/validation` - Validación de datos
- `@/context/session-context` - Manejo de sesión
- `react-simple-captcha` - Verificación CAPTCHA

---

#### 2. `sis-verification-modal.tsx`
**Propósito**: Verificar tipo de atención (SIS/SOAT/Pagante).

**Funcionalidades**:
- Selección de tipo de paciente
- Para SIS: subida de archivo de referencia
- Validación de archivos (PDF, JPG, PNG - máx 5MB)
- Enlace a verificación SIS en línea

---

#### 3. `specialty-selection-modal.tsx`
**Propósito**: Selección de especialidad médica.

```typescript
interface Specialty {
  idEspecialidad: string
  nombre: string
}
```

**Funcionalidades**:
- Carga de especialidades desde API
- Búsqueda/filtrado en tiempo real
- Grid visual de especialidades
- Usa `useAppConfig` para fechas

---

#### 4. `search-type-selection-modal.tsx`
**Propósito**: Elegir método de búsqueda de citas.

**Opciones**:
- **Por Doctor**: Primero selecciona doctor, luego fecha/hora
- **Por Fecha**: Primero selecciona fecha/hora, luego doctor disponible

---

#### 5a. `doctor-selection-modal.tsx`
**Propósito**: Selección de médico por especialidad.

**Funcionalidades**:
- Lista de médicos disponibles
- Filtrado por especialidad seleccionada
- Muestra disponibilidad del médico

---

#### 5b. `date-time-selection-modal.tsx` / `date-time-range-selection-modal.tsx`
**Propósito**: Selección de fecha y hora de la cita.

**Funcionalidades**:
- Calendario visual con `react-day-picker`
- Selección de turno (Mañana/Tarde)
- Horarios disponibles en tiempo real
- Bloqueo de fechas pasadas (configurable)
- Usa `getEffectiveDateRangeForDates` para rangos

---

#### 6. `confirmation-modal.tsx`
**Propósito**: Revisión y confirmación de datos antes de enviar.

```typescript
interface ConfirmationModalProps {
  appointmentData: {
    patient: any
    specialty: string
    specialtyName?: string
    doctor: any
    dateTime: any
    tipoAtencion?: string
    idCita?: string
    consultorio?: string
    lugar?: string  // "1" = Sede Central, "2" = Consultorios Externos
  }
}
```

**Funcionalidades**:
- Resumen de todos los datos
- Campo de observaciones (máx 100 caracteres)
- Envío de solicitud a API
- Manejo de errores (duplicados, no disponible)
- Subida de archivo SIS si aplica

---

#### 7. `final-confirmation-modal.tsx`
**Propósito**: Mostrar código de reserva y confirmación final.

**Funcionalidades**:
- Muestra código de reserva
- Botón para copiar código
- Información de ubicación del hospital
- Botón para volver al inicio

---

### Componentes del Chatbot

Ubicados en `/components/chatbot/`:

| Archivo | Descripción |
|---------|-------------|
| `chatbot-controller.tsx` | ⭐ Controlador principal del flujo conversacional |
| `chat-launcher.tsx` | Botón flotante para abrir el chat |
| `message-renderers.tsx` | Renderizado de diferentes tipos de mensajes |
| `chat-form-field.tsx` | Campos de formulario en el chat |
| `chat-message-options.tsx` | Botones de opciones en mensajes |
| `chat-faq.tsx` | Preguntas frecuentes |
| `date-time-calendar-selector.tsx` | Selector de fecha/hora en chat |
| `chatbot-session-timer.tsx` | Temporizador de sesión en chat |
| `index.ts` | Exportaciones del módulo |

---

### Componentes UI Base (shadcn/ui)

Ubicados en `/components/ui/`, incluyen:

- **Formularios**: `input`, `select`, `checkbox`, `radio-group`, `textarea`, `form`
- **Feedback**: `toast`, `alert`, `progress`, `skeleton`
- **Navegación**: `tabs`, `accordion`, `navigation-menu`, `breadcrumb`
- **Overlay**: `dialog`, `sheet`, `popover`, `tooltip`, `dropdown-menu`
- **Layout**: `card`, `separator`, `scroll-area`, `resizable`
- **Datos**: `table`, `calendar`, `chart`

---

## 🔄 Sistema de Contextos

### `session-context.tsx`

Maneja sesiones efímeras de 10 minutos para seguridad.

```typescript
interface SessionContextType {
  token: string | null              // Token de sesión
  isSessionActive: boolean          // Estado de la sesión
  startSession: (token: string) => void
  endSession: () => void
  refreshSession: () => Promise<void>  // Renueva sesión con API
  setOnSessionExpired: (callback: () => void) => void
}

// Hook para tiempo restante (solo para SessionTimer)
interface SessionTimerContextType {
  timeRemaining: number  // Segundos restantes
}
```

**Uso**:
```typescript
import { useSession, useSessionTimer } from '@/context/session-context'

// En componentes que necesitan la sesión
const { token, refreshSession, setOnSessionExpired } = useSession()

// Solo en el componente SessionTimer
const { timeRemaining } = useSessionTimer()
```

**Características**:
- Duración: 10 minutos (`SESSION_DURATION = 10 * 60`)
- Usa `requestAnimationFrame` para el contador
- Callback configurable al expirar
- Separación de contextos para evitar re-renders innecesarios

---

### `date-context.tsx` (Legacy)

Contexto antiguo para fechas. **Usar `useAppConfig` en su lugar**.

---

## 🪝 Hooks Personalizados

### `use-app-config.ts`

**⭐ CENTRO ÚNICO DE CONFIGURACIÓN DE FECHAS**

```typescript
// Configuración principal
const USE_TEST_DATES = false  // true para modo pruebas
const TEST_START_DATE = '2025-10-01'
const TEST_END_DATE = '2025-10-31'
export const BLOCK_PAST_DATES = true  // Bloquear fechas pasadas

// Hook principal
export function useAppConfig() {
  return { config, loading, error }
}

// Helpers para rangos de fechas
export function getEffectiveDateRangeForDates(...)  // Para consultas de fechas
export function getEffectiveDateRangeForDoctors(...) // Para consultas de médicos
export function isDateBlocked(date: Date): boolean   // Verificar si fecha está bloqueada
```

**Uso**:
```typescript
import { useAppConfig, getEffectiveDateRangeForDates, BLOCK_PAST_DATES } from '@/hooks/use-app-config'

const { config, loading } = useAppConfig()
const startDate = config?.dateRange.startDate
const endDate = config?.dateRange.endDate
```

**Modos de operación**:
1. **Modo Producción** (`USE_TEST_DATES = false`): Fechas dinámicas basadas en fecha actual
2. **Modo Pruebas** (`USE_TEST_DATES = true`): Fechas fijas para testing

---

### `use-mobile.ts`

Detecta si el dispositivo es móvil.

```typescript
export function useMobile(): boolean
```

---

### `use-toast.ts`

Sistema de notificaciones toast.

```typescript
const { toast } = useToast()
toast({ title: "Éxito", description: "Operación completada" })
```

---

## 🛠️ Utilidades (lib/)

### `hospital-utils.ts`

**⭐ Lógica centralizada de ubicaciones del hospital**

```typescript
// Obtener dirección según código de lugar
export function getHospitalAddress(lugar?: string | null): string | null
// Reglas:
// - "0" → null (no mostrar)
// - "1" → "Jr. Arequipa N° 214 - Sede Central"
// - "2" o cualquier otro → "Jr. Cuzco 339 - Consultorios Externos"

// Obtener nombre de ubicación
export function getHospitalLocationName(lugar?: string | null): string | null
// - "1" → "Sede Central Hospital Chosica"
// - "2" → "Consultorios Externos HJATCH"

// Obtener etiqueta de consultorio
export function getConsultorioLabel(lugar?: string | null, consultorio?: string | null): string | null
// - lugar "2" → "Consultorio Externo: {número}"
// - otros → "Consultorio: {número}"
```

---

### `validation.ts`

Validación y sanitización con Zod.

```typescript
// Esquema de validación
export const patientValidationSchema = z.object({
  fullName: z.string().min(2).max(100).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  phone: z.string().length(9).regex(/^9\d{8}$/),  // Celular peruano
  documento: z.string().min(8).max(15).regex(/^\d+$/),
  email: z.string().email().max(100),
  tipoDocumento: z.string().min(1),
  digitoVerificador: z.string().optional()
})

// Funciones de sanitización
export const sanitizeInput = (input: string): string
export const sanitizeName = (input: string): string  // Preserva espacios
export const normalizePhone = (phone: string): string
export const normalizeEmail = (email: string): string

// Validar datos del paciente
export const validatePatientData = (data: any) => {
  return { success: boolean, data: PatientFormData | null, errors: Record<string, string> | null }
}

// Mensajes de error seguros
export const getSecureErrorMessage = (error: any): string
```

---

### `sanitize.ts`

Sanitización HTML con DOMPurify.

```typescript
// Sanitizar HTML
export const sanitizeHTML = (html: string): string

// Componente React para HTML seguro
export const SafeHTML: React.FC<{ html: string; className?: string }>

// Escapar caracteres HTML
export const escapeHTML = (text: string): string

// Validar URL segura
export const isSafeURL = (url: string): boolean
```

---

### `appointment-utils.ts`

Utilidades para manejo de citas.

```typescript
export type PatientType = 'SIS' | 'SOAT' | 'PAGANTE'
export type ShiftType = 'M' | 'T'  // Mañana / Tarde

// Mapear tipo de paciente para API
export function mapPatientTypeToApiFormat(patientType?: string): PatientType

// Determinar turno por hora
export function getShiftFromTime(time: string): ShiftType
// < 14:00 = 'M', >= 14:00 = 'T'

// Formatear fecha para API
export function formatDateForApi(date: string | Date): string  // YYYY-MM-DD
```

---

### `logger.ts`

Sistema de logging con Pino.

```typescript
// Logger principal
export const logger = isClient ? browserLogger : serverLogger

// Helpers específicos
export const logSuccessfulBooking = (data: {...}) => void
export const logBookingError = (error: Error, context: {...}) => void
export const logApiError = (endpoint: string, error: Error, requestData?: any) => void
export const logEvent = (eventName: string, data?: any) => void
export const logWarning = (message: string, data?: any) => void
```

---

### `navigation.ts`

Helpers de navegación.

```typescript
export function goToHomePage(delay?: number): void
```

---

## 📝 Sistema de Tipos

### `types/chatbot.ts`

```typescript
// Tipos de mensaje
export type MessageSender = "user" | "bot"
export type MessageType = "text" | "options" | "form" | "component" | 
                          "calendar" | "doctor-list" | "specialty-list" | 
                          "summary" | "confirmation"

// Estructura de mensaje
export interface Message {
  id: string
  content: string
  sender: MessageSender
  timestamp: Date
  type?: MessageType
  data?: any
}

// Pasos del flujo del chatbot
export type FlowStep =
  | "greeting"
  | "requesting-data"
  | "collecting-personal-info"
  | "selecting-patient-type"
  | "selecting-appointment-type"
  | "selecting-specialty"
  | "selecting-search-method"
  | "selecting-doctor"
  | "selecting-shift"
  | "selecting-datetime"
  | "selecting-doctor-after-datetime"
  | "showing-summary"
  | "requesting-observations"
  | "final-confirmation"
  | "appointment-confirmed"
  | "error"

// Datos del paciente
export interface PatientData {
  fullName: string
  phone: string
  tipoDocumento: string
  documento: string
  digitoVerificador?: string
  email: string
  patientType?: "PAGANTE" | "SIS" | "SOAT"
  tipoCita?: "CITADO" | "INTERCONSULTA" | "TRAMITE"
  especialidadInterconsulta?: string
}

// Datos de la cita
export interface AppointmentData {
  specialty: string
  specialtyName: string
  doctor?: { nombre: string; medicoId: string }
  dateTime?: { date: string; time: string; day: string; displayDate: string }
  shift?: "M" | "T"
  searchMethod?: "doctor" | "datetime"
  consultorio?: string
  lugar?: string
  idCita?: string
  observaciones?: string
}

// FAQs predefinidas
export const PATIENT_TYPE_FAQ: Record<string, FAQ>
export const APPOINTMENT_TYPE_FAQ: Record<string, FAQ>
```

---

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

---

## 🤖 Chatbot Asistente Virtual

El sistema incluye un chatbot conversacional ubicado en `/components/chatbot/`.

### Arquitectura del Chatbot

```
ChatLauncher (Botón flotante)
    ↓
ChatbotController (Controlador de flujo)
    ├── Manejo de estados (FlowStep)
    ├── Procesamiento de mensajes
    ├── Llamadas a API
    └── Renderizado de mensajes
        ├── MessageRenderers (Tipos de mensaje)
        ├── ChatFormField (Formularios)
        ├── ChatMessageOptions (Botones)
        └── DateTimeCalendarSelector (Calendario)
```

### Estados del Flujo (`FlowStep`)

```
greeting → requesting-data → selecting-patient-type → selecting-appointment-type
    ↓
selecting-specialty → selecting-search-method
    ↓                       ↓
selecting-doctor    selecting-datetime
    ↓                       ↓
selecting-datetime  selecting-doctor-after-datetime
    ↓                       ↓
    └───────────────────────┘
              ↓
    showing-summary → requesting-observations → final-confirmation
              ↓
    appointment-confirmed
```

### Tipos de Mensajes

| Tipo | Descripción | Renderizador |
|------|-------------|--------------|
| `text` | Mensaje de texto simple | Texto plano |
| `options` | Botones de selección | `ChatMessageOptions` |
| `form` | Formulario interactivo | `ChatFormField` |
| `specialty-list` | Lista de especialidades | Grid de especialidades |
| `doctor-list` | Lista de médicos | Lista con selección |
| `datetime-selector` | Selector de fecha/hora | `DateTimeCalendarSelector` |
| `summary` | Resumen de cita | Tarjeta de resumen |

### Personalización del Chatbot

**Cambiar la mascota**:
```typescript
// En app/page.tsx
<ChatLauncher 
  avatarUrl="/lobo.png"           // Cambiar imagen
  text="Pregúntale al Asistente"  // Cambiar texto
  position="right"                 // "left" o "right"
/>
```

**Modificar mensajes del bot**:
Editar `chatbot-controller.tsx`, función `sendBotMessage()`.

**Agregar nuevos pasos**:
1. Agregar nuevo valor a `FlowStep` en `types/chatbot.ts`
2. Implementar lógica en `handleButtonAction()` de `chatbot-controller.tsx`
3. Crear renderizador si es necesario en `message-renderers.tsx`

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

---

## 📖 Guía de Modificación

### Cómo Agregar una Nueva Especialidad

Las especialidades se cargan dinámicamente desde la API. No requiere cambios en el frontend.

### Cómo Modificar las Fechas Disponibles

Todo el control de fechas está en `hooks/use-app-config.ts`.

**Para activar modo de pruebas (fechas fijas):**
1. Cambiar `USE_TEST_DATES = true`
2. Configurar `TEST_START_DATE` y `TEST_END_DATE`

**Para modo producción (fechas dinámicas):**
1. Asegurar `USE_TEST_DATES = false`
2. El sistema calculará automáticamente desde hoy hasta fin del próximo mes.

```typescript
// hooks/use-app-config.ts
const USE_TEST_DATES = true  // true = fechas fijas, false = dinámicas
const TEST_START_DATE = '2025-01-01'
const TEST_END_DATE = '2025-01-31'
```

### Cómo Agregar un Nuevo Tipo de Paciente

1. **Agregar tipo en `types/chatbot.ts`**:
```typescript
export interface PatientData {
  // ...
  patientType?: "PAGANTE" | "SIS" | "SOAT" | "NUEVO_TIPO"
}
```

2. **Agregar FAQ en `types/chatbot.ts`**:
```typescript
export const PATIENT_TYPE_FAQ: Record<string, FAQ> = {
  // ...
  NUEVO_TIPO: {
    question: "¿Qué es NUEVO_TIPO?",
    answer: "Descripción del nuevo tipo..."
  }
}
```

3. **Actualizar `sis-verification-modal.tsx`** para manejar el nuevo tipo.

4. **Actualizar `appointment-utils.ts`**:
```typescript
export function mapPatientTypeToApiFormat(patientType?: string): PatientType {
  // Agregar case para NUEVO_TIPO
}
```

### Cómo Agregar un Nuevo Campo al Formulario de Registro

1. **Actualizar estado en `patient-registration-modal.tsx`**:
```typescript
const [formData, setFormData] = useState({
  // campos existentes...
  nuevoCampo: "",
})
```

2. **Agregar validación en `lib/validation.ts`**:
```typescript
export const patientValidationSchema = z.object({
  // campos existentes...
  nuevoCampo: z.string().min(1, 'Campo requerido'),
})
```

3. **Agregar el campo en el JSX del formulario**.

4. **Actualizar `handleInputChange` si necesita sanitización especial**.

### Cómo Modificar las Ubicaciones del Hospital

Editar `lib/hospital-utils.ts`:

```typescript
export function getHospitalAddress(lugar?: string | null): string | null {
  const code = (lugar ?? "").toString().trim().replace(/\D/g, "")
  if (code === "0") return null
  if (code === "1") return "Nueva dirección Sede Central"
  if (code === "2") return "Nueva dirección Consultorios"
  if (code === "3") return "Nueva sede adicional"  // Agregar nueva sede
  return "Dirección por defecto"
}
```

### Cómo Cambiar la Duración de la Sesión

Editar `context/session-context.tsx`:

```typescript
const SESSION_DURATION = 15 * 60 // Cambiar a 15 minutos
```

### Cómo Agregar un Nuevo Modal al Flujo

1. **Crear el componente**:
```typescript
// components/nuevo-modal.tsx
interface NuevoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  // datos necesarios...
}

export default function NuevoModal({ open, onOpenChange, onBack, ...props }: NuevoModalProps) {
  const [showNextModal, setShowNextModal] = useState(false)
  
  return (
    <>
      <Dialog open={open && !showNextModal} onOpenChange={onOpenChange}>
        {/* Contenido */}
      </Dialog>
      
      <SiguienteModal
        open={showNextModal}
        onOpenChange={setShowNextModal}
        onBack={() => setShowNextModal(false)}
      />
    </>
  )
}
```

2. **Importar y usar en el modal anterior**.

### Cómo Agregar Nuevos Componentes UI (shadcn/ui)

```bash
npx shadcn-ui@latest add [nombre-componente]
```

Ejemplo:
```bash
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add date-picker
```

### Cómo Modificar Estilos Globales

Editar `app/globals.css` para:
- Variables CSS de colores
- Estilos de componentes base
- Animaciones personalizadas

### Cómo Agregar Nuevos Endpoints de API

1. **Crear archivo en `app/api/`**:
```typescript
// app/api/nuevo-endpoint/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Lógica del endpoint
  return NextResponse.json({ data: 'resultado' })
}
```

2. **Consumir desde el frontend**:
```typescript
const response = await fetch('/api/nuevo-endpoint')
const data = await response.json()
```

### Cómo Agregar Logging a Nuevos Componentes

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

### Configuración
- ✅ El archivo de configuración **DEBE** estar en `/public/app-config.json`
- ✅ Solo se hace **1 llamada HTTP** al config gracias al sistema de caché
- ✅ Todos los componentes tienen valores por defecto si falla la configuración

### Seguridad
- ✅ Los logs NO incluyen información sensible (solo IDs y nombres)
- ✅ Sanitización de inputs con DOMPurify y Zod
- ✅ CAPTCHA visual obligatorio en registro
- ✅ Sesiones efímeras de 10 minutos
- ✅ Middleware de seguridad para headers HTTP
- ✅ Bloqueador de consola en producción (configurable)

### Ubicaciones del Hospital
- **Código "0"**: No mostrar ubicación
- **Código "1"**: Sede Central - Jr. Arequipa N° 214
- **Código "2"**: Consultorios Externos - Jr. Cuzco 339

### Validaciones de Teléfono
- Debe ser celular peruano (9 dígitos, comenzando con 9)
- Formato: `9XXXXXXXX`

---

## 🔧 Variables de Entorno Completas

```env
# Requeridas
NEXT_PUBLIC_API_APP_CITAS_URL=https://api.example.com

# Opcionales
LOG_LEVEL=info                           # info, debug, warn, error
NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=true    # false para bloquear consola
NEXT_PUBLIC_HOSPITAL_NAME=Hospital José Agurto Tello de Chosica
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- **Componentes**: PascalCase (`PatientRegistrationModal`)
- **Hooks**: camelCase con prefijo `use` (`useAppConfig`)
- **Utilidades**: camelCase (`sanitizeInput`)
- **Tipos**: PascalCase (`PatientData`)
- **Constantes**: UPPER_SNAKE_CASE (`SESSION_DURATION`)

---

## 📄 Licencia

Este proyecto es privado y confidencial del Hospital José Agurto Tello de Chosica.

---

## 📞 Soporte

Para soporte técnico o consultas, contacta al equipo de desarrollo:
- **Unidad**: Estadística e Informática / Desarrollo de Software
- **Teléfono**: (01) 418-3232

---

## 📚 Documentación Adicional

El proyecto incluye documentación adicional en archivos `.md`:

| Archivo | Descripción |
|---------|-------------|
| `CHATBOT_SETUP.md` | Configuración del chatbot |
| `CHATBOT_TESTING_GUIDE.md` | Guía de pruebas del chatbot |
| `DATE_CENTRALIZATION_GUIDE.md` | Guía de centralización de fechas |
| `INSTRUCCIONES_DOCKER.md` | Instrucciones para Docker |
| `AVISOS_DEPLOY.md` | Avisos importantes para despliegue |
| `components/chatbot/README.md` | Documentación específica del chatbot |

---

**Última actualización**: Diciembre 2025  
**Versión**: 2.0.0  
**Desarrollado por**: Unidad de Estadística e Informática - Hospital José Agurto Tello de Chosica
