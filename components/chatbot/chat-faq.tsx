"use client"

import { HelpCircle } from "lucide-react"
import { useState } from "react"

interface ChatFAQProps {
  question: string
  answer: string
}

/**
 * Componente para mostrar FAQ interactivo en el chat
 */
export default function ChatFAQ({ question, answer }: ChatFAQProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[#3e92cc] hover:text-[#0a2463] transition-colors text-sm"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="font-medium">{question}</span>
      </button>
      
      {isOpen && (
        <div className="mt-2 bg-blue-50 border-l-4 border-[#3e92cc] rounded-r-lg px-4 py-3 text-sm text-gray-700 animate-in slide-in-from-top-2">
          <div dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      )}
    </div>
  )
}
