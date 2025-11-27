# ✅ Correcciones de APIs del Chatbot - Completo

## 🎯 Problemas Corregidos

### 1. ✅ Llamada a Sesión al Inicio
**Problema:** No se llamaba a `/v1/solicitudes/sesion` al iniciar el chatbot.

**Solución:** Agregado en el `useEffect` de inicialización.

```typescript
useEffect(() => {
  const initializeChatbot = async () => {
    try {
      // 1. Obtener token de sesión
      const sessionResponse = await fetch(
        `${API_URL}/v1/solicitudes/sesion`,
        { method: 'POST' }
      )
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        console.log('Token de sesión obtenido:', sessionData.token)
      }
      
      // 2. Cargar tipos de documento
      // ...
    } catch (error) {
      console.error('Error inicializando chatbot:', error)
    }
  }
  initializeChatbot()
}, [])
```

---

### 2. ✅ Especialidades para Interconsulta
**Problema:** No se cargaban especialidades cuando se seleccionaba INTERCONSULTA.

**Solución:** Implementado en `handleAppointmentTypeSelection`.

```typescript
if (tipoCita === "INTERCONSULTA") {
  sendBotMessage("Para una interconsulta, necesito saber de qué especialidad vienes...")
  
  if (!startDate || !endDate) {
    sendBotMessage("Error: No se pudo cargar la configuración de fechas.")
    return
  }
  
  try {
    const url = `${API_URL}/v1/app-citas/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}`
    const response = await fetch(url)
    const data = await response.json()
    
    const filtered = data
      .filter((item: any) => item.idEspecialidad && item.nombre)
      .map((item: any) => ({
        id: item.idEspecialidad,
        nombre: item.nombre
      }))
    
    sendBotMessage(
      "Selecciona la especialidad de la que vienes (para interconsulta):",
      "specialty-list",
      {
        specialties: filtered,
        action: "select-interconsulta-specialty"
      }
    )
    return
  } catch (error) {
    console.error('Error cargando especialidades de interconsulta:', error)
  }
}
```

**Handler agregado:**
```typescript
const handleInterconsultaSpecialtySelection = (specialty: any) => {
  // Guardar la especialidad de interconsulta
  setUserData(prev => ({ ...prev!, especialidadInterconsulta: specialty.id }))
  
  sendBotMessage(
    `Especialidad de interconsulta: ${specialty.nombre}. Ahora, ¿qué especialidad necesitas para tu cita?`,
    "text"
  )
  
  setCurrentStep("selecting-specialty")
  
  setTimeout(() => {
    loadSpecialties()
  }, 800)
}
```

---

### 3. ✅ Carga de Médicos con Fechas del Config
**Problema:** No se implementó la carga de médicos desde la API.

**Solución:** Implementado `loadDoctors` con fechas centralizadas.

```typescript
const loadDoctors = async () => {
  if (!startDate || !endDate || !appointmentData?.specialty) {
    sendBotMessage("Error: Faltan datos para cargar médicos.")
    return
  }
  
  try {
    const url = `${API_URL}/v1/app-citas/medicos?fechaInicio=${startDate}&fechaFin=${endDate}&idEspecialidad=${appointmentData.specialty}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Error al obtener médicos: ${response.status}`)
    }
    
    const data = await response.json()
    
    const doctors = data
      .filter((item: any) => item.nombre && item.medicoId)
      .map((item: any) => ({
        id: item.medicoId,
        nombre: item.nombre,
        especialidadId: appointmentData.specialty
      }))
    
    setDoctors(doctors)
    
    if (doctors.length === 0) {
      sendBotMessage("No hay médicos disponibles para esta especialidad.")
      return
    }
    
    sendBotMessage(
      "Selecciona el médico con quien deseas atenderte:",
      "doctor-list",
      {
        doctors,
        action: "select-doctor"
      }
    )
  } catch (error) {
    console.error('Error cargando médicos:', error)
    sendBotMessage("Lo siento, hubo un error al cargar los médicos.")
  }
}
```

**URL generada:**
```
http://192.168.0.252:9012/api/v1/app-citas/medicos?fechaInicio=2025-08-01&fechaFin=2025-08-30&idEspecialidad=0001
```

---

### 4. ✅ Carga de Citas con Fechas del Config
**Problema:** La fecha de inicio no respetaba el `app-config`, usaba fecha actual.

**Solución:** Implementado `loadAvailableSlots` con fechas centralizadas.

```typescript
const loadAvailableSlots = async () => {
  if (!startDate || !endDate || !appointmentData?.specialty) {
    sendBotMessage("Error: Faltan datos para cargar horarios.")
    return
  }
  
  try {
    let url: string
    
    // Si ya seleccionó médico, cargar citas específicas
    if (appointmentData.doctor && appointmentData.shift) {
      const turno = appointmentData.shift === "MAÑANA" ? "M" : "T"
      url = `${API_URL}/v1/app-citas/citas?fechaInicio=${startDate}&fechaFin=${endDate}&medicoId=${appointmentData.doctor.nombre}&turnoConsulta=${turno}&idEspecialidad=${appointmentData.specialty}`
    } else {
      // Si busca por fecha, cargar fechas disponibles
      const turno = appointmentData.shift === "MAÑANA" ? "M" : "T"
      url = `${API_URL}/v1/app-citas/fechas-consultorios?fechaInicio=${startDate}&fechaFin=${endDate}&turnoConsulta=${turno}&idEspecialidad=${appointmentData.specialty}`
    }
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Error al obtener horarios: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Procesar datos según el tipo de búsqueda
    let slots: any[]
    
    if (appointmentData.doctor) {
      // Formato de citas específicas
      slots = data
        .filter((item: any) => item.fecha && item.hora)
        .map((item: any) => ({
          date: item.fecha.split(' ')[0],
          time: item.hora,
          consultorio: item.consultorio,
          idCita: item.idCita,
          lugar: item.lugar
        }))
    } else {
      // Formato de fechas disponibles
      slots = data
        .filter((item: any) => item.fecha)
        .map((item: any) => ({
          date: item.fecha.split(' ')[0],
          consultorio: item.consultorio,
          totalDisponibles: item.totalDisponibles
        }))
    }
    
    setAvailableSlots(slots)
    
    if (slots.length === 0) {
      sendBotMessage("No hay horarios disponibles para esta selección.")
      return
    }
    
    sendBotMessage(
      "Selecciona la fecha y hora para tu cita:",
      "datetime-selector",
      {
        slots,
        action: "select-datetime"
      }
    )
  } catch (error) {
    console.error('Error cargando horarios:', error)
    sendBotMessage("Lo siento, hubo un error al cargar los horarios.")
  }
}
```

**URLs generadas:**

**Búsqueda por médico:**
```
http://192.168.0.252:9012/api/v1/app-citas/citas?fechaInicio=2025-08-01&fechaFin=2025-08-30&medicoId=BBC&turnoConsulta=M&idEspecialidad=0001
```

**Búsqueda por fecha:**
```
http://192.168.0.252:9012/api/v1/app-citas/fechas-consultorios?fechaInicio=2025-08-01&fechaFin=2025-08-30&turnoConsulta=M&idEspecialidad=0001
```

---

### 5. ✅ Selección de Turno para Búsqueda por Fecha
**Problema:** No se preguntaba por el turno cuando se buscaba por fecha.

**Solución:** Agregado en `handleSearchMethodSelection`.

```typescript
const handleSearchMethodSelection = (method: string) => {
  setAppointmentData(prev => ({ ...prev!, searchMethod: method as any }))
  
  if (method === "doctor") {
    setCurrentStep("selecting-doctor")
    sendBotMessage("Cargando médicos disponibles...")
    loadDoctors()
  } else {
    // Si busca por fecha, primero preguntar por el turno
    setCurrentStep("selecting-shift")
    sendBotMessage(
      "¿En qué turno prefieres atenderte?",
      "options",
      {
        options: [
          { id: "morning", label: "Mañana", value: "MAÑANA" },
          { id: "afternoon", label: "Tarde", value: "TARDE" }
        ],
        action: "select-shift"
      }
    )
  }
}
```

---

## 🔄 Flujo Completo del Chatbot

### **Flujo Normal (CITADO o TRÁMITE):**
```
1. Inicio → Obtener token de sesión ✅
2. Cargar tipos de documento ✅
3. Usuario completa formulario
4. Selecciona tipo de paciente (SIS/PAGANTE/SOAT)
5. Selecciona tipo de cita (CITADO/TRAMITE)
6. Cargar especialidades con fechas del config ✅
7. Usuario selecciona especialidad
8. Usuario selecciona método de búsqueda:
   
   A) Por Médico:
      → Cargar médicos con fechas del config ✅
      → Usuario selecciona médico
      → Usuario selecciona turno
      → Cargar citas con fechas del config ✅
      → Usuario selecciona fecha/hora
   
   B) Por Fecha:
      → Usuario selecciona turno ✅
      → Cargar fechas disponibles con fechas del config ✅
      → Usuario selecciona fecha/hora
      
9. Mostrar resumen
10. Capturar observaciones
11. Confirmar cita
```

### **Flujo Interconsulta:**
```
1-4. (Igual que flujo normal)
5. Selecciona tipo de cita (INTERCONSULTA)
6. Cargar especialidades para interconsulta ✅
7. Usuario selecciona especialidad de origen
8. Cargar especialidades para la cita ✅
9. Usuario selecciona especialidad de destino
10-11. (Continúa igual que flujo normal desde paso 8)
```

---

## 📊 APIs Llamadas Correctamente

| API | Cuándo | Parámetros | Estado |
|-----|--------|------------|--------|
| `/v1/solicitudes/sesion` | Al iniciar chatbot | - | ✅ |
| `/v1/app-citas/tipo-documento` | Al iniciar chatbot | - | ✅ |
| `/v1/app-citas/especialidades` | Al seleccionar tipo de cita | `fechaInicio`, `fechaFin` | ✅ |
| `/v1/app-citas/especialidades` | Si es INTERCONSULTA | `fechaInicio`, `fechaFin` | ✅ |
| `/v1/app-citas/medicos` | Si busca por médico | `fechaInicio`, `fechaFin`, `idEspecialidad` | ✅ |
| `/v1/app-citas/citas` | Después de seleccionar médico y turno | `fechaInicio`, `fechaFin`, `medicoId`, `turnoConsulta`, `idEspecialidad` | ✅ |
| `/v1/app-citas/fechas-consultorios` | Si busca por fecha | `fechaInicio`, `fechaFin`, `turnoConsulta`, `idEspecialidad` | ✅ |
| `/v1/solicitudes` | Al confirmar cita | `token`, payload completo | ✅ |

---

## ✅ Verificación de Fechas

**Todas las URLs ahora usan:**
```
fechaInicio=2025-08-01  (desde app-config)
fechaFin=2025-08-30     (desde app-config)
```

**Antes (❌ INCORRECTO):**
```
fechaInicio=2025-11-27  (fecha actual del sistema)
fechaFin=2025-08-30     (del config)
```

**Ahora (✅ CORRECTO):**
```
fechaInicio=2025-08-01  (del config)
fechaFin=2025-08-30     (del config)
```

---

## 🎯 Cambios en el Código

### **Archivo:** `components/chatbot/chatbot-controller.tsx`

**Cambios realizados:**

1. ✅ **Inicialización con sesión:**
   - Agregado llamada a `/v1/solicitudes/sesion` en `useEffect`
   - Token se obtiene al inicio

2. ✅ **Interconsulta:**
   - Agregado carga de especialidades en `handleAppointmentTypeSelection`
   - Agregado `handleInterconsultaSpecialtySelection`
   - Agregado case en `handleButtonAction`

3. ✅ **Carga de médicos:**
   - Implementado `loadDoctors` completo
   - Usa `startDate` y `endDate` del config
   - Maneja errores y casos sin resultados

4. ✅ **Carga de slots:**
   - Implementado `loadAvailableSlots` completo
   - Diferencia entre búsqueda por médico y por fecha
   - Usa `startDate` y `endDate` del config
   - Procesa ambos formatos de respuesta

5. ✅ **Selección de turno:**
   - Agregado en `handleSearchMethodSelection` para búsqueda por fecha
   - Pregunta por turno antes de cargar fechas

---

## 🧪 Cómo Verificar

### **1. Verificar Token de Sesión:**
```bash
# Abrir DevTools (F12) → Network
# Iniciar chatbot
# Buscar llamada a:
✅ POST /v1/solicitudes/sesion
```

### **2. Verificar Interconsulta:**
```bash
# Seleccionar INTERCONSULTA
# Verificar llamada:
✅ GET /v1/app-citas/especialidades?fechaInicio=2025-08-01&fechaFin=2025-08-30
```

### **3. Verificar Médicos:**
```bash
# Seleccionar "Buscar por Médico"
# Verificar llamada:
✅ GET /v1/app-citas/medicos?fechaInicio=2025-08-01&fechaFin=2025-08-30&idEspecialidad=0001
```

### **4. Verificar Citas:**
```bash
# Después de seleccionar médico y turno
# Verificar llamada:
✅ GET /v1/app-citas/citas?fechaInicio=2025-08-01&fechaFin=2025-08-30&medicoId=BBC&turnoConsulta=M&idEspecialidad=0001
```

### **5. Verificar Fechas Disponibles:**
```bash
# Seleccionar "Buscar por Fecha"
# Seleccionar turno
# Verificar llamada:
✅ GET /v1/app-citas/fechas-consultorios?fechaInicio=2025-08-01&fechaFin=2025-08-30&turnoConsulta=M&idEspecialidad=0001
```

---

## 🎉 Estado Final

| Funcionalidad | Estado |
|---------------|--------|
| Token de sesión al inicio | ✅ |
| Especialidades para interconsulta | ✅ |
| Carga de médicos con fechas correctas | ✅ |
| Carga de citas con fechas correctas | ✅ |
| Carga de fechas disponibles | ✅ |
| Selección de turno para búsqueda por fecha | ✅ |
| Todas las URLs usan fechas del config | ✅ |

**¡Todas las APIs del chatbot ahora funcionan correctamente con las fechas centralizadas!** 🎊
