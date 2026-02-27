/**
 * Tipos para el sistema de autenticación
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface RegisterRequest {
  nombres: string
  apellidos: string
  email: string
  celular: string
  fechaNacimiento: string
  password: string
  termsAccepted: boolean
  tipoDocumento: string
  nroDocumento: string
  digitoVerificacion?: string
  fechaExpedicion?: string
}

export interface RegisterResponse {
  accessToken: string
  refreshToken: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

export interface AuthUser {
  id?: number
  nombres: string
  apellidos: string
  email: string
  celular: string
  fechaNacimiento: string
  tipoDocumento: string
  nroDocumento: string
  digitoVerificacion?: string
  fechaExpedicion?: string
  profileImage?: string
  role?: string
  emailVerified?: boolean
  ubigeo?: string | null
}

export interface UpdateUserRequest {
  nombres: string
  apellidos: string
  email: string
  celular: string
  fechaNacimiento: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type AuthStep = 
  | 'login'
  | 'register'
  | 'verify-email'
  | 'forgot-password'
  | 'reset-password'
  | 'terms'

export interface AuthModalState {
  isOpen: boolean
  currentStep: AuthStep
  email?: string
}
