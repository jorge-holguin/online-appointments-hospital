# 🔄 Diagrama de Flujo del Chatbot

## Flujo Visual Completo

```
┌─────────────────────────────────────────────────────────────┐
│                     INICIO DEL CHAT                         │
│  Bot: "¡Hola! Soy tu asistente virtual..."                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               PASO 1: DATOS PERSONALES                      │
│  Bot: "Antes de continuar necesito tus datos"              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📋 Formulario:                                     │    │
│  │  • Apellidos y Nombres                             │    │
│  │  • Teléfono                                        │    │
│  │  • Tipo de Documento (API: tipo-documento)         │    │
│  │  • Número de Documento                             │    │
│  │  • Dígito Verificador (solo DNI)                   │    │
│  │  • Correo Electrónico                              │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ [Datos validados]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PASO 2: TIPO DE PACIENTE                       │
│  Bot: "¿Qué tipo de paciente es usted?"                    │
│  ┌─────────────┬──────────────┬─────────────┐             │
│  │  PAGANTE    │     SIS      │    SOAT     │             │
│  │  No seguro  │ Seguro SIS   │  Accidente  │             │
│  │  Paga 100%  │              │  de tránsito│             │
│  └─────────────┴──────────────┴─────────────┘             │
│  💡 FAQ interactivo para cada opción                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               PASO 3: TIPO DE CITA                          │
│  Bot: "¿Qué tipo de cita tiene usted?"                     │
│  ┌─────────────┬──────────────┬─────────────┐             │
│  │   CITADO    │ INTERCONSULTA│   TRÁMITE   │             │
│  │ Canal       │ Referido por │Administrativo│             │
│  │ regular     │ otro médico  │             │             │
│  └─────────────┴──────────────┴─────────────┘             │
│  💡 FAQ interactivo para cada opción                       │
│  ↓ Si INTERCONSULTA → Cargar especialidades                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PASO 4: ESPECIALIDAD                           │
│  Bot: "¿Qué especialidad estás buscando?"                  │
│  API: GET /especialidades?fechaInicio=X&fechaFin=Y         │
│  ┌────────────────────────────────────────────────────┐    │
│  │  🏥 MEDICINA INTERNA                               │    │
│  │  👶 PEDIATRÍA                                      │    │
│  │  🫀 CARDIOLOGÍA                                    │    │
│  │  🦴 TRAUMATOLOGÍA                                  │    │
│  │  ... (lista completa desde API)                    │    │
│  │  🔍 Búsqueda por nombre                            │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           PASO 5: MÉTODO DE BÚSQUEDA                        │
│  Bot: "¿Cómo deseas buscar tu cita?"                       │
│  ┌──────────────────────┬──────────────────────┐          │
│  │   POR MÉDICO         │   POR FECHA          │          │
│  │  Elegir doctor       │  Elegir fecha        │          │
│  │  primero             │  primero             │          │
│  └──────────────────────┴──────────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │  OPCIÓN A:      │          │  OPCIÓN B:      │
    │  POR MÉDICO     │          │  POR FECHA      │
    └─────────────────┘          └─────────────────┘
          │                             │
          ▼                             ▼
┌───────────────────────┐      ┌──────────────────────┐
│ 5A.1: Lista de Médicos│      │ 5B.1: Calendario     │
│ (de la especialidad)  │      │ (fechas disponibles) │
└───────────┬───────────┘      └──────────┬───────────┘
            │                             │
            ▼                             ▼
┌───────────────────────┐      ┌──────────────────────┐
│ 5A.2: Turno           │      │ 5B.2: Médicos        │
│ [Mañana] [Tarde]      │      │ (disponibles)        │
└───────────┬───────────┘      └──────────┬───────────┘
            │                             │
            ▼                             │
┌───────────────────────┐                │
│ 5A.3: Calendario      │                │
│ (fechas disponibles)  │                │
└───────────┬───────────┘                │
            │                             │
            └──────────┬──────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                PASO 6: RESUMEN DE CITA                      │
│  Bot: "Este es el resumen de su atención:"                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  📅 Martes, 02/12/2025 08:26hs                     │    │
│  │  🏥 Especialidad: MEDICINA INTERNA                 │    │
│  │  🚪 Consultorio: 1012                              │    │
│  │  👨‍⚕️ Médico: Dr. BAZAN BETETA CARLO MAGNO         │    │
│  │  📍 Jr. Cuzco 339 - Consultorios Externos         │    │
│  │  👤 Paciente: HOLGUIN CUCALON JORGE ALBERTO       │    │
│  │  🆔 DNI: 41877141                                  │    │
│  │  💳 Paciente SIS                                   │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             PASO 7: OBSERVACIONES (Opcional)                │
│  Bot: "¿Desea agregar una observación?"                    │
│  [Sí] [No]                                                  │
│  ↓ Si Sí                                                    │
│  📝 Campo de texto (máx 100 caracteres)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           PASO 8: CONFIRMACIÓN FINAL                        │
│  Bot: "¿Confirma todos los datos para llegar a su cita?"   │
│  [Sí, confirmar] [No, modificar]                            │
└────────────────────────┬────────────────────────────────────┘
                         │ [Confirmar]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              LLAMADA A LA API                               │
│  POST /v1/solicitudes?token={token}                         │
│  {                                                           │
│    tipoDocumento, numeroDocumento, citaId,                  │
│    consultorio, nombres, celular, correo,                   │
│    especialidad, medico, fecha, hora, turno,                │
│    tipoAtencion, tipoCita, observacionPaciente, lugar       │
│  }                                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
    ┌──────────┐                  ┌──────────┐
    │  ÉXITO   │                  │  ERROR   │
    └──────────┘                  └──────────┘
          │                             │
          ▼                             ▼
┌───────────────────┐          ┌─────────────────────┐
│ ✅ CITA CONFIRMADA│          │ ❌ MANEJO DE ERROR  │
│ Código: XXXXXX    │          │ • Cita duplicada    │
│ Email enviado     │          │ • No disponible     │
└───────────────────┘          │ • Sesión expirada   │
                               └─────────────────────┘
```

## Estados del Flujo (FlowStep)

```typescript
type FlowStep =
  | "greeting"                    // Saludo inicial
  | "requesting-data"             // Solicitar datos
  | "collecting-personal-info"    // Recopilando datos
  | "selecting-patient-type"      // Tipo de paciente
  | "selecting-appointment-type"  // Tipo de cita
  | "selecting-specialty"         // Especialidad
  | "selecting-search-method"     // Método de búsqueda
  | "selecting-doctor"            // Selección de médico
  | "selecting-shift"             // Turno (mañana/tarde)
  | "selecting-datetime"          // Fecha y hora
  | "showing-summary"             // Resumen de cita
  | "requesting-observations"     // Observaciones opcionales
  | "final-confirmation"          // Confirmación final
  | "appointment-confirmed"       // Cita confirmada
  | "error"                       // Error en el proceso
```

## Transiciones de Estado

```typescript
greeting → requesting-data
  ↓
requesting-data → collecting-personal-info
  ↓
collecting-personal-info → selecting-patient-type
  ↓
selecting-patient-type → selecting-appointment-type
  ↓
selecting-appointment-type → selecting-specialty
  ↓
selecting-specialty → selecting-search-method
  ↓
selecting-search-method → selecting-doctor | selecting-datetime
  ↓
selecting-doctor → selecting-shift → selecting-datetime
  ↓
selecting-datetime → showing-summary
  ↓
showing-summary → requesting-observations
  ↓
requesting-observations → final-confirmation
  ↓
final-confirmation → appointment-confirmed | error
```

## Datos Requeridos por Paso

### PatientData
```typescript
{
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
```

### AppointmentData
```typescript
{
  specialty: string              // ID
  specialtyName: string          // Nombre
  doctor?: {
    nombre: string
    medicoId: string
  }
  dateTime?: {
    date: string
    time: string
    day: string
    displayDate: string
  }
  shift?: "MAÑANA" | "TARDE"
  searchMethod?: "doctor" | "datetime"
  consultorio?: string
  lugar?: string
  idCita?: string
  observaciones?: string
}
```

## APIs por Paso

| Paso | Endpoint | Método | Datos |
|------|----------|--------|-------|
| 1 | `/tipo-documento` | GET | Tipos de documento |
| 4 | `/especialidades?fechaInicio=X&fechaFin=Y` | GET | Especialidades |
| 5A | `/medicos?especialidad=X` | GET | Médicos |
| 5B | `/disponibilidad?...` | GET | Fechas/horas |
| 8 | `/solicitudes?token=X` | POST | Crear cita |

## Validaciones por Paso

### PASO 1: Datos Personales
- ✅ Nombre: mínimo 3 caracteres
- ✅ Teléfono: 9 dígitos
- ✅ Documento: según tipo (DNI: 8 dígitos)
- ✅ Email: formato válido
- ✅ Todos los campos requeridos

### PASO 2: Tipo de Paciente
- ✅ Selección obligatoria

### PASO 3: Tipo de Cita
- ✅ Selección obligatoria
- ✅ Si INTERCONSULTA: especialidad requerida
- ✅ Si TRÁMITE: observación obligatoria

### PASO 4-6: Selección
- ✅ Verificar disponibilidad
- ✅ Validar horarios no pasados

### PASO 8: Confirmación
- ✅ Token de sesión válido
- ✅ Todos los datos completos

## Manejo de Errores

### Errores Comunes
1. **Cita Duplicada**: "Ya tienes una solicitud pendiente"
   - Acción: Ofrecer buscar otra especialidad
   
2. **Cita No Disponible**: "Ese horario ya no está disponible"
   - Acción: Volver a selección de horario
   
3. **Sesión Expirada**: "Tu sesión ha expirado"
   - Acción: Reiniciar flujo
   
4. **Error de API**: "Error al conectar con el servidor"
   - Acción: Reintentar o contactar soporte

## Componentes por Tipo de Mensaje

| Tipo | Componente | Uso |
|------|-----------|-----|
| `text` | Burbuja simple | Mensajes informativos |
| `options` | `ChatMessageOptions` | Selección múltiple |
| `form` | `ChatFormField` | Formularios |
| `faq` | `ChatFAQ` | Preguntas frecuentes |
| `list` | Custom | Listas de médicos/especialidades |
| `calendar` | Custom | Selector de fechas |
| `summary` | Custom | Resumen formateado |

---

Este diagrama sirve como referencia para implementar la lógica completa del chatbot.
