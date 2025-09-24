"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, ChevronLeft, Search, Loader2 } from "lucide-react"
import DoctorSelectionModal from "./doctor-selection-modal"
import { useDateContext } from "@/context/date-context"

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

// Import environment variables
import { env } from "@/lib/env"

export default function SpecialtySelectionModal({
  open,
  onOpenChange,
  onBack,
  patientData,
}: SpecialtySelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("") // Nombre de la especialidad
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("") // ID de la especialidad
  const [showDoctorSelection, setShowDoctorSelection] = useState(false)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Usar el contexto de fechas compartido
  const { startDate, endDate } = useDateContext()
  
  // Cargar especialidades desde la API
  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Error al obtener especialidades: ${response.status}`)
        }
        
        const data = await response.json()
        setSpecialties(data)
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
    
    if (open) {
      fetchSpecialties()
    }
  }, [open])

  const filteredSpecialties = specialties.filter((specialty) =>
    specialty.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNext = () => {
    if (selectedSpecialty) {
      setShowDoctorSelection(true)
    }
  }

  return (
    <>
      <Dialog open={open && !showDoctorSelection} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-xl font-semibold">¿Qué especialidad necesitas?</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Buscar especialidad</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="specialty"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ingresa la especialidad"
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2">Cargando especialidades...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredSpecialties.length > 0 ? (
                  filteredSpecialties.map((specialty) => (
                    <button
                      key={specialty.idEspecialidad}
                      onClick={() => {
                        setSelectedSpecialty(specialty.nombre)
                        setSelectedSpecialtyId(specialty.idEspecialidad)
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedSpecialty === specialty.nombre
                          ? "border-blue-500 text-white"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      style={selectedSpecialty === specialty.nombre ? { backgroundColor: "#3e92cc" } : {}}
                    >
                      {specialty.nombre}
                    </button>
                  ))
                ) : searchTerm ? (
                  <div className="text-center py-4 text-gray-500">
                    No se encontraron especialidades que coincidan con "{searchTerm}"
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay especialidades disponibles en este momento
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={!selectedSpecialty}
              className="w-full text-white py-3 mt-6 hover:opacity-90"
              style={{ backgroundColor: "#0a2463" }}
              size="lg"
            >
              Siguiente paso
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DoctorSelectionModal
        open={showDoctorSelection}
        onOpenChange={setShowDoctorSelection}
        onBack={() => setShowDoctorSelection(false)}
        patientData={patientData}
        selectedSpecialty={selectedSpecialty}
        selectedSpecialtyId={selectedSpecialtyId}
      />
    </>
  )
}
