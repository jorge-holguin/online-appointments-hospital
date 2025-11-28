# 🧪 Guía de Pruebas del Chatbot

## ✅ Cambios Aplicados

### 1. Mensaje Inicial Corregido
**Antes:** "¡Hola! Soy tu asistente virtual del Hospital José Agurto Tello. ¿En qué puedo ayudarte hoy?"

**Ahora:** "¡Hola! Soy tu asistente virtual del Hospital José Agurto Tello. Estoy aquí para ayudarte a reservar una cita."

**Archivo:** `app/chat/page.tsx` línea 32

### 2. Carga de Tipos de Documento Corregida
**Problema:** El formulario se mostraba antes de que los tipos de documento se cargaran desde la API.

**Solución:** Agregada condición `documentTypes.length > 0` en el useEffect de inicialización.

**Archivo:** `components/chatbot/chatbot-controller.tsx` línea 61

---

## 🚀 Cómo Probar

### Paso 1: Abrir el Chatbot

```
http://localhost:3001
```

1. Verás el botón flotante en la **esquina inferior izquierda**
2. Click en el botón
3. Se abrirá el chat (popup en desktop, fullscreen en móvil)

### Paso 2: Verificar Mensaje Inicial

Deberías ver:
```
¡Hola! Soy tu asistente virtual del Hospital José Agurto Tello. 
Estoy aquí para ayudarte a reservar una cita.
```

### Paso 3: Esperar Carga de Datos

El bot automáticamente:
1. Carga tipos de documento desde la API
2. Después de ~2 segundos, muestra:
   ```
   Antes de continuar, necesito conocer tus datos personales 
   para poder ayudarte.
   ```
3. Muestra el **formulario interactivo**

### Paso 4: Verificar Formulario

El formulario debe tener estos campos:

✅ **Apellidos y Nombres**
- Tipo: text
- Placeholder: "Ej: PEREZ GARCIA JUAN CARLOS"

✅ **Teléfono**
- Tipo: tel
- Placeholder: "Ej: 987654321"

✅ **Tipo de Documento**
- Tipo: select (dropdown)
- Opciones cargadas desde API:
  - DNI
  - Carnet de Extranjería
  - Pasaporte
  - etc.

✅ **Número de Documento**
- Tipo: text
- Placeholder: "Ej: 12345678"

✅ **Dígito Verificador (solo DNI)**
- Tipo: text
- Placeholder: "Opcional"

✅ **Correo Electrónico**
- Tipo: email
- Placeholder: "Ej: juan@email.com"

✅ **Botón "Continuar"**
- Color azul (#3e92cc)
- Ancho completo

---

## 🔍 Verificación de Tipos de Documento

### Endpoint Llamado
```
GET ${NEXT_PUBLIC_API_APP_CITAS_URL}/v1/app-citas/tipo-documento
```

### Respuesta Esperada
```json
[
  {
    "tipoDocumento": "1",
    "nombre": "DNI"
  },
  {
    "tipoDocumento": "2",
    "nombre": "Carnet de Extranjería"
  },
  {
    "tipoDocumento": "3",
    "nombre": "Pasaporte"
  }
]
```

### Filtrado Aplicado
- ✅ Elimina elementos sin `nombre` o `tipoDocumento`
- ✅ Elimina "*Ninguno"
- ✅ Convierte a formato `{ value, label }` para el Select

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: No aparece el formulario
**Causa:** API de tipos de documento no responde o es muy lenta

**Solución:**
1. Verificar que la API esté activa
2. Revisar la consola del navegador (F12)
3. Buscar errores de CORS o red

**Verificar en consola:**
```javascript
fetch('http://192.168.0.252:9012/api/v1/app-citas/tipo-documento')
  .then(r => r.json())
  .then(console.log)
```

### Problema 2: El Select de "Tipo de Documento" está vacío
**Causa:** Los datos no se están filtrando correctamente

**Debug:**
1. Abrir DevTools (F12)
2. Ir a la pestaña "Components" (React DevTools)
3. Buscar `ChatbotController`
4. Verificar el estado `documentTypes`

**Debe mostrar:**
```javascript
documentTypes: [
  { tipoDocumento: "1", nombre: "DNI" },
  { tipoDocumento: "2", nombre: "Carnet de Extranjería" },
  // ...
]
```

### Problema 3: El formulario no valida
**Causa:** La función `validatePatientData` no está importada

**Verificar en:** `components/chatbot/chatbot-controller.tsx` línea 5
```typescript
import { validatePatientData } from "@/lib/validation"
```

### Problema 4: Error de TypeScript en imports
**Causa:** Caché de TypeScript desactualizado

**Solución:**
```bash
# Detener el servidor (Ctrl+C)
rm -rf .next
npm run dev
```

---

## ✅ Checklist de Pruebas Completas

### Flujo Básico
- [ ] El botón flotante aparece en inferior izquierda
- [ ] Click abre el chat
- [ ] Mensaje inicial correcto
- [ ] Formulario aparece después de ~2 segundos
- [ ] Todos los campos están presentes
- [ ] Select de "Tipo de Documento" tiene opciones

### Validación del Formulario
- [ ] Campos vacíos muestran error al enviar
- [ ] Email inválido muestra error
- [ ] Teléfono inválido muestra error
- [ ] DNI de 8 dígitos se valida correctamente
- [ ] Formulario válido permite continuar

### Flujo Completo (Después del Formulario)
- [ ] Aparecen opciones de tipo de paciente (PAGANTE/SIS/SOAT)
- [ ] FAQs se expanden correctamente
- [ ] Selección de tipo de paciente funciona
- [ ] Aparecen opciones de tipo de cita
- [ ] Carga de especialidades funciona
- [ ] Búsqueda de especialidades funciona
- [ ] Selección de método de búsqueda funciona
- [ ] Resumen se muestra correctamente
- [ ] Confirmación funciona

---

## 📊 Métricas de Rendimiento

### Tiempos Esperados
- Carga inicial del chat: < 1 segundo
- Carga de tipos de documento: < 2 segundos
- Aparición del formulario: ~2-3 segundos desde apertura
- Carga de especialidades: < 3 segundos
- Respuesta a cada acción: < 1 segundo

### Tamaño de Respuestas
- Tipos de documento: ~10-15 items
- Especialidades: ~50-100 items
- Médicos por especialidad: ~5-20 items

---

## 🔧 Debugging Avanzado

### Ver Estado Completo del Chatbot

Abrir consola del navegador y ejecutar:

```javascript
// En React DevTools, seleccionar ChatbotController y ver:
// - currentStep
// - userData
// - appointmentData
// - documentTypes
// - specialties
```

### Ver Mensajes del Chat

```javascript
// En React DevTools, seleccionar ChatPage y ver:
// - messages (array de todos los mensajes)
// - isTyping (boolean)
```

### Simular Respuesta Lenta de API

En `chatbot-controller.tsx`, agregar delay artificial:

```typescript
const fetchDocumentTypes = async () => {
  await new Promise(resolve => setTimeout(resolve, 5000)) // 5 segundos
  const response = await fetch(...)
  // ...
}
```

---

## 📝 Notas de Implementación

### Orden de Carga
1. **Página se carga** → Mensaje inicial aparece
2. **useEffect se ejecuta** → Fetch de tipos de documento
3. **Tipos de documento se cargan** → Trigger del segundo useEffect
4. **Segundo useEffect** → Muestra mensaje "Antes de continuar..."
5. **Después de 1 segundo** → Muestra formulario

### Dependencias del useEffect
```typescript
useEffect(() => {
  // Solo se ejecuta cuando:
  // 1. hasInitialized.current === false
  // 2. messages.length === 1 (solo mensaje inicial)
  // 3. currentStep === "greeting"
  // 4. documentTypes.length > 0 (NUEVO - espera carga)
}, [messages, currentStep, documentTypes])
```

---

## 🎯 Próximas Pruebas

Una vez que el formulario funcione correctamente:

1. **Probar validación completa**
   - Enviar formulario vacío
   - Enviar con email inválido
   - Enviar con teléfono inválido

2. **Probar flujo de tipo de paciente**
   - Seleccionar PAGANTE
   - Seleccionar SIS
   - Seleccionar SOAT
   - Verificar FAQs

3. **Probar flujo de especialidades**
   - Búsqueda funciona
   - Selección funciona
   - Transición al siguiente paso

4. **Probar flujo completo end-to-end**
   - Desde inicio hasta confirmación
   - Con datos válidos
   - Verificar código de reserva

---

## ✅ Estado Actual

- ✅ Mensaje inicial corregido
- ✅ Carga de tipos de documento corregida
- ✅ Formulario espera a que los datos se carguen
- ✅ Servidor corriendo en http://localhost:3001
- ⏳ Pendiente: Probar en navegador

**Siguiente paso:** Abrir http://localhost:3001 y verificar que el formulario aparece con las opciones de tipo de documento.
