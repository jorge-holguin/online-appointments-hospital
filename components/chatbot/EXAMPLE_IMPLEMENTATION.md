# Ejemplo de Implementación del Chatbot

## Paso 1: Implementar Máquina de Estados

En `chatbot-controller.tsx`, agregar:

```typescript
import { useState, useEffect } from "react"
import { FlowStep, PatientData, AppointmentData, PATIENT_TYPE_FAQ, APPOINTMENT_TYPE_FAQ } from "@/types/chatbot"

export default function ChatbotController({ messages, setMessages, setIsTyping }: ChatbotControllerProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("greeting")
  const [userData, setUserData] = useState<PatientData | null>(null)
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null)

  // Inicializar conversación
  useEffect(() => {
    if (currentStep === "greeting" && messages.length === 1) {
      // Después del saludo inicial, preguntar si desea continuar
      setTimeout(() => {
        sendBotMessage(
          "¿Deseas solicitar una cita médica? Te ayudaré paso a paso.",
          "options",
          {
            options: [
              { id: "1", label: "Sí, solicitar cita", value: "yes" },
              { id: "2", label: "No, gracias", value: "no" }
            ]
          }
        )
      }, 1000)
    }
  }, [currentStep, messages])

  // Escuchar respuestas del usuario
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.sender === "user") {
      handleUserMessage(lastMessage)
    }
  }, [messages])

  const handleUserMessage = (message: Message) => {
    switch (currentStep) {
      case "greeting":
        if (message.content.toLowerCase().includes("sí") || message.content === "yes") {
          setCurrentStep("requesting-data")
          requestPersonalData()
        }
        break
      
      case "collecting-personal-info":
        // Validar datos y continuar
        break
      
      // ... más casos
    }
  }

  const requestPersonalData = () => {
    sendBotMessage(
      "¡Perfecto! Antes de continuar necesito tus datos personales.",
      "text"
    )
    
    setTimeout(() => {
      sendBotMessage(
        "Por favor completa el siguiente formulario:",
        "form",
        {
          fields: [
            { id: "fullName", label: "Apellidos y Nombres", type: "text", required: true },
            { id: "phone", label: "Teléfono", type: "tel", required: true },
            { id: "tipoDocumento", label: "Tipo de Documento", type: "select", required: true },
            { id: "documento", label: "Número de Documento", type: "text", required: true },
            { id: "email", label: "Correo Electrónico", type: "email", required: true }
          ]
        }
      )
      setCurrentStep("collecting-personal-info")
    }, 1000)
  }
}
```

## Paso 2: Renderizar Mensajes Interactivos

En `app/chat/page.tsx`, modificar el renderizado de mensajes:

```typescript
{messages.map((message) => (
  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
    {message.sender === "bot" ? (
      <div className="max-w-[75%] md:max-w-[60%]">
        {/* Mensaje de texto */}
        <div className="bg-white rounded-lg px-4 py-2 shadow-sm mb-2">
          <p className="text-sm md:text-base whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <span className="text-xs text-gray-500 mt-1 block text-right">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        {/* Opciones interactivas */}
        {message.type === "options" && message.data?.options && (
          <ChatMessageOptions
            options={message.data.options}
            onSelect={(value) => handleOptionSelect(value, message.id)}
          />
        )}
        
        {/* Formulario */}
        {message.type === "form" && message.data?.fields && (
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
            {message.data.fields.map((field: any) => (
              <ChatFormField
                key={field.id}
                {...field}
                value={formData[field.id] || ""}
                onChange={(value) => handleFormChange(field.id, value)}
              />
            ))}
            <Button onClick={handleFormSubmit} className="w-full bg-[#3e92cc]">
              Continuar
            </Button>
          </div>
        )}
      </div>
    ) : (
      <div className="bg-[#dcf8c6] rounded-lg px-4 py-2 shadow-sm">
        <p className="text-sm md:text-base">{message.content}</p>
        <span className="text-xs text-gray-500 mt-1 block text-right">
          {formatTime(message.timestamp)}
        </span>
      </div>
    )}
  </div>
))}
```

## Paso 3: Integrar APIs

### Cargar Tipos de Documento

```typescript
const fetchDocumentTypes = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/tipo-documento`
    )
    const data = await response.json()
    
    return data
      .filter((type: any) => type.nombre && type.tipoDocumento)
      .filter((type: any) => type.nombre !== "*Ninguno")
      .map((type: any) => ({
        value: type.tipoDocumento,
        label: type.nombre
      }))
  } catch (error) {
    console.error("Error cargando tipos de documento:", error)
    return [
      { value: "D  ", label: "DNI" },
      { value: "CE ", label: "Carnet de Extranjería" },
      { value: "PP ", label: "Pasaporte" }
    ]
  }
}
```

### Cargar Especialidades

```typescript
const fetchSpecialties = async (startDate: string, endDate: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}`
    const response = await fetch(url)
    const data = await response.json()
    
    return data
      .filter((item: any) => item.idEspecialidad && item.nombre)
      .map((item: any) => ({
        id: item.idEspecialidad,
        label: item.nombre,
        value: item.idEspecialidad
      }))
  } catch (error) {
    console.error("Error cargando especialidades:", error)
    return []
  }
}
```

## Paso 4: Mostrar FAQs Interactivos

```typescript
// En el paso de selección de tipo de paciente
const showPatientTypeOptions = () => {
  sendBotMessage(
    "¿Qué tipo de paciente es usted?",
    "options",
    {
      options: [
        {
          id: "1",
          label: "PAGANTE",
          value: "PAGANTE",
          description: "No tengo seguro SIS"
        },
        {
          id: "2",
          label: "SIS",
          value: "SIS",
          description: "Tengo seguro SIS"
        },
        {
          id: "3",
          label: "SOAT",
          value: "SOAT",
          description: "Accidente de tránsito"
        }
      ],
      faqs: [
        PATIENT_TYPE_FAQ.PAGANTE,
        PATIENT_TYPE_FAQ.SIS,
        PATIENT_TYPE_FAQ.SOAT
      ]
    }
  )
}

// Renderizar FAQs junto con las opciones
{message.data?.faqs && (
  <div className="space-y-2 mt-2">
    {message.data.faqs.map((faq: any, index: number) => (
      <ChatFAQ key={index} question={faq.question} answer={faq.answer} />
    ))}
  </div>
)}
```

## Paso 5: Confirmar Cita (Llamada a API)

```typescript
const confirmAppointment = async (data: AppointmentData) => {
  try {
    setIsTyping(true)
    
    const payload = {
      tipoDocumento: userData.tipoDocumento,
      numeroDocumento: userData.documento,
      citaId: data.idCita,
      consultorio: data.consultorio,
      nombres: userData.fullName,
      celular: userData.phone,
      correo: userData.email,
      especialidad: data.specialty,
      especialidadNombre: data.specialtyName,
      medico: data.doctor?.nombre,
      medicoNombre: data.doctor?.medicoId,
      fecha: data.dateTime?.date,
      hora: data.dateTime?.time,
      turno: data.shift,
      tipoAtencion: userData.patientType,
      tipoCita: userData.tipoCita,
      especialidadInterconsulta: userData.especialidadInterconsulta || "",
      observacionPaciente: data.observaciones || "",
      lugar: data.lugar
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al crear la cita")
    }
    
    const result = await response.json()
    
    sendBotMessage(
      `¡Cita confirmada! 🎉\n\nTu código de reserva es: ${result.codigo}\n\nRecibirás un correo con los detalles.`,
      "confirmation",
      { reservationCode: result.codigo }
    )
    
    setCurrentStep("appointment-confirmed")
    
  } catch (error) {
    sendBotMessage(
      `❌ Error al confirmar la cita: ${error.message}\n\nPor favor, intenta nuevamente o llama al (01) 418-3232.`,
      "text"
    )
    setCurrentStep("error")
  } finally {
    setIsTyping(false)
  }
}
```

## Paso 6: Manejo de Errores Específicos

```typescript
// Detectar cita duplicada
if (errorMessage.toLowerCase().includes('ya tiene una solicitud')) {
  sendBotMessage(
    "Ya tienes una solicitud de cita pendiente para este mes en esta especialidad.",
    "options",
    {
      options: [
        { id: "1", label: "Buscar otra especialidad", value: "search-other" },
        { id: "2", label: "Ver mi solicitud", value: "view-request" }
      ]
    }
  )
}

// Cita no disponible
if (errorMessage.toLowerCase().includes('ya no está disponible')) {
  sendBotMessage(
    "Lo siento, esa cita ya no está disponible. ¿Deseas buscar otro horario?",
    "options",
    {
      options: [
        { id: "1", label: "Sí, buscar otro horario", value: "search-again" },
        { id: "2", label: "Cancelar", value: "cancel" }
      ]
    }
  )
}
```

## Paso 7: Resumen Visual de la Cita

```typescript
const showAppointmentSummary = (data: AppointmentData) => {
  const summaryText = `
📅 **${data.dateTime?.day}**
${data.dateTime?.displayDate} ${data.dateTime?.time}hs

🏥 **Especialidad**
${data.specialtyName}

🚪 **Consultorio:** ${data.consultorio}

👨‍⚕️ **Médico**
Dr(a). ${data.doctor?.medicoId}

📍 **Ubicación**
${getHospitalAddress(data.lugar)}

👤 **Paciente**
${userData.fullName}
DNI: ${userData.documento}
${userData.patientType === 'SIS' ? '💳 Paciente SIS' : '💰 Paciente Pagante'}
  `
  
  sendBotMessage(summaryText, "summary", data)
  
  setTimeout(() => {
    sendBotMessage(
      "¿Desea agregar una observación?",
      "options",
      {
        options: [
          { id: "1", label: "Sí", value: "yes-observation" },
          { id: "2", label: "No", value: "no-observation" }
        ]
      }
    )
  }, 500)
}
```

## Próximos Pasos

1. Implementar cada paso del flujo en `chatbot-controller.tsx`
2. Crear componentes visuales para listas (médicos, especialidades)
3. Adaptar el calendario para el chat
4. Agregar validaciones en cada paso
5. Implementar persistencia de datos (localStorage/sessionStorage)
6. Agregar botón de "Reiniciar conversación"
7. Implementar historial de mensajes
8. Agregar animaciones de entrada/salida
9. Testing de flujo completo
10. Optimización de performance
