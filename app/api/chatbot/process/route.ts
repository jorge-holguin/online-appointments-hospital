import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para procesar mensajes de texto libre del chatbot
 * Implementa NLP básico con detección de intenciones y entidades
 */

// Normalizar texto: minúsculas, sin tildes, sin símbolos
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
    .replace(/[^\w\s]/g, '') // Eliminar símbolos
    .trim()
}

// Palabras clave por intención
const intents = {
  greeting: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'holi'],
  affirmative: ['si', 'sip', 'ok', 'vale', 'claro', 'exacto', 'correcto', 'confirmo', 'acepto'],
  negative: ['no', 'nop', 'nope', 'negativo', 'tampoco', 'nunca'],
  thanks: ['gracias', 'thanks', 'agradezco', 'agradecido'],
  help: ['ayuda', 'help', 'auxilio', 'socorro', 'asistencia'],
  appointment: ['cita', 'turno', 'consulta', 'reserva', 'agendar'],
  cancel: ['cancelar', 'anular', 'eliminar', 'borrar'],
  specialty: ['especialidad', 'medicina', 'doctor', 'medico'],
  date: ['fecha', 'dia', 'cuando', 'horario', 'hora']
}

// Detectar intent por palabras clave
const detectIntent = (normalizedText: string): string | null => {
  for (const [intent, keywords] of Object.entries(intents)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        return intent
      }
    }
  }
  return null
}

// Extraer entidades comunes
const extractEntities = (text: string): Record<string, any> => {
  const entities: Record<string, any> = {}
  
  // Detectar DNI (8 dígitos)
  const dniMatch = text.match(/\b\d{8}\b/)
  if (dniMatch) {
    entities.dni = dniMatch[0]
  }
  
  // Detectar teléfono (9 dígitos empezando con 9)
  const phoneMatch = text.match(/\b9\d{8}\b/)
  if (phoneMatch) {
    entities.phone = phoneMatch[0]
  }
  
  // Detectar email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  if (emailMatch) {
    entities.email = emailMatch[0]
  }
  
  // Detectar fechas (dd/mm/yyyy o dd-mm-yyyy)
  const dateMatch = text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/)
  if (dateMatch) {
    entities.date = dateMatch[0]
  }
  
  // Detectar horas (hh:mm)
  const timeMatch = text.match(/\b\d{1,2}:\d{2}\b/)
  if (timeMatch) {
    entities.time = timeMatch[0]
  }
  
  return entities
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, currentStep, userData, appointmentData } = body
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }
    
    // Normalizar el mensaje
    const normalizedMessage = normalize(message)
    
    // Detectar intención
    const intent = detectIntent(normalizedMessage)
    
    // Extraer entidades
    const entities = extractEntities(message)
    
    // Contexto basado en el paso actual
    let contextualIntent = intent
    
    // Si estamos en un paso específico, ajustar la interpretación
    switch (currentStep) {
      case 'requesting-observations':
        // Si el usuario escribe algo mientras está en observaciones
        // asumir que es la observación
        contextualIntent = 'provide-observation'
        entities.observation = message.slice(0, 100) // Máx 100 caracteres
        break
        
      case 'selecting-patient-type':
        // Detectar tipo de paciente por palabras clave
        if (normalizedMessage.includes('pagante') || normalizedMessage.includes('pagar')) {
          contextualIntent = 'select-patient-type'
          entities.patientType = 'PAGANTE'
        } else if (normalizedMessage.includes('sis') || normalizedMessage.includes('seguro')) {
          contextualIntent = 'select-patient-type'
          entities.patientType = 'SIS'
        } else if (normalizedMessage.includes('soat') || normalizedMessage.includes('accidente')) {
          contextualIntent = 'select-patient-type'
          entities.patientType = 'SOAT'
        }
        break
        
      case 'selecting-appointment-type':
        // Detectar tipo de cita
        if (normalizedMessage.includes('citado') || normalizedMessage.includes('regular')) {
          contextualIntent = 'select-appointment-type'
          entities.appointmentType = 'CITADO'
        } else if (normalizedMessage.includes('interconsulta') || normalizedMessage.includes('referido')) {
          contextualIntent = 'select-appointment-type'
          entities.appointmentType = 'INTERCONSULTA'
        } else if (normalizedMessage.includes('tramite') || normalizedMessage.includes('administrativo')) {
          contextualIntent = 'select-appointment-type'
          entities.appointmentType = 'TRAMITE'
        }
        break
    }
    
    // Respuesta
    return NextResponse.json({
      intent: contextualIntent,
      entities,
      normalizedMessage,
      originalMessage: message,
      currentStep
    })
    
  } catch (error) {
    console.error('Error processing chatbot message:', error)
    return NextResponse.json(
      { error: 'Error processing message' },
      { status: 500 }
    )
  }
}
