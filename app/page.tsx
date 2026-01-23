"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Search, Phone, CalendarDays, X, Play } from "lucide-react"
import PatientRegistrationModal from "@/components/patient-registration-modal"
import AppointmentLookupModal from "@/components/appointment-lookup-modal"
import VideoTutorialModal from "@/components/video-tutorial-modal"
import ChatLauncher from "@/components/chatbot/chat-launcher"
import SnowParticles from "@/components/snow-particles"
import { CHRISTMAS_MODE } from "@/hooks/use-app-config"

export default function HomePage() {
  const [showRegistration, setShowRegistration] = useState(false)
  const [showLookup, setShowLookup] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [isWolfHappy, setIsWolfHappy] = useState(false)

  // Calculate next month dynamically
  const getNextMonth = () => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    const currentMonth = new Date().getMonth()
    const nextMonthIndex = (currentMonth + 1) % 12
    return months[nextMonthIndex]
  }
  
  const nextMonth = getNextMonth()

  useEffect(() => {
    // Animación continua del lobo normal (cuando se muestra el modo no navideño)
    const interval = setInterval(() => {
      setIsWolfHappy(prev => !prev)
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  // Colores navideños
  const christmasColors = {
    bgGradient: "from-emerald-800 via-green-700 to-emerald-900",
    headerBg: "bg-red-700",
    headerText: "text-white",
    headerSubtext: "text-red-100",
    titleText: "text-white",
    subtitleText: "text-emerald-100",
    cardBorder: "border-red-200",
    footerBg: "bg-red-800",
    footerText: "text-white",
    footerSubtext: "text-red-200",
    contactBg: "bg-white/20",
    contactText: "text-white",
  }

  // Colores normales
  const normalColors = {
    bgGradient: "from-blue-50 to-slate-50",
    headerBg: "bg-white",
    headerText: "text-[#0a2463]",
    headerSubtext: "text-[#3e92cc]",
    titleText: "text-gray-900",
    subtitleText: "text-gray-600",
    cardBorder: "border-gray-100",
    footerBg: "bg-white",
    footerText: "text-[#0a2463]",
    footerSubtext: "text-gray-500",
    contactBg: "bg-white/50",
    contactText: "text-gray-600",
  }

  const colors = CHRISTMAS_MODE ? christmasColors : normalColors

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bgGradient} relative overflow-hidden`}>
      {/* Partículas de nieve navideñas - solo en modo navideño */}
      {CHRISTMAS_MODE && <SnowParticles />}
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: CHRISTMAS_MODE 
              ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.3'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23${encodeURIComponent("0a2463")}' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <header className={`${colors.headerBg} shadow-sm border-b relative z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <img src="/hospital-logo.png" alt="Hospital José Agurto Tello" className="h-12 w-auto" />
            <div className="text-center">
              <h1 className={`text-2xl font-bold ${colors.headerText}`}>
                Hospital José Agurto Tello
              </h1>
              <p className={`text-sm ${colors.headerSubtext}`}>
                Chosica
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${colors.titleText} mb-4 text-balance`}>
            {CHRISTMAS_MODE ? "¡Felices Fiestas! " : ""}Solicita tu cita de manera rápida y sencilla
          </h2>
          <p className={`text-lg ${colors.subtitleText} max-w-2xl mx-auto text-pretty`}>
            Solicita una cita y el personal del Hospital de Chosica te la otorgará de manera rápida para tu atención presencial en el Hospital.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Schedule Appointment Card */}
          <div className={`bg-white rounded-xl shadow-lg border ${colors.cardBorder} p-8 hover:shadow-xl transition-shadow h-full flex flex-col`}>
            <div className="text-center flex-1 flex flex-col justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: CHRISTMAS_MODE ? "#dc262620" : "#3e92cc20" }}
              >
                <Calendar className="w-8 h-8" style={{ color: CHRISTMAS_MODE ? "#dc2626" : "#3e92cc" }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitud de cita</h3>
              <p className="text-gray-600 mb-6 flex-1">Crea una solicitud de cita con nuestros especialistas</p>
              <Button
                onClick={() => setShowRegistration(true)}
                className="w-full text-white py-3 text-lg font-medium hover:opacity-90 mt-auto"
                style={{ backgroundColor: CHRISTMAS_MODE ? "#dc2626" : "#3e92cc" }}
                size="lg"
              >
                Generar solicitud
              </Button>
            </div>
          </div>

          {/* Lookup Appointment Card */}
          <div className={`bg-white rounded-xl shadow-lg border ${colors.cardBorder} p-8 hover:shadow-xl transition-shadow h-full flex flex-col`}>
            <div className="text-center flex-1 flex flex-col justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: CHRISTMAS_MODE ? "#15803d20" : "#0a246320" }}
              >
                <Search className="w-8 h-8" style={{ color: CHRISTMAS_MODE ? "#15803d" : "#0a2463" }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Consultar solicitud de cita</h3>
              <p className="text-gray-600 mb-6 flex-1">Revisa el estado de tu solicitud de cita</p>
              <Button
                onClick={() => setShowLookup(true)}
                className="w-full text-white py-3 text-lg font-medium hover:opacity-90 mt-auto"
                style={{ backgroundColor: CHRISTMAS_MODE ? "#15803d" : "#0a2463" }}
                size="lg"
              >
                Consultar solicitud 
              </Button>
            </div>
          </div>
        </div>

        {/* Schedule Button */}
        <div className="text-center mt-8 max-w-2xl mx-auto">
          <Button
            onClick={() => setShowSchedule(true)}
            variant="outline"
            className="text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 px-6 py-2"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Ver programación de citas para {nextMonth}
          </Button>
        </div>

        {/* Tutorial Section */}
        <div className="text-center mt-8 max-w-2xl mx-auto">
          <Button
            onClick={() => setShowTutorial(true)}
            variant="outline"
            className="text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 px-6 py-2"
          >
            <Play className="w-4 h-4 mr-2" />
            Ver tutorial del sistema
          </Button>
        </div>

        {/* Contact Info */}
        <div className={`text-center mt-12 p-6 ${colors.contactBg} rounded-lg`}>
          <div className={`flex items-center justify-center gap-2 ${colors.contactText}`}>
            <Phone className="w-4 h-4" />
            <span>¿Necesitas ayuda? Llámanos al (01) 418-3232</span>
          </div>
        </div>
      </main>

      <footer className={`${colors.footerBg} border-t mt-auto relative z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="text-sm">
              <h4 className={`font-semibold mb-2 ${colors.footerText}`}>
                Realice su solicitud de cita  - opción 1
              </h4>
              <p className={`font-medium text-lg ${CHRISTMAS_MODE ? "text-red-100" : "text-[#3e92cc]"}`}>
                01 418 3232
              </p>
            </div>
            <div className={`pt-4 border-t ${CHRISTMAS_MODE ? "border-red-600" : "border-gray-200"} space-y-2`}>
              <p className={`text-xs ${colors.footerSubtext}`}>
                Desarrollado por la Unidad de Estadística e Informática / Desarrollo de Software
              </p>
              <p className={`text-xs ${colors.footerSubtext}`}>
                © Todos los derechos reservados, {process.env.NEXT_PUBLIC_HOSPITAL_NAME || "Hospital José Agurto Tello de Chosica"}.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PatientRegistrationModal open={showRegistration} onOpenChange={setShowRegistration} />
      <AppointmentLookupModal open={showLookup} onOpenChange={setShowLookup} />
      <VideoTutorialModal open={showTutorial} onOpenChange={setShowTutorial} />

      {/* Banner animado del lobo para llamar la atención hacia el chat - SOLO en desktop */}
      <div className="hidden md:block fixed bottom-28 right-8 z-40 pointer-events-none transform -translate-x-1/2">
        <div className="relative w-52 h-52 flex items-center justify-center">
          {CHRISTMAS_MODE ? (
            /* Lobo navideño GIF en círculo blanco */
            <div className="bg-white rounded-full p-3 shadow-xl flex items-center justify-center overflow-hidden">
              <img
                src="/lobo/lobo_chrismast.gif"
                alt="Asistente virtual navideño"
                className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto"
              />
            </div>
          ) : (
            /* Animación normal de 2 lobos */
            <>
              <img
                src="/lobo-completo1.png"
                alt="Asistente virtual"
                className={`absolute inset-0 w-full h-full object-contain drop-shadow-xl transition-opacity duration-700 ease-in-out ${isWolfHappy ? "opacity-0" : "opacity-100"}`}
              />
              <img
                src="/lobo-completo2.png"
                alt="Asistente virtual sonriente"
                className={`absolute inset-0 w-full h-full object-contain drop-shadow-xl transition-opacity duration-700 ease-in-out ${isWolfHappy ? "opacity-100" : "opacity-0"}`}
              />
            </>
          )}
        </div>
      </div>

      {/* Chatbot Launcher */}
      <ChatLauncher 
        avatarUrl="/lobo.png"
        className="bg-white"
        text="Pregúntale al Asistente Virtual"
        position="right"
      />

      {/* Schedule Viewer */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold" style={{ color: "#0a2463" }}>
                Programación de Citas - {nextMonth}
              </h2>
              <Button
                onClick={() => setShowSchedule(false)}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="p-6">
              <img
                src="/programacion.jpg"
                alt="Programación de Citas para Noviembre"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => setShowSchedule(false)}
                  className="text-white px-8 py-3 text-lg font-medium hover:opacity-90"
                  style={{ backgroundColor: "#0a2463" }}
                  size="lg"
                >
                  Volver a la página principal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
