/**
 * Utilidades para manejo de información de ubicaciones del hospital
 */

/**
 * Obtiene la dirección del hospital basada en el campo 'lugar'
 * @param lugar - Código de ubicación ("0", "1", "2", etc.)
 * @returns Dirección del hospital o null si lugar es "0"
 */
export function getHospitalAddress(lugar?: string | null): string | null {
  // Si es "0", no mostrar nada
  if (lugar === "0") {
    return null
  }
  
  // Si es "1", es Sede Central
  if (lugar === "1") {
    return "Jr. Arequipa N° 214 - Sede Central"
  }
  
  // Si es "2" o cualquier otro valor (por defecto), es Consultorios Externos
  return "Jr. Cuzco 339 - Consultorios Externos"
}

/**
 * Obtiene el nombre de la ubicación del hospital basada en el campo 'lugar'
 * @param lugar - Código de ubicación ("0", "1", "2", etc.)
 * @returns Nombre de la ubicación o null si lugar es "0"
 */
export function getHospitalLocationName(lugar?: string | null): string | null {
  // Si es "0", no mostrar nada
  if (lugar === "0") {
    return null
  }
  
  // Si es "1", es Sede Central
  if (lugar === "1") {
    return "Sede Central Hospital Chosica"
  }
  
  // Si es "2" o cualquier otro valor (por defecto), es Consultorios Externos
  return "Consultorios Externos HJATCH"
}

/**
 * Obtiene la etiqueta del consultorio basada en el campo 'lugar'
 * @param lugar - Código de ubicación ("0", "1", "2", etc.)
 * @param consultorio - Número del consultorio
 * @returns Etiqueta formateada del consultorio o null si no hay consultorio o lugar es "0"
 */
export function getConsultorioLabel(lugar?: string | null, consultorio?: string | null): string | null {
  // Si es "0" o no hay consultorio, no mostrar nada
  if (lugar === "0" || !consultorio) {
    return null
  }
  
  // Si es "2", es Consultorio Externo
  if (lugar === "2") {
    return `Consultorio Externo: ${consultorio}`
  }
  
  // Si es "1" o cualquier otro valor, es Consultorio normal
  return `Consultorio: ${consultorio}`
}
