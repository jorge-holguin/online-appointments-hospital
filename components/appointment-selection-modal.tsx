"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, User, Clock, MapPin, Loader2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import ConfirmationModal from "./confirmation-modal"
import SessionTimer from "./session-timer"

interface AppointmentSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  patientData: any
  selectedSpecialty: string
  selectedSpecialtyId: string
  selectedDate: Date
  selectedShift: 'M' | 'T'
  selectedTimeRange: {
    start: string
    end: string
    label: string
  }
}

interface ApiTimeSlot {
  citaId: string
  fecha: string
  hora: string
  turnoConsulta: string
  consultorio: string
  medico: string
  nombreMedico: string
  conSolicitud: boolean
}

interface DoctorAppointments {
  medico: string
  nombreMedico: string
  appointments: ApiTimeSlot[]
}

export default function AppointmentSelectionModal({
  open,
  onOpenChange,
  onBack,
  patientData,
  selectedSpecialty,
  selectedSpecialtyId,
  selectedDate,
  selectedShift,
  selectedTimeRange,
}: AppointmentSelectionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointments[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<ApiTimeSlot | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Cargar citas disponibles
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!open) return

      setLoading(true)
      setError(null)

      try {
        const dateKey = format(selectedDate, "yyyy-MM-dd")
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/por-fecha?fecha=${dateKey}&turnoConsulta=${selectedShift}&idEspecialidad=${selectedSpecialtyId}&horaInicio=${encodeURIComponent(
          selectedTimeRange.start
        )}&horaFin=${encodeURIComponent(selectedTimeRange.end)}`

        const response = await fetch(url)
        if (!response.ok) throw new Error(`Error al obtener citas: ${response.status}`)

        const data: ApiTimeSlot[] = await response.json()

        // Agrupar por médico
        const groupedByDoctor = data.reduce((acc, slot) => {
          const doctorKey = slot.medico
          if (!acc[doctorKey]) {
            acc[doctorKey] = {
              medico: slot.medico,
              nombreMedico: slot.nombreMedico,
              appointments: [],
            }
          }
          acc[doctorKey].appointments.push(slot)
          return acc
        }, {} as Record<string, DoctorAppointments>)

        const doctorsArray = Object.values(groupedByDoctor).sort((a, b) =>
          a.nombreMedico.localeCompare(b.nombreMedico)
        )

        setDoctorAppointments(doctorsArray)
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError("No se pudieron cargar las citas disponibles.")
        setDoctorAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [open, selectedDate, selectedShift, selectedSpecialtyId, selectedTimeRange])

  const handleSelectAppointment = (appointment: ApiTimeSlot) => {
    setSelectedAppointment(appointment)
    setShowConfirmation(true)
  }

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6" redirectToHome={true}>
          <DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-blue-50 h-8 w-8 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: "#0a2463" }} />
              </Button>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg sm:text-xl font-semibold" style={{ color: "#0a2463" }}>
                  Selecciona una cita
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Selecciona la cita que mejor se ajuste a tu horario
                </DialogDescription>
              </div>
            </div>

            {/* Timer de sesión */}
            <div className="mt-3">
              <SessionTimer />
            </div>
          </DialogHeader>

          {/* Información de búsqueda */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium capitalize">
                {format(selectedDate, "EEEE dd/MM/yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Rango de horario: {selectedTimeRange.label}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{selectedSpecialty}</span>
            </div>
          </div>

          {/* Lista de citas */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600">Cargando citas disponibles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : doctorAppointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-semibold text-lg mb-2">No hay citas disponibles</p>
                <p className="text-sm">No se encontraron citas disponibles en este rango de horario.</p>
                <p className="text-sm mt-2">Intenta con otro rango de hora o fecha.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resumen */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Se encontraron{" "}
                    <span className="font-semibold text-blue-600">
                      {doctorAppointments.reduce(
                        (acc, doc) => acc + doc.appointments.filter((a) => !a.conSolicitud).length,
                        0
                      )}
                    </span>{" "}
                    citas disponibles con{" "}
                    <span className="font-semibold text-blue-600">{doctorAppointments.length}</span>{" "}
                    {doctorAppointments.length === 1 ? "médico" : "médicos"}
                  </p>

                  {doctorAppointments.reduce(
                    (acc, doc) => acc + doc.appointments.filter((a) => a.conSolicitud).length,
                    0
                  ) > 0 && (
                    <p className="text-gray-500">
                      <span className="font-semibold">
                        {doctorAppointments.reduce(
                          (acc, doc) => acc + doc.appointments.filter((a) => a.conSolicitud).length,
                          0
                        )}
                      </span>{" "}
                      citas ya fueron otorgadas
                    </p>
                  )}
                </div>

                {/* Bloque por médico */}
                {doctorAppointments.map((doctor) => (
                  <div key={doctor.medico} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    {/* Header del médico */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">Dr(a). {doctor.nombreMedico}</p>
                          <p className="text-sm text-blue-100">
                            {doctor.appointments.filter((a) => !a.conSolicitud).length}{" "}
                            {doctor.appointments.filter((a) => !a.conSolicitud).length === 1
                              ? "horario disponible"
                              : "horarios disponibles"}
                            {doctor.appointments.filter((a) => a.conSolicitud).length > 0 && (
                              <span className="text-gray-300">
                                {" "}
                                • {doctor.appointments.filter((a) => a.conSolicitud).length} otorgada(s)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lista de horarios */}
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {doctor.appointments.map((appointment) => (
                        <button
                          key={appointment.citaId}
                          onClick={() => !appointment.conSolicitud && handleSelectAppointment(appointment)}
                          disabled={appointment.conSolicitud}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 group relative ${
                            appointment.conSolicitud
                              ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-75"
                              : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Clock
                              className={`w-5 h-5 ${
                                appointment.conSolicitud
                                  ? "text-gray-400"
                                  : "text-gray-500 group-hover:text-blue-600"
                              }`}
                            />
                            <span
                              className={`font-bold ${
                                appointment.conSolicitud
                                  ? "text-gray-500 line-through"
                                  : "text-gray-900 group-hover:text-blue-600"
                              }`}
                            >
                              {appointment.hora}
                            </span>
                            <span
                              className={`text-xs ${
                                appointment.conSolicitud ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Cons. {appointment.consultorio.trim()}
                            </span>
                            {appointment.conSolicitud && (
                              <span className="text-[10px] font-semibold text-gray-500 mt-1">OTORGADA</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación */}
      {selectedAppointment && (
        <ConfirmationModal
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          onBack={() => setShowConfirmation(false)}
          appointmentData={{
            patient: patientData,
            specialty: selectedSpecialtyId,
            specialtyName: selectedSpecialty,
            doctor: {
              medicoId: selectedAppointment.nombreMedico,
              nombre: selectedAppointment.medico,
            },
            dateTime: {
              day:
                format(selectedDate, "EEEE", { locale: es }).charAt(0).toUpperCase() +
                format(selectedDate, "EEEE", { locale: es }).slice(1),
              date: format(selectedDate, "yyyy-MM-dd"),
              displayDate: format(selectedDate, "dd/MM/yyyy"),
              time: selectedAppointment.hora.trim(),
              fullDate: selectedDate,
            },
            idCita: selectedAppointment.citaId,
            consultorio: selectedAppointment.consultorio.trim(),
          }}
        />
      )}
    </>
  )
}
