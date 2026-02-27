"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface UserMenuProps {
  onOpenProfileSettings: () => void
}

function UserMenu({ onOpenProfileSettings }: UserMenuProps) {
  const { user, logout, isAuthenticated, getProfileImageUrl } = useAuth()

  if (!isAuthenticated || !user) {
    return null
  }

  const displayName = user.nombres 
    ? `${user.nombres} ${user.apellidos || ''}`.trim()
    : user.email

  const shortName = user.nombres 
    ? `${user.nombres.split(' ')[0]} ${user.apellidos?.split(' ')[0] || ''}`.trim()
    : user.email

  const profileImageUrl = getProfileImageUrl()

  const handleLogout = () => {
    logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/90 hover:bg-white border-gray-200"
        >
          <div className="w-8 h-8 rounded-full bg-[#3e92cc] flex items-center justify-center overflow-hidden">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {shortName}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onOpenProfileSettings} className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Configuración de Perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default memo(UserMenu)
