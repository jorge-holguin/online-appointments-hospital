"use client"

import { useState, useCallback } from "react"
import type { AuthStep } from "@/types/auth"
import LoginModal from "./login-modal"
import RegisterModal from "./register-modal"
import VerifyEmailModal from "./verify-email-modal"
import ForgotPasswordModal from "./forgot-password-modal"
import ResetPasswordModal from "./reset-password-modal"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialStep?: AuthStep
}

export default function AuthModal({ open, onOpenChange, initialStep = 'login' }: AuthModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep)
  const [email, setEmail] = useState("")

  const handleClose = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setCurrentStep('login')
      setEmail("")
    }
    onOpenChange(isOpen)
  }, [onOpenChange])

  const goToLogin = useCallback(() => {
    setCurrentStep('login')
  }, [])

  const goToRegister = useCallback(() => {
    setCurrentStep('register')
  }, [])

  const goToForgotPassword = useCallback(() => {
    setCurrentStep('forgot-password')
  }, [])

  const goToVerifyEmail = useCallback((userEmail: string) => {
    setEmail(userEmail)
    setCurrentStep('verify-email')
  }, [])

  const goToResetPassword = useCallback((userEmail: string) => {
    setEmail(userEmail)
    setCurrentStep('reset-password')
  }, [])

  const handleVerifySuccess = useCallback(() => {
    handleClose(false)
  }, [handleClose])

  const handleResetSuccess = useCallback(() => {
    setCurrentStep('login')
    setEmail("")
  }, [])

  return (
    <>
      <LoginModal
        open={open && currentStep === 'login'}
        onOpenChange={handleClose}
        onRegister={goToRegister}
        onForgotPassword={goToForgotPassword}
      />

      <RegisterModal
        open={open && currentStep === 'register'}
        onOpenChange={handleClose}
        onBack={goToLogin}
        onVerifyEmail={goToVerifyEmail}
      />

      <VerifyEmailModal
        open={open && currentStep === 'verify-email'}
        onOpenChange={handleClose}
        email={email}
        onBack={goToRegister}
        onSuccess={handleVerifySuccess}
      />

      <ForgotPasswordModal
        open={open && currentStep === 'forgot-password'}
        onOpenChange={handleClose}
        onBack={goToLogin}
        onResetPassword={goToResetPassword}
      />

      <ResetPasswordModal
        open={open && currentStep === 'reset-password'}
        onOpenChange={handleClose}
        email={email}
        onBack={goToForgotPassword}
        onSuccess={handleResetSuccess}
      />
    </>
  )
}
