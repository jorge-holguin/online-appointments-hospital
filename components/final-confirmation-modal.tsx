"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, User, MapPin, Mail, AlertCircle, Copy, Check } from "lucide-react"
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
    idCita?: string
    consultorio?: string
  }
}

export default function FinalConfirmationModal({
  open,
  onOpenChange,
  reservationCode,
  appointmentStatus,
  appointmentData,
}: FinalConfirmationModalProps) {
  const [copied, setCopied] = useState(false)
  const [copyAnimating, setCopyAnimating] = useState(false)

  // Effect to handle copy animation timing
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (copied) {
      setCopyAnimating(true)
      timer = setTimeout(() => {
        setCopied(false)
        setTimeout(() => setCopyAnimating(false), 300) // Allow time for animation to complete
      }, 2000)
    }
    return () => clearTimeout(timer)
  }, [copied])

  const handleBackToHome = () => {
    // Close the modal first
    onOpenChange(false)
    // Then navigate with a delay to ensure the modal is fully closed
    goToHomePage(100) // 100ms delay should be enough for the modal to close
  }

  const handleCopy = async () => {
    try {
      // Intentar primero con la API moderna
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(reservationCode)
        setCopied(true)
        return
      }
      
      // Fallback para dispositivos móviles
      const textArea = document.createElement("textarea")
      textArea.value = reservationCode
      textArea.setAttribute('readonly', '')
      textArea.style.position = 'absolute'
      textArea.style.left = '-9999px'
      
      document.body.appendChild(textArea)
      
      // Para iOS Safari
      const range = document.createRange()
      range.selectNodeContents(textArea)
      
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      
      textArea.setSelectionRange(0, 999999)
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        setCopied(true)
      } else {
        // Si todo falla, mostrar el código para copia manual
        prompt("Copia este código:", reservationCode)
      }
    } catch (err) {
      console.error("Error al copiar:", err)
      // Mostrar el código para copia manual
      prompt("Copia este código:", reservationCode)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="w-[95vw] max-w-lg max-h-[90vh] flex flex-col"
      redirectToHome={true}
    >
      {/* Header fijo */}
      <div className="flex-shrink-0">
        <DialogTitle className="sr-only">
          Confirmación de reserva de cita
        </DialogTitle>
        <DialogDescription className="sr-only">
          Confirmación de reserva de cita exitosa
        </DialogDescription>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto space-y-6 p-4 text-center">
        {/* Icono de éxito */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#3e92cc20" }}
          >
            <CheckCircle className="w-12 h-12" style={{ color: "#3e92cc" }} />
          </div>
        </div>

        {/* Mensaje de éxito */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Tu cita ha sido reservada
          </h2>
          <p className="text-gray-600">
            Se ha enviado un correo con los detalles de tu cita
          </p>
        </div>

        {/* Código de reserva con botón copiar */}
        <div
          className="border rounded-lg p-4"
          style={{
            backgroundColor: "#3e92cc10",
            borderColor: "#3e92cc40",
          }}
        >
          <p className="text-sm mb-1" style={{ color: "#0a2463" }}>
            Código único de reserva
          </p>
          <div className="flex items-center justify-center gap-2">
            <p
              className="text-2xl font-bold font-mono"
              style={{ color: "#0a2463" }}
            >
              {reservationCode}
            </p>
            <button
              onClick={handleCopy}
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              aria-label="Copiar código"
              style={{
                backgroundColor: copied ? "#3e92cc20" : "transparent",
              }}
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <div className="relative h-5 mt-1">
            <p 
              className={`text-xs absolute w-full transition-all duration-300 ${copied ? "opacity-100" : "opacity-0"}`} 
              style={{ color: "#22c55e" }}
            >
              Código copiado al portapapeles
            </p>
            <p 
              className={`text-xs absolute w-full transition-all duration-300 ${copied ? "opacity-0" : "opacity-100"}`} 
              style={{ color: "#3e92cc" }}
            >
              Guarda este código para consultar tu cita
            </p>
          </div>
          {appointmentData?.idCita && (
            <p className="text-xs mt-1 text-gray-500">
              ID de cita: {appointmentData.idCita}
            </p>
          )}
        </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-left space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-blue-800">Aviso importante</p>
                <p className="text-sm text-gray-700">
                  Esta <strong>reserva no significa que la cita ya esté
                  otorgada</strong>. Debes revisar periódicamente el estado de tu
                  cita para confirmar si ha sido <strong>OTORGADA</strong>.
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Se recomienda llegar con <strong>30 minutos de
                  anticipación</strong> a la cita otorgada y presentar una{" "}
                  <strong>copia de la referencia</strong> junto con el{" "}
                  <strong>DNI del paciente</strong>.
                </p>
              </div>
            </div>
          </div>
  
          {/* Appointment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-left">
            {appointmentData?.dateTime && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Fecha y hora</p>
                  <p className="font-medium text-gray-900">
                    {appointmentData.dateTime.day},{" "}
                    {appointmentData.dateTime.date} -{" "}
                    {appointmentData.dateTime.time}hs
                  </p>
                </div>
              </div>
            )}
  
            {appointmentData?.doctor && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Médico</p>
                  <p className="font-medium text-gray-900">
                    Dr(a). {appointmentData.doctor.medicoId}
                  </p>
                  {appointmentData.specialty && (
                    <p className="text-sm text-gray-600">
                      {appointmentData.specialty}
                    </p>
                  )}
                </div>
              </div>
            )}
  
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="font-medium text-gray-900">
                  Consultorios Externos
                </p>
                <p className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS ||
                    "Jr. Cuzco 274 - Chosica"}
                </p>
                {appointmentData?.consultorio && (
                  <div className="mt-1 inline-flex items-center px-2 py-1 rounded-md bg-blue-50 border border-blue-100">
                    <span className="text-xs font-medium text-blue-700">
                      Consultorio: {appointmentData.consultorio}
                    </span>
                  </div>
                )}
              </div>
            </div>
  
            {/* Tipo de Atención */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 text-gray-500 flex items-center justify-center">
                {appointmentData?.patient?.patientType === "SIS" ? (
                  <span className="text-blue-500 font-bold">S</span>
                ) : (
                  <span className="text-green-500 font-bold">P</span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de Atención</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      appointmentData?.patient?.patientType === "SIS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {appointmentData?.patient?.patientType === "SIS"
                      ? "Paciente SIS"
                      : "Paciente Pagante"}
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
              <span>
                Confirmación enviada a {appointmentData.patient.email}
              </span>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 p-3">
              No se detectó correo electrónico para enviar confirmación
            </div>
          )}
        </div>
  
        {/* Footer fijo */}
        <div className="flex-shrink-0 p-4">
          <Button
            onClick={handleBackToHome}
            className="w-full text-white py-3 text-base font-medium hover:opacity-90 flex items-center justify-center"
            style={{ backgroundColor: "#0a2463" }}
            size="lg"
          >
            <span>Volver al inicio</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}