"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Sun, Moon, Clock } from "lucide-react"
import ConfirmationModal from "./confirmation-modal"
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, isWithinInterval, getDay, getDate, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useDateContext } from "@/context/date-context"
import { env } from "@/lib/env"
import { AvailabilityCalendar } from "@/components/ui/availability-calendar"
import { cn } from "@/lib/utils"

interface DateTimeSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
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
}

interface ApiTimeSlot {
  // Posibles nombres para el ID de cita
  idCita?: number
  citaId?: number
  id?: number
  
  fecha: string
  hora: string
  turnoConsulta: string
  consultorio: string
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
  patientData,
  selectedSpecialty,
  selectedDoctor,
}: DateTimeSelectionModalProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedShift, setSelectedShift] = useState<ShiftType>('M') // Por defecto turno mañana
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null) // Día seleccionado en el calendario
  
  // Datos de disponibilidad desde la API
  const [availableSlots, setAvailableSlots] = useState<ApiTimeSlot[]>([])
  const [dayTimeSlots, setDayTimeSlots] = useState<Map<string, string[]>>(new Map())

  // Usar el contexto de fechas compartido
  const { startDate, endDate } = useDateContext()
  
  // Cargar horarios disponibles desde la API
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor?.nombre || !open) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Construir la URL de la API con los parámetros necesarios
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/citas?fechaInicio=${startDate}&fechaFin=${endDate}&medicoId=${selectedDoctor.nombre}&turnoConsulta=${selectedShift}`
        
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Error al obtener horarios: ${response.status}`)
        
        const data = await response.json()
        setAvailableSlots(data)
        
        // Procesar los datos para crear el mapa de horarios por día
        const slotsMap = new Map<string, string[]>()
        data.forEach(slot => {
          // No verificamos disponible ya que la API devuelve solo citas disponibles
          const dateKey = slot.fecha
          if (!slotsMap.has(dateKey)) {
            slotsMap.set(dateKey, [])
          }
          // Eliminar espacios en blanco que puedan venir en la hora
          const hora = slot.hora.trim()
          slotsMap.get(dateKey)?.push(hora)
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
  }, [selectedDoctor, selectedShift, startDate, endDate, open])
  
  // No necesitamos slides para la nueva interfaz
  
  // Obtener las fechas disponibles para el calendario
  const availableDates = Array.from(dayTimeSlots.keys())
  
  // Manejar la selección de fecha en el calendario
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date || null)
    setSelectedTimeSlot(null) // Resetear la hora seleccionada cuando se cambia de día
  }
  
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
      slot.fecha === formattedDate && slot.hora.trim() === time
    );
    
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
      // Incluir idCita y consultorio si están disponibles
      idCita: citaIdValue,
      consultorio: selectedApiSlot?.consultorio ? selectedApiSlot.consultorio.trim() : undefined
    });
    
    // El slot se ha seleccionado correctamente
  }

  const handleNext = () => {
    if (selectedTimeSlot) {
      setShowConfirmation(true)
    }
  }

  // Ya no necesitamos funciones de navegación para slides
  
  // Verificar si el mes actual es el mes actual del sistema
  const isCurrentMonthToday = () => {
    const today = new Date()
    return (
      currentMonth.getMonth() === today.getMonth() && 
      currentMonth.getFullYear() === today.getFullYear()
    )
  }
  
  const goToPrevMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1))
    // Ya no necesitamos resetear slides
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
    // Ya no necesitamos resetear slides
  }

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto p-3 sm:p-6 sm:max-h-[90vh]" redirectToHome={true}>
          <DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-blue-50 h-8 w-8 sm:h-10 sm:w-10">
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: "#0a2463" }} />
              </Button>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg sm:text-xl font-semibold" style={{ color: "#0a2463" }}>
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
            ) : availableDates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay horarios disponibles para el turno {selectedShift === 'M' ? 'de mañana' : 'de tarde'}</p>
                <p className="text-sm mt-2">Intenta cambiar el turno o seleccionar otro mes</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Calendario de disponibilidad */}
                <div className="w-full md:w-1/2">
                  <div className="bg-white rounded-lg border shadow-sm p-3 md:p-4">
                    <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-center" style={{ color: "#0a2463" }}>
                      Selecciona una fecha disponible
                    </h3>
                    <div className="flex justify-center">
                      <AvailabilityCalendar
                        availableDates={availableDates}
                        onSelectDate={handleDateSelect}
                        selectedDate={selectedDay || undefined}
                        fromDate={new Date()}
                        className="max-w-[320px] mx-auto"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
                        <span className="text-xs text-gray-500">No disponible</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3e92cc" }}></div>
                        <span className="text-xs text-gray-500">Disponible</span>
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
                      ) : (
                        <>Selecciona una fecha para ver horarios</>  
                      )}
                    </h3>
                    
                    {selectedDay ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getAvailableTimesForSelectedDay().length > 0 ? (
                          getAvailableTimesForSelectedDay().map((time) => {
                            const isSelected = selectedTimeSlot?.date === formatDateForAPI(selectedDay) && selectedTimeSlot?.time === time;
                            return (
                              <button
                                key={`${formatDateForAPI(selectedDay)}-${time}`}
                                onClick={() => handleTimeSelect(selectedDay, time)}
                                className={cn(
                                  "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                                  isSelected ? "shadow-md" : "hover:shadow-sm"
                                )}
                                style={isSelected ? 
                                  { borderColor: "#d8315b", backgroundColor: "#d8315b", color: "white" } : 
                                  { borderColor: "#3e92cc", backgroundColor: "white", color: "#3e92cc" }
                                }
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
    onClick={handleNext}
    disabled={!selectedTimeSlot}
    className="w-full text-white py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg rounded-full flex items-center justify-center"
    style={{ backgroundColor: "#d8315b" }}
    size="lg"
  >
    <span>Siguiente paso</span>
    <ChevronRight className="w-4 h-4 ml-2" />
  </Button>
</div>

            
            {/* Espacio adicional en móvil para evitar que el contenido quede oculto detrás del botón flotante */}
            <div className="h-16 sm:hidden"></div>
            
            {/* Botón para pantallas medianas y grandes */}
            <div className="hidden sm:flex justify-end pt-2">
              <Button
                onClick={handleNext}
                disabled={!selectedTimeSlot}
                className="text-white px-8 py-3 text-base font-semibold hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#d8315b" }}
                size="lg"
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                Siguiente paso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onBack={() => setShowConfirmation(false)}
        appointmentData={{
          patient: patientData,
          specialty: selectedDoctor?.especialidadId || "", // ID de la especialidad
          specialtyName: selectedSpecialty, // Nombre de la especialidad
          doctor: selectedDoctor,
          dateTime: selectedTimeSlot,
          idCita: selectedTimeSlot?.idCita || "", // ID de la cita
          consultorio: selectedTimeSlot?.consultorio || "", // Número de consultorio
        }}
      />
    </>
  )
}
