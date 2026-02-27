"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]" redirectToHome={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Términos y Condiciones</DialogTitle>
          <DialogDescription>
            Lea detenidamente los siguientes términos antes de continuar
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-gray-700">
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">1. Aceptación de los Términos</h3>
              <p>
                Al registrarse y utilizar el sistema de citas en línea del Hospital José Agurto Tello de Chosica, 
                usted acepta cumplir con estos términos y condiciones. Si no está de acuerdo con alguno de estos 
                términos, le recomendamos no utilizar este servicio.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">2. Tratamiento de Datos Personales</h3>
              <p className="mb-2">
                En cumplimiento con la Ley N° 29733, Ley de Protección de Datos Personales, y su Reglamento 
                aprobado por Decreto Supremo N° 003-2013-JUS, le informamos que:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sus datos personales serán utilizados exclusivamente para la gestión de citas médicas.</li>
                <li>La información proporcionada será almacenada en nuestros sistemas seguros.</li>
                <li>No compartiremos sus datos con terceros sin su consentimiento expreso.</li>
                <li>Tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">3. Responsabilidades del Usuario</h3>
              <p className="mb-2">Al utilizar este sistema, usted se compromete a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Proporcionar información veraz y actualizada.</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
                <li>No compartir su cuenta con terceros.</li>
                <li>Notificar de inmediato cualquier uso no autorizado de su cuenta.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">4. Limitación de Responsabilidad</h3>
              <p className="mb-2">
                El Hospital José Agurto Tello de Chosica no se responsabiliza por:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Pérdida de datos debido a problemas técnicos fuera de nuestro control 
                  (cortes de energía, fallas de internet, etc.).
                </li>
                <li>
                  Uso indebido de la plataforma por parte del usuario o terceros que accedan 
                  a su cuenta debido a negligencia en el manejo de sus credenciales.
                </li>
                <li>
                  Consecuencias derivadas de la información incorrecta proporcionada por el usuario.
                </li>
                <li>
                  Interrupciones del servicio por mantenimiento programado o emergencias técnicas.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">5. Seguridad de la Información</h3>
              <p>
                Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para 
                proteger sus datos personales. Sin embargo, ningún sistema es completamente seguro. 
                Usted acepta que utiliza este servicio bajo su propia responsabilidad.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">6. Uso del Sistema de Citas</h3>
              <p className="mb-2">El sistema de citas en línea está sujeto a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Disponibilidad de médicos y horarios.</li>
                <li>Confirmación previa por parte del establecimiento.</li>
                <li>Políticas de cancelación establecidas por el hospital.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">7. Modificaciones</h3>
              <p>
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. 
                Los cambios serán efectivos inmediatamente después de su publicación en el sistema. 
                El uso continuado del servicio después de cualquier modificación constituye su aceptación 
                de los nuevos términos.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2">8. Contacto</h3>
              <p>
                Para consultas sobre estos términos o el tratamiento de sus datos personales, 
                puede comunicarse con nosotros al teléfono (01) 418-3232 o acercarse a la 
                Oficina de Atención al Usuario del Hospital José Agurto Tello de Chosica.
              </p>
            </section>

            <section className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Aviso Importante</h3>
              <p className="text-amber-700">
                Al marcar la casilla "Acepto los términos y condiciones" y completar su registro, 
                usted declara haber leído, comprendido y aceptado todos los términos establecidos 
                en este documento, incluyendo el tratamiento de sus datos personales conforme a 
                la legislación peruana vigente.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
