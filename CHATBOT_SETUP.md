# Configuración y Uso del Chatbot

## 🎯 Descripción

Widget de chatbot conversacional integrado en la aplicación de citas del Hospital José Agurto Tello. Permite a los usuarios solicitar citas médicas a través de una interfaz tipo WhatsApp.

## 📦 Archivos Creados

### Componentes del Chatbot
```
components/chatbot/
├── chat-launcher.tsx              # Botón flotante
├── chatbot-controller.tsx         # Controlador de lógica
├── chat-message-options.tsx       # Componente de opciones
├── chat-faq.tsx                   # Componente de FAQ
├── chat-form-field.tsx            # Campos de formulario
├── index.ts                       # Exportaciones
├── README.md                      # Documentación técnica
└── EXAMPLE_IMPLEMENTATION.md      # Ejemplos de código
```

### Páginas
```
app/chat/
├── page.tsx                       # Interfaz del chat
└── layout.tsx                     # Layout específico
```

### Tipos
```
types/
└── chatbot.ts                     # Tipos TypeScript
```

## 🚀 Características

### ✅ Implementadas (Estructura y Diseño)

1. **ChatLauncher** - Botón flotante personalizable
   - Posición configurable (inferior izquierda por defecto)
   - Avatar y texto personalizables
   - Comportamiento adaptativo desktop/móvil
   - Animaciones y efectos visuales

2. **ChatPage** - Interfaz tipo WhatsApp
   - Header con avatar, nombre y estado
   - Área de mensajes con burbujas diferenciadas
   - Indicador de "escribiendo..."
   - Input de mensaje con emojis y adjuntos
   - Auto-scroll a mensajes nuevos
   - Diseño responsive

3. **Componentes Auxiliares**
   - `ChatMessageOptions`: Botones de opciones
   - `ChatFAQ`: FAQs expandibles
   - `ChatFormField`: Campos de formulario

4. **Tipos y Utilidades**
   - Interfaces completas para mensajes
   - Tipos para el flujo conversacional
   - FAQs predefinidos

### 🔨 Pendientes (Lógica del Chatbot)

- [ ] Máquina de estados del flujo conversacional
- [ ] Integración con APIs del sistema
- [ ] Formulario de registro de paciente
- [ ] Selección de tipo de paciente/cita
- [ ] Selección de especialidad
- [ ] Búsqueda por médico/fecha
- [ ] Calendario interactivo
- [ ] Resumen y confirmación de cita
- [ ] Manejo de errores específicos

## 📝 Uso Básico

### Personalizar el ChatLauncher

En `app/page.tsx`, el componente ya está integrado:

```tsx
<ChatLauncher 
  avatarUrl="/avatar-jorge.png"
  text="Pregúntale a Jorge"
  position="left"
/>
```

**Personalizar:**
```tsx
<ChatLauncher 
  avatarUrl="/tu-avatar.png"       // Ruta a tu imagen
  text="¿Necesitas ayuda?"          // Texto personalizado
  position="right"                  // "left" o "right"
/>
```

### Acceder al Chat

**Desktop:**
- Click en el botón → Abre popup/nueva ventana

**Móvil:**
- Click en el botón → Navega a `/chat` fullscreen

## 🎨 Personalización Visual

### Colores

Los colores principales se definen en los componentes usando las variables del hospital:
- `#0a2463` - Azul oscuro
- `#3e92cc` - Azul claro

Para cambiarlos globalmente, modificar en:
- `components/chatbot/chat-launcher.tsx`
- `app/chat/page.tsx`

### Avatar

1. Colocar imagen en `/public/avatar-jorge.png`
2. O usar URL externa: `https://...`
3. Fallback automático si la imagen no carga

### Dimensiones del Popup (Desktop)

En `components/chatbot/chat-launcher.tsx`, línea ~41:

```typescript
window.open("/chat", "_blank", "width=420,height=680,resizable=yes,scrollbars=yes")
```

Cambiar `width` y `height` según necesidades.

## 🔧 Desarrollo - Próximos Pasos

### Fase 1: Flujo Básico

1. **Implementar máquina de estados** en `chatbot-controller.tsx`:
   ```typescript
   const [currentStep, setCurrentStep] = useState<FlowStep>("greeting")
   ```

2. **Crear formulario de datos personales**:
   - Reutilizar validaciones de `patient-registration-modal.tsx`
   - Adaptar para renderizado en chat

3. **Integrar API de tipos de documento**:
   ```typescript
   GET /api/v1/app-citas/tipo-documento
   ```

### Fase 2: Selección de Especialidad

1. **Cargar especialidades desde API**:
   ```typescript
   GET /api/v1/app-citas/especialidades?fechaInicio=X&fechaFin=Y
   ```

2. **Mostrar lista interactiva** con `ChatMessageOptions`

3. **Agregar búsqueda/filtrado** similar a `specialty-selection-modal.tsx`

### Fase 3: Búsqueda y Selección de Cita

1. **Opciones de búsqueda**:
   - Por médico
   - Por fecha y hora

2. **Adaptar componentes existentes**:
   - `doctor-selection-modal.tsx` → Lista en chat
   - `date-time-selection-modal.tsx` → Calendario en chat

### Fase 4: Confirmación

1. **Mostrar resumen** formateado en el chat

2. **Campo de observaciones** opcional

3. **Llamada a API**:
   ```typescript
   POST /api/v1/solicitudes?token={token}
   ```

4. **Manejo de errores**:
   - Citas duplicadas
   - Horarios no disponibles
   - Sesión expirada

## 📚 Documentación de Referencia

- **`components/chatbot/README.md`**: Documentación técnica completa
- **`components/chatbot/EXAMPLE_IMPLEMENTATION.md`**: Ejemplos de código
- **`types/chatbot.ts`**: Tipos TypeScript disponibles

## 🧪 Testing

### Probar el Botón Flotante

1. Iniciar el servidor: `npm run dev`
2. Ir a `http://localhost:3000`
3. Verificar que aparece el botón en la esquina inferior izquierda
4. Click → Debe abrir `/chat`

### Probar la Interfaz de Chat

1. Navegar a `http://localhost:3000/chat`
2. Verificar:
   - Header con avatar y nombre
   - Área de mensajes
   - Input de mensaje funcional
   - Botón de enviar

### Responsive

1. **Desktop**: Abrir DevTools, cambiar tamaño de ventana
2. **Móvil**: Usar DevTools → Device Toolbar
3. Verificar:
   - Botón flotante se adapta
   - Chat ocupa toda la pantalla en móvil
   - Mensajes se ajustan correctamente

## 🐛 Solución de Problemas

### El botón no aparece

- Verificar que `ChatLauncher` está importado en `app/page.tsx`
- Comprobar que no hay errores en la consola
- Verificar z-index (debe ser 50)

### El chat no abre

- Revisar Next.js router (debe estar configurado correctamente)
- Verificar que existe `app/chat/page.tsx`

### Errores de TypeScript

- Ejecutar `npm install` para asegurar dependencias
- Reiniciar el servidor TypeScript en el IDE
- Verificar que todos los archivos en `types/` están correctos

### Imagen del avatar no carga

- Verificar que la imagen existe en `/public/`
- Probar con URL externa para descartar problemas de ruta
- El componente tiene fallback automático

## 🎯 Roadmap

### V1.0 - Estructura (✅ COMPLETADO)
- [x] Componente ChatLauncher
- [x] Página ChatPage
- [x] Tipos y utilidades
- [x] Componentes auxiliares
- [x] Documentación

### V2.0 - Lógica Básica (🚧 PENDIENTE)
- [ ] Máquina de estados
- [ ] Formulario de registro
- [ ] Selección de tipo de paciente
- [ ] Selección de especialidad

### V3.0 - Búsqueda y Reserva (📋 PLANIFICADO)
- [ ] Búsqueda de médicos
- [ ] Calendario de citas
- [ ] Resumen y confirmación
- [ ] Integración completa con APIs

### V4.0 - Pulido (🔮 FUTURO)
- [ ] Persistencia de conversación
- [ ] Historial de mensajes
- [ ] Mejoras de UX/UI
- [ ] Accesibilidad
- [ ] Analytics

## 🤝 Contribuir

Para agregar nueva funcionalidad:

1. Revisar `components/chatbot/README.md` para entender la estructura
2. Consultar `EXAMPLE_IMPLEMENTATION.md` para ejemplos
3. Seguir los patrones de código existentes
4. Documentar cambios importantes

## 📞 Soporte

Para preguntas sobre implementación:
- Revisar la documentación en `/components/chatbot/`
- Consultar los modales existentes como referencia
- Verificar las APIs en `/app/api/`

---

**Desarrollado por**: Unidad de Estadística e Informática / Desarrollo de Software
**Hospital**: José Agurto Tello de Chosica
