/**
 * Tipos para el sistema de chatbot
 */

export type MessageSender = "user" | "bot"

export type MessageType = 
  | "text"              // Mensaje de texto simple
  | "options"           // Mensaje con opciones/botones
  | "form"              // Formulario interactivo
  | "component"         // Componente React personalizado
  | "calendar"          // Selector de calendario
  | "doctor-list"       // Lista de médicos
  | "specialty-list"    // Lista de especialidades
  | "summary"           // Resumen de cita
  | "confirmation"      // Confirmación final

export interface Message {
  id: string
  content: string
  sender: MessageSender
  timestamp: Date
  type?: MessageType
  data?: any
}

export interface ChatbotState {
  currentStep: FlowStep
  userData: PatientData | null
  appointmentData: AppointmentData | null
}

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

export interface AppointmentData {
  specialty: string
  specialtyName: string
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
  timeRange?: {
    start: string
    end: string
    label: string
  }
  shift?: "M" | "T"
  searchMethod?: "doctor" | "datetime"
  consultorio?: string
  lugar?: string
  idCita?: string
  observaciones?: string
}

export interface ChatOption {
  id: string
  label: string
  value: string
  description?: string
  icon?: string
}

export interface FAQ {
  question: string
  answer: string
}

export const PATIENT_TYPE_FAQ: Record<string, FAQ> = {
  PAGANTE: {
    question: "¿Qué es un paciente pagante?",
    answer: "Paciente pagante es cuando usted no tiene un seguro SIS. Usted estará a cargo de pagar el 100% de su atención médica."
  },
  SIS: {
    question: "¿Qué es el SIS?",
    answer: `Seleccione esta opción si dispone de un seguro SIS. 
    Puede comprobarlo en: <a href="https://cel.sis.gob.pe/SisConsultaEnLinea" target="_blank"><b>Consultar SIS en Línea</b></a>`
  },
  SOAT: {
    question: "¿Cuándo usar SOAT?",
    answer: "¿Sufrió un accidente de tránsito y su seguro vehicular va a cubrir esta cita? Seleccione esta opción."
  }
}

export const APPOINTMENT_TYPE_FAQ: Record<string, FAQ> = {
  CITADO: {
    question: "¿Qué es una cita regular (CITADO)?",
    answer: "Si usted necesita una cita por el canal regular. Recuerde que debe haber sido referido por su posta o centro de salud."
  },
  INTERCONSULTA: {
    question: "¿Qué es una interconsulta?",
    answer: "Si usted necesita una cita, referido por un médico de otra especialidad del hospital."
  },
  TRAMITE: {
    question: "¿Qué es un trámite administrativo?",
    answer: "Necesita reservar una cita en una especialidad para formalizar algún trámite administrativo (ejemplo: certificados médicos, informes, etc.)."
  }
}
