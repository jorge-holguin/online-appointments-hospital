# 🚀 Guía Rápida - Chatbot Widget

## ✅ Estado Actual: ESTRUCTURA COMPLETA

La estructura base del chatbot está **100% implementada y lista para usar**. Solo falta conectar la lógica conversacional.

## 🎨 Lo que YA está funcionando

### 1. Botón Flotante (ChatLauncher)
```
✅ Visible en la esquina inferior izquierda
✅ Avatar personalizable
✅ Texto personalizable
✅ Animaciones y efectos hover
✅ Indicador "en línea"
✅ Comportamiento responsive
✅ Desktop: abre popup
✅ Móvil: navegación fullscreen
```

### 2. Página de Chat (/chat)
```
✅ Diseño tipo WhatsApp
✅ Header con avatar y nombre
✅ Área de mensajes con burbujas
✅ Diferenciación usuario/bot
✅ Timestamps en mensajes
✅ Indicador "escribiendo..."
✅ Input con emojis y adjuntos
✅ Auto-scroll a nuevos mensajes
✅ Botón de enviar
✅ Responsive (mobile/desktop)
```

### 3. Componentes Auxiliares Listos
```
✅ ChatMessageOptions - Botones de opciones
✅ ChatFAQ - FAQs expandibles
✅ ChatFormField - Campos de formulario
✅ ChatbotController - Estructura de lógica
```

### 4. Tipos y Utilidades
```
✅ Interfaces de Message
✅ Tipos de MessageType
✅ FlowStep para el flujo
✅ PatientData y AppointmentData
✅ FAQs predefinidos
✅ ChatOption interface
```

## 🔌 Próximo Paso: Implementar la Lógica

### Flujo a Implementar

```
1. SALUDO
   ↓
2. SOLICITAR DATOS PERSONALES
   - Formulario: Nombre, Teléfono, Documento, Email
   ↓
3. TIPO DE PACIENTE
   - Opciones: PAGANTE / SIS / SOAT
   - FAQs explicativos
   ↓
4. TIPO DE CITA
   - Opciones: CITADO / INTERCONSULTA / TRÁMITE
   - FAQs explicativos
   ↓
5. ESPECIALIDAD
   - Lista desde API
   - Búsqueda/filtrado
   ↓
6. MÉTODO DE BÚSQUEDA
   - Por médico o por fecha
   ↓
7. SELECCIÓN MÉDICO/FECHA
   - Lista de médicos
   - Calendario interactivo
   ↓
8. RESUMEN DE CITA
   - Mostrar todos los datos
   ↓
9. OBSERVACIONES
   - Campo opcional
   ↓
10. CONFIRMACIÓN
    - Llamada a API
    - Mostrar código de reserva
```

## 📝 Código Base para Empezar

### En chatbot-controller.tsx

```typescript
import { useState, useEffect } from "react"
import { FlowStep, PatientData, AppointmentData } from "@/types/chatbot"

export default function ChatbotController({ messages, setMessages, setIsTyping }) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("greeting")
  const [userData, setUserData] = useState<PatientData | null>(null)
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null)

  // Función helper para enviar mensaje del bot
  const sendBotMessage = (content: string, type = "text", data = null) => {
    setIsTyping(true)
    setTimeout(() => {
      const botMessage = {
        id: Date.now().toString(),
        content,
        sender: "bot",
        timestamp: new Date(),
        type,
        data
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 800)
  }

  // Iniciar conversación
  useEffect(() => {
    if (currentStep === "greeting" && messages.length === 1) {
      setTimeout(() => {
        sendBotMessage("Antes de continuar, necesito tus datos.")
        setCurrentStep("requesting-data")
      }, 1000)
    }
  }, [currentStep, messages])

  // TODO: Escuchar respuestas del usuario y avanzar en el flujo
  
  return null
}
```

## 🎯 APIs a Conectar

| Paso | API | Método | Notas |
|------|-----|--------|-------|
| Datos | `/v1/app-citas/tipo-documento` | GET | Tipos de documento |
| Especialidad | `/v1/app-citas/especialidades` | GET | Con fechas |
| Médicos | (revisar modales) | GET | Por especialidad |
| Horarios | (revisar modales) | GET | Disponibilidad |
| Confirmar | `/v1/solicitudes?token=X` | POST | Crear cita |

## 💡 Tips de Implementación

### 1. Usar Máquina de Estados
```typescript
switch (currentStep) {
  case "requesting-data":
    // Mostrar formulario
    break
  case "selecting-patient-type":
    // Mostrar opciones
    break
  // ... etc
}
```

### 2. Validar en Cada Paso
```typescript
import { validatePatientData } from "@/lib/validation"

const validation = validatePatientData(userData)
if (!validation.success) {
  sendBotMessage("Por favor corrige: " + validation.errors.fullName)
  return
}
```

### 3. Reutilizar Lógica de Modales
```typescript
// Ejemplo: Cargar especialidades igual que specialty-selection-modal.tsx
const url = `${API_URL}/v1/app-citas/especialidades?fechaInicio=${start}&fechaFin=${end}`
const response = await fetch(url)
const data = await response.json()
```

## 📱 Probar el Widget

### 1. Iniciar Servidor
```bash
npm run dev
```

### 2. Abrir Navegador
```
http://localhost:3000
```

### 3. Verificar
- ✅ Botón flotante aparece abajo a la izquierda
- ✅ Click abre el chat (desktop: popup, móvil: fullscreen)
- ✅ Chat muestra mensaje inicial
- ✅ Input permite escribir

### 4. Personalizar
```tsx
// En app/page.tsx
<ChatLauncher 
  avatarUrl="/mi-avatar.png"
  text="Mi texto personalizado"
  position="left"
/>
```

## 📚 Recursos Disponibles

1. **README.md**: Documentación técnica completa
2. **EXAMPLE_IMPLEMENTATION.md**: Ejemplos de código paso a paso
3. **CHATBOT_SETUP.md**: Guía de configuración y uso
4. **Modales existentes**: Referencia para integración de APIs

## 🎨 Personalización Visual

### Cambiar Colores
Buscar y reemplazar en componentes:
- `#0a2463` → Tu color primario
- `#3e92cc` → Tu color secundario

### Cambiar Posición del Botón
```tsx
<ChatLauncher position="right" /> // Esquina derecha
```

### Cambiar Tamaño del Popup
En `chat-launcher.tsx`, línea 41:
```typescript
"width=500,height=750,resizable=yes"
```

## ✨ Características Especiales

### Auto-scroll
```typescript
// Ya implementado en ChatPage
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
```

### Indicador "Escribiendo..."
```typescript
// Ya implementado
setIsTyping(true)
// ... proceso
setIsTyping(false)
```

### Fallback de Avatar
```typescript
// Si la imagen falla, usa un SVG por defecto
onError={(e) => { e.target.src = "..." }}
```

## 🚦 Siguiente Acción Recomendada

**PASO 1**: Implementar flujo básico en `chatbot-controller.tsx`
1. Crear estado inicial
2. Solicitar datos del usuario
3. Mostrar opciones de tipo de paciente
4. Probar el flujo

**PASO 2**: Integrar primera API
1. Cargar tipos de documento
2. Mostrarlos en el formulario
3. Validar selección

**PASO 3**: Continuar con el resto del flujo
1. Seguir el orden del README.md
2. Consultar EXAMPLE_IMPLEMENTATION.md
3. Reutilizar lógica de modales existentes

## 🎉 ¡Todo Listo para Comenzar!

La estructura está **100% completa**. Solo necesitas:
1. Implementar la lógica del flujo conversacional
2. Conectar con las APIs existentes
3. Probar y ajustar

**Tiempo estimado**: 2-4 días de desarrollo para el flujo completo.

---

**¿Dudas?** Consulta la documentación en `/components/chatbot/`
