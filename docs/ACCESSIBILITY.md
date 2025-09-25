# Guía de Accesibilidad

## Solución a Warnings de Accesibilidad

### 1. Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}

Este warning indica que los componentes `DialogContent` no tienen una descripción accesible, lo cual es importante para la accesibilidad web (a11y).

#### Solución Implementada:

1. **Agregar `DialogDescription` a todos los modales**:
   ```tsx
   <DialogHeader>
     <DialogTitle>Título del Modal</DialogTitle>
     <DialogDescription>
       Descripción del propósito del modal
     </DialogDescription>
   </DialogHeader>
   ```

2. **Para casos donde la descripción no debe ser visible**:
   ```tsx
   <DialogDescription className="sr-only">
     Descripción solo para lectores de pantalla
   </DialogDescription>
   ```

### 2. Warning: [Violation] Added non-passive event listener to a scroll-blocking 'touchstart' event

Este warning ocurre cuando se agregan event listeners para eventos touch que podrían bloquear el scroll, lo que puede afectar el rendimiento en dispositivos móviles.

#### Solución Implementada:

1. **Script global para hacer pasivos los eventos touch**:
   - Creado archivo `/public/js/passive-events.js`
   - Sobrescribe `addEventListener` para hacer pasivos los eventos touch por defecto
   - Incluido en el layout principal con:
     ```tsx
     <head>
       <script src="/js/passive-events.js" async></script>
     </head>
     ```

### 3. Componentes de Accesibilidad Creados

1. **`AccessibleDescription`**:
   - Componente para proporcionar descripciones accesibles
   - Puede ser visible o solo para lectores de pantalla
   - Genera IDs únicos automáticamente

2. **`useAccessibleDescription` Hook**:
   - Facilita la creación de descripciones accesibles
   - Proporciona props para conectar elementos con sus descripciones

3. **Utilidades de Accesibilidad**:
   - `lib/accessibility-utils.ts` contiene funciones útiles para accesibilidad
   - Generación de IDs, combinación de props, verificación de contraste, etc.

## Mejores Prácticas Implementadas

1. **Descripciones para todos los diálogos**:
   - Cada modal tiene una descripción clara de su propósito
   - Las descripciones son concisas y específicas

2. **Elementos ocultos visualmente pero accesibles para lectores de pantalla**:
   - Uso de la clase `sr-only` para contenido solo para lectores de pantalla

3. **Eventos pasivos para mejor rendimiento**:
   - Los eventos touch no bloquean el scroll
   - Mejora la experiencia en dispositivos móviles

4. **Atributos ARIA adecuados**:
   - `aria-describedby` para conectar elementos con sus descripciones
   - `aria-label` para proporcionar etiquetas accesibles

## Cómo Usar los Componentes de Accesibilidad

### Ejemplo con `AccessibleDescription`:

```tsx
import { AccessibleDescription } from "@/components/ui/accessible-description";

function MyComponent() {
  return (
    <div>
      <button aria-describedby="button-desc">Guardar</button>
      <AccessibleDescription 
        id="button-desc" 
        text="Guarda los cambios actuales" 
      />
    </div>
  );
}
```

### Ejemplo con `useAccessibleDescription` Hook:

```tsx
import { useAccessibleDescription } from "@/components/ui/accessible-description";

function MyComponent() {
  const { description, describedByProps } = useAccessibleDescription(
    "Guarda los cambios actuales"
  );
  
  return (
    <div>
      <button {...describedByProps}>Guardar</button>
      {description}
    </div>
  );
}
```

## Verificación de Accesibilidad

Para verificar que los problemas han sido resueltos:

1. Abrir la consola del navegador
2. Verificar que no aparecen los warnings mencionados
3. Usar herramientas como Lighthouse o axe para una evaluación completa

## Referencias

- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/)
- [MDN Web Docs: ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
