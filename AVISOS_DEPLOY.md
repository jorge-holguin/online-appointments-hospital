# ✅ Checklist de Despliegue a Producción

## 🔧 Configuraciones a Activar en Producción

### 1. **HSTS (Strict-Transport-Security)**
📁 Archivo: `next.config.mjs`

**Descomentar líneas 66-69:**
```javascript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains; preload'
},
```

---

### 2. **Upgrade Insecure Requests**
📁 Archivo: `next.config.mjs`

**Descomentar línea 36:**
```javascript
"upgrade-insecure-requests"
```

---

### 3. **Variables de Entorno**
📁 Archivo: `.env`

**Actualizar a URLs de producción:**
```env
NEXT_PUBLIC_API_APP_CITAS_URL=https://citas.hospitalchosica.gob.pe/api
NEXT_PUBLIC_HOSPITAL_NAME="Hospital José Agurto Tello de Chosica"
NEXT_PUBLIC_HOSPITAL_ADDRESS="Jr. Cuzco 274 - Chosica"
NEXT_PUBLIC_HOSPITAL_LOCATION="Consultorios Externos HJATCH"
NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=false
```

---

### 4. **Bloqueo de Consola (Opcional)**
📁 Archivos: `app/layout.tsx` y `components/security/console-blocker.tsx`

**Si deseas activar el bloqueo de consola en producción:**

**En `app/layout.tsx` (descomentar líneas 19, 26-28, 32):**
```typescript
const allowConsoleAccess = process.env.NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS === 'true'

{!allowConsoleAccess && (
  <script src="/js/console-blocker.js"></script>
)}

{!allowConsoleAccess && <ConsoleBlocker />}
```

**En `components/security/console-blocker.tsx` (eliminar línea 13):**
```typescript
// Eliminar esta línea:
return
```

---

## 🚫 Configuraciones para Desarrollo

### Headers Deshabilitados en Desarrollo

1. ❌ **HSTS** - Comentado (requiere HTTPS)
2. ❌ **upgrade-insecure-requests** - Comentado (requiere HTTPS)
3. ❌ **Console Blocker** - Deshabilitado (facilita debugging)

### Por qué están deshabilitados

**HSTS y upgrade-insecure-requests causan errores en desarrollo porque:**
- Fuerzan el uso de HTTPS
- El servidor de desarrollo usa HTTP (localhost:3000)
- Otros computadores intentan conectarse por HTTPS y fallan con `ERR_SSL_PROTOCOL_ERROR`

---

## 🌐 Acceso desde Otros Computadores en Desarrollo

### Problema Actual
Cuando accedes desde otro computador a `http://192.168.x.x:3000`, el navegador intenta forzar HTTPS debido a HSTS.

### Solución Aplicada
✅ HSTS comentado en desarrollo
✅ upgrade-insecure-requests comentado en desarrollo

### Cómo Acceder desde Otro Computador

1. **Asegúrate que el servidor esté corriendo:**
   ```bash
   npm run dev
   ```

2. **Encuentra tu IP local:**
   ```bash
   ipconfig
   ```
   Busca: `IPv4 Address`

3. **Accede desde otro computador:**
   ```
   http://TU_IP:3000
   ```
   Ejemplo: `http://192.168.1.100:3000`

4. **Si aún hay problemas, limpia caché del navegador:**
   - Chrome: `Ctrl + Shift + Delete` → Borrar datos de navegación
   - O en Incógnito: `Ctrl + Shift + N`

---

## 🔒 Verificación de Seguridad en Producción

### Headers que DEBEN estar activos en producción:

✅ Content-Security-Policy  
✅ X-Frame-Options: DENY  
✅ X-Content-Type-Options: nosniff  
✅ Referrer-Policy  
✅ Permissions-Policy  
✅ X-XSS-Protection  
✅ **Strict-Transport-Security** (HSTS)  
✅ **upgrade-insecure-requests** en CSP  

### Cómo verificar:

1. Abre DevTools (F12)
2. Network → Selecciona el documento principal
3. Headers → Response Headers
4. Verifica que todos los headers estén presentes

---

## 📝 Notas Importantes

### Desarrollo (HTTP)
- HSTS: ❌ Deshabilitado
- upgrade-insecure-requests: ❌ Deshabilitado
- Console Access: ✅ Permitido
- URL: `http://localhost:3000` o `http://IP_LOCAL:3000`

### Producción (HTTPS)
- HSTS: ✅ Habilitado
- upgrade-insecure-requests: ✅ Habilitado
- Console Access: ❌ Bloqueado (opcional)
- URL: `https://citas.hospitalchosica.gob.pe`

---

## 🐛 Solución de Problemas

### Error: ERR_SSL_PROTOCOL_ERROR en desarrollo

**Causa:** HSTS o upgrade-insecure-requests están activos

**Solución:**
1. Verifica que HSTS esté comentado en `next.config.mjs`
2. Verifica que upgrade-insecure-requests esté comentado
3. Limpia caché del navegador
4. Reinicia el servidor: `npm run dev`

### Error: Cannot find module 'lib/worker.js'

**Causa:** Caché corrupta de Next.js

**Solución:**
```bash
Remove-Item -Path ".next" -Recurse -Force
npm run dev
```

---

## ✅ Checklist Final para Producción

- [ ] Descomentar HSTS en `next.config.mjs`
- [ ] Descomentar upgrade-insecure-requests en `next.config.mjs`
- [ ] Actualizar `.env` con URLs de producción
- [ ] Configurar `NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=false`
- [ ] (Opcional) Activar Console Blocker
- [ ] Verificar que el dominio tenga certificado SSL válido
- [ ] Probar todos los headers de seguridad
- [ ] Ejecutar `npm run build` sin errores
- [ ] Verificar que todas las APIs funcionen correctamente

---

**Fecha de última actualización:** 2025-10-06  
**Versión:** 1.0
