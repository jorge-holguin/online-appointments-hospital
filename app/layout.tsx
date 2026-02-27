import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { DateProvider } from '@/context/date-context'
import { SessionProvider } from '@/context/session-context'
import { AuthProvider } from '@/context/auth-context'
import ConsoleBlocker from '@/components/security/console-blocker'

export const metadata: Metadata = {
  title: 'Solicitud de Citas',
  description: 'Pagina para solicitud de citas en linea',
  generator: 'Jorge Holguin',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Por defecto permite el acceso a la consola (true), solo bloquea si está explícitamente en 'false'
  const allowConsoleAccess = process.env.NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS !== 'false'
  
  return (
    <html lang="en">
      <head>
        <script src="/js/passive-events.js" async></script>
        {/* Cargar el bloqueador de consola solo si ALLOW_CONSOLE_ACCESS es false */}
        {!allowConsoleAccess && (
          <script src="/js/console-blocker.js"></script>
        )}
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* Componente para bloquear la consola si está configurado */}
        {!allowConsoleAccess && <ConsoleBlocker />}
        <AuthProvider>
          <SessionProvider>
            <DateProvider>
              {children}
            </DateProvider>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
