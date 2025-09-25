"use client"

import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, User, MapPin, Mail } from "lucide-react"
import { goToHomePage } from "@/lib/navigation"

interface FinalConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservationCode: string
  appointmentStatus: string
  appointmentData?: {
    dateTime?: {
      day: string
      date: string
      time: string
    }
    doctor?: {
      medicoId: string
    }
    specialty?: string
    patient?: {
      email?: string
      patientType?: 'SIS' | 'PAGANTE'
    }
    tipoAtencion?: string
  }
}

export default function FinalConfirmationModal({ open, onOpenChange, reservationCode, appointmentStatus, appointmentData }: FinalConfirmationModalProps) {
  const handleBackToHome = () => {
    onOpenChange(false)
    // Redirigir a la página principal
    goToHomePage()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" redirectToHome={true}>
        <DialogDescription className="sr-only">
          Confirmación de reserva de cita exitosa
        </DialogDescription>
        <div className="text-center space-y-6 py-4">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#3e92cc20" }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: "#3e92cc" }} />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Tu cita ha sido reservada</h2>
            <p className="text-gray-600">Se ha enviado un correo con los detalles de tu cita</p>
          </div>

          {/* Reservation Code */}
          <div className="border rounded-lg p-4" style={{ backgroundColor: "#3e92cc10", borderColor: "#3e92cc40" }}>
            <p className="text-sm mb-1" style={{ color: "#0a2463" }}>
              Código único de reserva
            </p>
            <p className="text-2xl font-bold font-mono" style={{ color: "#0a2463" }}>
              {reservationCode}
            </p>
            <p className="text-xs mt-1" style={{ color: "#3e92cc" }}>
              Guarda este código para consultar tu cita
            </p>
          </div>

          {/* Appointment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-left">
            {appointmentData?.dateTime && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Fecha y hora</p>
                  <p className="font-medium text-gray-900">
                    {appointmentData.dateTime.day}, {appointmentData.dateTime.date} - {appointmentData.dateTime.time}hs
                  </p>
                </div>
              </div>
            )}

            {appointmentData?.doctor && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Médico</p>
                  <p className="font-medium text-gray-900">Dr(a). {appointmentData.doctor.medicoId}</p>
                  {appointmentData.specialty && (
                    <p className="text-sm text-gray-600">{appointmentData.specialty}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="font-medium text-gray-900">Consultorios Externos</p>
                <p className="text-sm text-gray-600">{process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "Jr. Cuzco 274 - Chosica"}</p>
              </div>
            </div>

            {/* Tipo de Atención */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 text-gray-500 flex items-center justify-center">
                {appointmentData?.patient?.patientType === 'SIS' ? (
                  <span className="text-blue-500 font-bold">S</span>
                ) : (
                  <span className="text-green-500 font-bold">P</span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de Atención</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    appointmentData?.patient?.patientType === 'SIS' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {appointmentData?.patient?.patientType === 'SIS' ? 'Paciente SIS' : 'Paciente Pagante'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notification */}
          {appointmentData?.patient?.email ? (
            <div
              className="flex items-center justify-center gap-2 text-sm text-gray-600 rounded-lg p-3"
              style={{ backgroundColor: "#3e92cc10" }}
            >
              <Mail className="w-4 h-4" />
              <span>Confirmación enviada a {appointmentData.patient.email}</span>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 p-3">
              No se detectó correo electrónico para enviar confirmación
            </div>
          )}

          {/* Back to Home Button */}
          <Button
            onClick={handleBackToHome}
            className="w-full text-white py-3 text-lg font-medium hover:opacity-90"
            style={{ backgroundColor: "#0a2463" }}
            size="lg"
          >
            Volver al inicio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
