"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Search, Calendar, User, MapPin, Loader2 } from "lucide-react"

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
        turno: data.turno
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
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-100">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cita encontrada</h3>
              <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
                Estado: {appointmentData.status}
              </div>
            </div>

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

            <Button
              onClick={handleClose}
              className="w-full text-white py-3 hover:opacity-90"
              style={{ backgroundColor: "#0a2463" }}
              size="lg"
            >
              Volver al inicio
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
