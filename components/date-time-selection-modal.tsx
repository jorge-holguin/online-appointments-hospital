"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Calendar, ArrowLeft, ArrowRight, Sun, Moon } from "lucide-react"
import ConfirmationModal from "./confirmation-modal"
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns"
import { es } from "date-fns/locale"
import { useDateContext } from "@/context/date-context"
import { env } from "@/lib/env"

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
}

interface ApiTimeSlot {
  citaId: number
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedShift, setSelectedShift] = useState<ShiftType>('M') // Por defecto turno mañana
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  
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
  
  const getItemsPerSlide = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1 // Mobile
      if (window.innerWidth < 1024) return 3 // Tablet
      return 4 // Desktop
    }
    return 4
  }

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide())
  
  // Generar días del mes actual para mostrar
  const generateDaysForMonth = (month: Date) => {
    const startOfMonthDate = startOfMonth(month)
    const endOfMonthDate = endOfMonth(month)
    return eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate })
  }
  
  const filteredDays = generateDaysForMonth(currentMonth).filter(day => {
    const dateKey = formatDateForAPI(day)
    return dayTimeSlots.has(dateKey) && (dayTimeSlots.get(dateKey)?.length || 0) > 0
  })
  
  const maxSlides = Math.ceil(filteredDays.length / itemsPerSlide)

  useEffect(() => {
    const handleResize = () => {
      const newItemsPerSlide = getItemsPerSlide()
      if (newItemsPerSlide !== itemsPerSlide) {
        setItemsPerSlide(newItemsPerSlide)
        setCurrentSlide(0) // Reset to first slide when changing layout
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [itemsPerSlide])
  
  // Resetear el slide cuando cambia el mes
  useEffect(() => {
    setCurrentSlide(0);
  }, [currentMonth]);

  const handleTimeSelect = (day: Date, time: string) => {
    const dayName = format(day, 'EEEE', { locale: es });
    const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const formattedDate = format(day, 'yyyy-MM-dd'); // API expects YYYY-MM-DD format
    const displayDate = format(day, 'dd/MM/yyyy'); // For display purposes
    
    setSelectedTimeSlot({ 
      day: dayNameCapitalized, 
      date: formattedDate, // API format
      displayDate: displayDate, // Display format
      time,
      fullDate: day
    })
  }

  const handleNext = () => {
    if (selectedTimeSlot) {
      setShowConfirmation(true)
    }
  }

  const nextSlide = () => {
    if (currentSlide < maxSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }
  
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
    setCurrentSlide(0)
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
    setCurrentSlide(0)
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
              
              {/* Navegación de mes - Solo visible en pantallas medianas y grandes */}
              <div className="hidden sm:flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevMonth}
                  disabled={isCurrentMonthToday()}
                  className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 border-2 ${isCurrentMonthToday() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                  style={{ borderColor: "#3e92cc" }}
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" style={{ color: "#0a2463" }} />
                  Mes anterior
                </Button>
                
                <h3 className="text-sm sm:text-lg font-bold text-center" style={{ color: "#0a2463" }}>
                  {format(currentMonth, 'MMMM yyyy', { locale: es }).toUpperCase()}
                </h3>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMonth}
                  className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 border-2 hover:bg-blue-50"
                  style={{ borderColor: "#3e92cc" }}
                >
                  Mes siguiente
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" style={{ color: "#0a2463" }} />
                </Button>
              </div>
              
              {/* Navegación de mes para móvil - Deslizador con título */}
              <div className="sm:hidden">
                <div className="flex justify-center items-center mb-2">
                  <button 
                    onClick={goToPrevMonth} 
                    disabled={isCurrentMonthToday()}
                    className={`p-2 ${isCurrentMonthToday() ? 'opacity-50' : ''}`}
                  >
                    <ChevronLeft className="h-5 w-5" style={{ color: isCurrentMonthToday() ? "#ccc" : "#0a2463" }} />
                  </button>
                  
                  <h3 className="text-base font-bold text-center mx-2" style={{ color: "#0a2463" }}>
                    {format(currentMonth, 'MMMM yyyy', { locale: es }).toUpperCase()}
                  </h3>
                  
                  <button onClick={goToNextMonth} className="p-2">
                    <ChevronRight className="h-5 w-5" style={{ color: "#0a2463" }} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando horarios disponibles...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : filteredDays.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay horarios disponibles para el turno {selectedShift === 'M' ? 'de mañana' : 'de tarde'} en este mes</p>
                <p className="text-sm mt-2">Intenta cambiar el turno o seleccionar otro mes</p>
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-hidden" ref={sliderRef}>
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {Array.from({ length: maxSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="min-w-full flex gap-2 sm:gap-3 px-1 sm:px-2">
                        {filteredDays
                          .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                          .map((day) => {
                            const dateKey = formatDateForAPI(day);
                            const availableTimes = dayTimeSlots.get(dateKey) || [];
                            const dayName = format(day, 'EEEE', { locale: es });
                            const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                            const formattedDate = format(day, 'dd/MM/yyyy');
                            
                            return (
                              <div key={dateKey} className="flex-1 min-w-0">
                                <div
                                  className="bg-white rounded-lg border-2 p-2 sm:p-3 h-full"
                                  style={{ borderColor: "#fffaff" }}
                                >
                                  <div className="text-center mb-4 sm:mb-5">
                                    <h3 className="font-bold text-base sm:text-lg" style={{ color: "#0a2463" }}>
                                      {dayNameCapitalized}
                                    </h3>
                                    <div className="flex justify-center mt-1">
                                      <div className="inline-flex items-center justify-center border border-blue-300 rounded-md px-2 py-1">
                                        <Calendar className="w-4 h-4 mr-1" style={{ color: "#3e92cc" }} />
                                        <span className="text-sm text-blue-600">{format(day, 'dd/MM/yyyy')}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-1 sm:space-y-2 max-h-[300px] sm:max-h-none overflow-y-auto pr-1">
                                    {availableTimes.length > 0 ? (
                                      availableTimes.map((time) => (
                                        <button
                                          key={`${dateKey}-${time}`}
                                          onClick={() => handleTimeSelect(day, time)}
                                          className={`w-full p-2.5 sm:p-3 rounded-full border text-sm font-medium transition-all duration-200 mb-2 ${
                                            selectedTimeSlot?.fullDate.toDateString() === day.toDateString() && 
                                            selectedTimeSlot?.time === time
                                              ? "shadow-md"
                                              : "hover:shadow-sm"
                                          }`}
                                          style={
                                            selectedTimeSlot?.fullDate.toDateString() === day.toDateString() && 
                                            selectedTimeSlot?.time === time
                                              ? { borderColor: "#d8315b", backgroundColor: "#d8315b", color: "white" }
                                              : { borderColor: "#3e92cc", backgroundColor: "white", color: "#3e92cc" }
                                          }
                                        >
                                          <div className="flex items-center justify-center">
                                            <span className="inline-block mr-1">•</span>
                                            {time}
                                          </div>
                                        </button>
                                      ))
                                    ) : (
                                      <div className="text-center text-xs sm:text-sm py-2 text-gray-500">
                                        No hay horarios disponibles
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                </div>

                {maxSlides > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-blue-50 z-10 border-2 h-8 w-8 sm:h-10 sm:w-10"
                      style={{ borderColor: "#3e92cc" }}
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: "#0a2463" }} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-blue-50 z-10 border-2 h-8 w-8 sm:h-10 sm:w-10"
                      style={{ borderColor: "#3e92cc" }}
                      onClick={nextSlide}
                      disabled={currentSlide === maxSlides - 1}
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: "#0a2463" }} />
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Botón flotante para móviles */}
            <div className="fixed bottom-4 right-4 left-4 sm:hidden z-10">
              <Button
                onClick={handleNext}
                disabled={!selectedTimeSlot}
                className="w-full text-white py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg rounded-full"
                style={{ backgroundColor: "#d8315b" }}
                size="lg"
              >
                Siguiente paso
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
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
        }}
      />
    </>
  )
}
