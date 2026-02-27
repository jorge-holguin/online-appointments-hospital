"use client"

import { useState, useEffect, useRef } from "react"
import { useAppConfig } from "@/hooks/use-app-config"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, FileText, ClipboardList, Stethoscope, Loader2, ChevronDown, Info } from "lucide-react"
import SessionTimer from "./session-timer"

interface AppointmentTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  onContinue: (tipoCita: string, especialidadInterconsulta?: string) => void
  patientData: any
}

interface Specialty {
  idEspecialidad: string
  nombre: string
}

interface ApiSpecialty {
  idEspecialidad?: string | null
  nombre?: string | null
}

export default function AppointmentTypeModal({
  open,
  onOpenChange,
  onBack,
  onContinue,
  patientData,
}: AppointmentTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedSpecialtyName, setSelectedSpecialtyName] = useState<string>("")
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loadingSpecialties, setLoadingSpecialties] = useState(false)
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)
  
  // Usar configuración centralizada
  const { config } = useAppConfig()
  const startDate = config?.dateRange.startDate
  const endDate = config?.dateRange.endDate
  
  // Ref para el botón de continuar
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Enfocar el botón de continuar cuando se selecciona un tipo
  useEffect(() => {
    if (selectedType && continueButtonRef.current) {
      // Pequeño delay para asegurar que el botón esté habilitado
      setTimeout(() => {
        continueButtonRef.current?.focus()
      }, 100)
    }
  }, [selectedType])

  // Cargar especialidades cuando se selecciona INTERCONSULTA
  useEffect(() => {
    const fetchSpecialties = async () => {
      if (selectedType !== 'INTERCONSULTA' || !config) return
      
      setLoadingSpecialties(true)
      
      try {
        const url = `${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Error al obtener especialidades: ${response.status}`)
        }
        
        const data: ApiSpecialty[] = await response.json()
        
        // Normalizar y filtrar datos nulos/inválidos
        const normalizedSpecialties: Specialty[] = data
          .filter(item => item != null)
          .map(item => ({
            idEspecialidad: item.idEspecialidad || '',
            nombre: item.nombre || ''
          }))
          .filter(specialty => 
            specialty.idEspecialidad && 
            specialty.nombre && 
            specialty.nombre.trim() !== ''
          )
        
        setSpecialties(normalizedSpecialties)
      } catch (err) {
        console.error('Error fetching specialties:', err)
        setSpecialties([])
      } finally {
        setLoadingSpecialties(false)
      }
    }
    
    if (selectedType === 'INTERCONSULTA') {
      fetchSpecialties()
    } else {
      setSelectedSpecialtyName('')
      setSpecialties([])
    }
  }, [selectedType, config, startDate, endDate])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSpecialtyDropdown(false)
      }
    }

    if (showSpecialtyDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSpecialtyDropdown])

  const handleContinue = () => {
    if (selectedType) {
      // Si es INTERCONSULTA y se seleccionó una especialidad, pasarla
      if (selectedType === 'INTERCONSULTA' && selectedSpecialtyName) {
        onContinue(selectedType, selectedSpecialtyName)
      } else {
        onContinue(selectedType)
      }
    }
  }

  const canContinue = selectedType && (selectedType !== 'INTERCONSULTA' || selectedSpecialtyName)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
        redirectToHome={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header fijo */}
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-blue-50">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-xl font-semibold">
                Tipo de Cita
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Selecciona el tipo de cita médica que necesitas
          </DialogDescription>
          {/* Timer de sesión */}
          <div className="mt-3">
            <SessionTimer />
          </div>
        </DialogHeader>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Paciente:</strong> {patientData.fullName}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Tipo de Atención:</strong> {patientData.patientType}
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Selecciona el tipo de cita
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Elige el tipo de cita médica que necesitas
            </p>
          </div>

          {/* Opciones de tipo de cita */}
          <div className="space-y-4">
            <button
              onClick={() => setSelectedType("CITADO")}
              className={`w-full border-2 rounded-xl p-6 transition-all duration-200 ${
                selectedType === "CITADO"
                  ? "border-[#3e92cc] bg-[#3e92cc] text-white shadow-lg scale-[1.02]"
                  : "border-gray-200 hover:border-[#3e92cc] hover:shadow-md bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-4 rounded-lg transition-colors ${
                    selectedType === "CITADO" ? "bg-white/20" : "bg-blue-50"
                  }`}
                >
                  <Calendar
                    className="w-8 h-8"
                    style={{ color: selectedType === "CITADO" ? "white" : "#3e92cc" }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`text-xl font-bold mb-1 ${
                    selectedType === "CITADO" ? "text-white" : "text-gray-900"
                  }`}>
                    CITADO
                  </h4>
                  <p className={`text-sm ${
                    selectedType === "CITADO" ? "text-white/90" : "text-gray-600"
                  }`}>
                    Cita programada regular para consulta médica
                  </p>
                </div>
                {selectedType === "CITADO" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" style={{ color: "#3e92cc" }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedType("INTERCONSULTA")}
              className={`w-full border-2 rounded-xl p-6 transition-all duration-200 ${
                selectedType === "INTERCONSULTA"
                  ? "border-[#3e92cc] bg-[#3e92cc] text-white shadow-lg scale-[1.02]"
                  : "border-gray-200 hover:border-[#3e92cc] hover:shadow-md bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-4 rounded-lg transition-colors ${
                    selectedType === "INTERCONSULTA" ? "bg-white/20" : "bg-blue-50"
                  }`}
                >
                  <FileText
                    className="w-8 h-8"
                    style={{ color: selectedType === "INTERCONSULTA" ? "white" : "#3e92cc" }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`text-xl font-bold mb-1 ${
                    selectedType === "INTERCONSULTA" ? "text-white" : "text-gray-900"
                  }`}>
                    INTERCONSULTA
                  </h4>
                  <p className={`text-sm ${
                    selectedType === "INTERCONSULTA" ? "text-white/90" : "text-gray-600"
                  }`}>
                    Referencia de otro médico o especialista
                  </p>
                </div>
                {selectedType === "INTERCONSULTA" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" style={{ color: "#3e92cc" }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedType("TRAMITE")}
              className={`w-full border-2 rounded-xl p-6 transition-all duration-200 ${
                selectedType === "TRAMITE"
                  ? "border-[#3e92cc] bg-[#3e92cc] text-white shadow-lg scale-[1.02]"
                  : "border-gray-200 hover:border-[#3e92cc] hover:shadow-md bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-4 rounded-lg transition-colors ${
                    selectedType === "TRAMITE" ? "bg-white/20" : "bg-blue-50"
                  }`}
                >
                  <ClipboardList
                    className="w-8 h-8"
                    style={{ color: selectedType === "TRAMITE" ? "white" : "#3e92cc" }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`text-xl font-bold mb-1 ${
                    selectedType === "TRAMITE" ? "text-white" : "text-gray-900"
                  }`}>
                    TRÁMITE ADMINISTRATIVO
                  </h4>
                  <p className={`text-sm ${
                    selectedType === "TRAMITE" ? "text-white/90" : "text-gray-600"
                  }`}>
                    Solicitudes administrativas y gestiones
                  </p>
                </div>
                {selectedType === "TRAMITE" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" style={{ color: "#3e92cc" }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Mensaje informativo para Trámite Administrativo */}
          {selectedType === 'TRAMITE' && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Información importante
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Todos los trámites administrativos son únicamente para atención como <strong>PAGANTE</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Selector de Especialidad para Interconsulta */}
          {selectedType === 'INTERCONSULTA' && (
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                ¿De qué especialidad vienes? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Selecciona la especialidad desde donde te están refiriendo
              </p>
              
              {loadingSpecialties ? (
                <div className="flex items-center justify-center py-4 border-2 border-gray-200 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: "#3e92cc" }} />
                  <span className="text-sm text-gray-600">Cargando especialidades...</span>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
                    className="w-full px-4 py-3 text-left border-2 border-gray-300 rounded-lg focus:border-[#3e92cc] focus:outline-none hover:border-gray-400 transition-colors bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-gray-400" />
                        <span className={selectedSpecialtyName ? "text-gray-900" : "text-gray-500"}>
                          {selectedSpecialtyName || "Selecciona una especialidad"}
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSpecialtyDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {showSpecialtyDropdown && (
                    <div className="absolute z-50 w-full bottom-full mb-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {specialties.length > 0 ? (
                        specialties.map((specialty) => (
                          <button
                            key={specialty.idEspecialidad}
                            type="button"
                            onClick={() => {
                              setSelectedSpecialtyName(specialty.nombre)
                              setShowSpecialtyDropdown(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{specialty.nombre}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No hay especialidades disponibles
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        

        {/* Footer fijo */}
        <div className="flex-shrink-0 p-4">
          <Button
            ref={continueButtonRef}
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white py-3 font-semibold disabled:opacity-50 flex items-center justify-center transition-all"
            size="lg"
          >
            <span>Continuar</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
