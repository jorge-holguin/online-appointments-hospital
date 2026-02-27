"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  Camera, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface ProfileSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Password strength validation
const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "Mínimo 8 caracteres" }
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Debe contener al menos una mayúscula" }
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Debe contener al menos una minúscula" }
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Debe contener al menos un número" }
  }
  return { isValid: true, message: "Contraseña segura" }
}

export default function ProfileSettingsModal({ open, onOpenChange }: ProfileSettingsModalProps) {
  const { user, updateUserData, changePassword, uploadProfileImage, getProfileImageUrl } = useAuth()
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    nombres: user?.nombres || "",
    apellidos: user?.apellidos || "",
    email: user?.email || "",
    celular: user?.celular || "",
    fechaNacimiento: user?.fechaNacimiento || "",
  })
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  // UI state
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update profile data when user changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && user) {
      setProfileData({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        email: user.email || "",
        celular: user.celular || "",
        fechaNacimiento: user.fechaNacimiento || "",
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setProfileError("")
      setProfileSuccess("")
      setPasswordError("")
      setPasswordSuccess("")
    }
    onOpenChange(isOpen)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError("")
    setProfileSuccess("")
    setIsLoadingProfile(true)

    try {
      await updateUserData({
        nombres: profileData.nombres,
        apellidos: profileData.apellidos,
        email: profileData.email,
        celular: profileData.celular,
        fechaNacimiento: profileData.fechaNacimiento,
      })
      setProfileSuccess("Datos actualizados correctamente")
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Error al actualizar datos")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    // Validate password strength
    const strengthCheck = validatePasswordStrength(passwordData.newPassword)
    if (!strengthCheck.isValid) {
      setPasswordError(strengthCheck.message)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    setIsLoadingPassword(true)

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordSuccess("Contraseña actualizada correctamente")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Error al cambiar contraseña")
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setProfileError("Solo se permiten archivos de imagen")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("La imagen no debe superar los 5MB")
      return
    }

    setIsLoadingImage(true)
    setProfileError("")

    try {
      await uploadProfileImage(file)
      setProfileSuccess("Imagen actualizada correctamente")
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Error al subir imagen")
    } finally {
      setIsLoadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const profileImageUrl = getProfileImageUrl()

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" redirectToHome={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Configuración de Perfil
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Mis Datos</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-[#3e92cc]">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoadingImage}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#3e92cc] rounded-full flex items-center justify-center text-white hover:bg-[#3e92cc]/90 transition-colors"
                >
                  {isLoadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">Haz clic en el ícono para cambiar tu foto</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="nombres"
                      value={profileData.nombres}
                      onChange={(e) => setProfileData({ ...profileData, nombres: e.target.value })}
                      className="pl-10"
                      disabled={isLoadingProfile}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="apellidos"
                      value={profileData.apellidos}
                      onChange={(e) => setProfileData({ ...profileData, apellidos: e.target.value })}
                      className="pl-10"
                      disabled={isLoadingProfile}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="pl-10"
                    disabled={isLoadingProfile}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="celular"
                    value={profileData.celular}
                    onChange={(e) => setProfileData({ ...profileData, celular: e.target.value })}
                    className="pl-10"
                    disabled={isLoadingProfile}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={profileData.fechaNacimiento}
                    onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
                    className="pl-10"
                    disabled={isLoadingProfile}
                  />
                </div>
              </div>

              {/* Document info (read-only) */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Tipo de documento:</strong> {user?.tipoDocumento === "D  " ? "DNI" : user?.tipoDocumento}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Número de documento:</strong> {user?.nroDocumento}
                </p>
              </div>

              {profileError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white"
                disabled={isLoadingProfile}
              >
                {isLoadingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="pl-10 pr-10"
                    disabled={isLoadingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="pl-10 pr-10"
                    disabled={isLoadingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.newPassword && (
                  <p className={`text-xs ${validatePasswordStrength(passwordData.newPassword).isValid ? 'text-green-600' : 'text-amber-600'}`}>
                    {validatePasswordStrength(passwordData.newPassword).message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    disabled={isLoadingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password requirements */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                    • Mínimo 8 caracteres
                  </li>
                  <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    • Al menos una letra mayúscula
                  </li>
                  <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    • Al menos una letra minúscula
                  </li>
                  <li className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    • Al menos un número
                  </li>
                </ul>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white"
                disabled={isLoadingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {isLoadingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  "Cambiar Contraseña"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
