"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface ForgotPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  onResetPassword: (email: string) => void
}

export default function ForgotPasswordModal({ open, onOpenChange, onBack, onResetPassword }: ForgotPasswordModalProps) {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Por favor, ingrese su correo electrónico.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, ingrese un correo electrónico válido.")
      return
    }

    setIsLoading(true)
    try {
      await forgotPassword(email.trim())
      setIsSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    onResetPassword(email.trim())
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail("")
      setError("")
      setIsSent(false)
    }
    onOpenChange(isOpen)
  }

  if (isSent) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Correo enviado</h3>
            <p className="text-gray-600 text-center mb-6">
              Hemos enviado un código de recuperación a <span className="font-medium">{email}</span>. 
              Revisa tu bandeja de entrada.
            </p>
            <Button
              onClick={handleContinue}
              className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white py-3 font-semibold"
              size="lg"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" redirectToHome={false} overlayClassName="bg-black/20">
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
              <DialogTitle className="text-xl font-semibold">Recuperar Contraseña</DialogTitle>
              <DialogDescription>
                Te enviaremos un código para restablecer tu contraseña
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError("")
                }}
                placeholder="correo@ejemplo.com"
                className="pl-10"
                disabled={isLoading}
                required
              />
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
                Enviando...
              </>
            ) : (
              "Enviar Código"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
