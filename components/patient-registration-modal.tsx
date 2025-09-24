"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Phone, CreditCard, Mail, ChevronDown, AlertCircle } from "lucide-react"
import SISVerificationModal from "./sis-verification-modal"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { env } from "@/lib/env"
import { validatePatientData, getSecureErrorMessage, sanitizeInput, normalizePhone, normalizeEmail } from "@/lib/validation"

interface PatientRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Using HCaptcha site key from environment variables (manteniendo el nombre RECAPTCHA_SITE_KEY)

interface DocumentType {
  tipoDocumento: string
  nombre: string
  activo?: number
  tipoLabo?: number
  tipoRef?: number
  tipoSis?: string
  tipoCdc?: string | null
}

export default function PatientRegistrationModal({ open, onOpenChange }: PatientRegistrationModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    tipoDocumento: "",
    documento: "",
    digitoVerificador: "",
    email: "",
  })
  const [showSISVerification, setShowSISVerification] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>("")
  const captchaRef = useRef<HCaptcha>(null)
  const hasLoadedDocumentTypes = useRef(false)

  // Fetch document types from API
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      // Evitar llamadas múltiples usando ref
      if (!open || hasLoadedDocumentTypes.current || loadingDocumentTypes) return;
      
      setLoadingDocumentTypes(true);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/tipo-documento`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: DocumentType[] = await response.json();
        console.log('Document types from API:', data);
        
        // La API no devuelve campo 'activo', así que solo filtramos por nombre
        const filteredTypes = data.filter(type => type.nombre && type.nombre !== "*Ninguno");
        console.log('Filtered document types:', filteredTypes);
        setDocumentTypes(filteredTypes);
        hasLoadedDocumentTypes.current = true;
        
      } catch (error) {
        console.error('Error fetching document types from API:', error);
        // Fallback con tipos básicos si falla la API
        setDocumentTypes([
          { tipoDocumento: "D  ", nombre: "DNI", activo: 1, tipoLabo: 1, tipoRef: 1, tipoSis: "1", tipoCdc: "1" },
          { tipoDocumento: "CE ", nombre: "Carnet de Extranjeria", activo: 1, tipoLabo: 3, tipoRef: 2, tipoSis: "3", tipoCdc: "2" },
          { tipoDocumento: "PP ", nombre: "Pasaporte", activo: 1, tipoLabo: 9, tipoRef: 3, tipoSis: "10", tipoCdc: "3" }
        ]);
        hasLoadedDocumentTypes.current = true;
      } finally {
        setLoadingDocumentTypes(false);
      }
    };
    
    fetchDocumentTypes();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevenir doble submit
    if (isSubmitting) return
    
    // Limpiar errores previos
    setValidationErrors({})
    setGeneralError("")
    
    try {
      setIsSubmitting(true)
      
      // Verificar CAPTCHA primero
      if (!captchaVerified) {
        setGeneralError("Por favor, verifica que no eres un robot")
        return
      }
      
      // Depurar datos del formulario antes de validar
      console.log('Datos del formulario antes de validar:', formData)
      console.log('Tipo de documento en submit:', formData.tipoDocumento, 'longitud:', formData.tipoDocumento.length)
      
      // Validar y sanitizar datos con Zod
      const validation = validatePatientData(formData)
      
      if (!validation.success) {
        console.log('Errores de validación:', validation.errors)
        setValidationErrors(validation.errors || {})
        return
      }
      
      // Si la validación es exitosa, continuar con el siguiente paso
      setShowSISVerification(true)
      
    } catch (error) {
      console.error('Error en validación:', error)
      setGeneralError(getSecureErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Limpiar error específico del campo cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Sanitizar input según el tipo de campo
    let sanitizedValue = value
    
    switch (field) {
      case 'fullName':
        sanitizedValue = sanitizeInput(value)
        break
      case 'phone':
        sanitizedValue = normalizePhone(value)
        break
      case 'email':
        sanitizedValue = normalizeEmail(value)
        break
      case 'documento':
        // Solo permitir números para DNI
        sanitizedValue = value.replace(/\D/g, '').slice(0, 8)
        break
      case 'tipoDocumento':
        // No sanitizar el tipo de documento para preservar espacios
        sanitizedValue = value
        console.log('Tipo de documento seleccionado:', value, 'longitud:', value.length)
        break
      default:
        sanitizedValue = sanitizeInput(value)
    }
    
    setFormData({
      ...formData,
      [field]: sanitizedValue,
    })
  }
  
  const handleCaptchaChange = (token: string) => {
    setCaptchaVerified(!!token)
  }

  return (
    <>
      <Dialog open={open && !showSISVerification} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">Registro de paciente</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Apellidos y Nombres *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className={`pl-10 ${validationErrors.fullName ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {validationErrors.fullName && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.fullName}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Ingresa tu número de teléfono"
                  className={`pl-10 ${validationErrors.phone ? 'border-red-500' : ''}`}
                  maxLength={15}
                  required
                />
              </div>
              {validationErrors.phone && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
              <Select 
                value={formData.tipoDocumento} 
                onValueChange={(value) => {
                  console.log('Select onValueChange:', value, 'longitud:', value.length)
                  handleInputChange("tipoDocumento", value)
                }}
              >
                <SelectTrigger className={`w-full ${validationErrors.tipoDocumento ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={loadingDocumentTypes ? "Cargando..." : "Selecciona el tipo de documento"} />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((docType) => {
                    console.log('Renderizando tipo documento:', docType.tipoDocumento, 'longitud:', docType.tipoDocumento.length)
                    return (
                      <SelectItem key={docType.tipoDocumento} value={docType.tipoDocumento}>
                        {docType.nombre}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {validationErrors.tipoDocumento && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.tipoDocumento}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Número de Documento *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => handleInputChange("documento", e.target.value)}
                  placeholder="Ingresa tu número de documento"
                  className={`pl-10 ${validationErrors.documento ? 'border-red-500' : ''}`}
                  maxLength={15}
                  required
                />
              </div>
              {validationErrors.documento && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.documento}</span>
                </div>
              )}
            </div>

            {/* Dígito Verificador - Solo se muestra si es DNI */}
            {formData.tipoDocumento === "D  " && (
              <div className="space-y-2">
                <Label htmlFor="digitoVerificador">Dígito Verificador</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="digitoVerificador"
                    value={formData.digitoVerificador}
                    onChange={(e) => handleInputChange("digitoVerificador", e.target.value)}
                    placeholder="Ingresa el dígito verificador"
                    className="pl-10"
                    maxLength={1}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Este campo es opcional y solo para fines visuales
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {validationErrors.email && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.email}</span>
                </div>
              )}
            </div>
            
            {/* Mensaje de error general */}
            {generalError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{generalError}</span>
              </div>
            )}
            
            <div className="flex justify-center my-4">
              <HCaptcha
                ref={captchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                onVerify={handleCaptchaChange}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white py-3 mt-6 hover:opacity-90"
              style={{ backgroundColor: "#0a2463" }}
              size="lg"
              disabled={!captchaVerified || isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Siguiente paso"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <SISVerificationModal
        open={showSISVerification}
        onOpenChange={setShowSISVerification}
        onBack={() => setShowSISVerification(false)}
        patientData={formData}
      />
    </>
  )
}
