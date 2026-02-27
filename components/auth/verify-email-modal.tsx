"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface VerifyEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  onBack: () => void
  onSuccess: () => void
}

export default function VerifyEmailModal({ open, onOpenChange, email, onBack, onSuccess }: VerifyEmailModalProps) {
  const { verifyEmail } = useAuth()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (open && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [open])

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData) {
      const newCode = [...code]
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newCode[i] = pastedData[i]
      }
      setCode(newCode)
      if (pastedData.length >= 6) {
        inputRefs.current[5]?.focus()
      } else {
        inputRefs.current[pastedData.length]?.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")

    if (fullCode.length !== 6) {
      setError("Por favor, ingrese el código completo de 6 dígitos.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await verifyEmail(email, fullCode)
      setIsVerified(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código de verificación inválido.")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCode(["", "", "", "", "", ""])
      setError("")
      setIsVerified(false)
    }
    onOpenChange(isOpen)
  }

  if (isVerified) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" redirectToHome={false}>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Correo verificado!</h3>
            <p className="text-gray-600 text-center">
              Tu cuenta ha sido verificada exitosamente. Serás redirigido en unos segundos...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" redirectToHome={false}>
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
              <DialogTitle className="text-xl font-semibold">Verificar Correo</DialogTitle>
              <DialogDescription>
                Ingresa el código enviado a tu correo
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-[#3e92cc]" />
          </div>
          <p className="text-sm text-gray-600 text-center mb-2">
            Hemos enviado un código de verificación a:
          </p>
          <p className="font-medium text-gray-900 mb-6">{email}</p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-semibold"
                  disabled={isLoading}
                />
              ))}
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
              disabled={isLoading || code.join("").length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar Código"
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              ¿No recibiste el código? Revisa tu carpeta de spam o{" "}
              <button type="button" className="text-[#3e92cc] hover:underline">
                solicita uno nuevo
              </button>
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
