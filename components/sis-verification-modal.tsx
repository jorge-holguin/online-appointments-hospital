"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Upload, FileImage, X, AlertCircle } from "lucide-react"
import SpecialtySelectionModal from "./specialty-selection-modal"
import SessionTimer from "./session-timer"
import { mapPatientTypeToApiFormat } from "@/lib/appointment-utils"

interface SISVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  patientData: any
}

type PatientType = 'SIS' | 'PAGANTE'

export default function SISVerificationModal({
  open,
  onOpenChange,
  onBack,
  patientData,
}: SISVerificationModalProps) {
  const [showSpecialtySelection, setShowSpecialtySelection] = useState(false)
  const [patientType, setPatientType] = useState<PatientType>('SIS')
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setImageError(null)
    
    if (!file) {
      setReferenceImage(null)
      return
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setImageError('Solo se permiten archivos JPG, PNG o PDF')
      return
    }
    
    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB en bytes
    if (file.size > maxSize) {
      setImageError('El archivo no debe superar los 5MB')
      return
    }
    
    setReferenceImage(file)
  }
  
  const handleRemoveImage = () => {
    setReferenceImage(null)
    setImageError(null)
    // Limpiar el input file
    const fileInput = document.getElementById('referenceImage') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleContinue = () => {
    // Asegurarse de que el tipo de paciente sea un valor válido
    const validatedPatientType = patientType === 'SIS' ? 'SIS' : 'PAGANTE'
    
    // Mostrar el modal de selección de especialidad
    setShowSpecialtySelection(true)
  }
  
  const handleClose = () => {
    // Redirigir a la página principal
    window.location.href =   '/'
  }

  const canContinue = patientType === 'PAGANTE' || (patientType === 'SIS' /* && referenceImage !== null */)

    return (
      <>
        <Dialog open={open && !showSpecialtySelection} onOpenChange={onOpenChange}>
          <DialogContent
            className="w-[95vw] max-w-lg max-h-[90vh] flex flex-col"
            redirectToHome={true}
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
                  contrario, tu reserva será rechazada automáticamente. Asegúrate de
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
                </div>
              </div>
    
              {/* Subida de imagen si es SIS */}
            {/*   {patientType === "SIS" && (
                <div className="space-y-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    Imagen de Referencia SIS
                  </h4>
    
                  <p className="text-sm text-green-700">
                    Sube una foto o escaneo de tu documento de referencia del SIS
                  </p>
    
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="referenceImage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-green-500" />
                          <p className="mb-2 text-sm text-green-700">
                            <span className="font-semibold">Haz clic para subir</span>{" "}
                            o arrastra y suelta
                          </p>
                          <p className="text-xs text-green-600">
                            JPG, PNG o PDF (Máx. 5MB)
                          </p>
                        </div>
                        <input
                          id="referenceImage"
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
    
                    {referenceImage && (
                      <div className="flex items-center justify-between bg-white border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <FileImage className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            {referenceImage.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(referenceImage.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
    
                    {imageError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{imageError}</span>
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </div>
    
            {/* Footer fijo */}
            <div className="flex-shrink-0 p-4">
              <Button
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
    
        <SpecialtySelectionModal
          open={showSpecialtySelection}
          onOpenChange={setShowSpecialtySelection}
          onBack={() => setShowSpecialtySelection(false)}
          patientData={{
            ...patientData,
            patientType: patientType === "SIS" ? "SIS" : "PAGANTE",
            referenceImage: patientType === "SIS" ? referenceImage : null,
            tipoAtencion: patientType === "SIS" ? "SIS" : "PAGANTE",
          }}
        />
      </>
    )
    
}
