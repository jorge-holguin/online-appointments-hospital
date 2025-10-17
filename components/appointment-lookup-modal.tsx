"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Search, Calendar, User, MapPin, Loader2, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Stethoscope, FileText } from "lucide-react"

interface AppointmentLookupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Interfaz más permisiva para datos de la API (permite null/undefined)
interface AppointmentResponse {
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  nombres?: string | null;
  especialidad?: string | null;
  especialidadNombre?: string | null;
  medico?: string | null;
  medicoNombre?: string | null;
  turno?: string | null;
  fecha?: string | null;
  hora?: string | null;
  correo?: string | null;
  codigo?: string | null;
  estado?: string | null;
  observacion?: string | null;
  tipoAtencion?: string | null;
  tipoCita?: string | null;
}

export default function AppointmentLookupModal({ open, onOpenChange }: AppointmentLookupModalProps) {
  const [reservationCode, setReservationCode] = useState("")
  const [appointmentData, setAppointmentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservationCode.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes/codigo/${reservationCode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error al buscar la cita: ${response.status}`)
      }

      const data: AppointmentResponse = await response.json()
      
      // Validar que tenemos al menos los datos mínimos necesarios
      if (!data || (!data.codigo && !data.estado)) {
        throw new Error('Datos de cita inválidos')
      }
      
      // Normalizar datos, manejando valores null/undefined
      setAppointmentData({
        code: data.codigo || 'N/A',
        specialty: data.especialidadNombre || 'Especialidad no disponible',
        doctor: `Dr(a). ${data.medicoNombre || 'Médico no disponible'}`,
        date: data.fecha || 'Fecha no disponible',
        time: data.hora ? `${data.hora}hs` : 'Hora no disponible',
        location: "Consultorios Externos",
        patient: data.nombres || 'Paciente no disponible',
        status: data.estado || 'PENDIENTE',
        especialidad: data.especialidad || '',
        turno: data.turno || '',
        observacion: data.observacion || undefined,
        tipoAtencion: data.tipoAtencion || undefined,
        tipoCita: data.tipoCita || undefined
      })
    } catch (err) {
      console.error('Error fetching appointment:', err)
      setError("No se encontró ninguna cita con ese código")
      setAppointmentData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReservationCode("")
    setAppointmentData(null)
    setError("")
    onOpenChange(false)
  }

  const handleSearchAnother = () => {
    setReservationCode("")
    setAppointmentData(null)
    setError("")
  }

  const getStatusConfig = (status: string, observacion?: string) => {
    switch (status) {
      case "PENDIENTE":
        return {
          icon: <Clock className="w-8 h-8 text-yellow-600" />,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
          message: "Tu solicitud de reserva de cita está siendo procesada. Te notificaremos cuando tengamos una respuesta."
        }
      case "EN_REVISION":
        return {
          icon: <AlertCircle className="w-8 h-8 text-blue-600" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          message: "Tu solicitud de reserva de cita está en revisión por nuestro equipo. Pronto tendrás una respuesta."
        }
      case "CITADO":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          message: "¡Felicidades! Tu reserva de cita ha sido otorgada. Debes llegar 30 minutos antes de la hora programada con tu DNI" + 
                   (appointmentData?.tipoAtencion === "SIS" ? " y una copia impresa de tu referencia." : ".")
        }
      case "DENEGADO":
        return {
          icon: <XCircle className="w-8 h-8 text-red-600" />,
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          message: `Su solicitud de reserva fue denegada por: "${observacion || 'No se especificó el motivo'}"`
        }
      case "ELIMINADO":
        return {
          icon: <XCircle className="w-8 h-8 text-gray-600" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          message: "Esta cita ha sido eliminada del sistema."
        }
      default:
        return {
          icon: <AlertCircle className="w-8 h-8 text-gray-600" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          message: "Estado de cita no reconocido."
        }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain scroll-smooth" 
        redirectToHome={true}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Consulta de solicitud de reserva de cita</DialogTitle>
          <DialogDescription className="text-center">
            Ingresa tu código de solicitud para ver los detalles de tu solicitud de reserva de cita.
          </DialogDescription>
        </DialogHeader>

        {!appointmentData ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de solicitud de reserva</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="code"
                  value={reservationCode}
                  onChange={(e) => setReservationCode(e.target.value)}
                  placeholder="Ingresa tu código de solicitud"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3 mt-6 hover:opacity-90"
              style={{ backgroundColor: "#0a2463" }}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                "Buscar"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {(() => {
              const statusConfig = getStatusConfig(appointmentData.status, appointmentData.observacion)
              return (
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${statusConfig.bgColor}`}>
                    {statusConfig.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Reserva encontrada</h3>
                  <div className={`inline-block ${statusConfig.bgColor} ${statusConfig.textColor} px-3 py-1 rounded-md text-sm font-medium mb-3`}>
                    Estado: {appointmentData.status}
                  </div>
                  
                  {/* Mensaje personalizado según el estado */}
                  <div className={`p-4 rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                    <p className={`text-sm ${statusConfig.textColor}`}>
                      {statusConfig.message}
                    </p>
                  </div>
                </div>
              )
            })()}

            <div className="border rounded-lg p-4 bg-white space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Fecha y hora</p>
                  <p className="font-semibold text-gray-900">{appointmentData.date} - {appointmentData.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Especialidad</p>
                  <p className="font-semibold text-gray-900">{appointmentData.specialty}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Médico</p>
                  <p className="font-semibold text-gray-900">{appointmentData.doctor}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Ubicación</p>
                  <p className="font-semibold text-gray-900">{appointmentData.location}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "Jr. Cuzco 274 - Chosica"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Paciente</p>
                  <p className="font-semibold text-gray-900">{appointmentData.patient}</p>
                </div>
              </div>

              {appointmentData.tipoAtencion && (
                <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                  <div className="w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                    {appointmentData.tipoAtencion === "SIS" ? (
                      <span className="text-blue-600 font-bold text-sm">S</span>
                    ) : appointmentData.tipoAtencion === "SOAT" ? (
                      <span className="text-purple-600 font-bold text-xs">SO</span>
                    ) : (
                      <span className="text-green-600 font-bold text-sm">P</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Tipo de Atención</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        appointmentData.tipoAtencion === "SIS"
                          ? "bg-blue-100 text-blue-700"
                          : appointmentData.tipoAtencion === "SOAT"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {appointmentData.tipoAtencion === "SIS"
                        ? "Paciente SIS"
                        : appointmentData.tipoAtencion === "SOAT"
                        ? "Paciente SOAT"
                        : "Paciente Pagante"}
                    </span>
                  </div>
                </div>
              )}

              {appointmentData.tipoCita && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Tipo de Cita</p>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      {appointmentData.tipoCita}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-3 bg-gray-50 border-gray-200">
              <p className="text-sm text-gray-800">
                <strong>Código de solicitud de reserva:</strong> {appointmentData.code}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSearchAnother}
                variant="outline"
                className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Buscar otro código
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 text-white py-3 hover:opacity-90"
                style={{ backgroundColor: "#0a2463" }}
                size="lg"
              >
                Volver al inicio
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
