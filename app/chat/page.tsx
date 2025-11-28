"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Paperclip, MoreVertical, Phone, Video, Smile } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import ChatbotController from "@/components/chatbot/chatbot-controller"
import ChatbotSessionTimer from "@/components/chatbot/chatbot-session-timer"
import {
  OptionsRenderer,
  FormRenderer,
  SpecialtyListRenderer,
  DoctorListRenderer,
  DateTimeSelectorRenderer,
  SummaryRenderer
} from "@/components/chatbot/message-renderers"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "options" | "form" | "specialty-list" | "doctor-list" | "datetime-selector" | "summary"
  data?: any
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy tu asistente virtual del Hospital José Agurto Tello. Estoy aquí para ayudarte a reservar una cita.",
      sender: "bot",
      timestamp: new Date(),
      type: "text"
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showSessionTimer, setShowSessionTimer] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Función para enviar mensaje
  const handleSendMessage = async (message: string, action?: string, value?: any) => {
    if (!message.trim() && !action) return

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      sender: "user",
      timestamp: new Date(),
      type: "text",
      data: action ? { action, value } : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
  }
  
  // Manejar acciones de botones/formularios
  const handleUserAction = (action: string, value: any) => {
    // Crear mensaje del usuario con la acción
    let displayText = ''
    
    if (action === 'form-submit') {
      displayText = `Datos enviados: ${value.fullName || 'Formulario completado'}`
      // Iniciar el contador de sesión cuando se envíe el formulario
      setShowSessionTimer(true)
    } else if (typeof value === 'object' && value.nombre) {
      displayText = value.nombre
    } else if (typeof value === 'string') {
      displayText = value
    } else {
      displayText = 'Selección realizada'
    }
    
    handleSendMessage(displayText, action, value)
  }
  
  // Manejar expiración de sesión
  const handleSessionExpire = () => {
    // Cerrar el chatbot
    if (window.opener) {
      // Si se abrió como popup, cerrar
      window.close()
    } else {
      // Si es navegación normal, volver
      router.push('/')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputMessage)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-PE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  return (
    <div className="flex flex-col h-screen bg-[#efeae2]">
      {/* Header tipo WhatsApp */}
      <header className="bg-[#0a2463] text-white px-4 py-3 shadow-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-1">
          {/* Botón de volver */}
          <button
            onClick={() => {
              if (window.opener) {
                // Si se abrió como popup, cerrar
                window.close()
              } else {
                // Si es navegación normal, volver
                router.back()
              }
            }}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Avatar y nombre */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                <img 
                  src="/lobo.jpg" 
                  alt="Asistente Virtual" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"
                  }}
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a2463]"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-base truncate">Asistente Virtual</h1>
              <p className="text-xs text-white/80 truncate">En línea</p>
            </div>
          </div>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center gap-2">
          <button 
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
            aria-label="Llamar"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button 
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
            aria-label="Videollamada"
          >
            <Video className="w-5 h-5" />
          </button>
          <button 
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
            aria-label="Más opciones"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Contador de sesión */}
      {showSessionTimer && (
        <ChatbotSessionTimer 
          onExpire={handleSessionExpire}
          onClose={() => {
            if (window.opener) {
              window.close()
            } else {
              router.push('/')
            }
          }}
        />
      )}

      {/* Área de mensajes */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23${encodeURIComponent("d9d9d9")}' fillOpacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "bot" ? (
              <div className="max-w-[85%] md:max-w-[70%] space-y-2">
                {/* Mensaje de texto */}
                {message.content && (
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                    {(() => {
                      // Reemplazar enlaces en formato Markdown [texto](url) por enlaces HTML
                      const contentWithLinks = message.content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1<\/a>')
                      return (
                        <p
                          className="text-sm md:text-base whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{ __html: contentWithLinks }}
                        />
                      )
                    })()}
                    <span className="text-xs text-gray-500 mt-1 block text-right">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}
                
                {/* Componentes interactivos */}
                {message.type === "options" && (
                  <OptionsRenderer message={message} onUserAction={handleUserAction} />
                )}
                {message.type === "form" && (
                  <FormRenderer message={message} onUserAction={handleUserAction} />
                )}
                {message.type === "specialty-list" && (
                  <SpecialtyListRenderer message={message} onUserAction={handleUserAction} />
                )}
                {message.type === "doctor-list" && (
                  <DoctorListRenderer message={message} onUserAction={handleUserAction} />
                )}
                {message.type === "datetime-selector" && (
                  <DateTimeSelectorRenderer message={message} onUserAction={handleUserAction} />
                )}
                {message.type === "summary" && (
                  <SummaryRenderer message={message} onUserAction={handleUserAction} />
                )}
              </div>
            ) : (
              <div className="bg-[#dcf8c6] rounded-lg px-4 py-2 shadow-sm max-w-[75%] md:max-w-[60%]">
                <p className="text-sm md:text-base whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <span className="text-xs text-gray-500 mt-1 block text-right">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Indicador de "escribiendo..." */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="bg-[#f0f0f0] px-4 py-3 border-t border-gray-200 sticky bottom-0">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          {/* Botón de adjuntar */}
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            aria-label="Adjuntar archivo"
          >
            <Paperclip className="w-6 h-6 text-gray-600" />
          </button>

          {/* Input de texto */}
          <div className="flex-1 bg-white rounded-full shadow-sm flex items-center px-4 py-2">
            <Input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-sm md:text-base"
            />
            <button
              className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Emojis"
            >
              <Smile className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Botón de enviar */}
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim()}
            className="p-3 bg-[#3e92cc] hover:bg-[#0a2463] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors flex-shrink-0 shadow-md"
            aria-label="Enviar mensaje"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Controlador del chatbot (lógica) */}
      <ChatbotController 
        messages={messages}
        setMessages={setMessages}
        setIsTyping={setIsTyping}
      />
    </div>
  )
}
