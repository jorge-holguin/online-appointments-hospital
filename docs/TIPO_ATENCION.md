# Implementación del Campo `tipoAtencion` en el Sistema de Citas

## Descripción

Este documento describe la implementación del campo `tipoAtencion` en el sistema de reserva de citas médicas. Este campo es necesario para identificar si el paciente es atendido como paciente SIS o como paciente pagante.

## Flujo de Datos

1. **Selección inicial**: El usuario selecciona su tipo de atención en el componente `SISVerificationModal`
2. **Propagación**: El valor seleccionado se propaga a través de todos los componentes en la cadena
3. **Envío a la API**: El valor se envía como parte del payload en la solicitud POST a `/api/v1/solicitudes`
4. **Visualización**: El tipo de atención se muestra en los modales de confirmación

## Implementación Técnica

### 1. Modelo de Datos

```typescript
// Tipo de atención para pacientes
export type PatientType = 'SIS' | 'PAGANTE';
```

### 2. Selección del Tipo de Atención

En `SISVerificationModal.tsx`, el usuario puede seleccionar entre:

- **Paciente SIS**: Requiere subir una referencia SIS
- **Paciente Pagante**: No requiere documentación adicional

```tsx
// Estado para almacenar el tipo de paciente
const [patientType, setPatientType] = useState<PatientType>('SIS');

// Al continuar, se pasa el tipo seleccionado al siguiente componente
<SpecialtySelectionModal
  patientData={{
    ...patientData,
    patientType: patientType,
    referenceImage: patientType === 'SIS' ? referenceImage : null
  }}
/>
```

### 3. Propagación del Valor

El valor se propaga a través de los siguientes componentes:

1. `SISVerificationModal` → `SpecialtySelectionModal`
2. `SpecialtySelectionModal` → `DoctorSelectionModal`
3. `DoctorSelectionModal` → `DateTimeSelectionModal`
4. `DateTimeSelectionModal` → `ConfirmationModal`

### 4. Preparación del Payload

En `ConfirmationModal.tsx`, el valor se incluye en el payload de la solicitud:

```tsx
const appointmentPayload = {
  // ... otros campos
  tipoAtencion: mapPatientTypeToApiFormat(appointmentData.patient.patientType)
};
```

### 5. Utilidades

Se han creado utilidades para garantizar la consistencia del valor:

```typescript
// En appointment-utils.ts
export function mapPatientTypeToApiFormat(patientType?: string): PatientType {
  if (!patientType) return 'PAGANTE';
  
  // Normaliza el valor a mayúsculas y elimina espacios
  const normalizedType = patientType.trim().toUpperCase();
  
  // Verifica si es un tipo válido
  return normalizedType === 'SIS' ? 'SIS' : 'PAGANTE';
}
```

### 6. Visualización

El tipo de atención se muestra en:

1. **Modal de Confirmación**: Como un badge junto a la información del paciente
2. **Modal de Confirmación Final**: Como parte del resumen de la cita

## Estructura de la API

### Endpoint

```
POST /api/v1/solicitudes
```

### Payload

```json
{
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "nombres": "Nombre Completo",
  "celular": "987654321",
  "correo": "correo@ejemplo.com",
  "especialidad": "CODIGO_ESPECIALIDAD",
  "especialidadNombre": "Nombre de Especialidad",
  "medico": "CODIGO_MEDICO",
  "medicoNombre": "Nombre del Médico",
  "fecha": "2025-09-25",
  "hora": "10:00",
  "turno": "M",
  "tipoAtencion": "SIS"  // o "PAGANTE"
}
```

### Respuesta

```json
{
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "nombres": "Nombre Completo",
  "especialidad": "CODIGO_ESPECIALIDAD",
  "especialidadNombre": "Nombre de Especialidad",
  "medico": "CODIGO_MEDICO",
  "medicoNombre": "Nombre del Médico",
  "turno": "M",
  "fecha": "2025-09-25",
  "hora": "10:00",
  "correo": "correo@ejemplo.com",
  "codigo": "ABCDEF12",
  "estado": "RESERVADO",
  "tipoAtencion": "SIS"  // o "PAGANTE"
}
```

## Consideraciones Adicionales

1. **Valor por defecto**: Si no se especifica un tipo de atención, se utiliza "PAGANTE" como valor por defecto
2. **Validación**: Se realiza normalización y validación para garantizar que solo se envíen valores válidos
3. **Visualización**: Se utilizan colores diferentes para distinguir visualmente los tipos de atención
   - SIS: Azul
   - Pagante: Verde

## Pruebas

Para probar esta funcionalidad:

1. Seleccionar "Paciente SIS" en el modal de verificación SIS
2. Completar el flujo de reserva
3. Verificar en la consola del navegador que se envía el valor correcto en el payload
4. Confirmar que la respuesta de la API incluye el campo `tipoAtencion` con el valor correcto
