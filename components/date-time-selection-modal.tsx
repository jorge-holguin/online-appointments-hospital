"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sun, Moon, Clock } from "lucide-react"
import ConfirmationModal from "./confirmation-modal"
import SessionTimer from "./session-timer"
import { format, addMonths, startOfMonth, endOfMonth, parseISO, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { AvailabilityCalendar } from "@/components/ui/availability-calendar"
import { cn } from "@/lib/utils"
import { useAppConfig, getEffectiveDateRange } from "@/hooks/use-app-config"

interface DateTimeSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  onBackToSpecialties?: () => void  // Callback para volver a especialidades
  onRefreshAppointments?: () => void  // Callback para refrescar citas
  refreshTrigger?: number  // Trigger para forzar refresco de citas
  patientData: any
  selectedSpecialty: string
  selectedDoctor: any
}

interface TimeSlot {
  day: string
  date: string
  displayDate?: string
  time: string
  fullDate: Date
  idCita?: string
  consultorio?: string
  lugar?: string
  available: boolean
}

// Interfaz más permisiva para datos de la API (permite null/undefined)
interface ApiTimeSlot {
  // Posibles nombres para el ID de cita
  idCita?: number | null
  citaId?: number | null
  id?: number | null
  
  fecha?: string | null
  hora?: string | null
  turnoConsulta?: string | null
  consultorio?: string | null
  lugar?: string | null
  conSolicitud?: boolean | null
  estado?: string | null // Estado de la cita: "1" = disponible, otros = no disponible
}

type ShiftType = 'M' | 'T' // M = Mañana, T = Tarde

// Función para obtener el turno basado en la hora
const getShiftFromTime = (time: string): ShiftType => {
  const hour = parseInt(time.split(':')[0])
  return hour < 14 ? 'M' : 'T' // Antes de las 14:00 es mañana, después es tarde
}

// Función para formatear la fecha para la API (YYYY-MM-DD)
const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

export default function DateTimeSelectionModal({
  open,
  onOpenChange,
  onBack,
  onBackToSpecialties,
  onRefreshAppointments,
  refreshTrigger,
  patientData,
  selectedSpecialty,
  selectedDoctor,
}: DateTimeSelectionModalProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftType>('M') // Por defecto turno mañana
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null) // Día seleccionado en el calendario
  
  // Ref para los botones de continuar (móvil y desktop)
  const continueButtonMobileRef = useRef<HTMLButtonElement>(null)
  const continueButtonDesktopRef = useRef<HTMLButtonElement>(null)
  
  // Enfocar el botón de continuar cuando se selecciona un horario
  useEffect(() => {
    if (selectedTimeSlot) {
      // Pequeño delay para asegurar que el botón esté habilitado
      setTimeout(() => {
        // Intentar enfocar el botón visible (móvil o desktop)
        if (continueButtonMobileRef.current?.offsetParent !== null) {
          continueButtonMobileRef.current?.focus()
        } else if (continueButtonDesktopRef.current?.offsetParent !== null) {
          continueButtonDesktopRef.current?.focus()
        }
      }, 100)
    }
  }, [selectedTimeSlot])
  
  // Datos de disponibilidad desde la API
  const [availableSlots, setAvailableSlots] = useState<ApiTimeSlot[]>([])
  const [dayTimeSlots, setDayTimeSlots] = useState<Map<string, string[]>>(new Map())

  // Usar configuración centralizada
  const { config } = useAppConfig()
  const startDate = config?.dateRange.startDate
  const endDate = config?.dateRange.endDate
  
  // Inicializar el mes del calendario con la fecha de inicio
  const [currentMonth, setCurrentMonth] = useState(() => startDate ? parseISO(startDate) : new Date())
  
  // Actualizar el mes del calendario cuando cambie la configuración
  useEffect(() => {
    if (config?.dateRange.startDate) {
      setCurrentMonth(parseISO(config.dateRange.startDate))
    }
  }, [config?.dateRange.startDate])
  
  // Cargar horarios disponibles desde la API
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor?.nombre || !open || !config) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Calcular rango efectivo de fechas
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        const dateRange = getEffectiveDateRange(monthStart, monthEnd, startDate, endDate)
        
        if (!dateRange) {
          setError('No se pudo cargar la configuración de fechas')
          setLoading(false)
          return
        }
        
        const { startDate: fetchStartDate, endDate: fetchEndDate } = dateRange
        
        // Construir la URL de la API con los parámetros necesarios, incluyendo idEspecialidad
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/citas?fechaInicio=${fetchStartDate}&fechaFin=${fetchEndDate}&medicoId=${selectedDoctor.nombre}&turnoConsulta=${selectedShift}&idEspecialidad=${selectedDoctor.especialidadId}`
        
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Error al obtener horarios: ${response.status}`)
        
        const data: ApiTimeSlot[] = await response.json()
        
        // Filtrar citas que ya pasaron si es el día de hoy
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        
        // Normalizar y filtrar datos nulos/inválidos
        const filteredData = data
          .filter(slot => slot != null) // Filtrar elementos null/undefined
          .filter(slot => {
            // Verificar que tenemos los campos mínimos necesarios
            if (!slot.fecha || !slot.hora) return false
            
            try {
              const slotDate = parseISO(slot.fecha.split(' ')[0])
              
              // Si no es hoy, mostrar todas las citas
              if (!isToday(slotDate)) return true
              
              // Si es hoy, solo mostrar citas futuras
              const horaTrimmed = slot.hora.trim()
              if (!horaTrimmed) return false
              
              const [slotHour, slotMinute] = horaTrimmed.split(':').map(Number)
              if (isNaN(slotHour) || isNaN(slotMinute)) return false
              
              const slotTimeInMinutes = slotHour * 60 + slotMinute
              const currentTimeInMinutes = currentHour * 60 + currentMinute
              
              return slotTimeInMinutes > currentTimeInMinutes
            } catch (e) {
              console.error('Error parsing slot date/time:', e, slot)
              return false // Excluir slots con datos inválidos
            }
          })
        
        setAvailableSlots(filteredData)
        
        // Procesar los datos para crear el mapa de horarios por día
        const slotsMap = new Map<string, string[]>()
        filteredData.forEach((slot) => {
          // Verificar que tenemos los datos necesarios
          if (!slot.fecha || !slot.hora) return
          
          // Procesamos todas las citas, independientemente de su disponibilidad
          const dateKey = slot.fecha
          if (!slotsMap.has(dateKey)) {
            slotsMap.set(dateKey, [])
          }
          // Eliminar espacios en blanco que puedan venir en la hora
          const hora = slot.hora.trim()
          if (hora) {
            slotsMap.get(dateKey)?.push(hora)
          }
        })
        
        setDayTimeSlots(slotsMap)
        
      } catch (err) {
        console.error('Error fetching available slots:', err)
        setError('No se pudieron cargar los horarios disponibles. Por favor, inténtelo de nuevo.')
        setDayTimeSlots(new Map())
      } finally {
        setLoading(false)
      }
    }
    
    fetchAvailableSlots()
  }, [selectedDoctor, selectedShift, open, config, refreshTrigger, currentMonth])
  
  // No necesitamos slides para la nueva interfaz
  
  // Obtener las fechas disponibles para el calendario
  const availableDates = Array.from(dayTimeSlots.keys())
  
  // Manejar la selección de fecha en el calendario
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date || null)
    setSelectedTimeSlot(null) // Resetear la hora seleccionada cuando se cambia de día
  }

  // Seleccionar automáticamente el primer horario DISPONIBLE cuando se selecciona un día
  useEffect(() => {
    if (!selectedDay || !availableSlots.length) return

    const dateKey = formatDateForAPI(selectedDay)
    const timesForDay = dayTimeSlots.get(dateKey) || []
    
    // Buscar el primer horario disponible (conSolicitud === false y estado === "1")
    const firstAvailableTime = timesForDay.find(time => {
      const apiSlot = availableSlots.find(slot => 
        slot.fecha === dateKey && slot.hora && slot.hora.trim() === time
      )
      return apiSlot && !apiSlot.conSolicitud && apiSlot.estado === "1"
    })

    // Si hay un horario disponible, seleccionarlo automáticamente
    if (firstAvailableTime) {
      const apiSlot = availableSlots.find(slot => 
        slot.fecha === dateKey && slot.hora && slot.hora.trim() === firstAvailableTime
      )
      
      if (apiSlot && !apiSlot.conSolicitud && apiSlot.estado === "1") {
        const dayName = format(selectedDay, 'EEEE', { locale: es })
        const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1)
        const formattedDate = format(selectedDay, 'yyyy-MM-dd')
        const displayDate = format(selectedDay, 'dd/MM/yyyy')
        
        const citaIdValue = apiSlot.idCita || apiSlot.citaId || apiSlot.id
        
        setSelectedTimeSlot({ 
          day: dayNameCapitalized, 
          date: formattedDate,
          displayDate: displayDate,
          time: firstAvailableTime,
          fullDate: selectedDay,
          idCita: citaIdValue !== undefined ? String(citaIdValue) : undefined,
          consultorio: apiSlot?.consultorio ? apiSlot.consultorio.trim() : undefined,
          lugar: apiSlot?.lugar ?? undefined,
          available: true
        })
      }
    }
  }, [selectedDay, availableSlots, dayTimeSlots])
  
  // Obtener las horas disponibles para el día seleccionado
  const getAvailableTimesForSelectedDay = () => {
    if (!selectedDay) return []
    const dateKey = formatDateForAPI(selectedDay)
    return dayTimeSlots.get(dateKey) || []
  }

  // Ya no necesitamos efectos para manejar slides y resize

  const handleTimeSelect = (day: Date, time: string) => {
    const dayName = format(day, 'EEEE', { locale: es });
    const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const formattedDate = format(day, 'yyyy-MM-dd'); // API expects YYYY-MM-DD format
    const displayDate = format(day, 'dd/MM/yyyy'); // For display purposes
    
    // Buscar la información completa del slot seleccionado en los datos de la API
    const selectedApiSlot = availableSlots.find(slot => 
      slot.fecha === formattedDate && slot.hora && slot.hora.trim() === time
    );
    
    // Si no encontramos el slot en la API o si conSolicitud es true o estado !== "1" (no disponible), no permitir la selección
    if (!selectedApiSlot || selectedApiSlot.conSolicitud === true || selectedApiSlot.estado !== "1") {
      // No hacemos nada si la cita no está disponible
      return;
    }
    
    // Determinar el ID de la cita, considerando diferentes posibles nombres de campo
    let citaIdValue: string | undefined = undefined;
    if (selectedApiSlot) {
      // Intentar obtener el ID de la cita de cualquiera de los posibles campos
      const idValue = selectedApiSlot.idCita || selectedApiSlot.citaId || selectedApiSlot.id;
      citaIdValue = idValue !== undefined ? String(idValue) : undefined;
    }
    
    setSelectedTimeSlot({ 
      day: dayNameCapitalized, 
      date: formattedDate, // API format
      displayDate: displayDate, // Display format
      time,
      fullDate: day,
      // Incluir idCita, consultorio y lugar si están disponibles
      idCita: citaIdValue,
      consultorio: selectedApiSlot?.consultorio ? selectedApiSlot.consultorio.trim() : undefined,
      lugar: selectedApiSlot?.lugar ?? undefined,
      available: !selectedApiSlot.conSolicitud && selectedApiSlot.estado === "1" // La cita está disponible si conSolicitud es false y estado es "1"
    });
    
    // El slot se ha seleccionado correctamente
  }

  const handleNext = () => {
    if (selectedTimeSlot) {
      setShowConfirmation(true)
    }
  }

  // Manejar tecla Enter para continuar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedTimeSlot) {
      e.preventDefault()
      handleNext()
    }
  }

  // Ya no necesitamos funciones de navegación para slides
  
  // Calcular el rango de fechas permitido
  const minDate = startDate ? parseISO(startDate) : new Date()
  const maxDate = endDate ? parseISO(endDate) : new Date()
  
  // Permitir navegar 6 meses antes y después del rango de fechas
  const minNavigationDate = addMonths(startOfMonth(minDate), -6)
  const maxNavigationDate = addMonths(startOfMonth(maxDate), 6)
  
  // Verificar si podemos navegar al mes anterior
  const canGoPrevMonth = () => {
    const prevMonth = addMonths(currentMonth, -1)
    return prevMonth >= minNavigationDate
  }
  
  // Verificar si podemos navegar al mes siguiente
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

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
        <DialogContent 
          className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto p-3 sm:p-6 sm:max-h-[90vh]" 
          redirectToHome={true}
          onInteractOutside={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-blue-50 h-8 w-8 sm:h-10 sm:w-10">
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg sm:text-xl font-semibold">
                  Fecha y hora
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Selecciona la fecha y hora para tu cita médica
                </DialogDescription>
                <div className="flex items-center gap-2 sm:gap-3 mt-2">
                  <img
                    src="/male-doctor.jpg"
                    alt={selectedDoctor?.medicoId}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 flex-shrink-0"
                    style={{ borderColor: "#3e92cc" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate" style={{ color: "#3e92cc" }}>
                      {selectedSpecialty}
                    </p>
                    <p className="text-sm sm:text-base font-semibold truncate" style={{ color: "#1e1b18" }}>
                      {selectedDoctor?.medicoId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Timer de sesión */}
            <div className="mt-3">
              <SessionTimer />
            </div>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-4">
              {/* Selector de turno */}
              <div className="flex justify-center">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedShift('M')}
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
                    onClick={() => setSelectedShift('T')}
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
              
              {/* Navegación de mes unificada para todos los dispositivos */}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando horarios disponibles...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Calendario de disponibilidad */}
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
                
                {/* Horas disponibles */}
                <div className="w-full md:w-1/2">
                  <div className="bg-white rounded-lg border shadow-sm p-3 md:p-4 h-full">
                    <h3 className="font-semibold text-lg mb-4 text-center" style={{ color: "#0a2463" }}>
                      {selectedDay ? (
                        <>
                          Horarios para {format(selectedDay, 'EEEE dd/MM/yyyy', { locale: es })}
                        </>
                      ) : availableDates.length === 0 ? (
                        <>No hay horarios disponibles</>
                      ) : (
                        <>Selecciona una fecha para ver horarios</>  
                      )}
                    </h3>
                    
                    {availableDates.length === 0 && !selectedDay ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mb-4 text-gray-300" />
                        <p className="text-center">No hay horarios disponibles para el turno {selectedShift === 'M' ? 'de mañana' : 'de tarde'}</p>
                        <p className="text-sm mt-2 text-center">Intenta cambiar el turno o navegar a otro mes</p>
                      </div>
                    ) : selectedDay ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getAvailableTimesForSelectedDay().length > 0 ? (
                          getAvailableTimesForSelectedDay().map((time) => {
                            const isSelected = selectedTimeSlot?.date === formatDateForAPI(selectedDay) && selectedTimeSlot?.time === time;
                            
                            // Buscar el slot en los datos de la API para determinar disponibilidad
                            const apiSlot = availableSlots.find(slot => 
                              slot.fecha === formatDateForAPI(selectedDay) && slot.hora && slot.hora.trim() === time
                            );
                            
                            // Determinar si está disponible (conSolicitud === false y estado === "1")
                            const isAvailable = apiSlot && !apiSlot.conSolicitud && apiSlot.estado === "1";
                            
                            return (
                              <button
                                key={`${formatDateForAPI(selectedDay)}-${time}`}
                                onClick={() => handleTimeSelect(selectedDay, time)}
                                className={cn(
                                  "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                                  isSelected ? "shadow-md" : "hover:shadow-sm",
                                  !isAvailable ? "opacity-60 cursor-not-allowed" : ""
                                )}
                                style={isSelected ? 
                                  { borderColor: "#d8315b", backgroundColor: "#d8315b", color: "white" } : 
                                  isAvailable ?
                                    { borderColor: "#3e92cc", backgroundColor: "white", color: "#3e92cc" } :
                                    { borderColor: "#cccccc", backgroundColor: "#f5f5f5", color: "#666666" }
                                }
                                disabled={!isAvailable}
                              >
                                <div className="flex items-center justify-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  {time}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-full text-center py-8 text-gray-500">
                            <p>No hay horarios disponibles para esta fecha</p>
                            <p className="text-sm mt-2">Intenta seleccionar otra fecha</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mb-4 text-gray-300" />
                        <p>Selecciona una fecha en el calendario</p>
                        <p className="text-sm mt-2">Para ver los horarios disponibles</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Botón para móviles con sticky */}
<div className="sticky bottom-0 left-0 right-0 sm:hidden z-20 bg-white p-3 border-t">
  <Button
    ref={continueButtonMobileRef}
    onClick={handleNext}
    disabled={!selectedTimeSlot}
    className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white py-3 text-sm font-semibold disabled:opacity-50 shadow-lg rounded-full flex items-center justify-center transition-all"
    size="lg"
  >
    <span>Continuar</span>
    <ChevronRight className="w-4 h-4 ml-2" />
  </Button>
</div>

            
            {/* Espacio adicional en móvil para evitar que el contenido quede oculto detrás del botón flotante */}
            <div className="h-16 sm:hidden"></div>
            
            {/* Botón para pantallas medianas y grandes */}
            <div className="hidden sm:block pt-2">
              <Button
                ref={continueButtonDesktopRef}
                onClick={handleNext}
                disabled={!selectedTimeSlot}
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

      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onBack={() => setShowConfirmation(false)}
        onBackToSpecialties={onBackToSpecialties}
        onRefreshAppointments={onRefreshAppointments}
        appointmentData={{
          patient: patientData,
          specialty: selectedDoctor?.especialidadId || "", // ID de la especialidad
          specialtyName: selectedSpecialty, // Nombre de la especialidad
          doctor: selectedDoctor,
          dateTime: selectedTimeSlot,
          idCita: selectedTimeSlot?.idCita || "", // ID de la cita
          consultorio: selectedTimeSlot?.consultorio || "", // Número de consultorio
          lugar: selectedTimeSlot?.lugar ?? undefined, // Ubicación de la cita
        }}
      />
    </>
  )
}
