"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, User, MapPin, ChevronRight, Loader2 } from "lucide-react"
import FinalConfirmationModal from "./final-confirmation-modal"
import SessionTimer from "./session-timer"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { goToHomePage } from "@/lib/navigation"
import { mapPatientTypeToApiFormat, getShiftFromTime, formatDateForApi } from "@/lib/appointment-utils"
import { logSuccessfulBooking, logBookingError, logApiError, logEvent } from "@/lib/logger"
import { useSession } from "@/context/session-context"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  appointmentData: {
    patient: any
    specialty: string      // ID de la especialidad
    specialtyName?: string // Nombre de la especialidad
    doctor: any
    dateTime: any
    tipoAtencion?: string  // Tipo de atención: SIS o PAGANTE
    idCita?: string        // ID de la cita
    consultorio?: string   // Número de consultorio
  }
};

interface AppointmentResponse {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  idCita: string;
  consultorio: string;
  especialidad: string;
  especialidadNombre: string;
  medico: string;
  medicoNombre: string;
  turno: string;
  fecha: string;
  hora: string;
  correo: string;
  codigo: string;
  estado: string;
  tipoAtencion: string;
}

// Función para subir el archivo de referencia SIS
const uploadReferenceFile = async (reservationCode: string, file: File) => {
  try {
    logEvent('FILE_UPLOAD_START', { reservationCode, fileName: file.name, fileSize: file.size })
    
    const formData = new FormData()
    formData.append('file', file)
    
    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes/${reservationCode}/archivo`, {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`Error al subir archivo: ${uploadResponse.status}`)
    }
    
    const uploadResult = await uploadResponse.json()
    logEvent('FILE_UPLOAD_SUCCESS', { reservationCode, result: uploadResult })
    
  } catch (error) {
    logApiError(`/v1/solicitudes/${reservationCode}/archivo`, error, { fileName: file.name })
    // No lanzamos el error para no interrumpir el flujo principal
  }
}

export default function ConfirmationModal({ open, onOpenChange, onBack, appointmentData }: ConfirmationModalProps) {
  const { token, setOnSessionExpired } = useSession()
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [appointmentResponse, setAppointmentResponse] = useState<AppointmentResponse | null>(null)
  const [finalAppointmentData, setFinalAppointmentData] = useState(appointmentData)

  // Configurar redirección automática cuando la sesión expire
  useEffect(() => {
    setOnSessionExpired(() => {
      // Cerrar todos los modales
      setShowFinalConfirmation(false)
      onOpenChange(false)
      // Redirigir al inicio después de un breve delay
      goToHomePage(500)
    })
  }, [setOnSessionExpired, onOpenChange])
  
  // Update the finalAppointmentData when the API response is received
  useEffect(() => {
    if (appointmentResponse) {
      setFinalAppointmentData({
        ...appointmentData,
        patient: {
          ...appointmentData.patient,
          email: appointmentResponse.correo || appointmentData.patient.email
        },
        tipoAtencion: appointmentResponse.tipoAtencion || appointmentData.patient.patientType,
        // Mantener los valores de idCita y consultorio (del slot seleccionado)
        idCita: appointmentData.idCita,
        consultorio: appointmentData.consultorio
      })
    }
  }, [appointmentResponse, appointmentData])

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setApiError(null)

    try {
      // Preparar los datos para la API
      const appointmentPayload = {
        tipoDocumento: appointmentData.patient.tipoDocumento || "D  ",
        numeroDocumento: appointmentData.patient.documento || appointmentData.patient.dni || "",
        citaId: appointmentData.idCita || "",
        consultorio: appointmentData.consultorio || "", 
        nombres: appointmentData.patient.fullName || "",
        celular: appointmentData.patient.phone || "",
        correo: appointmentData.patient.email || "",
        especialidad: appointmentData.specialty || "", // Código de la especialidad
        especialidadNombre: appointmentData.specialtyName || "", // Nombre de la especialidad
        medico: appointmentData.doctor?.nombre || "",
        medicoNombre: appointmentData.doctor?.medicoId || "",
        fecha: formatDateForApi(appointmentData.dateTime?.date || new Date()),
        hora: appointmentData.dateTime?.time || "",
        turno: getShiftFromTime(appointmentData.dateTime?.time || ""),
        tipoAtencion: mapPatientTypeToApiFormat(appointmentData.patient.patientType) // Tipo de atención: SIS o PAGANTE
      }
      
      logEvent('BOOKING_ATTEMPT', {
        patientId: appointmentPayload.numeroDocumento,
        specialty: appointmentPayload.especialidadNombre,
        doctor: appointmentPayload.medicoNombre,
        date: appointmentPayload.fecha,
        time: appointmentPayload.hora,
        tipoAtencion: appointmentPayload.tipoAtencion
      })

      // Verificar que tengamos el token de sesión
      if (!token) {
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar el proceso.')
      }

      // Realizar la llamada a la API con el token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Error al enviar la solicitud: ${response.status}`

        try {
          // Intentar parsear el JSON de error para obtener el mensaje específico
          const errorData = JSON.parse(errorText)
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else {
            errorMessage = `${errorMessage} - ${errorText}`
          }
        } catch (parseError) {
          // Si no se puede parsear el JSON, usar el texto original
          errorMessage = `${errorMessage} - ${errorText}`
        }

        throw new Error(errorMessage)
      }

      const responseData = await response.json()

      // Log de reserva exitosa
      logSuccessfulBooking({
        patientId: appointmentPayload.numeroDocumento,
        patientName: appointmentPayload.nombres,
        specialty: appointmentPayload.especialidadNombre,
        doctor: appointmentPayload.medicoNombre,
        appointmentId: responseData.codigo,
        date: appointmentPayload.fecha,
        time: appointmentPayload.hora
      })

      // Guardar la respuesta para usarla en el modal de confirmación final
      setAppointmentResponse(responseData)

      // Si el paciente es SIS y tiene archivo de referencia, subirlo
      if (appointmentData.patient.patientType === 'SIS' && appointmentData.patient.referenceImage && responseData.codigo) {
        setIsUploadingFile(true)
        await uploadReferenceFile(responseData.codigo, appointmentData.patient.referenceImage)
        setIsUploadingFile(false)
      }

      // Mostrar el modal de confirmación final
      setShowFinalConfirmation(true)
    } catch (error) {
      logBookingError(error, {
        step: 'CONFIRMATION',
        patientId: appointmentData.patient.documento,
        specialty: appointmentData.specialtyName,
        doctor: appointmentData.doctor?.medicoId,
        additionalInfo: {
          idCita: appointmentData.idCita,
          consultorio: appointmentData.consultorio
        }
      })
      setApiError(error instanceof Error ? error.message : 'Error al procesar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Close the modal first
    onOpenChange(false)
    // Redirigir a la página principal con un delay
    goToHomePage(100) // 100ms delay should be enough for the modal to close
  }

  return (
    <>
      <Dialog open={open && !showFinalConfirmation} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto" redirectToHome={true}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack} className="p-1 sm:p-2 hover:bg-blue-50">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-lg sm:text-xl font-semibold">¡Ya casi terminas!</DialogTitle>
            </div>
            <DialogDescription>
              Revisa los detalles de tu cita y confirma para reservar
            </DialogDescription>
            {/* Timer de sesión */}
            <div className="mt-3">
              <SessionTimer />
            </div>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <p className="text-center text-sm sm:text-base text-gray-600">Revisa y confirma</p>

            {/* Appointment Summary Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: "#3e92cc" }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3e92cc" }} />
                <span>Presencial</span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">{appointmentData.dateTime?.day || 'Fecha no disponible'}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {appointmentData.dateTime?.displayDate || appointmentData.dateTime?.date} {appointmentData.dateTime?.time}hs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">{process.env.NEXT_PUBLIC_HOSPITAL_LOCATION || "Consultorios Externos HJATCH"} - {appointmentData.specialtyName || appointmentData.specialty}</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">Dr(a). {appointmentData.doctor?.medicoId || 'Médico no disponible'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base text-gray-900">{process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "Jr. Cuzco 274 - Chosica"}</p>
                  </div>
                </div>

                <div className="border-t pt-2 sm:pt-3 space-y-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Paciente</p>
                      <p className="font-semibold text-sm sm:text-base text-gray-900">{appointmentData.patient?.fullName || 'Paciente no disponible'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          appointmentData.patient?.patientType === 'SIS' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {appointmentData.patient?.patientType === 'SIS' ? 'Paciente SIS' : 'Paciente Pagante'}
                        </span>
                        {appointmentData.patient?.patientType === 'SIS' && appointmentData.patient?.referenceImage && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            📎 Referencia adjunta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md">
                <p className="text-xs sm:text-sm">{apiError}</p>
                <p className="text-xs mt-1">Por favor, intenta nuevamente o contacta con soporte.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                className="flex-1 py-2 sm:py-3 bg-transparent text-sm sm:text-base" 
                size="lg"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold disabled:opacity-50 transition-all"
                size="lg"
                disabled={isSubmitting || isUploadingFile}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando cita...
                  </>
                ) : isUploadingFile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo referencia...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Confirmar cita
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FinalConfirmationModal
        open={showFinalConfirmation}
        onOpenChange={setShowFinalConfirmation}
        reservationCode={appointmentResponse?.codigo || ''}
        appointmentStatus={appointmentResponse?.estado || ''}
        appointmentData={finalAppointmentData}
      />
    </>
  )
}
