# 📅 Guía de Centralización de Fechas

## ✅ Centralización Completa Implementada

Todas las fechas de inicio (`startDate`) y fin (`endDate`) ahora están centralizadas en un **único punto de control**: `hooks/use-app-config.ts`

---

## 🎯 Centro de Control

### Archivo: `hooks/use-app-config.ts`

```typescript
// ------------------------------------------------------
// CENTRO ÚNICO DE CONFIGURACIÓN DE FECHAS
// ------------------------------------------------------

// Cambia esta bandera a false cuando quieras volver a fechas 100% dinámicas
const USE_TEST_DATES = true

// Fechas de prueba centralizadas
const TEST_START_DATE = '2025-08-01'
const TEST_END_DATE = '2025-08-30'

// Helper centralizado para obtener el startDate por defecto
const getDefaultStartDate = (): string => {
  return USE_TEST_DATES ? TEST_START_DATE : getTodayDate()
}

// Helper centralizado para obtener el endDate por defecto
const getDefaultEndDate = (configEndDate?: string): string => {
  if (USE_TEST_DATES) return TEST_END_DATE
  return configEndDate || getEndOfCurrentMonth()
}
```

---

## 📋 Componentes Actualizados

Todos estos componentes ahora usan `useAppConfig()` sin valores hardcodeados:

### ✅ 1. `specialty-selection-modal.tsx`
**Antes:**
```typescript
const startDate = config?.dateRange.startDate || "2025-08-01"
const endDate = config?.dateRange.endDate || "2025-08-31"
```

**Ahora:**
```typescript
const { config } = useAppConfig()
const startDate = config?.dateRange.startDate
const endDate = config?.dateRange.endDate
```

**URL generada:**
```
/v1/app-citas/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}
```

---

### ✅ 2. `appointment-type-modal.tsx`
**Antes:**
```typescript
const startDate = config?.dateRange.startDate || "2025-08-01"
const endDate = config?.dateRange.endDate || "2025-08-31"
```

**Ahora:**
```typescript
const { config } = useAppConfig()
const startDate = config?.dateRange.startDate
const endDate = config?.dateRange.endDate
```

**URL generada (para INTERCONSULTA):**
```
/v1/app-citas/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}
```

---

### ✅ 3. `doctor-selection-modal.tsx`
**Antes:**
```typescript
const startDate = config?.dateRange.startDate || "2025-08-01"
const endDate = config?.dateRange.endDate || "2025-08-31"
```

**Ahora:**
```typescript
const { config } = useAppConfig()
const startDate = config?.dateRange.startDate
const endDate = config?.dateRange.endDate
```

**URL generada:**
```
/v1/app-citas/medicos?fechaInicio=${startDate}&fechaFin=${endDate}&idEspecialidad=${id}
```

---

### ✅ 4. `date-time-selection-modal.tsx`
**Antes:**
```typescript
const startDate = config?.dateRange.startDate || "2025-08-01"
const endDate = config?.dateRange.endDate || "2025-08-31"
const [currentMonth, setCurrentMonth] = useState(parseISO(startDate))
const minDate = parseISO(startDate)
const maxDate = parseISO(endDate)
```

**Ahora:**
```typescript
const { config } = useAppConfig()
const startDate = config?.dateRange.startDate
const endDate = config?.dateRange.endDate
const [currentMonth, setCurrentMonth] = useState(() => startDate ? parseISO(startDate) : new Date())
const minDate = startDate ? parseISO(startDate) : new Date()
const maxDate = endDate ? parseISO(endDate) : new Date()
```

**URL generada:**
```
/v1/app-citas/disponibilidad?fechaInicio=${fetchStartDate}&fechaFin=${fetchEndDate}&medico=${medicoId}
```

---

### ✅ 5. `date-time-range-selection-modal.tsx`
**Antes:**
```typescript
const startDate = config?.dateRange.startDate || "2025-08-01"
const endDate = config?.dateRange.endDate || "2025-08-31"
const [currentMonth, setCurrentMonth] = useState(() => parseISO(startDate))
const minDate = parseISO(startDate)
const maxDate = parseISO(endDate)
```

**Ahora:**
```typescript
const { config } = useAppConfig()
const startDate = config?.dateRange.startDate
const endDate = config?.dateRange.endDate
const [currentMonth, setCurrentMonth] = useState(() => startDate ? parseISO(startDate) : new Date())
const minDate = startDate ? parseISO(startDate) : new Date()
const maxDate = endDate ? parseISO(endDate) : new Date()
```

**URL generada:**
```
/v1/app-citas/disponibilidad-fechas?fechaInicio=${startDate}&fechaFin=${endDate}&idEspecialidad=${id}
```

---

### ✅ 6. `chatbot-controller.tsx` (CHATBOT)
**Antes:**
```typescript
const loadSpecialties = async () => {
  try {
    const today = new Date()
    const endDate = addMonths(today, 2)
    const startStr = format(today, 'yyyy-MM-dd')
    const endStr = format(endDate, 'yyyy-MM-dd')
    
    const url = `.../especialidades?fechaInicio=${startStr}&fechaFin=${endStr}`
```

**Ahora:**
```typescript
// Al inicio del componente
const { config } = useAppConfig()
const startDate = config?.dateRange.startDate
const endDate = config?.dateRange.endDate

const loadSpecialties = async () => {
  if (!startDate || !endDate) {
    sendBotMessage("Error: No se pudo cargar la configuración de fechas...")
    return
  }
  
  try {
    // Usar fechas centralizadas de useAppConfig
    const url = `.../especialidades?fechaInicio=${startDate}&fechaFin=${endDate}`
```

**URL generada:**
```
/v1/app-citas/especialidades?fechaInicio=${startDate}&fechaFin=${endDate}
```

**Impacto:** El chatbot ahora usa las mismas fechas que los modales, garantizando consistencia en toda la aplicación.

---

## 🔄 Cómo Cambiar Entre Modos

### Modo 1: Fechas de Prueba (Actual)

En `hooks/use-app-config.ts`:

```typescript
const USE_TEST_DATES = true

const TEST_START_DATE = '2025-08-01'
const TEST_END_DATE = '2025-08-30'
```

**Resultado:**
- Todas las APIs usan: `fechaInicio=2025-08-01&fechaFin=2025-08-30`
- Calendarios muestran agosto 2025
- Datos de prueba disponibles

---

### Modo 2: Fechas Dinámicas (Producción)

En `hooks/use-app-config.ts`:

```typescript
const USE_TEST_DATES = false

// TEST_START_DATE y TEST_END_DATE ya no se usan
```

**Resultado:**
- `startDate` = Fecha actual (hoy)
- `endDate` = Último día del mes actual (o valor de `app-config.json` si existe)
- Todas las APIs usan fechas actuales automáticamente
- Calendarios muestran mes actual

---

## 🎨 Flujo de Datos

```
┌─────────────────────────────────────────┐
│     hooks/use-app-config.ts             │
│  (CENTRO ÚNICO DE CONFIGURACIÓN)        │
│                                         │
│  USE_TEST_DATES = true/false            │
│  ↓                                      │
│  getDefaultStartDate()                  │
│  getDefaultEndDate()                    │
│  ↓                                      │
│  config.dateRange.startDate             │
│  config.dateRange.endDate               │
└─────────────────┬───────────────────────┘
                  │
                  ├─────────────────────────────────┐
                  │                                 │
                  ▼                                 ▼
    ┌──────────────────────────┐    ┌──────────────────────────┐
    │ specialty-selection      │    │ appointment-type         │
    │ - Carga especialidades   │    │ - Carga especialidades   │
    │   con fechas centrales   │    │   (INTERCONSULTA)        │
    └──────────────────────────┘    └──────────────────────────┘
                  │
                  ├─────────────────────────────────┐
                  │                                 │
                  ▼                                 ▼
    ┌──────────────────────────┐    ┌──────────────────────────┐
    │ doctor-selection         │    │ date-time-selection      │
    │ - Carga médicos          │    │ - Carga horarios         │
    │   con fechas centrales   │    │ - Calendario con rango   │
    └──────────────────────────┘    └──────────────────────────┘
                  │
                  ▼
    ┌──────────────────────────┐
    │ date-time-range          │
    │ - Carga fechas disp.     │
    │ - Calendario con rango   │
    └──────────────────────────┘
```

---

## 🔍 Verificación

### Comprobar que todo usa fechas centralizadas:

1. **Abrir DevTools (F12) → Network**
2. **Navegar por el flujo de reserva**
3. **Verificar todas las llamadas a API:**

Con `USE_TEST_DATES = true`:
```
✅ /v1/app-citas/especialidades?fechaInicio=2025-08-01&fechaFin=2025-08-30
✅ /v1/app-citas/medicos?fechaInicio=2025-08-01&fechaFin=2025-08-30&...
✅ /v1/app-citas/disponibilidad?fechaInicio=2025-08-01&fechaFin=2025-08-30&...
✅ /v1/app-citas/disponibilidad-fechas?fechaInicio=2025-08-01&fechaFin=2025-08-30&...
```

Con `USE_TEST_DATES = false`:
```
✅ /v1/app-citas/especialidades?fechaInicio=2025-11-27&fechaFin=2025-11-30
✅ /v1/app-citas/medicos?fechaInicio=2025-11-27&fechaFin=2025-11-30&...
✅ /v1/app-citas/disponibilidad?fechaInicio=2025-11-27&fechaFin=2025-11-30&...
✅ /v1/app-citas/disponibilidad-fechas?fechaInicio=2025-11-27&fechaFin=2025-11-30&...
```

---

## 📝 Notas Importantes

### 1. Sin valores hardcodeados
Ya **no hay** valores por defecto como `"2025-08-01"` en ningún componente. Todo viene de `useAppConfig()`.

### 2. Manejo de undefined
Los componentes ahora manejan correctamente cuando `startDate` o `endDate` son `undefined`:

```typescript
const minDate = startDate ? parseISO(startDate) : new Date()
const maxDate = endDate ? parseISO(endDate) : new Date()
```

### 3. Actualización automática
Cuando cambias `USE_TEST_DATES`, todos los componentes se actualizan automáticamente porque todos leen de `useAppConfig()`.

### 4. Compatibilidad con app-config.json
Si existe `/public/app-config.json` con:
```json
{
  "dateRange": {
    "endDate": "2025-12-31"
  }
}
```

Y `USE_TEST_DATES = false`, entonces:
- `startDate` = hoy
- `endDate` = `"2025-12-31"` (del config)

---

## 🚀 Pasos para Cambiar a Producción

Cuando estés listo para usar fechas dinámicas:

1. **Abrir:** `hooks/use-app-config.ts`
2. **Cambiar:**
   ```typescript
   const USE_TEST_DATES = false
   ```
3. **Guardar**
4. **Reiniciar servidor** (opcional, pero recomendado):
   ```bash
   npm run dev
   ```
5. **Verificar en Network** que las fechas sean actuales

---

## 🎯 Ventajas de Esta Centralización

✅ **Un solo punto de cambio** - Cambias `USE_TEST_DATES` y todo se actualiza  
✅ **Sin duplicación** - No hay fechas hardcodeadas en múltiples archivos  
✅ **Fácil testing** - Activa/desactiva fechas de prueba en 1 línea  
✅ **Consistencia** - Todas las APIs usan el mismo rango  
✅ **Mantenible** - Fácil de entender y modificar  
✅ **Type-safe** - TypeScript valida todo correctamente  

---

## 📊 Resumen de Cambios

| Componente | Antes | Ahora | Estado |
|------------|-------|-------|--------|
| `specialty-selection-modal.tsx` | Valores hardcodeados | `useAppConfig()` | ✅ |
| `appointment-type-modal.tsx` | Valores hardcodeados | `useAppConfig()` | ✅ |
| `doctor-selection-modal.tsx` | Valores hardcodeados | `useAppConfig()` | ✅ |
| `date-time-selection-modal.tsx` | Valores hardcodeados | `useAppConfig()` | ✅ |
| `date-time-range-selection-modal.tsx` | Valores hardcodeados | `useAppConfig()` | ✅ |
| `chatbot-controller.tsx` | Calculaba fechas manualmente | `useAppConfig()` | ✅ |

**Total:** **6 componentes** completamente centralizados usando `useAppConfig()`

---

## ✨ Estado Final

🎉 **Todas las fechas están centralizadas en `use-app-config.ts`**

Para cambiar entre modo prueba y producción:
```typescript
// Modo prueba (datos de agosto 2025)
const USE_TEST_DATES = true

// Modo producción (fechas actuales)
const USE_TEST_DATES = false
```

**¡Listo para usar!**
