"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ChatFAQ from "./chat-faq"
import DateTimeCalendarSelector from "./date-time-calendar-selector"
import { HelpCircle, Stethoscope, UserCircle, Calendar as CalendarIcon } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: string
  data?: any
}

interface MessageRendererProps {
  message: Message
  onUserAction: (action: string, value: any) => void
}

// Renderizar opciones con botones
export function OptionsRenderer({ message, onUserAction }: MessageRendererProps) {
  const { options, action, faqs } = message.data || {}
  
  return (
    <div className="space-y-3">
      {faqs && faqs.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 space-y-2 mb-3">
          <p className="text-xs font-semibold text-blue-800 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            Preguntas frecuentes
          </p>
          {faqs.map((faq: any, index: number) => (
            <ChatFAQ key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        {options?.map((option: any) => (
          <button
            key={option.id}
            onClick={() => onUserAction(action, option.value)}
            className="bg-white hover:bg-[#3e92cc] hover:text-white border-2 border-[#3e92cc] text-[#3e92cc] rounded-lg px-4 py-3 text-left transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            <div className="font-semibold text-sm">
              {option.label}
            </div>
            {option.description && (
              <div className="text-xs mt-1 opacity-70 group-hover:opacity-100">
                {option.description}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Renderizar formulario
export function FormRenderer({ message, onUserAction }: MessageRendererProps) {
  const { fields } = message.data || {}
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos requeridos
    const newErrors: Record<string, string> = {}
    fields?.forEach((field: any) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} es obligatorio`
      }
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onUserAction('form-submit', formData)
  }
  
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-3 shadow-sm space-y-2 w-full max-w-full"
    >
      {fields?.map((field: any) => (
        <div key={field.id} className="space-y-0.5">
          <Label htmlFor={field.id} className="text-xs font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Label>
          
          {field.type === 'select' ? (
            <Select
              value={formData[field.id] || ''}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, [field.id]: value }))
                setErrors(prev => ({ ...prev, [field.id]: '' }))
              }}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt: any) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.id}
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, [field.id]: e.target.value }))
                setErrors(prev => ({ ...prev, [field.id]: '' }))
              }}
              placeholder={field.placeholder}
              className="w-full h-8 text-sm"
            />
          )}
          
          {errors[field.id] && (
            <p className="text-xs text-red-600">{errors[field.id]}</p>
          )}
        </div>
      ))}
      
      <Button type="submit" className="w-full h-9 bg-[#3e92cc] hover:bg-[#0a2463] text-white text-sm mt-2">
        Continuar
      </Button>
    </form>
  )
}

// Renderizar lista de especialidades
export function SpecialtyListRenderer({ message, onUserAction }: MessageRendererProps) {
  const { specialties, action } = message.data || {}
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredSpecialties = specialties?.filter((spec: any) =>
    spec.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="space-y-3">
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar especialidad..."
        className="w-full"
      />
      
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredSpecialties?.map((specialty: any) => (
          <button
            key={specialty.id}
            onClick={() => onUserAction(action, specialty)}
            className="w-full bg-white hover:bg-[#3e92cc] hover:text-white border border-[#3e92cc] text-[#3e92cc] rounded-lg px-4 py-3 text-left transition-all duration-200 shadow-sm hover:shadow-md group flex items-center gap-3"
          >
            <Stethoscope className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{specialty.nombre}</p>
              <p className="text-xs opacity-70">Código: {specialty.id}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Renderizar lista de médicos
export function DoctorListRenderer({ message, onUserAction }: MessageRendererProps) {
  const { doctors, action } = message.data || {}
  
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {doctors?.map((doctor: any) => (
        <button
          key={doctor.id}
          onClick={() => onUserAction(action, doctor)}
          className="w-full bg-white hover:bg-[#3e92cc] hover:text-white border border-[#3e92cc] text-[#3e92cc] rounded-lg px-4 py-3 text-left transition-all duration-200 shadow-sm hover:shadow-md group flex items-center gap-3"
        >
          <UserCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{doctor.medicoId}</p>
            <p className="text-xs opacity-70">Código: {doctor.nombre}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

// Renderizar selector de fecha/hora
export function DateTimeSelectorRenderer({ message, onUserAction }: MessageRendererProps) {
  const { searchMethod, specialty, doctor, shift, action, slots } = message.data || {}
  
  // Si solo tenemos slots (lista de horas), mostrar lista simple
  if (slots && slots.length > 0 && !searchMethod) {
    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {slots.map((slot: any, index: number) => (
          <button
            key={index}
            onClick={() => onUserAction(action, slot)}
            className="w-full bg-white hover:bg-[#3e92cc] hover:text-white border border-[#3e92cc] text-[#3e92cc] rounded-lg px-4 py-3 text-left transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{slot.time}</p>
                <p className="text-xs opacity-70">Consultorio: {slot.consultorio}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    )
  }
  
  // Si tenemos searchMethod, mostrar calendario completo
  return (
    <DateTimeCalendarSelector
      searchMethod={searchMethod}
      specialty={specialty}
      doctor={doctor}
      shift={shift}
      onDateTimeSelect={(slot) => onUserAction(action, slot)}
    />
  )
}

// Renderizar resumen
export function SummaryRenderer({ message }: MessageRendererProps) {
  const { summary } = message.data || {}
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-[#3e92cc]">
      <p className="text-sm whitespace-pre-wrap">{summary}</p>
    </div>
  )
}
