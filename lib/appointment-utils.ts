/**
 * Utilidades para el manejo de citas médicas
 */

/**
 * Tipo de atención para pacientes
 */
export type PatientType = 'SIS' | 'SOAT' | 'PAGANTE';

/**
 * Turno de atención
 */
export type ShiftType = 'M' | 'T'; // M = Mañana, T = Tarde

/**
 * Mapea el tipo de paciente al formato correcto para la API
 * @param patientType - Tipo de paciente (SIS, SOAT o PAGANTE)
 * @returns Tipo de atención formateado para la API
 */
export function mapPatientTypeToApiFormat(patientType?: string): PatientType {
  if (!patientType) return 'PAGANTE';
  
  // Normaliza el valor a mayúsculas y elimina espacios
  const normalizedType = patientType.trim().toUpperCase();
  
  // Verifica si es un tipo válido
  if (normalizedType === 'SIS') return 'SIS';
  if (normalizedType === 'SOAT') return 'SOAT';
  return 'PAGANTE';
}

/**
 * Determina el turno basado en la hora
 * @param time - Hora en formato HH:MM
 * @returns Turno (M para mañana, T para tarde)
 */
export function getShiftFromTime(time: string): ShiftType {
  if (!time) return 'M';
  
  try {
    const hour = parseInt(time.split(':')[0]);
    return hour < 14 ? 'M' : 'T'; // Antes de las 14:00 es mañana, después es tarde
  } catch (e) {
    console.error('Error al procesar la hora:', e);
    return 'M'; // Valor por defecto
  }
}

/**
 * Formatea una fecha para la API (YYYY-MM-DD)
 * @param date - Fecha en cualquier formato válido
 * @returns Fecha formateada como YYYY-MM-DD
 */
export function formatDateForApi(date: string | Date): string {
  if (!date) return new Date().toISOString().split('T')[0];
  
  try {
    if (typeof date === 'string') {
      // Si es DD/MM/YYYY, convertir a YYYY-MM-DD
      if (date.includes('/')) {
        return date.split('/').reverse().join('-');
      }
      return date;
    }
    
    // Si es un objeto Date
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error al formatear la fecha:', e);
    return new Date().toISOString().split('T')[0]; // Valor por defecto
  }
}
