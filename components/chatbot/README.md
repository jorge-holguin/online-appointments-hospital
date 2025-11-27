# Sistema de Chatbot - Hospital José Agurto Tello

## 📋 Descripción

Sistema de chatbot conversacional para solicitud de citas médicas. Replica el flujo completo de la aplicación web en formato de chat tipo WhatsApp.

## 🏗️ Estructura de Archivos

```
components/chatbot/
├── chat-launcher.tsx          # Botón flotante (inferior izquierdo)
├── chatbot-controller.tsx     # Lógica del flujo conversacional
└── README.md                  # Esta documentación

app/chat/
├── page.tsx                   # Página principal del chat (UI)
└── layout.tsx                 # Layout específico para el chat

types/
└── chatbot.ts                 # Tipos TypeScript del chatbot
```

## 🚀 Características Implementadas

### ✅ Componente ChatLauncher
- **Ubicación**: Inferior izquierda (personalizable)
- **Personalización**: Avatar y texto configurables
- **Comportamiento**:
  - **Desktop**: Abre nueva pestaña/ventana (popup)
  - **Móvil**: Navegación fullscreen a `/chat`
- **Diseño**: Botón flotante con avatar circular, indicador "en línea" y animaciones

### ✅ Página ChatPage
- **Diseño**: Estilo WhatsApp
  - Header con avatar, nombre y estado
  - Área de mensajes con burbujas diferenciadas (usuario/bot)
  - Indicador de "escribiendo..."
  - Input de mensaje con emojis y adjuntos
  - Botón de enviar
- **Responsive**: Adaptado para mobile y desktop
- **Funcionalidades UI**: Auto-scroll, timestamps, estados de typing

### ✅ Tipos TypeScript
- Interfaces completas para mensajes, estados y datos
- FAQs predefinidos para tipos de paciente y citas
- Enums para flujo conversacional

## 🔄 Flujo Conversacional (A IMPLEMENTAR)

### 1. **Saludo y Recopilación de Datos**
```
Bot: "¡Hola! Antes de continuar necesito tus datos."
```

**Formulario a mostrar** (similar a `patient-registration-modal.tsx`):
- Apellidos y Nombres
- Teléfono
- Tipo de Documento (API: `GET /api/v1/app-citas/tipo-documento`)
- Número de Documento
- Dígito Verificador (solo para DNI)
- Correo Electrónico

### 2. **Tipo de Paciente**
```
Bot: "¿Qué tipo de paciente es usted?"
Opciones: [PAGANTE] [SIS] [SOAT]
```

**FAQs Interactivos**:
- **PAGANTE**: No tiene seguro SIS, paga 100% de atención
- **SIS**: Tiene seguro SIS (verificar en https://cel.sis.gob.pe/SisConsultaEnLinea)
- **SOAT**: Accidente de tránsito, seguro vehicular cubre

### 3. **Tipo de Cita**
```
Bot: "¿Qué tipo de cita tiene usted?"
Opciones: [CITADO] [INTERCONSULTA] [TRÁMITE ADMINISTRATIVO]
```

**FAQs Interactivos**:
- **CITADO**: Cita regular, referido por posta
- **INTERCONSULTA**: Referido por médico de otra especialidad
  - Cargar especialidades: `GET /api/v1/app-citas/especialidades?fechaInicio=X&fechaFin=Y`
- **TRÁMITE**: Reserva para formalizar trámite administrativo

### 4. **Selección de Especialidad**
```
Bot: "¿Qué especialidad estás buscando?"
```

Mostrar lista similar a `specialty-selection-modal.tsx`
- **API**: `GET /api/v1/app-citas/especialidades?fechaInicio={fecha}&fechaFin={fecha}`

### 5. **Método de Búsqueda**
```
Bot: "¿Cómo deseas buscar tu cita?"
Opciones: [Buscar por médico] [Buscar por fecha y hora]
```

#### **Opción A: Buscar por Médico**
1. Mostrar lista de médicos (similar a `doctor-selection-modal.tsx`)
2. Seleccionar turno: [MAÑANA] [TARDE]
3. Mostrar calendario con fechas disponibles (similar a `date-time-selection-modal.tsx`)

#### **Opción B: Buscar por Fecha y Hora**
1. Mostrar calendario con fechas disponibles
2. Mostrar médicos disponibles en esa fecha/hora

### 6. **Resumen de la Cita**
```
Bot: "Este es el resumen de su atención:"

📅 Martes, 02/12/2025 08:26hs
🏥 Especialidad: MEDICINA INTERNA
🚪 Consultorio: 1012
👨‍⚕️ Médico: Dr(a). BAZAN BETETA CARLO MAGNO
📍 Jr. Cuzco 339 - Consultorios Externos
👤 Paciente: HOLGUIN CUCALON JORGE ALBERTO
🆔 DNI: 41877141
💳 Paciente SIS
```

### 7. **Observaciones (Opcional)**
```
Bot: "¿Desea agregar una observación?"
Opciones: [Sí] [No]
```

Si elige **Sí**: Mostrar input de texto

### 8. **Confirmación Final**
```
Bot: "¿Confirma todos los datos para llegar a su cita?"
Opciones: [Sí, confirmar] [No, modificar]
```

Si confirma: Llamada a API (similar a `confirmation-modal.tsx`)
- **API**: `POST /api/v1/solicitudes?token={token}`

## 🔌 APIs a Integrar

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/api/v1/app-citas/tipo-documento` | GET | Tipos de documento |
| `/api/v1/app-citas/especialidades` | GET | Lista de especialidades |
| `/api/v1/app-citas/medicos` | GET | Médicos por especialidad |
| `/api/v1/app-citas/disponibilidad` | GET | Fechas/horas disponibles |
| `/api/v1/solicitudes` | POST | Crear solicitud de cita |

## 📝 Componentes a Reutilizar

Revisar y adaptar lógica de estos modales existentes:

1. **`patient-registration-modal.tsx`**
   - Formulario de registro
   - Validación de datos
   - Captcha

2. **`specialty-selection-modal.tsx`**
   - Carga de especialidades
   - Búsqueda y filtrado

3. **`doctor-selection-modal.tsx`**
   - Lista de médicos
   - Filtros y búsqueda

4. **`date-time-selection-modal.tsx`**
   - Calendario interactivo
   - Selección de horarios

5. **`confirmation-modal.tsx`**
   - Resumen de cita
   - Llamada a API
   - Manejo de errores

## 🛠️ Próximos Pasos para Desarrollo

### Fase 1: Flujo Básico
- [ ] Implementar máquina de estados en `chatbot-controller.tsx`
- [ ] Crear componente de formulario inline para datos personales
- [ ] Implementar botones de opciones (tipo paciente, tipo cita)
- [ ] Integrar API de tipos de documento

### Fase 2: Selección de Especialidad y Médico
- [ ] Crear componente de lista de especialidades en chat
- [ ] Integrar API de especialidades
- [ ] Crear componente de lista de médicos en chat
- [ ] Integrar API de médicos

### Fase 3: Calendario y Horarios
- [ ] Adaptar calendario para vista de chat
- [ ] Integrar API de disponibilidad
- [ ] Implementar selección de turnos

### Fase 4: Confirmación y Reserva
- [ ] Mostrar resumen en formato chat
- [ ] Implementar campo de observaciones
- [ ] Integrar API de creación de citas
- [ ] Manejo de errores y casos especiales

### Fase 5: Pulido y UX
- [ ] Agregar animaciones y transiciones
- [ ] Implementar historial de conversación
- [ ] Añadir atajos de teclado
- [ ] Optimizar para accesibilidad

## 💡 Notas de Implementación

### Estado del Chatbot
Usar un hook personalizado o contexto para manejar:
```typescript
{
  currentStep: FlowStep,
  userData: PatientData | null,
  appointmentData: AppointmentData | null,
  conversationHistory: Message[]
}
```

### Mensajes Interactivos
Los mensajes pueden tener diferentes tipos:
- `text`: Texto simple
- `options`: Botones de opción
- `form`: Formulario embebido
- `component`: Componente React personalizado
- `calendar`: Selector de calendario
- `list`: Lista seleccionable

### Validaciones
Reutilizar las funciones de validación existentes en `lib/validation.ts`:
- `validatePatientData()`
- `sanitizeInput()`
- `validatePhone()`
- `validateEmail()`

### Manejo de Errores
Implementar respuestas automáticas para:
- Errores de API
- Citas duplicadas
- Horarios no disponibles
- Sesión expirada

## 🎨 Personalización

### Avatar
Colocar imagen del avatar en `/public/avatar-jorge.png` o URL personalizada

### Colores
Los colores principales se toman de la paleta del hospital:
- `#0a2463` - Azul oscuro
- `#3e92cc` - Azul claro

### Textos
Personalizar en `chat-launcher.tsx`:
```tsx
<ChatLauncher 
  avatarUrl="/mi-avatar.png"
  text="Mi texto personalizado"
  position="left" // o "right"
/>
```

## 📱 Responsive Design

- **Mobile**: Navegación fullscreen nativa
- **Desktop**: Popup window (420x680px)
- **Tablet**: Comportamiento de desktop

## 🔒 Seguridad

- Sanitizar todos los inputs del usuario
- Validar datos antes de enviar a API
- Usar tokens de sesión efímera
- No almacenar información sensible en localStorage

## 📚 Referencias

- Modales existentes en `/components`
- Utilidades en `/lib`
- Tipos en `/types`
- APIs en `/app/api`
