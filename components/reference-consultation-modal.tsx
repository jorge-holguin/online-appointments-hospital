"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2, AlertCircle, CreditCard, FileText, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, Calendar, ArrowRight, Info } from "lucide-react"
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha'
import PatientRegistrationModal from "./patient-registration-modal"

interface ApiDocumentType {
  tipoDocumento?: string | null
  nombre?: string | null
  activo?: number | null
  tipoLabo?: number | null
  tipoRef?: number | null
  tipoSis?: string | null
  tipoCdc?: string | null
}

interface DocumentType {
  tipoDocumento: string
  nombre: string
}

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
  diagnostico?: string
  profesionalOrigen?: string
}

interface ReferenciaResponse {
  data: ReferenciaData
}

interface ReferenceConsultationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getEstadoColor = (codigoEstado: string, estado: string) => {
  switch (codigoEstado) {
    case '2':
      return { bgColor: '#8A0016', labelColor: '#FFFFFF', selectable: false, label: 'Pendiente', skipRefconSync: false }
    case '3':
      return { bgColor: '#E6F7EB', labelColor: '#12AC26', selectable: true, label: 'Aceptada', skipRefconSync: false }
    case '4':
      return { bgColor: '#6A6A6A', labelColor: '#FFFFFF', selectable: false, label: 'Rechazada', skipRefconSync: false }
    case '5':
      return { bgColor: '#1D73E5', labelColor: '#FFFFFF', selectable: true, label: 'Recibido', skipRefconSync: true }
    case '7':
      return { bgColor: '#8A4BAF', labelColor: '#FFFFFF', selectable: true, label: 'Citado', skipRefconSync: true }
    case '8':
      return { bgColor: '#D1B21F', labelColor: '#000000', selectable: false, label: 'Contrareferido', skipRefconSync: false }
    case '9':
      return { bgColor: '#F4A33B', labelColor: '#000000', selectable: false, label: 'Observada', skipRefconSync: false }
    case '6':
      return { bgColor: '#4D4D4D', labelColor: '#FFFFFF', selectable: false, label: 'De Baja', skipRefconSync: false }
    default:
      return { bgColor: '#9CA3AF', labelColor: '#111827', selectable: false, label: estado || 'Desconocido', skipRefconSync: false }
  }
}

const getEstadoDetail = (codigoEstado: string) => {
  switch (codigoEstado) {
    case '2':
      return {
        icon: <Clock className="w-5 h-5 text-amber-600" />,
        title: 'Referencia en revisión',
        description: 'La Unidad de Referencias del Hospital de Chosica cuenta con un plazo de 3 días hábiles para verificar su referencia. Si transcurrido ese plazo no recibe respuesta, le recomendamos acercarse presencialmente a la Oficina de Referencias del hospital.',
        canSchedule: false,
      }
    case '3':
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        title: 'Referencia aprobada',
        description: 'Su referencia ha sido aceptada. Puede solicitar su cita a través de este sistema o acercándose directamente al hospital.',
        canSchedule: true,
      }
    case '4':
      return {
        icon: <XCircle className="w-5 h-5 text-gray-500" />,
        title: 'Referencia rechazada',
        description: 'Lamentablemente su referencia fue rechazada. Por favor, acérquese a su establecimiento de origen para que le indiquen el motivo del rechazo y los pasos a seguir.',
        canSchedule: false,
      }
    case '5':
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        title: 'Paciente recibido',
        description: 'Su referencia fue recibida por el hospital. Puede solicitar su cita a través de este sistema.',
        canSchedule: true,
      }
    case '7':
      return {
        icon: <Calendar className="w-5 h-5 text-purple-600" />,
        title: 'Referencia con cita previa',
        description: 'Esta referencia ya fue utilizada para agendar una cita anteriormente. Si continúa en tratamiento, puede reutilizarla para solicitar una nueva cita.',
        canSchedule: true,
      }
    case '8':
      return {
        icon: <ArrowRight className="w-5 h-5 text-yellow-600" />,
        title: 'Contrareferido',
        description: 'Su atención fue contrareferida a su establecimiento de origen. Acérquese a su posta para continuar con su atención.',
        canSchedule: false,
      }
    case '9':
      return {
        icon: <Info className="w-5 h-5 text-orange-500" />,
        title: 'Referencia observada',
        description: 'Su referencia presenta observaciones. Le recomendamos acercarse a su establecimiento de origen para corregir las observaciones indicadas.',
        canSchedule: false,
      }
    case '6':
      return {
        icon: <XCircle className="w-5 h-5 text-gray-400" />,
        title: 'Referencia dada de baja',
        description: 'Esta referencia fue dada de baja y no se encuentra activa.',
        canSchedule: false,
      }
    default:
      return {
        icon: <Info className="w-5 h-5 text-gray-500" />,
        title: 'Estado desconocido',
        description: 'No se pudo determinar el estado de esta referencia. Acérquese al hospital para mayor información.',
        canSchedule: false,
      }
  }
}

export default function ReferenceConsultationModal({ open, onOpenChange }: ReferenceConsultationModalProps) {
  const [tipoDocumento, setTipoDocumento] = useState("")
  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false)
  const [referencias, setReferencias] = useState<ReferenciaResponse[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState("")
  const [expandedRef, setExpandedRef] = useState<string | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)

  const hasLoadedDocumentTypes = useRef(false)
  const isMounted = useRef(false)

  // Fetch document types
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      if (!open || hasLoadedDocumentTypes.current || loadingDocumentTypes) return
      setLoadingDocumentTypes(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/tipo-documento`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data: ApiDocumentType[] = await response.json()
        const normalizedTypes: DocumentType[] = data
          .filter(type => type != null && type.nombre && type.tipoDocumento)
          .filter(type => type.nombre !== "*Ninguno")
          .filter(type => {
            const ref = type.tipoRef
            return ref === 1 || ref === 2 || ref === 3
          })
          .map(type => ({
            tipoDocumento: String(type.tipoRef ?? type.tipoDocumento),
            nombre: type.nombre!,
          }))
        setDocumentTypes(normalizedTypes)
        hasLoadedDocumentTypes.current = true
      } catch (err) {
        console.error('Error fetching document types:', err)
        setDocumentTypes([
          { tipoDocumento: "1", nombre: "DNI" },
          { tipoDocumento: "2", nombre: "Carnet de Extranjería" },
          { tipoDocumento: "3", nombre: "Pasaporte" },
        ])
        hasLoadedDocumentTypes.current = true
      } finally {
        setLoadingDocumentTypes(false)
      }
    }
    fetchDocumentTypes()
  }, [open])

  // Load captcha
  useEffect(() => {
    isMounted.current = true
    if (open && isMounted.current) {
      setTimeout(() => {
        try {
          loadCaptchaEnginge(4)
        } catch (err) {
          console.error('Error loading captcha:', err)
        }
      }, 100)
    }
    return () => { isMounted.current = false }
  }, [open])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setTipoDocumento("")
      setNumeroDocumento("")
      setCaptchaInput("")
      setReferencias([])
      setHasSearched(false)
      setError("")
      setExpandedRef(null)
    }
  }, [open])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!tipoDocumento || !numeroDocumento.trim()) {
      setError("Por favor, complete todos los campos obligatorios.")
      return
    }

    try {
      if (!validateCaptcha(captchaInput)) {
        setError("Código de verificación incorrecto. Intente nuevamente.")
        setCaptchaInput("")
        setTimeout(() => loadCaptchaEnginge(4), 100)
        return
      }
    } catch (err) {
      console.error('Captcha validation error:', err)
      setError("Error en la verificación de seguridad. Recargue la página.")
      return
    }

    setIsSearching(true)
    setHasSearched(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_REFCON}/referencia/consultar-referencias`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establecimientoDestino: "5947",
          limite: "20",
          numerodocumento: numeroDocumento.trim(),
          pagina: "1",
          tipodocumento: tipoDocumento,
        }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      const refList: ReferenciaResponse[] = Array.isArray(data)
        ? data.map((item: any) => ({ data: item }))
        : data?.data
          ? Array.isArray(data.data)
            ? data.data.map((item: any) => ({ data: item }))
            : [{ data: data.data }]
          : []

      setReferencias(refList)
      setHasSearched(true)
    } catch (err) {
      console.error('Error fetching references:', err)
      setError("No se pudo consultar las referencias. Verifique su conexión e intente nuevamente.")
    } finally {
      setIsSearching(false)
    }
  }

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
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">Consulta de Referencias</DialogTitle>
            <DialogDescription className="text-center">
              Ingrese sus datos para consultar el estado de sus referencias médicas.
            </DialogDescription>
          </DialogHeader>

          {/* Search Form */}
          {!hasSearched && (
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ref-tipoDocumento">Tipo de Documento *</Label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingDocumentTypes ? "Cargando..." : "Seleccione tipo de documento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem key={docType.tipoDocumento} value={docType.tipoDocumento}>
                        {docType.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ref-documento">Número de Documento *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="ref-documento"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    placeholder="Ingrese su número de documento"
                    className="pl-10"
                    maxLength={15}
                    required
                  />
                </div>
              </div>

              {/* Captcha */}
              <div className="space-y-3">
                <Label htmlFor="ref-captcha-input" className="text-sm font-medium text-gray-700">
                  Verificación de seguridad
                </Label>
                <div className="flex flex-col items-center space-y-3">
                  <div className="border rounded-lg p-3 bg-gray-50 relative">
                    {open && <LoadCanvasTemplate />}
                    <button
                      type="button"
                      onClick={() => {
                        setCaptchaInput("")
                        setTimeout(() => loadCaptchaEnginge(4), 100)
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                      aria-label="Refrescar captcha"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                    </button>
                  </div>
                  <div className="w-full">
                    <Input
                      id="ref-captcha-input"
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Ingrese el código mostrado arriba"
                      className="text-center"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Ingrese los caracteres que ve en la imagen
                    </p>
                  </div>
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
                className="w-full bg-[#3e92cc] hover:bg-[#3e92cc]/90 text-white py-3 mt-6 font-semibold disabled:opacity-50 transition-all"
                size="lg"
                disabled={isSearching || !tipoDocumento || !numeroDocumento.trim() || !captchaInput.trim()}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar referencias
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Results */}
          {hasSearched && (
            <div className="space-y-4">
              {/* Back / New search button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {sortedReferencias.length === 0
                    ? "No se encontraron referencias"
                    : `${sortedReferencias.length} referencia${sortedReferencias.length > 1 ? 's' : ''} encontrada${sortedReferencias.length > 1 ? 's' : ''}`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHasSearched(false)
                    setReferencias([])
                    setError("")
                    setCaptchaInput("")
                    setExpandedRef(null)
                    setTimeout(() => loadCaptchaEnginge(4), 150)
                  }}
                >
                  Nueva consulta
                </Button>
              </div>

              {sortedReferencias.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No se encontraron referencias asociadas a este documento.</p>
                  <p className="text-sm text-gray-400 mt-1">Verifique que los datos ingresados sean correctos.</p>
                </div>
              )}

              {/* Reference list */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {sortedReferencias.map((ref) => {
                  const refData = ref.data
                  const estadoInfo = getEstadoColor(refData.codigoEstado, refData.estado)
                  const detail = getEstadoDetail(refData.codigoEstado)
                  const isExpanded = expandedRef === refData.idReferencia

                  return (
                    <div
                      key={refData.idReferencia}
                      className="border rounded-lg overflow-hidden transition-all"
                    >
                      {/* Reference card header */}
                      <div className="p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: estadoInfo.bgColor, color: estadoInfo.labelColor }}
                              >
                                {estadoInfo.label}
                              </span>
                              {refData.fechaEnvio && (
                                <span className="text-xs text-gray-400">{refData.fechaEnvio}</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {refData.especialidad || 'Sin especialidad'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Origen: {refData.establecimientoOrigen || 'No especificado'}
                            </p>
                            {refData.numeroReferencia && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                N° Ref: {refData.numeroReferencia}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDetail(refData.idReferencia)}
                            className="text-[#3e92cc] hover:text-[#3e92cc]/80 hover:bg-blue-50 flex-shrink-0"
                          >
                            {isExpanded ? (
                              <>
                                Ocultar
                                <ChevronUp className="w-4 h-4 ml-1" />
                              </>
                            ) : (
                              <>
                                Ver detalle
                                <ChevronDown className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="border-t bg-gray-50 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">{detail.icon}</div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900">{detail.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{detail.description}</p>
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

      {/* Patient Registration Modal */}
      <PatientRegistrationModal open={showRegistration} onOpenChange={setShowRegistration} />
    </>
  )
}
