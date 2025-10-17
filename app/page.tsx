"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Search, Phone } from "lucide-react"
import PatientRegistrationModal from "@/components/patient-registration-modal"
import AppointmentLookupModal from "@/components/appointment-lookup-modal"

export default function HomePage() {
  const [showRegistration, setShowRegistration] = useState(false)
  const [showLookup, setShowLookup] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23${encodeURIComponent("0a2463")}' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <img src="/hospital-logo.png" alt="Hospital José Agurto Tello" className="h-12 w-auto" />
            <div className="text-center">
              <h1 className="text-2xl font-bold" style={{ color: "#0a2463" }}>
                Hospital José Agurto Tello
              </h1>
              <p className="text-sm" style={{ color: "#3e92cc" }}>
                Chosica
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-balance">
            Solicita tu cita de manera rápida y sencilla
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Solicita una cita y el personal del Hospital de Chosica te la otorgará de manera rápida para tu atención presencial en el Hospital.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Schedule Appointment Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow h-full flex flex-col">
            <div className="text-center flex-1 flex flex-col justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#3e92cc20" }}
              >
                <Calendar className="w-8 h-8" style={{ color: "#3e92cc" }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitud de reserva de cita</h3>
              <p className="text-gray-600 mb-6 flex-1">Solicita una cita con un especialista</p>
              <Button
                onClick={() => setShowRegistration(true)}
                className="w-full text-white py-3 text-lg font-medium hover:opacity-90 mt-auto"
                style={{ backgroundColor: "#3e92cc" }}
                size="lg"
              >
                Solicitar cita
              </Button>
            </div>
          </div>

          {/* Lookup Appointment Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow h-full flex flex-col">
            <div className="text-center flex-1 flex flex-col justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#0a246320" }}
              >
                <Search className="w-8 h-8" style={{ color: "#0a2463" }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Consultar solicitud de cita</h3>
              <p className="text-gray-600 mb-6 flex-1">Revisa el estado de tu solicitud de la reserva de cita</p>
              <Button
                onClick={() => setShowLookup(true)}
                className="w-full text-white py-3 text-lg font-medium hover:opacity-90 mt-auto"
                style={{ backgroundColor: "#0a2463" }}
                size="lg"
              >
                Consultar solicitud de cita
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-12 p-6 bg-white/50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>¿Necesitas ayuda? Llámanos al (01) 418-3232</span>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="text-sm">
              <h4 className="font-semibold mb-2" style={{ color: "#0a2463" }}>
                Realice su solicitud de reserva de cita  - opción 1
              </h4>
              <p className="font-medium text-lg" style={{ color: "#3e92cc" }}>
                01 418 3232
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <p className="text-xs text-gray-500">
                Desarrollado por la Unidad de Estadística e Informática / Desarrollo de Software
              </p>
              <p className="text-xs text-gray-500">
                © Todos los derechos reservados, {process.env.NEXT_PUBLIC_HOSPITAL_NAME || "Hospital José Agurto Tello de Chosica"}.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PatientRegistrationModal open={showRegistration} onOpenChange={setShowRegistration} />
      <AppointmentLookupModal open={showLookup} onOpenChange={setShowLookup} />
    </div>
  )
}
