"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Search, ChevronRight, Loader2 } from "lucide-react"
import DateTimeSelectionModal from "./date-time-selection-modal"
import SessionTimer from "./session-timer"
import { useAppConfig } from "@/hooks/use-app-config"

interface DoctorSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  onBackToSpecialties?: () => void  // Callback para volver a especialidades
  patientData: any
  selectedSpecialty: string
  selectedSpecialtyId: string
}

interface Doctor {
  nombre: string
  medicoId: string
}

// Interfaz más permisiva para datos de la API (permite null/undefined)
interface ApiDoctor {
  nombre?: string | null
  medicoId?: string | null
  nombreMedico?: string | null
  id?: string | null
}

// Ya no necesitamos datos de respaldo, usaremos la API

export default function DoctorSelectionModal({
  open,
  onOpenChange,
  onBack,
  onBackToSpecialties,
  patientData,
  selectedSpecialty,
  selectedSpecialtyId,
}: DoctorSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [showDateTimeSelection, setShowDateTimeSelection] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Usar configuración centralizada
  const { config } = useAppConfig()
  const startDate = config?.dateRange.startDate || "2025-08-01"
  const endDate = config?.dateRange.endDate || "2025-08-31"

  // Cargar doctores desde la API
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedSpecialtyId || !open || !config) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Llamada a la API real usando el ID de especialidad
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/medicos?fechaInicio=${startDate}&fechaFin=${endDate}&idEspecialidad=${selectedSpecialtyId}`
        
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Error al obtener doctores: ${response.status}`)
        
        const data: ApiDoctor[] = await response.json()
        
        // Normalizar y filtrar datos nulos/inválidos
        const normalizedDoctors: Doctor[] = data
          .filter(item => item != null) // Filtrar elementos null/undefined
          .map(item => ({
            nombre: item.nombre || item.id || '',
            medicoId: item.medicoId || item.nombreMedico || ''
          }))
          .filter(doctor => 
            doctor.nombre && 
            doctor.medicoId && 
            doctor.nombre.trim() !== '' &&
            doctor.medicoId.trim() !== ''
          ) // Filtrar doctores sin datos válidos
        
        setDoctors(normalizedDoctors)
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError('No se pudieron cargar los doctores. Por favor, inténtelo de nuevo.')
        setDoctors([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchDoctors()
  }, [selectedSpecialtyId, startDate, endDate, open, config])
  
  // Filtrado a prueba de nulos
  const filteredDoctors = doctors.filter((doctor) => {
    // Verificar que doctor y medicoId existen y no son nulos
    if (!doctor || !doctor.medicoId) return false
    
    const medicoId = doctor.medicoId.trim()
    if (!medicoId) return false
    
    // Solo entonces aplicar toLowerCase
    return medicoId.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleNext = () => {
    if (selectedDoctor) {
      setShowDateTimeSelection(true)
    }
  }

  // Manejar tecla Enter para continuar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedDoctor) {
      e.preventDefault()
      handleNext()
    }
  }

  // Callback para refrescar las citas cuando se vuelve del modal de confirmación
  const handleRefreshAppointments = () => {
    // Incrementar el trigger para forzar el refresco
    setRefreshTrigger(prev => prev + 1)
  }

  // Callback mejorado para volver a especialidades
  const handleBackToSpecialtiesFromChild = () => {
    // Cerrar el modal de selección de fecha/hora
    setShowDateTimeSelection(false)
    // Resetear el doctor seleccionado
    setSelectedDoctor(null)
    
    // Luego llamar al callback del padre
    if (onBackToSpecialties) {
      onBackToSpecialties()
    }
  }

  return (
    <>
      <Dialog open={open && !showDateTimeSelection} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto" 
          redirectToHome={true}
          onInteractOutside={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-blue-50">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-xl font-semibold">¿Con quién deseas atenderte?</DialogTitle>
            </div>
            <DialogDescription>
              Selecciona el médico con el que deseas agendar tu cita
            </DialogDescription>
            {/* Timer de sesión */}
            <div className="mt-3">
              <SessionTimer />
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor-search">Búsqueda de doctor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="doctor-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ingresa nombre del médico"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Médicos disponibles para {selectedSpecialty}:</p>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2">Cargando doctores...</span>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-4">{error}</div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <button
                        key={doctor.medicoId}
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`w-full p-4 rounded-lg border transition-colors text-left ${
                          selectedDoctor?.medicoId === doctor.medicoId
                            ? "border-blue-500 text-white"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        style={selectedDoctor?.medicoId === doctor.medicoId ? { backgroundColor: "#3e92cc" } : {}}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src="/male-doctor.jpg"
                            alt={doctor.medicoId}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p
                                  className={`text-sm mb-1 ${selectedDoctor?.medicoId === doctor.medicoId ? "text-white/80" : "text-gray-500"}`}
                                >
                                  {selectedSpecialty}
                                </p>
                                <p
                                  className={`font-medium text-sm ${selectedDoctor?.medicoId === doctor.medicoId ? "text-white" : "text-gray-900"}`}
                                >
                                  {doctor.medicoId}
                                </p>
                              </div>
                              <ChevronRight
                                className={`h-4 w-4 flex-shrink-0 ${selectedDoctor?.medicoId === doctor.medicoId ? "text-white/60" : "text-gray-400"}`}
                              />
                            </div>
                            <p
                              className={`text-xs mt-2 ${selectedDoctor?.medicoId === doctor.medicoId ? "text-white/90" : "text-blue-600"}`}
                              style={selectedDoctor?.medicoId === doctor.medicoId ? {} : { color: "#3e92cc" }}
                            >
                              Código: {doctor.nombre}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : searchTerm ? (
                    <div className="text-center py-4 text-gray-500">
                      No se encontraron doctores que coincidan con "{searchTerm}"
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No hay doctores disponibles para esta especialidad
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!selectedDoctor}
              className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white py-3 mt-6 font-semibold disabled:opacity-50 transition-all"
              size="lg"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DateTimeSelectionModal
        open={showDateTimeSelection}
        onOpenChange={setShowDateTimeSelection}
        onBack={() => setShowDateTimeSelection(false)}
        onBackToSpecialties={handleBackToSpecialtiesFromChild}
        onRefreshAppointments={handleRefreshAppointments}
        refreshTrigger={refreshTrigger}
        patientData={patientData}
        selectedSpecialty={selectedSpecialty}
        selectedDoctor={{
          ...selectedDoctor,
          especialidadId: selectedSpecialtyId // Añadimos el ID de la especialidad al objeto del doctor
        }}
      />
    </>
  )
}
