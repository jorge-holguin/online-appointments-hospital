# Flujo de Subida de Archivo de Referencia SIS

## Descripción del Flujo

Este documento describe cómo se implementó el flujo para manejar archivos de referencia SIS desde el modal de verificación hasta la confirmación final.

## 1. Captura del Archivo (SIS Verification Modal)

**Archivo:** `components/sis-verification-modal.tsx`

- El usuario selecciona "Paciente SIS"
- Se habilita la opción para subir archivo de referencia
- Se valida el archivo (JPG, PNG, PDF, máximo 5MB)
- El archivo se almacena en el estado `referenceImage`
- Se pasa al siguiente modal en `patientData.referenceImage`

```typescript
patientData={{
  ...patientData,
  patientType: patientType,
  referenceImage: patientType === 'SIS' ? referenceImage : null
}}
```

## 2. Propagación del Archivo

El archivo se propaga a través de todos los modales:

1. **SIS Verification Modal** → **Specialty Selection Modal**
2. **Specialty Selection Modal** → **Doctor Selection Modal** 
3. **Doctor Selection Modal** → **Date Time Selection Modal**
4. **Date Time Selection Modal** → **Confirmation Modal**

Cada modal pasa el `patientData` completo al siguiente, manteniendo el archivo.

## 3. Subida del Archivo (Confirmation Modal)

**Archivo:** `components/confirmation-modal.tsx`

### Función de Subida

```typescript
const uploadReferenceFile = async (reservationCode: string, file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_SOLICITUDES_URL}/${reservationCode}/archivo`, {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`Error al subir archivo: ${uploadResponse.status}`)
    }
    
    const uploadResult = await uploadResponse.json()
    console.log('Archivo subido exitosamente:', uploadResult)
    
  } catch (error) {
    console.error('Error al subir archivo de referencia:', error)
  }
}
```

### Flujo de Confirmación

1. **Usuario hace clic en "Confirmar cita"**
2. **Se envía la solicitud de cita** → Obtiene código de reserva
3. **Si es paciente SIS con archivo** → Se sube el archivo usando el código
4. **Se muestra confirmación final**

```typescript
// Después de obtener el código de reserva
if (appointmentData.patient.patientType === 'SIS' && 
    appointmentData.patient.referenceImage && 
    responseData.codigo) {
  setIsUploadingFile(true)
  await uploadReferenceFile(responseData.codigo, appointmentData.patient.referenceImage)
  setIsUploadingFile(false)
}
```

## 4. API Endpoint

**URL:** `POST /api/v1/solicitudes/{codigo}/archivo`

- **Método:** POST
- **Content-Type:** multipart/form-data
- **Parámetros:**
  - `codigo`: Código de reserva obtenido de la respuesta de la cita
  - `file`: Archivo de referencia SIS

**Ejemplo de URL:**
```
http://192.168.0.252:9012/api/v1/solicitudes/MWPXV6IZ/archivo
```

## 5. Estados de UI

### Indicadores Visuales

- **Tipo de paciente:** Badge que muestra "Paciente SIS" o "Paciente Pagante"
- **Archivo adjunto:** Badge "📎 Referencia adjunta" cuando hay archivo
- **Estados de carga:**
  - "Procesando cita..." - Creando la cita
  - "Subiendo referencia..." - Subiendo el archivo

### Validaciones

- Solo pacientes SIS pueden subir archivos
- Archivos permitidos: JPG, PNG, PDF
- Tamaño máximo: 5MB
- El botón se deshabilita durante la subida

## 6. Manejo de Errores

- **Error en subida de archivo:** No interrumpe el flujo principal
- **Solo se registra en console** para debugging
- **La cita se confirma** aunque falle la subida del archivo
- **El usuario ve la confirmación** normalmente

## 7. Variables de Entorno

```env
NEXT_PUBLIC_API_SOLICITUDES_URL=http://192.168.0.252:9012/api/v1/solicitudes
```

## 8. Consideraciones de Seguridad

- **Validación de tipo de archivo** en frontend
- **Validación de tamaño** en frontend
- **El backend debe validar** nuevamente el archivo
- **Sanitización** del nombre del archivo
- **Almacenamiento seguro** en el servidor

## 9. Testing

Para probar el flujo:

1. Crear una cita como "Paciente SIS"
2. Subir un archivo de referencia (PDF/imagen)
3. Completar el flujo hasta la confirmación
4. Verificar en las herramientas de desarrollador:
   - Console logs de la subida del archivo
   - Network tab para ver la llamada POST al endpoint
   - Respuesta del servidor

## 10. Futuras Mejoras

- **Previsualización del archivo** antes de subir
- **Barra de progreso** para archivos grandes
- **Retry automático** si falla la subida
- **Notificación específica** si falla la subida del archivo
- **Validación de formato** más estricta en backend
