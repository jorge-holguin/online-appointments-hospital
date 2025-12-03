"use client"

import { useEffect, useState, useRef } from "react"
import { FlowStep, PatientData, AppointmentData, PATIENT_TYPE_FAQ, APPOINTMENT_TYPE_FAQ } from "@/types/chatbot"
import { validatePatientData } from "@/lib/validation"
import { format, addMonths, parseISO, startOfDay, isBefore, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { getHospitalAddress } from "@/lib/hospital-utils"
import { useAppConfig, getEffectiveDateRangeForDoctors, getEffectiveDateRangeForDates } from "@/hooks/use-app-config"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "options" | "form" | "specialty-list" | "doctor-list" | "datetime-selector" | "summary"
  data?: any
}

interface ChatbotControllerProps {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ChatbotController({
  messages,
  setMessages,
  setIsTyping
}: ChatbotControllerProps) {
  
  // Usar configuración centralizada de fechas
  const { config, loading: configLoading } = useAppConfig()
  const startDate = config?.dateRange.startDate
  const endDate = config?.dateRange.endDate
  
  // Estado del flujo del chatbot
  const [currentStep, setCurrentStep] = useState<FlowStep>("greeting")
  const [userData, setUserData] = useState<PatientData | null>(null)
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null)
  const [documentTypes, setDocumentTypes] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [observacion, setObservacion] = useState<string>("")
  const [waitingForObservation, setWaitingForObservation] = useState(false)
  const [waitingForAppointmentConfirmation, setWaitingForAppointmentConfirmation] = useState(false)
  const [waitingForLookupCode, setWaitingForLookupCode] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const hasInitialized = useRef(false)
  const lastMessageId = useRef<string | null>(null)
  const lastBotMessageRef = useRef<{ content: string; type: string; data?: any } | null>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasShownInactivityMessage = useRef(false)
  
  // Cargar tipos de documento al inicio
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        // Cargar tipos de documento
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/tipo-documento`)
        const data = await response.json()
        const filtered = data
          .filter((type: any) => type.nombre && type.tipoDocumento)
          .filter((type: any) => type.nombre !== "*Ninguno")
        setDocumentTypes(filtered)
      } catch (error) {
        // Error silencioso al inicializar el chatbot
      }
    }
    initializeChatbot()
  }, [])
  
  // Inicializar conversación con menú principal
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 1 && currentStep === "greeting" && documentTypes.length > 0) {
      hasInitialized.current = true
      setTimeout(() => {
        setCurrentStep("main-menu")
        showMainMenu()
      }, 1500)
    }
  }, [messages, currentStep, documentTypes])
  
  // Timer de inactividad - 15 segundos
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    hasShownInactivityMessage.current = false
    
    inactivityTimerRef.current = setTimeout(() => {
      if (!hasShownInactivityMessage.current && lastBotMessageRef.current) {
        hasShownInactivityMessage.current = true
        sendBotMessage("¿Estás ahí? 👋")
        
        // Repetir la última pregunta después de un breve delay
        setTimeout(() => {
          if (lastBotMessageRef.current) {
            sendBotMessage(
              lastBotMessageRef.current.content,
              lastBotMessageRef.current.type as any,
              lastBotMessageRef.current.data
            )
          }
        }, 1000)
      }
    }, 150000) // 150 segundos
  }
  
  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [])
  
  // Procesar mensajes del usuario
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.sender !== "user" || lastMessage.id === lastMessageId.current) {
      return
    }
    
    lastMessageId.current = lastMessage.id
    handleUserMessage(lastMessage)
  }, [messages])

  const sendBotMessage = (content: string, type: Message["type"] = "text", data?: any, trackForInactivity = true) => {
    setIsTyping(true)
    
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content,
        sender: "bot",
        timestamp: new Date(),
        type,
        data
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
      
      // Guardar último mensaje con opciones para repetir si hay inactividad
      if (trackForInactivity && (type === "options" || type === "form")) {
        lastBotMessageRef.current = { content, type, data }
        resetInactivityTimer()
      }
    }, 800)
  }
  
  const handleUserMessage = async (message: Message) => {
    const content = message.content.trim().toLowerCase()
    
    // Si el mensaje viene con data (selección de botón), procesarlo directamente
    if (message.data?.action) {
      handleButtonAction(message.data.action, message.data.value)
      return
    }
    
    // Si estamos esperando la observación del usuario
    if (waitingForObservation) {
      if (content.length > 100) {
        sendBotMessage("⚠️ La observación no puede tener más de 100 caracteres. Por favor, escribe una más breve:")
        return
      }
      
      setObservacion(message.content.trim())
      setWaitingForObservation(false)
      sendBotMessage(`Observación guardada: "${message.content.trim()}"`)
      
      setTimeout(() => {
        setCurrentStep("final-confirmation")
        askForFinalConfirmation()
      }, 1000)
      return
    }
    
    // Si estamos esperando el código de reserva para consultar cita
    if (waitingForLookupCode) {
      const code = message.content.trim().toUpperCase()
      setWaitingForLookupCode(false)
      
      if (code.length < 4) {
        sendBotMessage("⚠️ El código ingresado parece muy corto. Por favor, ingresa un código válido:")
        setWaitingForLookupCode(true)
        return
      }
      
      await lookupAppointment(code)
      return
    }
    
    // Si estamos esperando confirmación para mostrar el formulario
    if (waitingForAppointmentConfirmation) {
      const affirmativeWords = ['si', 'sí', 'yes', 'ok', 'vale', 'claro', 'por favor', 'quiero', 'necesito']
      const negativeWords = ['no', 'nop', 'nope', 'nunca', 'después', 'luego', 'ahora no']
      
      const isAffirmative = affirmativeWords.some(word => content.includes(word))
      const isNegative = negativeWords.some(word => content.includes(word))
      
      setWaitingForAppointmentConfirmation(false)
      
      if (isAffirmative) {
        // Mostrar el formulario
        setCurrentStep("requesting-data")
        sendBotMessage("Perfecto, te mostraré el formulario para solicitar tu cita.")
        setTimeout(() => {
          showRegistrationForm()
        }, 800)
      } else if (isNegative) {
        sendBotMessage("¡Gracias por usar nuestro asistente virtual! Si necesitas algo más, estaré aquí para ayudarte. 😊")
        setCurrentStep("greeting")
        hasInitialized.current = false
      } else {
        // Si no entendemos, preguntar de nuevo
        sendBotMessage("No entendí tu respuesta. ¿Deseas solicitar una cita? Por favor responde 'sí' o 'no'.")
        setWaitingForAppointmentConfirmation(true)
      }
      return
    }
    
    // Si el usuario escribe texto libre que no es parte del flujo esperado
    // Mostrar mensaje de que no puede entender y ofrecer solicitar cita
    if (currentStep !== "requesting-data" && currentStep !== "appointment-confirmed") {
      sendBotMessage("Lo siento, no puedo entenderte. 😔")
      setTimeout(() => {
        sendBotMessage(
          "¿Deseas solicitar tu cita?",
          "options",
          {
            options: [
              { id: "yes", label: "Sí, quiero solicitar una cita", value: "yes" },
              { id: "no", label: "No, gracias", value: "no" }
            ],
            action: "unmapped-text-response"
          }
        )
      }, 800)
      return
    }
    
    // Procesar mensaje de texto libre con NLP básico (fallback)
    try {
      const response = await fetch('/api/chatbot/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, currentStep, userData, appointmentData })
      })
      
      const result = await response.json()
      
      if (result.intent) {
        handleIntent(result.intent, result.entities)
      }
    } catch (error) {
      // Error silencioso en procesamiento de mensaje del chatbot
    }
  }
  
  const handleButtonAction = (action: string, value: any) => {
    // Resetear timer de inactividad cuando el usuario interactúa
    resetInactivityTimer()
    
    switch (action) {
      case 'main-menu-selection':
        handleMainMenuSelection(value)
        break
      case 'form-submit':
        handleFormSubmit(value)
        break
      case 'select-patient-type':
        handlePatientTypeSelection(value)
        break
      case 'select-appointment-type':
        handleAppointmentTypeSelection(value)
        break
      case 'select-specialty':
        handleSpecialtySelection(value)
        break
      case 'select-interconsulta-specialty':
        handleInterconsultaSpecialtySelection(value)
        break
      case 'select-search-method':
        handleSearchMethodSelection(value)
        break
      case 'select-doctor':
        handleDoctorSelection(value)
        break
      case 'select-doctor-after-datetime':
        handleDoctorAfterDateTimeSelection(value)
        break
      case 'select-shift':
        handleShiftSelection(value)
        break
      case 'select-datetime':
        handleDateTimeSelection(value)
        break
      case 'add-observation':
        handleObservationResponse(value)
        break
      case 'confirm-appointment':
        if (value === 'yes') {
          confirmAppointment()
        } else {
          sendBotMessage("Entendido. Puedes volver a seleccionar especialidad, médico u horario desde el menú principal.")
          setCurrentStep("greeting")
        }
        break
      case 'unmapped-text-response':
        if (value === 'yes') {
          setCurrentStep("requesting-data")
          sendBotMessage("Perfecto, te mostraré el formulario para solicitar tu cita.")
          setTimeout(() => {
            showRegistrationForm()
          }, 800)
        } else {
          sendBotMessage("¡Gracias por usar nuestro asistente virtual! Si necesitas algo más, estaré aquí para ayudarte. 😊")
          setCurrentStep("greeting")
          hasInitialized.current = false
        }
        break
      case 'retry-specialty':
        if (value === 'yes') {
          // Limpiar datos de cita anterior pero mantener datos del paciente
          setAppointmentData(null)
          setObservacion("")
          setCurrentStep("selecting-specialty")
          loadSpecialties()
        } else {
          // Volver al menú principal
          setCurrentStep("main-menu")
          showMainMenu()
        }
        break
    }
  }
  
  const handleIntent = (intent: string, entities: any) => {
    // Manejar intenciones detectadas por NLP
    switch (intent) {
      case 'greeting':
        sendBotMessage("¡Hola! ¿En qué puedo ayudarte hoy?")
        break
      case 'affirmative':
        // Continuar con el flujo actual
        break
      case 'negative':
        // Manejar respuesta negativa
        break
    }
  }
  
  // Mostrar menú principal con opciones de reservar o consultar cita
  const showMainMenu = () => {
    sendBotMessage(
      "¿En qué puedo ayudarte hoy?",
      "options",
      {
        options: [
          { id: "reserve", label: "Deseo reservar una cita", value: "reserve" },
          { id: "lookup", label: "Deseo consultar el estado de mi cita", value: "lookup" }
        ],
        action: "main-menu-selection"
      }
    )
  }
  
  // Manejar selección del menú principal
  const handleMainMenuSelection = (value: string) => {
    if (value === "reserve") {
      sendBotMessage("Antes de continuar, necesito conocer tus datos personales para poder ayudarte.")
      setTimeout(() => {
        setCurrentStep("requesting-data")
        showRegistrationForm()
      }, 1000)
    } else if (value === "lookup") {
      setCurrentStep("lookup-appointment")
      sendBotMessage("Por favor, ingresa tu código de reserva:")
      setWaitingForLookupCode(true)
    } else if (value === "done") {
      sendBotMessage("¡Gracias por usar nuestro asistente virtual! Si necesitas algo más, estaré aquí para ayudarte. 😊")
      setCurrentStep("greeting")
      hasInitialized.current = false
    }
  }
  
  // Consultar estado de cita por código
  const lookupAppointment = async (code: string) => {
    sendBotMessage("Buscando tu cita... 🔍", "text", undefined, false)
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes/codigo/${code}`
      )
      
      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          sendBotMessage("❌ No se encontró ninguna cita con ese código. Por favor, verifica e intenta nuevamente.")
        } else {
          sendBotMessage("❌ Hubo un error al consultar tu cita. Por favor, intenta más tarde.")
        }
        
        setTimeout(() => {
          setCurrentStep("main-menu")
          showMainMenu()
        }, 2000)
        return
      }
      
      const data = await response.json()
      
      // Mostrar información de la cita encontrada
      const getStatusText = (estado: string) => {
        switch (estado) {
          case 'PENDIENTE': return '⏳ Pendiente'
          case 'CONFIRMADA': return '✅ Confirmada'
          case 'CANCELADA': return '❌ Cancelada'
          default: return estado
        }
      }
      const statusText = getStatusText(data.estado)
      const horaText = data.hora ? data.hora + 'hs' : 'No disponible'
      const ubicacionText = data.lugar === '1' ? 'Sede Central Hospital Chosica' : 'Jr. Cuzco 339 - Consultorios Externos'
      const observacionText = data.observacion ? '📝 **Observación:** ' + data.observacion + '\n\n' : ''
      const consultorioText = data.consultorio ? '\n🚪 **Consultorio:** ' + data.consultorio : ''
      
      const summaryText = '📋 **Estado de tu cita**\n\n' +
        '🔖 **Código:** ' + (data.codigo || code) + '\n\n' +
        '📊 **Estado:** ' + statusText + '\n\n' +
        '📅 **Fecha:** ' + (data.fecha || 'No disponible') + '\n' +
        '🕐 **Hora:** ' + horaText + '\n\n' +
        '🏥 **Especialidad:** ' + (data.especialidadNombre || 'No disponible') + '\n' +
        '👨‍⚕️ **Médico:** Dr(a). ' + (data.medicoNombre || 'No disponible') + '\n\n' +
        '👤 **Paciente:** ' + (data.nombres || 'No disponible') + '\n' +
        '📄 **Documento:** ' + (data.numeroDocumento || 'No disponible') + '\n\n' +
        observacionText +
        '📍 **Ubicación:** ' + ubicacionText + consultorioText
      
      sendBotMessage(summaryText, "summary", { summary: summaryText })
      
      setTimeout(() => {
        sendBotMessage(
          "¿Hay algo más en lo que pueda ayudarte?",
          "options",
          {
            options: [
              { id: "reserve", label: "Deseo reservar una cita", value: "reserve" },
              { id: "lookup", label: "Consultar otra cita", value: "lookup" },
              { id: "done", label: "No, gracias", value: "done" }
            ],
            action: "main-menu-selection"
          }
        )
      }, 1500)
      
    } catch (error) {
      sendBotMessage("❌ Hubo un error de conexión. Por favor, intenta más tarde.")
      
      setTimeout(() => {
        setCurrentStep("main-menu")
        showMainMenu()
      }, 2000)
    }
  }
  
  const showRegistrationForm = () => {
    sendBotMessage(
      "Completa tus datos:",
      "form",
      {
        fields: [
          { id: "fullName", label: "Apellidos y Nombres", type: "text", required: true, placeholder: "PEREZ GARCIA JUAN" },
          { id: "phone", label: "Teléfono", type: "tel", required: true, placeholder: "987654321" },
          {
            id: "tipoDocumento",
            label: "Tipo Doc.",
            type: "select",
            required: true,
            options: documentTypes.map(dt => ({ value: dt.tipoDocumento, label: dt.nombre }))
          },
          { id: "documento", label: "Nro. Documento", type: "text", required: true, placeholder: "12345678" },
          { id: "digitoVerificador", label: "Dígito Verif. (DNI)", type: "text", placeholder: "Opcional" },
          { id: "email", label: "Correo", type: "email", required: true, placeholder: "correo@email.com" }
        ]
      }
    )
  }
  
  const handleFormSubmit = async (formData: any) => {
    const validation = validatePatientData(formData)
    
    if (!validation.success) {
      const errors = Object.entries(validation.errors || {})
        .map(([field, error]) => `• ${error}`)
        .join("\n")
      
      sendBotMessage(
        `Por favor corrige los siguientes errores:\n\n${errors}`,
        "text"
      )
      return
    }
    
    setUserData(formData as PatientData)
    
    // Obtener token de sesión después de completar el formulario
    try {
      const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes/sesion`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setSessionToken(sessionData.token)
      } else {
        // Error al obtener token de sesión
      }
    } catch (error) {
      // Error silencioso en llamada de sesión
    }
    
    setCurrentStep("selecting-patient-type")
    
    sendBotMessage(
      `Perfecto, ${formData.fullName}. Ahora necesito saber qué tipo de paciente eres.`,
      "text"
    )
    
    setTimeout(() => {
      showPatientTypeOptions()
    }, 800)
  }
  
  const showPatientTypeOptions = () => {
    sendBotMessage(
      "¿Qué tipo de paciente es usted?",
      "options",
      {
        options: [
          {
            id: "pagante",
            label: "PAGANTE",
            value: "PAGANTE",
            description: "No tengo seguro SIS, pagaré el 100% de mi atención"
          },
          {
            id: "sis",
            label: "SIS",
            value: "SIS",
            description: "Tengo seguro SIS activo"
          },
          {
            id: "soat",
            label: "SOAT",
            value: "SOAT",
            description: "Accidente de tránsito, mi seguro vehicular cubrirá"
          }
        ],
        action: "select-patient-type",
        faqs: [
          PATIENT_TYPE_FAQ.PAGANTE,
          PATIENT_TYPE_FAQ.SIS,
          PATIENT_TYPE_FAQ.SOAT
        ]
      }
    )
  }
  
  const handlePatientTypeSelection = (patientType: string) => {
    setUserData(prev => ({ ...prev!, patientType: patientType as any }))
    setCurrentStep("selecting-appointment-type")
    
    sendBotMessage(
      `Has seleccionado: ${patientType}. Ahora, ¿qué tipo de cita necesitas?`,
      "text"
    )
    
    setTimeout(() => {
      showAppointmentTypeOptions()
    }, 800)
  }
  
  const showAppointmentTypeOptions = () => {
    sendBotMessage(
      "Selecciona el tipo de cita que necesitas:",
      "options",
      {
        options: [
          {
            id: "citado",
            label: "CITADO",
            value: "CITADO",
            description: "Cita regular, referido por mi posta o centro de salud"
          },
          {
            id: "interconsulta",
            label: "INTERCONSULTA",
            value: "INTERCONSULTA",
            description: "Referido por un médico de otra especialidad"
          },
          {
            id: "tramite",
            label: "TRÁMITE ADMINISTRATIVO",
            value: "TRAMITE",
            description: "Necesito reservar para formalizar un trámite"
          }
        ],
        action: "select-appointment-type",
        faqs: [
          APPOINTMENT_TYPE_FAQ.CITADO,
          APPOINTMENT_TYPE_FAQ.INTERCONSULTA,
          APPOINTMENT_TYPE_FAQ.TRAMITE
        ]
      }
    )
  }
  
  const handleAppointmentTypeSelection = async (tipoCita: string) => {
    setUserData(prev => ({ ...prev!, tipoCita: tipoCita as any }))
    
    if (tipoCita === "INTERCONSULTA") {
      sendBotMessage("Para una interconsulta, necesito saber de qué especialidad vienes. Un momento mientras cargo las especialidades...")
      
      // Cargar especialidades para interconsulta
      if (!startDate || !endDate) {
        sendBotMessage("Error: No se pudo cargar la configuración de fechas.")
        return
      }
      
      try {
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}`
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
        sendBotMessage("Error al cargar especialidades. Continuando...")
      }
    }
    
    setCurrentStep("selecting-specialty")
    
    sendBotMessage(
      `Tipo de cita seleccionada: ${tipoCita}. Ahora, ¿qué especialidad necesitas?`,
      "text"
    )
    
    setTimeout(() => {
      loadSpecialties()
    }, 800)
  }
  
  const loadSpecialties = async () => {
    sendBotMessage("Cargando especialidades disponibles...")
    
    if (!startDate || !endDate) {
      sendBotMessage("Error: No se pudo cargar la configuración de fechas. Por favor, intenta de nuevo.")
      return
    }
    
    try {
      // Usar fechas centralizadas de useAppConfig
      const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/especialidades`
      const response = await fetch(url)
      const data = await response.json()
      
      const filtered = data
        .filter((item: any) => item.idEspecialidad && item.nombre)
        .map((item: any) => ({
          id: item.idEspecialidad,
          nombre: item.nombre
        }))
      
      setSpecialties(filtered)
      
      sendBotMessage(
        "Selecciona la especialidad que necesitas:",
        "specialty-list",
        {
          specialties: filtered,
          action: "select-specialty"
        }
      )
    } catch (error) {
      sendBotMessage("Lo siento, hubo un error al cargar las especialidades. Por favor, intenta nuevamente.")
    }
  }
  
  const handleInterconsultaSpecialtySelection = (specialty: any) => {
    // Guardar el nombre de la especialidad de interconsulta
    setUserData(prev => ({ ...prev!, especialidadInterconsulta: specialty.nombre }))
    
    sendBotMessage(
      `Especialidad de interconsulta: ${specialty.nombre}. Ahora, ¿qué especialidad necesitas para tu cita?`,
      "text"
    )
    
    setCurrentStep("selecting-specialty")
    
    setTimeout(() => {
      loadSpecialties()
    }, 800)
  }
  
  const handleSpecialtySelection = (specialty: any) => {
    setAppointmentData({
      specialty: specialty.id,
      specialtyName: specialty.nombre
    })
    
    setCurrentStep("selecting-search-method")
    
    sendBotMessage(
      `Especialidad seleccionada: ${specialty.nombre}. ¿Cómo deseas buscar tu cita?`,
      "text"
    )
    
    setTimeout(() => {
      showSearchMethodOptions()
    }, 800)
  }
  
  const showSearchMethodOptions = () => {
    sendBotMessage(
      "Elige cómo quieres buscar tu cita:",
      "options",
      {
        options: [
          {
            id: "by-doctor",
            label: "Buscar por Médico",
            value: "doctor",
            description: "Primero elijo el médico, luego veo sus horarios"
          },
          {
            id: "by-date",
            label: "Buscar por Fecha y Hora",
            value: "datetime",
            description: "Primero elijo la fecha, luego veo médicos disponibles"
          }
        ],
        action: "select-search-method"
      }
    )
  }
  
  const handleSearchMethodSelection = (method: string) => {
    // IMPORTANTE: Limpiar datos anteriores al cambiar método de búsqueda
    // Esto evita el bug de cruce entre búsqueda por médico y por fecha
    setAppointmentData(prev => ({ 
      ...prev!, 
      searchMethod: method as any,
      doctor: undefined,  // Limpiar médico anterior
      dateTime: undefined, // Limpiar fecha/hora anterior
      timeRange: undefined, // Limpiar rango de tiempo anterior
      consultorio: undefined,
      idCita: undefined,
      lugar: undefined
    }))
    
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
            { id: "morning", label: "Mañana", value: "M" },
            { id: "afternoon", label: "Tarde", value: "T" }
          ],
          action: "select-shift"
        }
      )
    }
  }
  
  const loadDoctors = async () => {
    // Validar que el config esté cargado
    if (configLoading) {
      setTimeout(() => loadDoctors(), 500)
      return
    }
    
    if (!startDate || !endDate || !appointmentData?.specialty) {
      sendBotMessage("Error: Faltan datos para cargar médicos.")
      return
    }
    
    // Calcular rango dinámico: mes actual + mes siguiente
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const dateRange = getEffectiveDateRangeForDoctors(monthStart, monthEnd, startDate, endDate)
    
    if (!dateRange) {
      sendBotMessage("Error: No se pudo calcular el rango de fechas.")
      return
    }
    
    const { startDate: fetchStartDate, endDate: fetchEndDate } = dateRange
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/medicos?fechaInicio=${fetchStartDate}&fechaFin=${fetchEndDate}&idEspecialidad=${appointmentData.specialty}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Error al obtener médicos: ${response.status}`)
      }
      
      const data = await response.json()
      
      const doctors = data
        .filter((item: any) => item.nombre && item.medicoId)
        .map((item: any) => ({
          id: item.nombre, // Código corto del médico (ej: "VPC")
          nombre: item.nombre, // Código corto del médico
          medicoId: item.medicoId, // Nombre completo del médico (ej: "VILLARREAL PARIONA...")
          especialidadId: appointmentData.specialty
        }))
      
      setDoctors(doctors)
      
      if (doctors.length === 0) {
        sendBotMessage("No hay médicos disponibles para esta especialidad en el rango de fechas seleccionado.")
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
      sendBotMessage("Lo siento, hubo un error al cargar los médicos. Por favor, intenta nuevamente.")
    }
  }
  
  const handleDoctorSelection = (doctor: any) => {
    setAppointmentData(prev => ({
      ...prev!,
      doctor: { 
        nombre: doctor.nombre, // Código corto (ej: "VPC")
        medicoId: doctor.medicoId // Nombre completo (ej: "VILLARREAL PARIONA...")
      }
    }))
    
    setCurrentStep("selecting-shift")
    
    sendBotMessage(
      `Médico seleccionado: ${doctor.medicoId}. ¿En qué turno prefieres atenderte?`,
      "options",
      {
        options: [
          { id: "morning", label: "Mañana", value: "M" },
          { id: "afternoon", label: "Tarde", value: "T" }
        ],
        action: "select-shift"
      }
    )
  }
  
  const handleDoctorAfterDateTimeSelection = async (doctor: any) => {
    // Actualizar datos del médico seleccionado después de haber elegido fecha/hora
    setAppointmentData(prev => ({
      ...prev!,
      doctor: { 
        nombre: doctor.nombre, // Código del médico
        medicoId: doctor.medicoId // Nombre completo del médico
      }
    }))
    
    sendBotMessage(`Médico seleccionado: ${doctor.medicoId}. Cargando horarios disponibles...`)
    
    // Ahora cargar las horas específicas del médico en el rango seleccionado
    try {
      if (!appointmentData?.dateTime?.date || !appointmentData?.timeRange || !appointmentData?.shift) {
        throw new Error('Faltan datos de fecha/hora/turno')
      }
      
      const turno = appointmentData.shift
      const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/por-fecha?fecha=${appointmentData.dateTime.date}&turnoConsulta=${turno}&idEspecialidad=${appointmentData.specialty}&horaInicio=${encodeURIComponent(appointmentData.timeRange.start)}&horaFin=${encodeURIComponent(appointmentData.timeRange.end)}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Error: ${response.status}`)
      
      const data = await response.json()
      
      // Filtrar solo las citas del médico seleccionado
      // Estado "1" o "4" = disponible
      const doctorSlots = data
        .filter((item: any) => 
          item.medico === doctor.nombre &&
          (item.estado === "1" || item.estado === "4") && 
          !item.conSolicitud
        )
        .map((item: any) => ({
          date: item.fecha,
          time: item.hora.trim(),
          consultorio: item.consultorio,
          idCita: item.idCita || item.citaId,
          lugar: item.lugar
        }))
      
      if (doctorSlots.length === 0) {
        sendBotMessage("No hay horarios disponibles para este médico. Por favor, selecciona otro médico.")
        setCurrentStep("selecting-doctor-after-datetime")
        return
      }
      
      // Mostrar las horas disponibles
      setCurrentStep("selecting-datetime")
      sendBotMessage(
        "Selecciona la hora específica:",
        "datetime-selector",
        {
          slots: doctorSlots,
          action: "select-datetime"
        }
      )
    } catch (error) {
      sendBotMessage("Error al cargar horarios. Intenta nuevamente.")
    }
  }
  
  const handleShiftSelection = (shift: string) => {
    setAppointmentData(prev => {
      const updated = { ...prev!, shift: shift as any }
      return updated
    })
    setCurrentStep("selecting-datetime")
    sendBotMessage("Cargando fechas disponibles...")
    
    // Pasar el shift directamente para evitar problemas con estado asíncrono
    if (configLoading) {
      setTimeout(() => loadAvailableSlots(shift as any), 500)
    } else {
      loadAvailableSlots(shift as any)
    }
  }
  
  const loadAvailableSlots = async (shiftParam?: "M" | "T") => {
    // Validar que el config esté cargado
    if (configLoading) {
      sendBotMessage("Cargando configuración...")
      return
    }
    
    if (!startDate || !endDate || !appointmentData?.specialty) {
      sendBotMessage("Error: Faltan datos para cargar horarios.")
      return
    }
    
    // Usar el shift del parámetro si está disponible, sino usar el del estado
    const currentShift = shiftParam || appointmentData.shift
    
    try {
      let url: string
      const today = new Date()
      const monthStart = startOfMonth(today)
      const monthEnd = endOfMonth(today)
      
      // Si ya seleccionó médico, cargar citas específicas (con mes siguiente)
      if (appointmentData.doctor && currentShift) {
        const dateRange = getEffectiveDateRangeForDoctors(monthStart, monthEnd, startDate, endDate)
        if (!dateRange) {
          sendBotMessage("Error: No se pudo calcular el rango de fechas.")
          return
        }
        const { startDate: fetchStartDate, endDate: fetchEndDate } = dateRange
        const turno = currentShift === "M" ? "M" : "T"
        url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/citas?fechaInicio=${fetchStartDate}&fechaFin=${fetchEndDate}&medicoId=${appointmentData.doctor.nombre}&turnoConsulta=${turno}&idEspecialidad=${appointmentData.specialty}`
      } else {
        // Si busca por fecha, cargar fechas disponibles (solo mes actual)
        const dateRange = getEffectiveDateRangeForDates(monthStart, monthEnd, startDate, endDate)
        if (!dateRange) {
          sendBotMessage("Error: No se pudo calcular el rango de fechas.")
          return
        }
        const { startDate: fetchStartDate, endDate: fetchEndDate } = dateRange
        const turno = currentShift === "M" ? "M" : "T"
        url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/fechas-consultorios?fechaInicio=${fetchStartDate}&fechaFin=${fetchEndDate}&turnoConsulta=${turno}&idEspecialidad=${appointmentData.specialty}`
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
      
      // SIEMPRE mostrar el calendario, incluso si no hay slots
      // El calendario permite navegar entre meses para buscar disponibilidad
      sendBotMessage(
        slots.length === 0 
          ? "No hay horarios disponibles en este mes. Puedes cambiar de mes en el calendario:"
          : "Selecciona la fecha y hora para tu cita:",
        "datetime-selector",
        {
          searchMethod: appointmentData.searchMethod,
          specialty: appointmentData.specialty,
          doctor: appointmentData.doctor,
          shift: currentShift,  // Usar currentShift en lugar de appointmentData.shift
          action: "select-datetime"
        }
      )
    } catch (error) {
      sendBotMessage("Lo siento, hubo un error al cargar los horarios. Por favor, intenta nuevamente.")
    }
  }
  
  const handleDateTimeSelection = async (slot: any) => {
    // Preparar los datos actualizados
    const updatedData = {
      ...appointmentData!,
      dateTime: {
        date: slot.date,
        time: slot.time,
        day: format(parseISO(slot.date), "EEEE", { locale: es }),
        displayDate: format(parseISO(slot.date), "dd/MM/yyyy")
      },
      timeRange: slot.timeRange, // Guardar el rango de tiempo si existe
      consultorio: slot.consultorio,
      idCita: slot.idCita,
      lugar: slot.lugar || "2"
    }
    
    // Actualizar datos de cita con fecha/hora seleccionada
    setAppointmentData(updatedData)
    
    // IMPORTANTE: Usar searchMethod para determinar el flujo, no la presencia de doctor
    // Esto evita el bug de cruce cuando el usuario cambia de método de búsqueda
    
    // Si el método de búsqueda es "doctor" (primero médico, luego fecha), ir al resumen
    if (appointmentData?.searchMethod === "doctor" && appointmentData?.doctor) {
      setCurrentStep("showing-summary")
      // Pasar los datos actualizados directamente
      showAppointmentSummary(updatedData)
      return
    }
    
    // Si ya tenemos médico seleccionado (flujo datetime -> médico -> hora específica), ir al resumen
    if (appointmentData?.doctor && slot.time && !slot.timeRange) {
      setCurrentStep("showing-summary")
      showAppointmentSummary(updatedData)
      return
    }
    
    // Si buscamos por fecha/hora y aún no hay médico, cargar médicos disponibles
    if (appointmentData?.searchMethod === "datetime" && !appointmentData?.doctor) {
      setCurrentStep("selecting-doctor-after-datetime")
      sendBotMessage("Cargando médicos disponibles para esta fecha y hora...")
      
      try {
        const turno = appointmentData.shift === "M" ? "M" : "T"
        
        // Si tenemos un rango de tiempo, usar el endpoint /por-fecha
        let url: string
        if (slot.timeRange) {
          // Endpoint correcto para búsqueda por rango de hora
          url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/por-fecha?fecha=${slot.date}&turnoConsulta=${turno}&idEspecialidad=${appointmentData.specialty}&horaInicio=${encodeURIComponent(slot.timeRange.start)}&horaFin=${encodeURIComponent(slot.timeRange.end)}`
        } else {
          // Fallback al endpoint anterior si no hay rango
          url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/citas?fechaInicio=${slot.date}&fechaFin=${slot.date}&turnoConsulta=${turno}&idEspecialidad=${appointmentData.specialty}`
        }
        
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Error: ${response.status}`)
        
        const data = await response.json()
        
        // Filtrar citas disponibles
        // Estado "4" = disponible, conSolicitud = false significa que no tiene solicitud pendiente
        const availableDoctors = data
          .filter((item: any) => {
            const isValid = item.medico && item.nombreMedico && 
                           (item.estado === "1" || item.estado === "4") && 
                           !item.conSolicitud
            return isValid
          })
          .map((item: any) => ({
            id: item.medico, // Código del médico
            nombre: item.medico, // Código del médico
            medicoId: item.nombreMedico, // Nombre completo
            especialidadId: appointmentData.specialty,
            // Guardar datos adicionales de la cita
            consultorio: item.consultorio,
            idCita: item.idCita || item.citaId,
            lugar: item.lugar
          }))
          // Eliminar duplicados por código de médico
          .filter((doctor: any, index: number, self: any[]) => 
            index === self.findIndex((d) => d.id === doctor.id)
          )
        
        if (availableDoctors.length === 0) {
          sendBotMessage("No hay médicos disponibles para esta fecha y hora. Por favor, selecciona otra opción.")
          setCurrentStep("selecting-datetime")
          return
        }
        
        sendBotMessage(
          "Selecciona el médico disponible:",
          "doctor-list",
          {
            doctors: availableDoctors,
            action: "select-doctor-after-datetime"
          }
        )
      } catch (error) {
        sendBotMessage("Error al cargar médicos. Intenta nuevamente.")
      }
    }
  }
  
  const showAppointmentSummary = (dataOverride?: AppointmentData) => {
    // Usar los datos pasados como parámetro o los del estado
    const data = dataOverride || appointmentData!
    
    const summaryText = `📅 **${data.dateTime?.day}**\n${data.dateTime?.displayDate} ${data.dateTime?.time}hs\n\n🏥 **Especialidad**\n${data.specialtyName}\n\n🚪 **Consultorio:** ${data.consultorio}\n\n👨‍⚕️ **Médico**\nDr(a). ${data.doctor?.medicoId}\n\n📍 **Ubicación**\n${getHospitalAddress(data.lugar)}\n\n👤 **Paciente**\n${userData!.fullName}\nDNI: ${userData!.documento}\n💳 ${userData!.patientType === 'SIS' ? 'Paciente SIS' : 'Paciente Pagante'}`
    
    sendBotMessage(
      "Este es el resumen de tu cita:",
      "summary",
      { summary: summaryText }
    )
    
    setTimeout(() => {
      setCurrentStep("requesting-observations")
      askForObservations()
    }, 1500)
  }
  
  const askForObservations = () => {
    const isRequired = userData?.tipoCita === 'TRAMITE'
    
    sendBotMessage(
      isRequired
        ? "Para trámites administrativos, es obligatorio agregar una observación explicando el motivo. Por favor, escribe tu observación:"
        : "¿Deseas agregar alguna observación a tu cita?",
      isRequired ? "text" : "options",
      isRequired ? null : {
        options: [
          { id: "yes", label: "Sí, agregar observación", value: "yes" },
          { id: "no", label: "No, continuar sin observación", value: "no" }
        ],
        action: "add-observation"
      }
    )
  }
  
  const handleObservationResponse = (response: string) => {
    if (response === "no") {
      setCurrentStep("final-confirmation")
      askForFinalConfirmation()
    } else {
      setWaitingForObservation(true)
      sendBotMessage("Por favor, escribe tu observación (máximo 100 caracteres):")
    }
  }
  
  const askForFinalConfirmation = () => {
    sendBotMessage(
      "¿Confirmas todos los datos para procesar tu solicitud de cita?",
      "options",
      {
        options: [
          { id: "confirm", label: "Sí, confirmar solicitud", value: "yes" },
          { id: "cancel", label: "No, quiero modificar", value: "no" }
        ],
        action: "confirm-appointment"
      }
    )
  }
  
  const confirmAppointment = async () => {
    sendBotMessage("Procesando tu solicitud...")
    setIsTyping(true)
    
    try {
      // Validar que tenemos el token de sesión
      if (!sessionToken) {
        throw new Error('No se ha obtenido el token de sesión')
      }

      // Construir URL base para consultar la cita
      const baseOrigin = typeof window !== 'undefined' ? window.location.origin : ''

      // Paso 2: Preparar datos de la cita
      // Validar que tenemos todos los campos obligatorios
      if (!appointmentData?.doctor?.nombre) {
        throw new Error('El médico es obligatorio')
      }
      if (!appointmentData?.doctor?.medicoId) {
        throw new Error('El nombre del médico es obligatorio')
      }
      if (!appointmentData?.dateTime?.time) {
        throw new Error('La hora es obligatoria')
      }
      
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
        medico: appointmentData.doctor.nombre, // Código del médico (obligatorio)
        medicoNombre: appointmentData.doctor.medicoId, // Nombre completo (obligatorio)
        fecha: appointmentData?.dateTime?.date || "",
        hora: appointmentData.dateTime.time, // Hora (obligatorio)
        turno: appointmentData?.shift || "",
        tipoAtencion: userData?.tipoCita === 'TRAMITE' 
          ? 'PAGANTE' 
          : (userData?.patientType === 'SIS' ? 'SIS' : 'PAGANTE'),
        tipoCita: userData?.tipoCita || "",
        especialidadInterconsulta: userData?.especialidadInterconsulta || "",
        observacionPaciente: observacion || "",
        lugar: appointmentData?.lugar ?? null
      }

      // Paso 2: Enviar solicitud de cita
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes?token=${encodeURIComponent(sessionToken)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Error al procesar la solicitud'
        
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (e) {
          // Usar mensaje por defecto
        }
        
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      
      setCurrentStep("appointment-confirmed")
      setIsTyping(false)

      // Mostrar resumen de la cita confirmada
      const location = getHospitalAddress(appointmentData?.lugar)
      const dayName = appointmentData?.dateTime?.day || "Día"
      const displayDate = appointmentData?.dateTime?.displayDate || appointmentData?.dateTime?.date
      
      const confirmationMessage = `
🎉 **¡Su reserva de cita ha sido admitida!**

📋 **Código de Solicitud:** ${responseData.codigo}

📅 **${dayName}**
${displayDate} - ${appointmentData?.dateTime?.time}

🏥 **Especialidad:** ${appointmentData?.specialtyName}
👨‍⚕️ **Médico:** Dr(a). ${appointmentData?.doctor?.medicoId}
🚪 **Consultorio:** ${appointmentData?.consultorio}

📍 ${location}

👤 **Paciente:** ${userData?.fullName}
🆔 **${userData?.tipoDocumento === 'D  ' ? 'DNI' : 'Documento'}:** ${userData?.documento}
💳 **Tipo:** ${userData?.patientType === 'SIS' ? 'Paciente SIS' : 'Pagante'}

✅ Puedes consultar el estado de tu solicitud en: [${baseOrigin}/${responseData.codigo}](${baseOrigin}/${responseData.codigo})

📧 Recibirás un correo con todos los detalles.

¡Te esperamos! 😊
      `.trim()

      sendBotMessage(confirmationMessage, "text")
      
      // Enviar link como mensaje separado
      setTimeout(() => {
        const link = baseOrigin ? `${baseOrigin}/${responseData.codigo}` : `${responseData.codigo}`
        sendBotMessage(
          `🔗 Consulta el estado de tu solicitud aquí: [${link}](${link})`,
          "text"
        )
      }, 1500)
      
    } catch (error) {
      setIsTyping(false)
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      sendBotMessage(
        `❌ Lo siento, hubo un error al procesar tu solicitud:\n\n${errorMessage}\n\nPor favor, intenta nuevamente o llama al (01) 418-3232.`
      )
      
      // Ofrecer opción de seleccionar otra especialidad
      setTimeout(() => {
        setCurrentStep("selecting-specialty")
        sendBotMessage(
          "¿Deseas seleccionar otra especialidad?",
          "options",
          {
            options: [
              { id: "yes", label: "Sí, seleccionar otra especialidad", value: "yes" },
              { id: "no", label: "No, volver al inicio", value: "no" }
            ],
            action: "retry-specialty"
          }
        )
      }, 1500)
    }
  }

  return null
}
