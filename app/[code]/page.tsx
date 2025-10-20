"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Calendar, User, MapPin, Loader2, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, ArrowLeft, Phone, Stethoscope, FileText } from "lucide-react"

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

export default function AppointmentCodePage({ params }: { readonly params: { code: string } }) {
  const router = useRouter()
  const [reservationCode, setReservationCode] = useState(params.code || "")
  const [appointmentData, setAppointmentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-buscar si viene con código en la URL
  useEffect(() => {
    if (params.code?.trim()) {
      handleSearch(null, params.code)
    }
  }, [params.code])

  const handleSearch = async (e: React.FormEvent | null, codeToSearch?: string) => {
    if (e) e.preventDefault()
    
    const searchCode = codeToSearch || reservationCode
    if (!searchCode.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/solicitudes/codigo/${searchCode}`, {
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

  const handleSearchAnother = () => {
    setReservationCode("")
    setAppointmentData(null)
    setError("")
    router.push("/")
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
          message: "¡Felicidades! Tu cita ha sido otorgada. Debes llegar 30 minutos antes de la hora programada" + 
                   (appointmentData?.tipoAtencion === "SIS" ? " y con una copia de tu DNI." : ".")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23${encodeURIComponent("0a2463")}' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between sm:justify-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="sm:absolute sm:left-4 p-2"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 sm:gap-4">
              <img src="/hospital-logo.png" alt="Hospital José Agurto Tello" className="h-10 sm:h-12 w-auto" />
              <div className="text-left sm:text-center">
                <h1 className="text-lg sm:text-2xl font-bold" style={{ color: "#0a2463" }}>
                  Hospital José Agurto Tello
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: "#3e92cc" }}>
                  Chosica
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-12 relative z-10">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Consulta de cita</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Ingresa tu código de reserva para ver los detalles de tu cita
            </p>
          </div>

          {!appointmentData ? (
            <form onSubmit={(e) => handleSearch(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm sm:text-base">Código de reserva</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="code"
                    value={reservationCode}
                    onChange={(e) => setReservationCode(e.target.value)}
                    placeholder="Ingresa tu código de reserva"
                    className="pl-10 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 mt-6 hover:opacity-90 text-sm sm:text-base"
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
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${statusConfig.bgColor}`}>
                      {statusConfig.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Reserva encontrada</h3>
                    <div className={`inline-block ${statusConfig.bgColor} ${statusConfig.textColor} px-3 py-1 rounded-md text-xs sm:text-sm font-medium mb-3`}>
                      Estado: {appointmentData.status}
                    </div>
                    
                    {/* Mensaje personalizado según el estado */}
                    <div className={`p-3 sm:p-4 rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                      <p className={`text-xs sm:text-sm ${statusConfig.textColor}`}>
                        {statusConfig.message}
                      </p>
                    </div>
                  </div>
                )
              })()}

              <div className="border rounded-lg p-3 sm:p-4 bg-white space-y-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Fecha y hora</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{appointmentData.date} - {appointmentData.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Especialidad</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{appointmentData.specialty}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Médico</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{appointmentData.doctor}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Ubicación</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">{appointmentData.location}</p>
                    <p className="text-xs text-gray-600 mt-0.5 break-words">
                      {process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "Jr. Cuzco 274 - Chosica"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Paciente</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{appointmentData.patient}</p>
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
                <p className="text-xs sm:text-sm text-gray-800 break-words">
                  <strong>Código de reserva:</strong> {appointmentData.code}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSearchAnother}
                  variant="outline"
                  className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Buscar otro código
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  className="flex-1 text-white py-3 hover:opacity-90 text-sm sm:text-base"
                  style={{ backgroundColor: "#0a2463" }}
                  size="lg"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="text-center mt-6 sm:mt-8 p-4 sm:p-6 bg-white/50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-gray-600 text-xs sm:text-sm">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">¿Necesitas ayuda? Llámanos al (01) 418-3232</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm">
              <h4 className="font-semibold mb-2" style={{ color: "#0a2463" }}>
                Realice su solicitud de reserva de cita - opción 1
              </h4>
              <p className="font-medium text-base sm:text-lg" style={{ color: "#3e92cc" }}>
                01 418 3232
              </p>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-gray-200 space-y-2">
              <p className="text-xs text-gray-500">
                Desarrollado por la Unidad de Estadística e Informática / Desarrollo de Software
              </p>
              <p className="text-xs text-gray-500 break-words">
                © Todos los derechos reservados, {process.env.NEXT_PUBLIC_HOSPITAL_NAME || "Hospital José Agurto Tello de Chosica"}.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
