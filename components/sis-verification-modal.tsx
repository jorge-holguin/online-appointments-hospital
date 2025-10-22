
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import SpecialtySelectionModal from "./specialty-selection-modal"
import AppointmentTypeModal from "./appointment-type-modal"
import SessionTimer from "./session-timer"

interface SISVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  patientData: any
}

type PatientType = 'SIS' | 'SOAT' | 'PAGANTE'

export default function SISVerificationModal({
  open,
  onOpenChange,
  onBack,
  patientData,
}: SISVerificationModalProps) {
  const [showSpecialtySelection, setShowSpecialtySelection] = useState(false)
  const [showAppointmentType, setShowAppointmentType] = useState(false)
  const [patientType, setPatientType] = useState<PatientType>('SIS')
  const [tipoCita, setTipoCita] = useState<string>('')
  const [especialidadInterconsulta, setEspecialidadInterconsulta] = useState<string>('')
  
  // Ref para el botón de continuar
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  
  // Enfocar el botón de continuar cuando se selecciona un tipo de atención
  useEffect(() => {
    if (patientType && continueButtonRef.current) {
      // Pequeño delay para asegurar que el botón esté habilitado
      setTimeout(() => {
        continueButtonRef.current?.focus()
      }, 100)
    }
  }, [patientType])

  const handleContinue = () => {
    // Todos los tipos (SIS, SOAT, PAGANTE) ahora pasan por el modal de tipo de cita
    setShowAppointmentType(true)
  }

  const canContinue = patientType === 'PAGANTE' || patientType === 'SIS' || patientType === 'SOAT'

  const handleAppointmentTypeSelected = (selectedType: string, especialidad?: string) => {
    setTipoCita(selectedType)
    if (especialidad) {
      setEspecialidadInterconsulta(especialidad)
    }
    setShowAppointmentType(false)
    setShowSpecialtySelection(true)
  }

    return (
      <>
        <Dialog open={open && !showSpecialtySelection && !showAppointmentType} onOpenChange={onOpenChange}>
          <DialogContent
            className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
            redirectToHome={true}
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
                    Tipo de Atención
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="sr-only">
                Selecciona el tipo de atención para tu cita médica
              </DialogDescription>
              {/* Timer de sesión */}
              <div className="mt-3">
                <SessionTimer />
              </div>
            </DialogHeader>
    
            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {/* Advertencia */}
              <div className="flex items-start gap-2 p-3 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                <AlertCircle className="w-5 h-5 mt-0.5 text-yellow-600" />
                <p>
                  <strong>Advertencia:</strong> Si eres paciente SIS, debes
                  seleccionar la opción <strong>Atención con SIS</strong>. De lo
                  contrario, tu solicitud de cita será rechazada automáticamente. Asegúrate de
                  ingresar información verídica y confiable.
                </p>
              </div>
    
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Paciente:</strong> {patientData.fullName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Documento:</strong> {patientData.documento}
                </p>
              </div>
    
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selecciona tu tipo de atención
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Elige cómo deseas ser atendido en tu cita médica
                </p>
              </div>
    
              {/* Opciones de tipo de paciente */}
              <div className="space-y-3">
                <h4 className="font-semibold">Tipo de atención</h4>
    
                <div className="space-y-3">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      patientType === "PAGANTE"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPatientType("PAGANTE")}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="pagante"
                        name="patientType"
                        value="PAGANTE"
                        checked={patientType === "PAGANTE"}
                        onChange={() => setPatientType("PAGANTE")}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div>
                        <label
                          htmlFor="pagante"
                          className="text-base font-medium text-gray-900 cursor-pointer"
                        >
                          Atención como Pagante
                        </label>
                        <p className="text-sm text-gray-600">
                          Pagarás directamente por la consulta médica
                        </p>
                      </div>
                    </div>
                  </div>
    
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      patientType === "SIS"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPatientType("SIS")}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="sis"
                        name="patientType"
                        value="SIS"
                        checked={patientType === "SIS"}
                        onChange={() => setPatientType("SIS")}
                        className="h-4 w-4 text-green-600"
                      />
                      <div>
                        <label
                          htmlFor="sis"
                          className="text-base font-medium text-gray-900 cursor-pointer"
                        >
                          Atención con SIS
                        </label>
                        <p className="text-sm text-gray-600">
                          Usar tu Seguro Integral de Salud
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      patientType === "SOAT"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPatientType("SOAT")}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="soat"
                        name="patientType"
                        value="SOAT"
                        checked={patientType === "SOAT"}
                        onChange={() => setPatientType("SOAT")}
                        className="h-4 w-4 text-purple-600"
                      />
                      <div>
                        <label
                          htmlFor="soat"
                          className="text-base font-medium text-gray-900 cursor-pointer"
                        >
                          Atención con SOAT
                        </label>
                        <p className="text-sm text-gray-600">
                          Usar tu Seguro Obligatorio de Accidentes de Tránsito (SOAT)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    
        <AppointmentTypeModal
          open={showAppointmentType}
          onOpenChange={setShowAppointmentType}
          onBack={() => setShowAppointmentType(false)}
          onContinue={handleAppointmentTypeSelected}
          patientData={{
            ...patientData,
            patientType: patientType,
          }}
        />

        <SpecialtySelectionModal
          open={showSpecialtySelection}
          onOpenChange={setShowSpecialtySelection}
          onBack={() => setShowSpecialtySelection(false)}
          patientData={{
            ...patientData,
            patientType: patientType,
            tipoAtencion: patientType,
            tipoCita: tipoCita,
            especialidadInterconsulta: especialidadInterconsulta,
          }}
        />
      </>
    )
    
}
