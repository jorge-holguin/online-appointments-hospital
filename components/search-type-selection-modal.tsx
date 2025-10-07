"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, UserSearch, CalendarClock } from "lucide-react"
import DoctorSelectionModal from "./doctor-selection-modal"
import DateTimeRangeSelectionModal from "./date-time-range-selection-modal"
import SessionTimer from "./session-timer"

interface SearchTypeSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  patientData: any
  selectedSpecialty: string
  selectedSpecialtyId: string
}

export default function SearchTypeSelectionModal({
  open,
  onOpenChange,
  onBack,
  patientData,
  selectedSpecialty,
  selectedSpecialtyId,
}: SearchTypeSelectionModalProps) {
  const [searchType, setSearchType] = useState<'doctor' | 'datetime' | null>(null)
  const [showDoctorSelection, setShowDoctorSelection] = useState(false)
  const [showDateTimeRangeSelection, setShowDateTimeRangeSelection] = useState(false)

  const handleSelectSearchType = (type: 'doctor' | 'datetime') => {
    setSearchType(type)
    if (type === 'doctor') {
      setShowDoctorSelection(true)
    } else {
      setShowDateTimeRangeSelection(true)
    }
  }

  return (
    <>
      <Dialog open={open && !showDoctorSelection && !showDateTimeRangeSelection} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-xl font-semibold">¿Cómo deseas buscar tu cita?</DialogTitle>
            </div>
            <DialogDescription>
              Selecciona el método de búsqueda que prefieras
            </DialogDescription>
            {/* Timer de sesión */}
            <div className="mt-3">
              <SessionTimer />
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 text-center">
              Especialidad seleccionada: <span className="font-semibold text-blue-600">{selectedSpecialty}</span>
            </p>

            <div className="space-y-3">
              {/* Opción: Buscar por médico */}
              <button
                onClick={() => handleSelectSearchType('doctor')}
                className="w-full p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                    <UserSearch className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                      Buscar por médico
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Elige un médico específico y luego selecciona la fecha y hora disponible
                    </p>
                  </div>
                </div>
              </button>

              {/* Opción: Buscar por fecha y hora */}
              <button
                onClick={() => handleSelectSearchType('datetime')}
                className="w-full p-6 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-500 flex items-center justify-center transition-colors">
                    <CalendarClock className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                      Buscar por fecha y hora
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Selecciona primero la fecha y el rango de horario que te convenga
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de selección de médico */}
      <DoctorSelectionModal
        open={showDoctorSelection}
        onOpenChange={setShowDoctorSelection}
        onBack={() => setShowDoctorSelection(false)}
        patientData={patientData}
        selectedSpecialty={selectedSpecialty}
        selectedSpecialtyId={selectedSpecialtyId}
      />

      {/* Modal de selección de fecha y rango de hora */}
      <DateTimeRangeSelectionModal
        open={showDateTimeRangeSelection}
        onOpenChange={setShowDateTimeRangeSelection}
        onBack={() => setShowDateTimeRangeSelection(false)}
        patientData={patientData}
        selectedSpecialty={selectedSpecialty}
        selectedSpecialtyId={selectedSpecialtyId}
      />
    </>
  )
}
