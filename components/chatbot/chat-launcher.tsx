"use client"

import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface ChatLauncherProps {
  avatarUrl?: string
  text?: string
  position?: "left" | "right"
  className?: string
}

export default function ChatLauncher({
  avatarUrl = "/logo.png",
  text = "Pregúntale al Asistente Virtual",
  position = "left",
  className = ""
}: ChatLauncherProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleClick = () => {
    if (isMobile) {
      // En móvil, navegar a la ruta /chat (fullscreen)
      router.push("/chat")
    } else {
      // En desktop, abrir en nueva pestaña
      window.open("/chat", "_blank", "width=420,height=680,resizable=yes,scrollbars=yes")
    }
  }

  const positionClasses = position === "left" 
    ? "left-6 md:left-8" 
    : "right-6 md:right-8"

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 md:bottom-8 ${positionClasses} z-50 
        flex items-center gap-3 px-4 py-3 
        bg-gradient-to-r from-[#3e92cc] to-[#0a2463] 
        hover:from-[#0a2463] hover:to-[#3e92cc]
        text-white rounded-full shadow-2xl 
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-3xl
        active:scale-95
        group
        max-w-[90vw] md:max-w-none
        ${className}`}
      aria-label="Abrir chat de asistencia"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
          <img 
            src={avatarUrl} 
            alt="Avatar del asistente" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback si la imagen no carga
              const target = e.target as HTMLImageElement
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"
            }}
          />
        </div>
        
        {/* Indicador verde de "en línea" */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
      </div>

      {/* Texto */}
      <span className="font-semibold text-sm md:text-base pr-2 whitespace-nowrap truncate max-w-[180px] md:max-w-none">
        {text}
      </span>

      {/* Icono animado */}
      <div className="relative">
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Pulso animado */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
      </div>
    </button>
  )
}
