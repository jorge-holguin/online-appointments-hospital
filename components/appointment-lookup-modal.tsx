"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Search, Calendar, User, MapPin, Loader2, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react"

interface AppointmentLookupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AppointmentResponse {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
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
  observacion?: string;
  tipoAtencion?: string;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SOLICITUDES_URL}/codigo/${reservationCode}`, {
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
      
      setAppointmentData({
        code: data.codigo,
        specialty: data.especialidadNombre,
        doctor: `Dr(a). ${data.medicoNombre}`,
        date: data.fecha,
        time: `${data.hora}hs`,
        location: "Consultorios Externos",
        patient: data.nombres,
        status: data.estado,
        especialidad: data.especialidad,
        turno: data.turno,
        observacion: data.observacion,
        tipoAtencion: data.tipoAtencion
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
          message: "Tu solicitud de cita está siendo procesada. Te notificaremos cuando tengamos una respuesta."
        }
      case "EN_REVISION":
        return {
          icon: <AlertCircle className="w-8 h-8 text-blue-600" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          message: "Tu solicitud está en revisión por nuestro equipo. Pronto tendrás una respuesta."
        }
      case "CITADO":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          message: "¡Felicidades! Tu cita ha sido otorgada. Debes llegar 30 minutos antes de la hora programada con tu DNI" + 
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
      <DialogContent className="sm:max-w-md" redirectToHome={true}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Consulta de cita</DialogTitle>
          <DialogDescription className="text-center">
            Ingresa tu código de reserva para ver los detalles de tu cita
          </DialogDescription>
        </DialogHeader>

        {!appointmentData ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de reserva</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="code"
                  value={reservationCode}
                  onChange={(e) => setReservationCode(e.target.value)}
                  placeholder="Ingresa tu código de reserva"
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
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Fecha y hora</p>
                  <p className="font-medium">{appointmentData.date} - {appointmentData.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Médico</p>
                  <p className="font-medium">{appointmentData.doctor}</p>
                  <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {appointmentData.specialty}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="font-medium">{appointmentData.location}</p>
                  <p className="text-xs text-gray-600">
                    {process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "Jr. Cuzco 274 - Chosica"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Paciente</p>
                  <p className="font-medium">{appointmentData.patient}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-gray-50 border-gray-200">
              <p className="text-sm text-gray-800">
                <strong>Código de reserva:</strong> {appointmentData.code}
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
