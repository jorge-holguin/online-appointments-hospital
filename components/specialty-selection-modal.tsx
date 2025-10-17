"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Search, Loader2, Stethoscope } from "lucide-react"
import SearchTypeSelectionModal from "./search-type-selection-modal"
import SessionTimer from "./session-timer"
import { useAppConfig } from "@/hooks/use-app-config"

interface SpecialtySelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  patientData: any
}

interface Specialty {
  idEspecialidad: string
  nombre: string
}

// Interfaz más permisiva para datos de la API (permite null/undefined)
interface ApiSpecialty {
  idEspecialidad?: string | null
  nombre?: string | null
  nombreEspecialidad?: string | null
  Nombre?: string | null
}

export default function SpecialtySelectionModal({
  open,
  onOpenChange,
  onBack,
  patientData,
}: SpecialtySelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("") // Nombre de la especialidad
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("") // ID de la especialidad
  const [showSearchTypeSelection, setShowSearchTypeSelection] = useState(false)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Usar configuración centralizada
  const { config, loading: configLoading } = useAppConfig()
  const startDate = config?.dateRange.startDate || "2025-08-01"
  const endDate = config?.dateRange.endDate || "2025-08-31"
  
  // Ref para el botón de continuar
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  
  // Resetear el filtro cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setSearchTerm("")
    }
  }, [open])
  
  // Enfocar el botón de continuar cuando se selecciona una especialidad
  useEffect(() => {
    if (selectedSpecialty && continueButtonRef.current) {
      // Pequeño delay para asegurar que el botón esté habilitado
      setTimeout(() => {
        continueButtonRef.current?.focus()
      }, 100)
    }
  }, [selectedSpecialty])
  
  // Cargar especialidades desde la API
  useEffect(() => {
    const fetchSpecialties = async () => {
      if (!config) return
      
      setLoading(true)
      setError(null)
      
      try {
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Error al obtener especialidades: ${response.status}`)
        }
        
        const data: ApiSpecialty[] = await response.json()
        
        // Normalizar y filtrar datos nulos/inválidos
        const normalizedSpecialties: Specialty[] = data
          .filter(item => item != null) // Filtrar elementos null/undefined
          .map(item => ({
            idEspecialidad: item.idEspecialidad || '',
            nombre: item.nombre || item.nombreEspecialidad || item.Nombre || ''
          }))
          .filter(specialty => 
            specialty.idEspecialidad && 
            specialty.nombre && 
            specialty.nombre.trim() !== ''
          ) // Filtrar especialidades sin datos válidos
        
        setSpecialties(normalizedSpecialties)
      } catch (err) {
        console.error('Error fetching specialties:', err)
        setError('No se pudieron cargar las especialidades. Por favor, inténtelo de nuevo.')
        // Usar datos de respaldo en caso de error
        setSpecialties([
          { idEspecialidad: "0001", nombre: "Medicina Interna" },
          { idEspecialidad: "0006", nombre: "Pediatría" },
          { idEspecialidad: "0003", nombre: "Ginecología" },
          { idEspecialidad: "0019", nombre: "Cardiología" },
          { idEspecialidad: "0018", nombre: "Dermatología" },
          { idEspecialidad: "0020", nombre: "Neurología" },
          { idEspecialidad: "0022", nombre: "Traumatología" },
          { idEspecialidad: "0010", nombre: "Oftalmología" },
          { idEspecialidad: "0002", nombre: "Otorrinolaringología" },
          { idEspecialidad: "0012", nombre: "Psiquiatría" },
        ])
      } finally {
        setLoading(false)
      }
    }
    
    if (open && config) {
      fetchSpecialties()
    }
  }, [open, config, startDate, endDate])

  // Filtrado a prueba de nulos
  const filteredSpecialties = specialties.filter((specialty) => {
    // Verificar que specialty y nombre existen y no son nulos
    if (!specialty || !specialty.nombre) return false
    
    const nombre = specialty.nombre.trim()
    if (!nombre) return false
    
    // Solo entonces aplicar toLowerCase
    return nombre.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleNext = () => {
    if (selectedSpecialty) {
      setShowSearchTypeSelection(true)
    }
  }

  // Manejar tecla Enter para continuar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedSpecialty) {
      e.preventDefault()
      handleNext()
    }
  }

  // Callback para volver a este modal desde modales hijos
  const handleBackToSpecialties = () => {
    // Cerrar el modal de tipo de búsqueda y todos sus hijos
    setShowSearchTypeSelection(false)
    // Resetear la especialidad para forzar una nueva selección
    // Esto asegura que todos los modales se cierren completamente
    setSelectedSpecialty("")
    setSelectedSpecialtyId("")
  }

  return (
    <>
      <Dialog open={open && !showSearchTypeSelection} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto pb-20 sm:pb-6"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="hover:bg-blue-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold ">
                  ¿Qué especialidad necesitas?
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Selecciona la especialidad médica para tu cita
                </DialogDescription>
              </div>
            </div>
            {/* Timer de sesión */}
            <div className="mt-3">
              <SessionTimer />
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search Bar with improved styling */}
            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-sm font-semibold text-gray-700">
                Buscar especialidad
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="specialty"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: Cardiología, Pediatría, Dermatología..."
                  className="pl-12 pr-4 py-6 text-base border-2 focus:border-blue-400 rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Loading, Error, or Specialties Grid */}
            {configLoading || loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: "#3e92cc" }} />
                <span className="text-gray-600 font-medium">Cargando especialidades...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                {filteredSpecialties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredSpecialties.map((specialty, index) => {
                      const isSelected = selectedSpecialty === specialty.nombre && selectedSpecialtyId === specialty.idEspecialidad
                      return (
                        <button
                          key={`${specialty.idEspecialidad}-${specialty.nombre}-${index}`}
                          onClick={() => {
                            setSelectedSpecialty(specialty.nombre)
                            setSelectedSpecialtyId(specialty.idEspecialidad)
                          }}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? "border-transparent shadow-lg scale-[1.02]"
                              : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]"
                          }`}
                          style={isSelected ? { 
                            backgroundColor: "#3e92cc",
                            color: "white"
                          } : {
                            backgroundColor: "white"
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className={`p-3 rounded-lg transition-colors ${
                                isSelected ? "bg-white/20" : "bg-blue-50"
                              }`}
                            >
                              <Stethoscope 
                                className="h-6 w-6" 
                                style={{ color: isSelected ? "white" : "#3e92cc" }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-base truncate ${
                                isSelected ? "text-white" : "text-gray-900"
                              }`}>
                                {specialty.nombre}
                              </p>
                              <p className={`text-xs mt-1 ${
                                isSelected ? "text-white/80" : "text-gray-500"
                              }`}>
                                Código: {specialty.idEspecialidad}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4" style={{ color: "#3e92cc" }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-xl p-8">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600 font-medium">No se encontraron especialidades</p>
                      <p className="text-gray-500 text-sm mt-2">que coincidan con "{searchTerm}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-xl p-8">
                      <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600 font-medium">No hay especialidades disponibles</p>
                      <p className="text-gray-500 text-sm mt-2">en este momento</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Button - Flotante en móviles */}
            <div className="fixed sm:relative bottom-0 left-0 right-0 p-4 bg-white border-t sm:border-t-0 sm:pt-4 z-50 shadow-lg sm:shadow-none">
              <Button
                ref={continueButtonRef}
                onClick={handleNext}
                disabled={!selectedSpecialty || configLoading}
                className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white py-6 text-base font-semibold disabled:opacity-50 transition-all rounded-xl shadow-md hover:shadow-lg"
                size="lg"
              >
                Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SearchTypeSelectionModal
        open={showSearchTypeSelection}
        onOpenChange={setShowSearchTypeSelection}
        onBack={() => setShowSearchTypeSelection(false)}
        onBackToSpecialties={handleBackToSpecialties}
        patientData={patientData}
        selectedSpecialty={selectedSpecialty}
        selectedSpecialtyId={selectedSpecialtyId}
      />
    </>
  )
}
