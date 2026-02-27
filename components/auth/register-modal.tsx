"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Loader2, CreditCard, Calendar, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import type { RegisterRequest } from "@/types/auth"
import TermsModal from "./terms-modal"

interface ApiDocumentType {
  tipoDocumento?: string | null
  nombre?: string | null
  activo?: number | null
}

interface DocumentType {
  tipoDocumento: string
  nombre: string
}

interface RegisterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  onVerifyEmail: (email: string) => void
}

export default function RegisterModal({ open, onOpenChange, onBack, onVerifyEmail }: RegisterModalProps) {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    celular: "",
    fechaNacimiento: "",
    password: "",
    confirmPassword: "",
    tipoDocumento: "",
    nroDocumento: "",
    digitoVerificacion: "",
    fechaExpedicion: "",
    termsAccepted: false,
    isAdult: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const hasLoadedDocumentTypes = useRef(false)

  // Fetch document types
  useEffect(() => {
    if (!open || hasLoadedDocumentTypes.current) return
    
    let isMounted = true
    const controller = new AbortController()
    
    const fetchDocumentTypes = async () => {
      if (loadingDocumentTypes) return
      
      setLoadingDocumentTypes(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/tipo-documento`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          signal: controller.signal,
        })
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data: ApiDocumentType[] = await response.json()
        
        if (!isMounted) return
        
        const normalizedTypes: DocumentType[] = data
          .filter(type => type != null && type.nombre && type.tipoDocumento)
          .filter(type => type.nombre !== "*Ninguno")
          .map(type => ({
            tipoDocumento: type.tipoDocumento!.trim(),
            nombre: type.nombre!,
          }))
        
        if (isMounted) {
          setDocumentTypes(normalizedTypes.length > 0 ? normalizedTypes : [
            { tipoDocumento: "D", nombre: "DNI" },
            { tipoDocumento: "CE", nombre: "Carnet de Extranjería" },
            { tipoDocumento: "PP", nombre: "Pasaporte" },
          ])
          hasLoadedDocumentTypes.current = true
        }
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return
        console.error('Error fetching document types:', err)
        if (isMounted) {
          setDocumentTypes([
            { tipoDocumento: "D", nombre: "DNI" },
            { tipoDocumento: "CE", nombre: "Carnet de Extranjería" },
            { tipoDocumento: "PP", nombre: "Pasaporte" },
          ])
          hasLoadedDocumentTypes.current = true
        }
      } finally {
        if (isMounted) {
          setLoadingDocumentTypes(false)
        }
      }
    }
    
    fetchDocumentTypes()
    
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [open])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const validateForm = (): boolean => {
    if (!formData.nombres.trim()) {
      setError("Por favor, ingrese sus nombres.")
      return false
    }
    if (!formData.apellidos.trim()) {
      setError("Por favor, ingrese sus apellidos.")
      return false
    }
    if (!formData.email.trim()) {
      setError("Por favor, ingrese su correo electrónico.")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Por favor, ingrese un correo electrónico válido.")
      return false
    }
    if (!formData.celular.trim()) {
      setError("Por favor, ingrese su número de celular.")
      return false
    }
    if (!formData.fechaNacimiento) {
      setError("Por favor, ingrese su fecha de nacimiento.")
      return false
    }
    if (!formData.tipoDocumento) {
      setError("Por favor, seleccione el tipo de documento.")
      return false
    }
    if (!formData.nroDocumento.trim()) {
      setError("Por favor, ingrese su número de documento.")
      return false
    }
    if (formData.tipoDocumento === "D" && !formData.digitoVerificacion) {
      setError("Por favor, ingrese el dígito verificador.")
      return false
    }
    if (!formData.password) {
      setError("Por favor, ingrese una contraseña.")
      return false
    }
    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return false
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("La contraseña debe contener al menos una letra mayúscula.")
      return false
    }
    if (!/[a-z]/.test(formData.password)) {
      setError("La contraseña debe contener al menos una letra minúscula.")
      return false
    }
    if (!/[0-9]/.test(formData.password)) {
      setError("La contraseña debe contener al menos un número.")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return false
    }
    if (!formData.isAdult) {
      setError("Debe confirmar que es mayor de 18 años.")
      return false
    }
    if (!formData.termsAccepted) {
      setError("Debe aceptar los términos y condiciones.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const registerData: RegisterRequest = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim().toLowerCase(),
        celular: formData.celular.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        password: formData.password,
        termsAccepted: formData.termsAccepted,
        tipoDocumento: formData.tipoDocumento,
        nroDocumento: formData.nroDocumento.trim(),
        digitoVerificacion: formData.tipoDocumento === "D" ? formData.digitoVerificacion : undefined,
        fechaExpedicion: formData.tipoDocumento === "D" ? formData.fechaExpedicion : undefined,
      }

      await register(registerData)
      onVerifyEmail(formData.email.trim().toLowerCase())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setFormData({
        nombres: "",
        apellidos: "",
        email: "",
        celular: "",
        fechaNacimiento: "",
        password: "",
        confirmPassword: "",
        tipoDocumento: "",
        nroDocumento: "",
        digitoVerificacion: "",
        fechaExpedicion: "",
        termsAccepted: false,
        isAdult: false,
      })
      setError("")
      setShowTerms(false)
      setIsLoading(false)
    }
    onOpenChange(isOpen)
  }, [onOpenChange])

  const isDNI = formData.tipoDocumento === "D" || formData.tipoDocumento === "D  "

  return (
    <>
      <Dialog open={open && !showTerms} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" redirectToHome={false}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold">Crear Cuenta</DialogTitle>
                <DialogDescription>
                  Complete sus datos para registrarse
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombres */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-nombres">Nombres *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="reg-nombres"
                    value={formData.nombres}
                    onChange={(e) => handleInputChange("nombres", e.target.value)}
                    placeholder="Nombres"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-apellidos">Apellidos *</Label>
                <Input
                  id="reg-apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange("apellidos", e.target.value)}
                  placeholder="Apellidos"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="reg-email">Correo electrónico *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Celular */}
            <div className="space-y-2">
              <Label htmlFor="reg-celular">Celular *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-celular"
                  type="tel"
                  value={formData.celular}
                  onChange={(e) => handleInputChange("celular", e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="999999999"
                  className="pl-10"
                  maxLength={9}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="reg-fechaNacimiento">Fecha de Nacimiento *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Tipo de Documento */}
            <div className="space-y-2">
              <Label htmlFor="reg-tipoDocumento">Tipo de Documento *</Label>
              <Select
                value={formData.tipoDocumento}
                onValueChange={(value) => handleInputChange("tipoDocumento", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingDocumentTypes ? "Cargando..." : "Seleccione tipo"} />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((docType) => (
                    <SelectItem key={docType.tipoDocumento} value={docType.tipoDocumento}>
                      {docType.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Número de Documento */}
            <div className="space-y-2">
              <Label htmlFor="reg-nroDocumento">Número de Documento *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-nroDocumento"
                  value={formData.nroDocumento}
                  onChange={(e) => handleInputChange("nroDocumento", e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="Número de documento"
                  className="pl-10"
                  maxLength={12}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campos solo para DNI */}
            {isDNI && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-digitoVerificacion">Dígito Verificador *</Label>
                    <Input
                      id="reg-digitoVerificacion"
                      value={formData.digitoVerificacion}
                      onChange={(e) => handleInputChange("digitoVerificacion", e.target.value.replace(/\D/g, '').slice(0, 1))}
                      placeholder="0"
                      maxLength={1}
                      disabled={isLoading}
                      inputMode="numeric"
                      pattern="[0-9]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-fechaExpedicion">Fecha de Expedición</Label>
                    <Input
                      id="reg-fechaExpedicion"
                      type="date"
                      value={formData.fechaExpedicion}
                      onChange={(e) => handleInputChange("fechaExpedicion", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="reg-password">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength indicators */}
              {formData.password && (
                <div className="space-y-1 text-xs">
                  <p className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                    • Mínimo 8 caracteres {formData.password.length >= 8 && '✓'}
                  </p>
                  <p className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    • Al menos una mayúscula {/[A-Z]/.test(formData.password) && '✓'}
                  </p>
                  <p className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    • Al menos una minúscula {/[a-z]/.test(formData.password) && '✓'}
                  </p>
                  <p className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    • Al menos un número {/[0-9]/.test(formData.password) && '✓'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="reg-confirmPassword">Confirmar Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="reg-confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Repita su contraseña"
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Age Confirmation */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="reg-adult"
                checked={formData.isAdult}
                onCheckedChange={(checked) => handleInputChange("isAdult", !!checked)}
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="reg-adult"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Confirmo que soy mayor de 18 años
                </label>
                <p className="text-xs text-gray-500">
                  Debes ser mayor de edad para registrarte en el sistema
                </p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="reg-terms"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => handleInputChange("termsAccepted", !!checked)}
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="reg-terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-[#3e92cc] hover:underline"
                  >
                    términos y condiciones
                  </button>
                </label>
                <p className="text-xs text-gray-500">
                  Al registrarte, aceptas el tratamiento de tus datos personales
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white py-3 font-semibold"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
    </>
  )
}
