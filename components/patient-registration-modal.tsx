"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Phone, CreditCard, Mail, ChevronDown, AlertCircle } from "lucide-react"
import SISVerificationModal from "./sis-verification-modal"
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha'
import { validatePatientData, getSecureErrorMessage, sanitizeInput, sanitizeName, normalizePhone, normalizeEmail } from "@/lib/validation"

interface PatientRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Using react-simple-captcha for visual captcha verification

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
  const [captchaInput, setCaptchaInput] = useState("")
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>("")
  // No necesitamos ref para react-simple-captcha
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
        
        // La API no devuelve campo 'activo', así que solo filtramos por nombre
        const filteredTypes = data.filter(type => type.nombre && type.nombre !== "*Ninguno");
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

  // Referencia para saber si el componente está montado
  const isMounted = useRef(false)

  // Cargar el captcha cuando se abre el modal y el componente está montado
  useEffect(() => {
    // Marcar el componente como montado
    isMounted.current = true
    
    // Función para cargar el captcha con un pequeño retraso
    const loadCaptcha = () => {
      if (open && isMounted.current) {
        // Pequeño timeout para asegurar que el DOM esté listo
        setTimeout(() => {
          try {
            loadCaptchaEnginge(6) // 6 caracteres
          } catch (error) {
            console.error('Error al cargar el captcha:', error)
          }
        }, 100)
      }
    }
    
    loadCaptcha()
    
    return () => {
      // Limpiar la referencia cuando el componente se desmonte
      isMounted.current = false
    }
  }, [open])

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
      try {
        if (!validateCaptcha(captchaInput)) {
          setGeneralError("Código de verificación incorrecto. Por favor, inténtalo de nuevo.")
          setCaptchaInput("") // Limpiar el input
          setTimeout(() => {
            loadCaptchaEnginge(6) // Regenerar captcha
          }, 100)
          setIsSubmitting(false)
          return
        }
        
        setCaptchaVerified(true)
      } catch (error) {
        console.error('Error al validar captcha:', error)
        setGeneralError("Error en la verificación de seguridad. Por favor, recarga la página.")
        setIsSubmitting(false)
        return
      }
      
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
        // Usar sanitizeName muy suave para preservar espacios naturales
        sanitizedValue = sanitizeName(value)
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
  
  // Ya no necesitamos handleCaptchaChange para react-simple-captcha

  return (
    <>
      <Dialog open={open && !showSISVerification} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">Registro de paciente</DialogTitle>
            <DialogDescription className="text-center">
              Ingresa tus datos personales para agendar una cita
            </DialogDescription>
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
                  handleInputChange("tipoDocumento", value)
                }}
              >
                <SelectTrigger className={`w-full ${validationErrors.tipoDocumento ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={loadingDocumentTypes ? "Cargando..." : "Selecciona el tipo de documento"} />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((docType) => {
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
            
            {/* Captcha Visual */}
            <div className="space-y-3">
              <Label htmlFor="captcha-input" className="text-sm font-medium text-gray-700">
                Verificación de seguridad
              </Label>
              <div className="flex flex-col items-center space-y-3">
                <div className="border rounded-lg p-3 bg-gray-50 relative">
                  {open && <LoadCanvasTemplate />}
                  <button 
                    type="button"
                    onClick={() => {
                      setCaptchaInput("") // Limpiar el input
                      setTimeout(() => loadCaptchaEnginge(6), 100) // Regenerar captcha
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                    aria-label="Refrescar captcha"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                  </button>
                </div>
                <div className="w-full">
                  <Input
                    id="captcha-input"
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Ingrese el código mostrado arriba"
                    className="text-center"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Ingrese los caracteres que ve en la imagen
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-white py-3 mt-6 hover:opacity-90"
              style={{ backgroundColor: "#0a2463" }}
              size="lg"
              disabled={isSubmitting || !captchaInput.trim()}
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
