"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { AuthUser, AuthState, RegisterRequest, UpdateUserRequest, ChangePasswordRequest } from '@/types/auth'
import {
  authApi,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  clearTokens,
  setTokens,
} from '@/lib/auth-api'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>
  logout: () => void
  updateUser: (user: AuthUser) => void
  updateUserData: (data: UpdateUserRequest) => Promise<void>
  changePassword: (data: ChangePasswordRequest) => Promise<void>
  uploadProfileImage: (file: File) => Promise<void>
  refreshUserData: () => Promise<void>
  getProfileImageUrl: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    const loadAuthState = () => {
      const storedUser = getStoredUser()
      const storedAccessToken = getAccessToken()
      const storedRefreshToken = getRefreshToken()

      if (storedUser && storedAccessToken) {
        setUser(storedUser)
        setAccessToken(storedAccessToken)
        setRefreshToken(storedRefreshToken)
      }
      setIsLoading(false)
    }

    // Ejecutar inmediatamente para evitar delays
    loadAuthState()
  }, [])

// Escuchar cambios en localStorage para sincronizar entre tabs
  useEffect(() => {
    let isMounted = true
    
    const handleStorageChange = (e: StorageEvent) => {
      if (!isMounted) return
      
      if (e.key === 'auth_access_token' || e.key === 'auth_refresh_token' || e.key === 'auth_user') {
        const storedUser = getStoredUser()
        const storedAccessToken = getAccessToken()
        const storedRefreshToken = getRefreshToken()

        if (storedUser && storedAccessToken) {
          setUser(storedUser)
          setAccessToken(storedAccessToken)
          setRefreshToken(storedRefreshToken)
        } else {
          setUser(null)
          setAccessToken(null)
          setRefreshToken(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      isMounted = false
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ email, password })
      setAccessToken(response.accessToken)
      setRefreshToken(response.refreshToken)
      
      // Obtener datos completos del usuario
      try {
        const userData = await authApi.getUserByEmail(email)
        setUser(userData)
        setStoredUser(userData)
      } catch (userError) {
        console.error('Error al obtener datos del usuario:', userError)
        // Fallback a datos básicos
        const tempUser: AuthUser = {
          nombres: '',
          apellidos: '',
          email: email,
          celular: '',
          fechaNacimiento: '',
          tipoDocumento: '',
          nroDocumento: '',
        }
        setUser(tempUser)
        setStoredUser(tempUser)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(userData)
      setAccessToken(response.accessToken)
      setRefreshToken(response.refreshToken)
      // Guardar datos del usuario
      const newUser: AuthUser = {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        email: userData.email,
        celular: userData.celular,
        fechaNacimiento: userData.fechaNacimiento,
        tipoDocumento: userData.tipoDocumento,
        nroDocumento: userData.nroDocumento,
        digitoVerificacion: userData.digitoVerificacion,
        fechaExpedicion: userData.fechaExpedicion,
      }
      setUser(newUser)
      setStoredUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyEmail = useCallback(async (email: string, code: string) => {
    await authApi.verifyEmail({ email, code })
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword(email)
  }, [])

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    await authApi.resetPassword({ email, code, newPassword })
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    clearTokens()
  }, [])

  const updateUser = useCallback((newUser: AuthUser) => {
    setUser(newUser)
    setStoredUser(newUser)
  }, [])

  const refreshUserData = useCallback(async () => {
    if (!user?.email) return
    try {
      const userData = await authApi.getUserByEmail(user.email)
      setUser(userData)
      setStoredUser(userData)
    } catch (error) {
      console.error('Error al refrescar datos del usuario:', error)
    }
  }, [user?.email])

  const updateUserData = useCallback(async (data: UpdateUserRequest) => {
    if (!user?.id) throw new Error('Usuario no identificado')
    const updatedUser = await authApi.updateUser(user.id, data)
    setUser(updatedUser)
    setStoredUser(updatedUser)
  }, [user?.id])

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    if (!user?.id) throw new Error('Usuario no identificado')
    await authApi.changePassword(user.id, data)
  }, [user?.id])

  const uploadProfileImage = useCallback(async (file: File) => {
    if (!user?.id) throw new Error('Usuario no identificado')
    await authApi.uploadProfileImage(user.id, file)
    // Refrescar datos del usuario para obtener la nueva imagen
    await refreshUserData()
  }, [user?.id, refreshUserData])

  const getProfileImageUrl = useCallback(() => {
    return authApi.getProfileImageUrl(user?.profileImage)
  }, [user?.profileImage])

  const isAuthenticated = useMemo(() => !!accessToken && !!user, [accessToken, user])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      verifyEmail,
      forgotPassword,
      resetPassword,
      logout,
      updateUser,
      updateUserData,
      changePassword,
      uploadProfileImage,
      refreshUserData,
      getProfileImageUrl,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      login,
      register,
      verifyEmail,
      forgotPassword,
      resetPassword,
      logout,
      updateUser,
      updateUserData,
      changePassword,
      uploadProfileImage,
      refreshUserData,
      getProfileImageUrl,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
