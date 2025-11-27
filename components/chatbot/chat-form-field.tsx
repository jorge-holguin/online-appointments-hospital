"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChatFormFieldProps {
  id: string
  label: string
  type: "text" | "tel" | "email" | "select"
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  error?: string
}

/**
 * Componente de campo de formulario para usar en el chat
 */
export default function ChatFormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  options,
  error
}: ChatFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {type === "select" && options ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder={placeholder || "Seleccionar..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white"
        />
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
