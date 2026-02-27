"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { authFetch } from "@/lib/auth-api"

interface AppointmentData {
  idSolicitudCita: number
  tipoDocumento: string
  numeroDocumento: string
  nombres: string
  especialidad: string
  especialidadNombre: string
  medico: string
  medicoNombre: string
  turno: string
  fecha: string
  hora: string
  correo: string
  codigo: string
  estado: string
  citaId: string
  tipoAtencion: string
  tipoCita?: string | null
  rutaReferencia?: string | null
  consultorio: string
  celular: string
  observacion?: string | null
  usuario?: string | null
  especialidadInterconsulta?: string | null
  observacionPaciente?: string | null
  lugar?: string | null
}

interface MyAppointmentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getEstadoInfo = (estado: string) => {
  switch (estado?.toUpperCase()) {
    case 'PENDIENTE':
      return {
        bgColor: '#FEF3C7',
        labelColor: '#92400E',
        label: 'Pendiente',
        icon: <Clock className="w-4 h-4 text-amber-600" />,
      }
    case 'APROBADO':
    case 'APROBADA':
    case 'CONFIRMADO':
      return {
        bgColor: '#D1FAE5',
        labelColor: '#065F46',
        label: 'Aprobado',
        icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      }
    case 'DENEGADO':
    case 'RECHAZADO':
    case 'RECHAZADA':
      return {
        bgColor: '#FEE2E2',
        labelColor: '#991B1B',
        label: 'Denegado',
        icon: <XCircle className="w-4 h-4 text-red-600" />,
      }
    case 'CANCELADO':
    case 'CANCELADA':
      return {
        bgColor: '#F3F4F6',
        labelColor: '#4B5563',
        label: 'Cancelado',
        icon: <XCircle className="w-4 h-4 text-gray-500" />,
      }
    default:
      return {
        bgColor: '#F3F4F6',
        labelColor: '#4B5563',
        label: estado || 'Desconocido',
        icon: <AlertCircle className="w-4 h-4 text-gray-500" />,
      }
  }
}

export default function MyAppointmentsModal({ open, onOpenChange }: MyAppointmentsModalProps) {
  const { user, isAuthenticated } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchAppointments = async () => {
    if (!isAuthenticated || !user?.nroDocumento || !user?.tipoDocumento) {
      setError("No se encontraron datos del usuario.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // URL encode the tipoDocumento (e.g., "D  " -> "D%20%20")
      const tipoDocEncoded = encodeURIComponent(user.tipoDocumento)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes/documento/${tipoDocEncoded}/${user.nroDocumento}`,
        { 
          method: 'GET',
          headers: { 'Accept': '*/*' }
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          setAppointments([])
          return
        }
        throw new Error('Error al consultar solicitudes')
      }

      const data = await response.json()
      const appointmentList = Array.isArray(data) ? data : (data?.data || data?.solicitudes || [])
      setAppointments(appointmentList)
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError("No se pudo consultar las solicitudes. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && isAuthenticated) {
      fetchAppointments()
    }
  }, [open, isAuthenticated])

  useEffect(() => {
    if (!open) {
      setAppointments([])
      setError("")
    }
  }, [open])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto" redirectToHome={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Mis Solicitudes de Cita</DialogTitle>
          <DialogDescription className="text-center">
            Historial de solicitudes de citas asociadas a tu cuenta
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#3e92cc] mb-4" />
            <p className="text-gray-500">Cargando solicitudes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAppointments} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {appointments.length === 0
                  ? "No se encontraron solicitudes"
                  : `${appointments.length} solicitud${appointments.length > 1 ? 'es' : ''}`}
              </p>
              <Button variant="outline" size="sm" onClick={fetchAppointments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>

            {appointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tienes solicitudes de cita registradas.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Cuando solicites una cita, aparecerá aquí.
                </p>
              </div>
            )}

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {appointments.map((appointment) => {
                const estadoInfo = getEstadoInfo(appointment.estado)

                return (
                  <div key={appointment.idSolicitudCita} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.especialidadNombre || appointment.especialidad || 'Especialidad no especificada'}
                        </p>
                        {appointment.medicoNombre && (
                          <p className="text-xs text-gray-500">Dr(a). {appointment.medicoNombre}</p>
                        )}
                      </div>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0"
                        style={{ backgroundColor: estadoInfo.bgColor, color: estadoInfo.labelColor }}
                      >
                        {estadoInfo.icon}
                        {estadoInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>Código: {appointment.codigo}</span>
                      {appointment.fecha && (
                        <span className="font-medium text-[#3e92cc]">
                          Cita: {formatDate(appointment.fecha)} {appointment.hora || ''}
                        </span>
                      )}
                      {appointment.consultorio && (
                        <span>Consultorio: {appointment.consultorio}</span>
                      )}
                      {appointment.tipoAtencion && (
                        <span>Tipo: {appointment.tipoAtencion}</span>
                      )}
                    </div>

                    {appointment.observacion && (
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {appointment.observacion}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
