import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat - Hospital José Agurto Tello',
  description: 'Asistente virtual para solicitud de citas',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout minimalista para el chat (sin header ni footer del sitio principal)
  return <>{children}</>
}
