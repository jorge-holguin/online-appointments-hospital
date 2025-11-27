# ✅ Chatbot - Confirmación de Citas Implementada

## 📋 Resumen de Implementación

Se ha implementado **completamente** el flujo de confirmación de citas en el chatbot, incluyendo:

1. ✅ Captura de observaciones del paciente
2. ✅ Obtención de token de sesión desde la API
3. ✅ Envío de solicitud de cita con todos los campos requeridos
4. ✅ Manejo de errores (cita duplicada, no disponible, etc.)
5. ✅ Mostrar código de solicitud y detalles completos de la cita
6. ✅ Link para consultar la cita en `/codigo`

---

## 🔄 Flujo Completo Implementado

### **1. Captura de Observaciones**

**Pregunta al usuario:**
```
¿Deseas agregar alguna observación a tu cita?
[Sí, agregar observación] [No, continuar sin observación]
```

**Si el usuario selecciona "Sí":**
- El chatbot espera que el usuario escriba su observación
- Valida que no exceda 100 caracteres
- Guarda la observación y continúa al siguiente paso

```typescript
const [observacion, setObservacion] = useState<string>("")
const [waitingForObservation, setWaitingForObservation] = useState(false)

// Cuando el usuario escribe en el chat
if (waitingForObservation) {
  if (content.length > 100) {
    sendBotMessage("⚠️ La observación no puede tener más de 100 caracteres...")
    return
  }
  
  setObservacion(content)
  setWaitingForObservation(false)
  // Continúa al siguiente paso
}
```

---

### **2. Confirmación Final**

```
¿Confirmas todos los datos para procesar tu solicitud de cita?
[Sí, confirmar solicitud] [No, quiero modificar]
```

---

### **3. Obtención de Token de Sesión**

```typescript
const sessionResponse = await fetch(
  `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes/sesion`,
  {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }
)

const sessionData = await sessionResponse.json()
// sessionData.token = "81cFkCpqhnSqSI4K00VHBQ"
```

---

### **4. Preparación de Datos**

```typescript
const appointmentPayload = {
  tipoDocumento: userData?.tipoDocumento || "D  ",
  numeroDocumento: userData?.documento || "",
  citaId: appointmentData?.idCita || "",
  consultorio: appointmentData?.consultorio || "",
  nombres: userData?.fullName || "",
  celular: userData?.phone || "",
  correo: userData?.email || "",
  especialidad: appointmentData?.specialty || "",
  especialidadNombre: appointmentData?.specialtyName || "",
  medico: appointmentData?.doctor?.nombre || "",
  medicoNombre: appointmentData?.doctor?.medicoId || "",
  fecha: appointmentData?.dateTime?.date || "",
  hora: appointmentData?.dateTime?.time || "",
  turno: appointmentData?.shift || "",
  tipoAtencion: userData?.tipoCita === 'TRAMITE' 
    ? 'PAGANTE' 
    : (userData?.patientType === 'SIS' ? 'SIS' : 'PAGANTE'),
  tipoCita: userData?.tipoCita || "",
  especialidadInterconsulta: userData?.especialidadInterconsulta || "",
  observacionPaciente: observacion || "",
  lugar: appointmentData?.lugar ?? null
}
```

**Ejemplo de payload real:**
```json
{
  "celular": "987787878",
  "citaId": "250231849",
  "consultorio": "6081",
  "correo": "jorge.holguin1105@gmail.com",
  "especialidad": "0038",
  "especialidadInterconsulta": "",
  "especialidadNombre": "PLANIFICACION",
  "fecha": "2025-11-29",
  "hora": "12:32",
  "lugar": null,
  "medico": "VPC",
  "medicoNombre": "VILLARREAL PARIONA CLAUDIA ESTHER",
  "nombres": "HOLGUIN CUCALON JORGE ALBERTO",
  "numeroDocumento": "41877141",
  "observacionPaciente": "",
  "tipoAtencion": "SIS",
  "tipoCita": "CITADO",
  "tipoDocumento": "D  ",
  "turno": "M"
}
```

---

### **5. Envío de Solicitud**

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes?token=${encodeURIComponent(sessionData.token)}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appointmentPayload)
  }
)
```

**URL real:**
```
api/v1/solicitudes?token=81cFkCpqhnSqSI4K00VHBQ
```

---

### **6. Respuesta de la API**

```json
{
  "codigo": "M39N8OM3",
  "tipoDocumento": "D  ",
  "numeroDocumento": "41877141",
  "nombres": "HOLGUIN CUCALON JORGE ALBERTO",
  "correo": "jorge.holguin1105@gmail.com",
  "tipoAtencion": "SIS",
  "lugar": null
}
```

---

### **7. Mostrar Confirmación al Usuario**

```
🎉 **¡Cita Confirmada!**

📋 **Código de Solicitud:** M39N8OM3

📅 **Sábado**
29/11/2025 - 12:32

🏥 **Especialidad:** PLANIFICACION
👨‍⚕️ **Médico:** Dr(a). VILLARREAL PARIONA CLAUDIA ESTHER
🚪 **Consultorio:** 6081

📍 Jr. Cuzco 339 - Consultorios Externos

👤 **Paciente:** HOLGUIN CUCALON JORGE ALBERTO
🆔 **DNI:** 41877141
💳 **Tipo:** Paciente SIS

✅ Puedes consultar tu cita en: http://localhost:3000/M39N8OM3

📧 Recibirás un correo con todos los detalles.

¡Te esperamos! 😊
```

**Y luego:**
```
🔗 Consulta tu cita aquí: http://localhost:3000/M39N8OM3
```

---

## 🔍 Manejo de Errores

### **Error de Cita Duplicada**
```
"Ya tienes una solicitud de cita pendiente para este mes en esta especialidad..."
```

### **Error de Cita No Disponible**
```
"La cita ya no está disponible, por favor elija otro horario..."
```

### **Error de Sesión**
```
"Error al iniciar sesión"
```

### **Error General**
```
❌ Lo siento, hubo un error al procesar tu solicitud:

[Mensaje de error específico]

Por favor, intenta nuevamente o llama al (01) 418-3232.
```

---

## 📊 Flujo de Datos

```
Usuario completa datos
        ↓
Selecciona especialidad, médico, fecha/hora
        ↓
Ve resumen de su cita
        ↓
Agrega observación (opcional)
        ↓
Confirma todos los datos
        ↓
┌───────────────────────────────────────┐
│  CHATBOT CONTROLLER                   │
│  confirmAppointment()                 │
└───────────────────────────────────────┘
        ↓
[1] POST /v1/solicitudes/sesion
        ↓
    Token de sesión
        ↓
[2] POST /v1/solicitudes?token=...
        ↓
    Código de solicitud (M39N8OM3)
        ↓
Mostrar confirmación completa
        ↓
Link para consultar cita
```

---

## ✅ Campos Implementados

| Campo | Fuente | Ejemplo |
|-------|--------|---------|
| `tipoDocumento` | `userData.tipoDocumento` | `"D  "` |
| `numeroDocumento` | `userData.documento` | `"41877141"` |
| `citaId` | `appointmentData.idCita` | `"250231849"` |
| `consultorio` | `appointmentData.consultorio` | `"6081"` |
| `nombres` | `userData.fullName` | `"HOLGUIN CUCALON JORGE ALBERTO"` |
| `celular` | `userData.phone` | `"987787878"` |
| `correo` | `userData.email` | `"jorge@example.com"` |
| `especialidad` | `appointmentData.specialty` | `"0038"` |
| `especialidadNombre` | `appointmentData.specialtyName` | `"PLANIFICACION"` |
| `medico` | `appointmentData.doctor.nombre` | `"VPC"` |
| `medicoNombre` | `appointmentData.doctor.medicoId` | `"VILLARREAL PARIONA..."` |
| `fecha` | `appointmentData.dateTime.date` | `"2025-11-29"` |
| `hora` | `appointmentData.dateTime.time` | `"12:32"` |
| `turno` | `appointmentData.shift` | `"M"` |
| `tipoAtencion` | Calculado de `userData` | `"SIS"` o `"PAGANTE"` |
| `tipoCita` | `userData.tipoCita` | `"CITADO"` |
| `especialidadInterconsulta` | `userData.especialidadInterconsulta` | `""` o código |
| `observacionPaciente` | `observacion` (estado del chatbot) | Texto del usuario |
| `lugar` | `appointmentData.lugar` | `null`, `"1"`, `"2"` |

---

## 🎯 Diferencias con el Modal

### **Modal (`confirmation-modal.tsx`)**
- Usa `useSession()` context que ya tiene el token
- Maneja subida de archivos SIS
- Muestra un modal de confirmación final separado

### **Chatbot (`chatbot-controller.tsx`)**
- **Obtiene el token directamente** dentro de `confirmAppointment()`
- **No maneja archivos** (por ahora)
- **Muestra la confirmación en mensajes** de chat

**Ambos llaman a los mismos endpoints:**
1. `POST /v1/solicitudes/sesion` → Token
2. `POST /v1/solicitudes?token=...` → Confirmación

---

## 🚀 Estado de Implementación

| Funcionalidad | Estado |
|---------------|--------|
| Captura de observaciones | ✅ Implementado |
| Validación de longitud (100 chars) | ✅ Implementado |
| Obtención de token de sesión | ✅ Implementado |
| Preparación de payload completo | ✅ Implementado |
| Envío a API de solicitudes | ✅ Implementado |
| Manejo de errores | ✅ Implementado |
| Mostrar código de solicitud | ✅ Implementado |
| Mostrar detalles completos | ✅ Implementado |
| Link para consultar cita | ✅ Implementado |
| Subida de archivo SIS | ⏸️ Pendiente (no crítico) |

---

## 📝 Código Relevante

### **`chatbot-controller.tsx`**

```typescript
// Estados
const [observacion, setObservacion] = useState<string>("")
const [waitingForObservation, setWaitingForObservation] = useState(false)

// Captura de observación
if (waitingForObservation) {
  if (content.length > 100) {
    sendBotMessage("⚠️ La observación no puede tener más de 100 caracteres...")
    return
  }
  
  setObservacion(content)
  setWaitingForObservation(false)
  sendBotMessage(`Observación guardada: "${content}"`)
  
  setTimeout(() => {
    setCurrentStep("final-confirmation")
    askForFinalConfirmation()
  }, 1000)
  return
}

// Confirmación de cita
const confirmAppointment = async () => {
  sendBotMessage("Procesando tu solicitud...")
  setIsTyping(true)
  
  try {
    // Paso 1: Obtener token de sesión
    const sessionResponse = await fetch(...)
    const sessionData = await sessionResponse.json()
    
    // Paso 2: Preparar datos de la cita
    const appointmentPayload = { ... }
    
    // Paso 3: Enviar solicitud de cita
    const response = await fetch(
      `/v1/solicitudes?token=${sessionData.token}`,
      { method: 'POST', body: JSON.stringify(appointmentPayload) }
    )
    
    const responseData = await response.json()
    
    // Paso 4: Mostrar confirmación
    sendBotMessage(`
🎉 **¡Cita Confirmada!**
📋 **Código de Solicitud:** ${responseData.codigo}
...
    `)
    
    // Paso 5: Enviar link
    setTimeout(() => {
      sendBotMessage(`🔗 Consulta tu cita aquí: ${window.location.origin}/${responseData.codigo}`)
    }, 1500)
    
  } catch (error) {
    sendBotMessage(`❌ Error: ${error.message}`)
  }
}
```

---

## 🎉 Conclusión

El chatbot ahora puede:

✅ Recoger toda la información del paciente  
✅ Permitirle seleccionar especialidad, médico y horario  
✅ Capturar observaciones opcionales  
✅ Confirmar todos los datos  
✅ **Reservar la cita en el backend**  
✅ Mostrar el código de solicitud  
✅ Proporcionar el link para consultar la cita  

**¡El flujo de confirmación está completo y funcional!** 🎊
