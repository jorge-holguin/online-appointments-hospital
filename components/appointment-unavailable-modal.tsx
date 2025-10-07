"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"

interface AppointmentUnavailableModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoBack: () => void
  errorMessage: string
}

export default function AppointmentUnavailableModal({
  open,
  onOpenChange,
  onGoBack,
  errorMessage,
}: AppointmentUnavailableModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Cita no disponible
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              {errorMessage}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Mensaje explicativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>¿Qué sucedió?</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Otro paciente reservó esta cita justo antes que tú. Te mostraremos las citas actualizadas para que puedas elegir otra disponible.
            </p>
          </div>

          {/* Botón para volver */}
          <Button
            onClick={onGoBack}
            className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white py-6 text-base font-semibold flex items-center justify-center gap-3"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Ver citas disponibles</span>
          </Button>

          {/* Información adicional */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Si necesitas ayuda, llama al{" "}
              <span className="font-semibold text-gray-700">(01) 418-3232 Opción 1</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
