"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, ChevronLeft, Search, ChevronRight, Loader2 } from "lucide-react"
import DateTimeSelectionModal from "./date-time-selection-modal"
import { useDateContext } from "@/context/date-context"
import { env } from "@/lib/env"

interface DoctorSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  patientData: any
  selectedSpecialty: string
  selectedSpecialtyId: string
}

interface Doctor {
  nombre: string
  medicoId: string
}

// Ya no necesitamos datos de respaldo, usaremos la API

export default function DoctorSelectionModal({
  open,
  onOpenChange,
  onBack,
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
  
  // Usar el contexto de fechas compartido
  const { startDate, endDate } = useDateContext()

  // Cargar doctores desde la API
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedSpecialtyId || !open) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Llamada a la API real usando el ID de especialidad
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/medicos?fechaInicio=${startDate}&fechaFin=${endDate}&idEspecialidad=${selectedSpecialtyId}`
        
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Error al obtener doctores: ${response.status}`)
        
        const data = await response.json()
        setDoctors(data)
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError('No se pudieron cargar los doctores. Por favor, inténtelo de nuevo.')
        setDoctors([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchDoctors()
  }, [selectedSpecialtyId, startDate, endDate, open])
  
  const filteredDoctors = doctors.filter((doctor) => 
    doctor.medicoId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNext = () => {
    if (selectedDoctor) {
      setShowDateTimeSelection(true)
    }
  }

  return (
    <>
      <Dialog open={open && !showDateTimeSelection} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg" redirectToHome={true}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-xl font-semibold">¿Con quién deseas atenderte?</DialogTitle>
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
              className="w-full text-white py-3 mt-6 hover:opacity-90"
              style={{ backgroundColor: "#0a2463" }}
              size="lg"
            >
              Siguiente paso
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DateTimeSelectionModal
        open={showDateTimeSelection}
        onOpenChange={setShowDateTimeSelection}
        onBack={() => setShowDateTimeSelection(false)}
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
