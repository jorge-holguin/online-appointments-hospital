/**
 * Servicio de API de autenticación con interceptor para refresh token
 */

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthUser,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '@/types/auth'

const AUTH_API_URL = process.env.NEXT_PUBLIC_API_AUTH_URL || 'http://192.168.0.252:9012'

const TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USER_KEY = 'auth_user'

// Token management
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const setStoredUser = (user: AuthUser): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Refresh token logic
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await fetch(`${AUTH_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${refreshToken}`,
      },
    })

    if (!response.ok) {
      clearTokens()
      return null
    }

    const data: LoginResponse = await response.json()
    setTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch (error) {
    console.error('Error refreshing token:', error)
    clearTokens()
    return null
  }
}

// Fetch with interceptor
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = getAccessToken()

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (accessToken) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
  }

  let response = await fetch(url, { ...options, headers })

  // Si el token expiró (401), intentar refresh
  if (response.status === 401 && accessToken) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await refreshAccessToken()
      isRefreshing = false

      if (newToken) {
        onTokenRefreshed(newToken)
        // Reintentar la petición original con el nuevo token
        ;(headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
        response = await fetch(url, { ...options, headers })
      }
    } else {
      // Esperar a que termine el refresh en curso
      return new Promise((resolve) => {
        subscribeTokenRefresh(async (token) => {
          ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
          resolve(await fetch(url, { ...options, headers }))
        })
      })
    }
  }

  return response
}

// Auth API endpoints
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al iniciar sesión')
    }

    const data: LoginResponse = await response.json()
    setTokens(data.accessToken, data.refreshToken)
    return data
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(`${AUTH_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al registrar usuario')
    }

    const data: RegisterResponse = await response.json()
    setTokens(data.accessToken, data.refreshToken)
    return data
  },

  verifyEmail: async (verificationData: VerifyEmailRequest): Promise<void> => {
    const response = await fetch(`${AUTH_API_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Código de verificación inválido')
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    const response = await fetch(
      `${AUTH_API_URL}/api/auth/forgot-password?email=${encodeURIComponent(email)}`,
      {
        method: 'POST',
        headers: {
          'Accept': '*/*',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al enviar correo de recuperación')
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    const params = new URLSearchParams({
      email: data.email,
      code: data.code,
      newPassword: data.newPassword,
    })

    const response = await fetch(
      `${AUTH_API_URL}/api/auth/reset-password?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Accept': '*/*',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al restablecer contraseña')
    }
  },

  logout: (): void => {
    clearTokens()
  },

  getUserByEmail: async (email: string): Promise<AuthUser> => {
    const response = await authFetch(
      `${AUTH_API_URL}/api/users/email?email=${encodeURIComponent(email)}`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al obtener datos del usuario')
    }

    return response.json()
  },

  updateUser: async (userId: number, data: UpdateUserRequest): Promise<AuthUser> => {
    const response = await authFetch(`${AUTH_API_URL}/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al actualizar datos del usuario')
    }

    return response.json()
  },

  changePassword: async (userId: number, data: ChangePasswordRequest): Promise<void> => {
    const params = new URLSearchParams({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })

    const response = await authFetch(
      `${AUTH_API_URL}/api/users/${userId}/password?${params.toString()}`,
      { method: 'PUT' }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al cambiar la contraseña')
    }
  },

  uploadProfileImage: async (userId: number, file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const accessToken = getAccessToken()
    const response = await fetch(`${AUTH_API_URL}/api/users/${userId}/image`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al subir imagen de perfil')
    }

    const text = await response.text()
    return text
  },

  getProfileImageUrl: (imageName: string | undefined): string | null => {
    if (!imageName) return null
    return `${AUTH_API_URL}/api/users/image/${imageName}`
  },
}
