"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, Calendar, ArrowRight, Info, RefreshCw } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import PatientRegistrationModal from "@/components/patient-registration-modal"

interface ReferenciaData {
  idReferencia: string
  numeroReferencia: string
  codigoestablecimientoOrigen: string
  establecimientoOrigen: string
  especialidad: string
  codigoEspecialidad: string
  codigoEstado: string
  estado: string
  fechaEnvio: string
  descUpsDestino?: string
  upsDestino?: string
  descUpsOrigen?: string
  upsOrigen?: string
  diagnostico?: string
  profesionalOrigen?: string
}

interface ReferenciaResponse {
  data: ReferenciaData
}

interface MyReferencesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getEstadoColor = (codigoEstado: string, estado: string) => {
  switch (codigoEstado) {
    case '2':
      return { bgColor: '#8A0016', labelColor: '#FFFFFF', selectable: false, label: 'Pendiente' }
    case '3':
      return { bgColor: '#E6F7EB', labelColor: '#12AC26', selectable: true, label: 'Aceptada' }
    case '4':
      return { bgColor: '#6A6A6A', labelColor: '#FFFFFF', selectable: false, label: 'Rechazada' }
    case '5':
      return { bgColor: '#1D73E5', labelColor: '#FFFFFF', selectable: true, label: 'Recibido' }
    case '7':
      return { bgColor: '#8A4BAF', labelColor: '#FFFFFF', selectable: true, label: 'Citado' }
    case '8':
      return { bgColor: '#D1B21F', labelColor: '#000000', selectable: false, label: 'Contrareferido' }
    case '9':
      return { bgColor: '#F4A33B', labelColor: '#000000', selectable: false, label: 'Observada' }
    case '6':
      return { bgColor: '#4D4D4D', labelColor: '#FFFFFF', selectable: false, label: 'De Baja' }
    default:
      return { bgColor: '#9CA3AF', labelColor: '#111827', selectable: false, label: estado || 'Desconocido' }
  }
}

const getEstadoDetail = (codigoEstado: string) => {
  switch (codigoEstado) {
    case '2':
      return {
        icon: <Clock className="w-5 h-5 text-amber-600" />,
        title: 'Referencia en revisión',
        description: 'La Unidad de Referencias del Hospital de Chosica cuenta con un plazo de 3 días hábiles para verificar su referencia.',
        canSchedule: false,
      }
    case '3':
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        title: 'Referencia aprobada',
        description: 'Su referencia ha sido aceptada. Puede solicitar su cita.',
        canSchedule: true,
      }
    case '4':
      return {
        icon: <XCircle className="w-5 h-5 text-gray-500" />,
        title: 'Referencia rechazada',
        description: 'Su referencia fue rechazada. Acérquese a su establecimiento de origen.',
        canSchedule: false,
      }
    case '5':
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        title: 'Paciente recibido',
        description: 'Su referencia fue recibida. Puede solicitar su cita.',
        canSchedule: true,
      }
    case '7':
      return {
        icon: <Calendar className="w-5 h-5 text-purple-600" />,
        title: 'Referencia con cita previa',
        description: 'Esta referencia ya fue utilizada para agendar una cita. Puede reutilizarla si continúa en tratamiento.',
        canSchedule: true,
      }
    case '8':
      return {
        icon: <ArrowRight className="w-5 h-5 text-yellow-600" />,
        title: 'Contrareferido',
        description: 'Su atención fue contrareferida a su establecimiento de origen.',
        canSchedule: false,
      }
    case '9':
      return {
        icon: <Info className="w-5 h-5 text-orange-500" />,
        title: 'Referencia observada',
        description: 'Su referencia presenta observaciones que deben ser corregidas.',
        canSchedule: false,
      }
    case '6':
      return {
        icon: <XCircle className="w-5 h-5 text-gray-400" />,
        title: 'Referencia dada de baja',
        description: 'Esta referencia fue dada de baja.',
        canSchedule: false,
      }
    default:
      return {
        icon: <Info className="w-5 h-5 text-gray-500" />,
        title: 'Estado desconocido',
        description: 'No se pudo determinar el estado de esta referencia.',
        canSchedule: false,
      }
  }
}

export default function MyReferencesModal({ open, onOpenChange }: MyReferencesModalProps) {
  const { user, isAuthenticated } = useAuth()
  const [referencias, setReferencias] = useState<ReferenciaResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedRef, setExpandedRef] = useState<string | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)

  const fetchReferences = async () => {
    if (!isAuthenticated || !user?.nroDocumento || !user?.tipoDocumento) {
      setError("No se encontraron datos del usuario.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const tipoDocMap: Record<string, string> = {
        'D': '1', 'D  ': '1', 'CE': '2', 'CE ': '2', 'PP': '3', 'PP ': '3'
      }
      const tipoDoc = tipoDocMap[user.tipoDocumento] || '1'

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_REFCON}/referencia/consultar-referencias`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establecimientoDestino: "5947",
          limite: "20",
          numerodocumento: user.nroDocumento,
          pagina: "1",
          tipodocumento: tipoDoc,
        }),
      })

      const data = await response.json()

      if (!response.ok || data?.codigo === '6000' || data?.datos?.total === 0) {
        setReferencias([])
        return
      }

      const rawList = data?.datos?.datos ?? data?.data ?? (Array.isArray(data) ? data : [])
      const refList: ReferenciaResponse[] = (Array.isArray(rawList) ? rawList : [])
        .filter((item: any) => item?.data)
        .map((item: any) => ({ data: item.data as ReferenciaData }))

      setReferencias(refList)
    } catch (err) {
      console.error('Error fetching references:', err)
      setError("No se pudo consultar las referencias. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && isAuthenticated) {
      fetchReferences()
    }
  }, [open, isAuthenticated])

  useEffect(() => {
    if (!open) {
      setReferencias([])
      setError("")
      setExpandedRef(null)
    }
  }, [open])

  const parseFecha = (fecha: string): number => {
    if (!fecha) return 0
    if (fecha.includes('-') && fecha.split('-').length === 3) {
      const parts = fecha.split('-')
      if (parts[0].length === 4) return new Date(fecha).getTime()
      const [day, month, year] = parts
      return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
    }
    if (fecha.includes('/')) {
      const [day, month, year] = fecha.split('/')
      return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
    }
    const d = new Date(fecha)
    return Number.isNaN(d.getTime()) ? 0 : d.getTime()
  }

  const sortedReferencias = [...referencias].sort((a, b) => {
    const fa = parseFecha(a.data.fechaEnvio)
    const fb = parseFecha(b.data.fechaEnvio)
    return fb - fa
  })

  const toggleDetail = (idRef: string) => {
    setExpandedRef(prev => prev === idRef ? null : idRef)
  }

  return (
    <>
      <Dialog open={open && !showRegistration} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto" redirectToHome={false}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">Mis Referencias</DialogTitle>
            <DialogDescription className="text-center">
              Referencias médicas asociadas a tu cuenta
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#3e92cc] mb-4" />
              <p className="text-gray-500">Cargando referencias...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchReferences} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {sortedReferencias.length === 0
                    ? "No se encontraron referencias"
                    : `${sortedReferencias.length} referencia${sortedReferencias.length > 1 ? 's' : ''}`}
                </p>
                <Button variant="outline" size="sm" onClick={fetchReferences}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>

              {sortedReferencias.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tienes referencias registradas.</p>
                </div>
              )}

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {sortedReferencias.map((ref) => {
                  const refData = ref.data
                  const estadoInfo = getEstadoColor(refData.codigoEstado, refData.estado)
                  const detail = getEstadoDetail(refData.codigoEstado)
                  const isExpanded = expandedRef === refData.idReferencia

                  return (
                    <div key={refData.idReferencia} className="border rounded-lg overflow-hidden transition-all">
                      <div className="p-4 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0"
                                style={{ backgroundColor: estadoInfo.bgColor, color: estadoInfo.labelColor }}
                              >
                                {estadoInfo.label}
                              </span>
                              {refData.fechaEnvio && (
                                <span className="text-xs text-gray-400 shrink-0">{refData.fechaEnvio}</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {refData.especialidad || 'Sin especialidad'}
                            </p>
                            <p className="text-xs text-gray-500 break-words">
                              Origen: {refData.establecimientoOrigen || 'No especificado'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDetail(refData.idReferencia)}
                            className="text-[#3e92cc] hover:text-[#3e92cc]/80 hover:bg-blue-50 flex-shrink-0"
                          >
                            {isExpanded ? (
                              <>Ocultar <ChevronUp className="w-4 h-4 ml-1" /></>
                            ) : (
                              <>Ver detalle <ChevronDown className="w-4 h-4 ml-1" /></>
                            )}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t bg-gray-50 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">{detail.icon}</div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900">{detail.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{detail.description}</p>
                            </div>
                          </div>

                          {refData.diagnostico && (
                            <div className="bg-white rounded-md p-3 border">
                              <p className="text-xs text-gray-500 mb-1">Diagnóstico</p>
                              <p className="text-sm text-gray-800">{refData.diagnostico}</p>
                            </div>
                          )}

                          {detail.canSchedule && (
                            <Button
                              onClick={() => setShowRegistration(true)}
                              className="w-full text-white font-medium hover:opacity-90"
                              style={{ backgroundColor: "#3e92cc" }}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Solicitar cita
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PatientRegistrationModal open={showRegistration} onOpenChange={setShowRegistration} />
    </>
  )
}
