"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sun, Moon, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format, addMonths, startOfMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { AvailabilityCalendar } from "@/components/ui/availability-calendar"
import AppointmentSelectionModal from "./appointment-selection-modal"
import SessionTimer from "./session-timer"
import { useAppConfig } from "@/hooks/use-app-config"

interface DateTimeRangeSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  onBackToSpecialties?: () => void  // Callback para volver a especialidades
  patientData: any
  selectedSpecialty: string
  selectedSpecialtyId: string
}

type ShiftType = 'M' | 'T' // M = Mañana, T = Tarde

interface TimeRange {
  start: string
  end: string
  label: string
}

// Rangos de hora para turno mañana (8:00 - 12:00)
const morningTimeRanges: TimeRange[] = [
  { start: "08:00", end: "09:00", label: "08:00 - 09:00" },
  { start: "09:00", end: "10:00", label: "09:00 - 10:00" },
  { start: "10:00", end: "11:00", label: "10:00 - 11:00" },
  { start: "11:00", end: "12:00", label: "11:00 - 12:00" },
  { start: "12:00", end: "13:00", label: "12:00 - 13:00" },
]

// Rangos de hora para turno tarde (14:00 - 19:00)
const afternoonTimeRanges: TimeRange[] = [
  { start: "14:00", end: "15:00", label: "14:00 - 15:00" },
  { start: "15:00", end: "16:00", label: "15:00 - 16:00" },
  { start: "16:00", end: "17:00", label: "16:00 - 17:00" },
  { start: "17:00", end: "18:00", label: "17:00 - 18:00" },
  { start: "18:00", end: "19:00", label: "18:00 - 19:00" },
]

interface ApiAvailableDate {
  fecha: string
  consultorio: string
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

export default function DateTimeRangeSelectionModal({
  open,
  onOpenChange,
  onBack,
  onBackToSpecialties,
  patientData,
  selectedSpecialty,
  selectedSpecialtyId,
}: DateTimeRangeSelectionModalProps) {
  // Usar configuración centralizada
  const { config } = useAppConfig()
  const startDate = config?.dateRange.startDate || "2025-08-01"
  const endDate = config?.dateRange.endDate || "2025-08-31"
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedShift, setSelectedShift] = useState<ShiftType>('M')
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => parseISO(startDate))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [showAppointmentSelection, setShowAppointmentSelection] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const minDate = parseISO(startDate)
  const maxDate = parseISO(endDate)
  const minNavigationDate = addMonths(startOfMonth(minDate), -6)
  const maxNavigationDate = addMonths(startOfMonth(maxDate), 6)
  
  // Actualizar el mes del calendario cuando cambie la configuración
  useEffect(() => {
    if (config?.dateRange.startDate) {
      setCurrentMonth(parseISO(config.dateRange.startDate))
    }
  }, [config?.dateRange.startDate])

  // Cargar fechas disponibles usando la nueva API
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!open || !config) return
      
      setLoading(true)
      setError(null)
      
      try {
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/fechas-consultorios?fechaInicio=${startDate}&fechaFin=${endDate}&turnoConsulta=${selectedShift}&idEspecialidad=${selectedSpecialtyId}`
        
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Error al obtener fechas: ${response.status}`)
        
        const data: ApiAvailableDate[] = await response.json()
        
        // Extraer fechas únicas y formatearlas
        const uniqueDates = Array.from(new Set(data.map(item => {
          // La fecha viene como "2025-08-01 00:00:00.0", necesitamos solo "2025-08-01"
          return item.fecha.split(' ')[0]
        })))
        setAvailableDates(uniqueDates)
      } catch (err) {
        console.error('Error fetching available dates:', err)
        setError('No se pudieron cargar las fechas disponibles.')
        setAvailableDates([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchAvailableDates()
  }, [open, selectedShift, selectedSpecialtyId, config, startDate, endDate])


  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date || null)
    setSelectedTimeRange(null) // Resetear el rango de hora seleccionado
  }

  const handleTimeRangeSelect = (range: TimeRange) => {
    setSelectedTimeRange(range)
  }

  const handleNext = () => {
    if (selectedDay && selectedTimeRange) {
      // Abrir el modal de selección de citas
      setShowAppointmentSelection(true)
    }
  }

  // Callback mejorado para volver a especialidades
  const handleBackToSpecialtiesFromChild = () => {
    // Cerrar el modal de selección de citas
    setShowAppointmentSelection(false)
    // Resetear selecciones
    setSelectedDay(null)
    setSelectedTimeRange(null)
    
    // Luego llamar al callback del padre
    if (onBackToSpecialties) {
      onBackToSpecialties()
    }
  }

  // Callback para refrescar las citas cuando se vuelve del modal de confirmación
  const handleRefreshAppointments = () => {
    // Incrementar el trigger para forzar el refresco
    setRefreshTrigger(prev => prev + 1)
  }

  const canGoPrevMonth = () => {
    const prevMonth = addMonths(currentMonth, -1)
    return prevMonth >= minNavigationDate
  }

  const canGoNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1)
    return nextMonth <= maxNavigationDate
  }

  const goToPrevMonth = () => {
    if (canGoPrevMonth()) {
      setCurrentMonth(prevMonth => addMonths(prevMonth, -1))
    }
  }

  const goToNextMonth = () => {
    if (canGoNextMonth()) {
      setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
    }
  }

  const timeRanges = selectedShift === 'M' ? morningTimeRanges : afternoonTimeRanges

  return (
    <>
      <Dialog open={open && !showAppointmentSelection} onOpenChange={onOpenChange}>
        <DialogContent 
          className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto p-3 sm:p-6 sm:max-h-[90vh]" 
          redirectToHome={true}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-blue-50 h-8 w-8 sm:h-10 sm:w-10">
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg sm:text-xl font-semibold">
                  Selecciona fecha y horario
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Selecciona la fecha y el rango de horario para tu cita médica
                </DialogDescription>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Especialidad: <span className="font-semibold text-blue-600">{selectedSpecialty}</span>
                </p>
              </div>
            </div>
            {/* Timer de sesión */}
            <div className="mt-3">
              <SessionTimer />
            </div>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            {/* Selector de turno */}
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setSelectedShift('M')
                    setSelectedTimeRange(null)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedShift === 'M'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Mañana
                </button>
                <button
                  onClick={() => {
                    setSelectedShift('T')
                    setSelectedTimeRange(null)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedShift === 'T'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Tarde
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando fechas disponibles...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : availableDates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay fechas disponibles para el turno {selectedShift === 'M' ? 'de mañana' : 'de tarde'}</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Calendario */}
                <div className="w-full md:w-1/2">
                  <div className="bg-white rounded-lg border shadow-sm p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevMonth}
                        disabled={!canGoPrevMonth()}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h3 className="font-semibold text-base md:text-lg text-center capitalize" style={{ color: "#0a2463" }}>
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextMonth}
                        disabled={!canGoNextMonth()}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <AvailabilityCalendar
                        availableDates={availableDates}
                        onSelectDate={handleDateSelect}
                        selectedDate={selectedDay || undefined}
                        fromDate={minDate}
                        toDate={maxDate}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        className="max-w-[320px] mx-auto"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
                        <span className="text-xs text-gray-500">Sin horarios</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3e92cc" }}></div>
                        <span className="text-xs text-gray-500">Con horarios</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rangos de hora */}
                <div className="w-full md:w-1/2">
                  <div className="bg-white rounded-lg border shadow-sm p-3 md:p-4 h-full">
                    <h3 className="font-semibold text-lg mb-4 text-center" style={{ color: "#0a2463" }}>
                      {selectedDay ? (
                        <>Selecciona un rango de horario</>
                      ) : (
                        <>Selecciona una fecha primero</>
                      )}
                    </h3>

                    {selectedDay ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 text-center font-medium capitalize">
                          {format(selectedDay, 'EEEE dd/MM/yyyy', { locale: es })}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {timeRanges.map((range) => (
                            <button
                              key={range.label}
                              onClick={() => handleTimeRangeSelect(range)}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                selectedTimeRange?.label === range.label
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className={`font-medium ${
                                  selectedTimeRange?.label === range.label
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                                }`}>
                                  {range.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mb-4 text-gray-300" />
                        <p>Selecciona una fecha en el calendario</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botón siguiente */}
            <div className="pt-2">
              <Button
                onClick={handleNext}
                disabled={!selectedDay || !selectedTimeRange}
                className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white px-8 py-3 text-base font-semibold disabled:opacity-50 transition-all"
                size="lg"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de selección de citas */}
      {selectedDay && selectedTimeRange && (
        <AppointmentSelectionModal
          open={showAppointmentSelection}
          onOpenChange={setShowAppointmentSelection}
          onBack={() => setShowAppointmentSelection(false)}
          onBackToSpecialties={handleBackToSpecialtiesFromChild}
          onRefreshAppointments={handleRefreshAppointments}
          refreshTrigger={refreshTrigger}
          patientData={patientData}
          selectedSpecialty={selectedSpecialty}
          selectedSpecialtyId={selectedSpecialtyId}
          selectedDate={selectedDay}
          selectedShift={selectedShift}
          selectedTimeRange={selectedTimeRange}
        />
      )}
    </>
  )
}
