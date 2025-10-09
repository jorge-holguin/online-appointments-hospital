"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, FileText } from "lucide-react"
import SessionTimer from "./session-timer"

interface AppointmentTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  onContinue: (tipoCita: string) => void
  patientData: any
}

export default function AppointmentTypeModal({
  open,
  onOpenChange,
  onBack,
  onContinue,
  patientData,
}: AppointmentTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string>("")

  const handleContinue = () => {
    if (selectedType) {
      onContinue(selectedType)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          </div>
        </div>

        {/* Footer fijo */}
        <div className="flex-shrink-0 p-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
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
