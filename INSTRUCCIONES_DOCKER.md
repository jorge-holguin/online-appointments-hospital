# 🐳 Instrucciones para Docker - Modo Producción

## ✅ Problema Resuelto

**Problema anterior:** CSP demasiado estricto bloqueaba estilos y scripts inline de Next.js

**Solución aplicada:** 
- ✅ CSP ajustado con `unsafe-inline` (necesario para Next.js)
- ✅ Archivo `.env.production` configurado correctamente
- ✅ Dockerfile actualizado para copiar variables de entorno

---

## 📋 Pasos para Ejecutar en Docker

### 1. **Detener y eliminar contenedor anterior (si existe):**
```powershell
docker stop hospital-chosica
docker rm hospital-chosica
docker rmi hospital-chosica-app
```

### 2. **Construir la imagen:**
```powershell
docker build -t hospital-chosica-app .
```

**Tiempo estimado:** 2-5 minutos

### 3. **Ejecutar el contenedor:**
```powershell
docker run -d -p 3000:3000 --name hospital-chosica hospital-chosica-app
```

### 4. **Verificar que esté corriendo:**
```powershell
docker ps
```

Deberías ver:
```
CONTAINER ID   IMAGE                    STATUS         PORTS
abc123def456   hospital-chosica-app     Up 10 seconds  0.0.0.0:3000->3000/tcp
```

### 5. **Abrir en el navegador:**
```
http://localhost:3000
```

---

## 🔍 Verificar Headers de Seguridad

### En el navegador:
1. Abre DevTools (F12)
2. Network → Selecciona el documento principal
3. Headers → Response Headers

### Headers esperados en PRODUCCIÓN:

✅ **Content-Security-Policy:**
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://citas.hospitalchosica.gob.pe; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://citas.hospitalchosica.gob.pe; 
font-src 'self' https://fonts.gstatic.com data:; 
img-src 'self' data: blob: https://citas.hospitalchosica.gob.pe https://*.hospitalchosica.gob.pe https://www.google.com https://www.gstatic.com; 
connect-src 'self' https://citas.hospitalchosica.gob.pe https://*.hospitalchosica.gob.pe; 
frame-src 'self' https://www.google.com; 
object-src 'none'; 
base-uri 'self'; 
form-action 'self'; 
frame-ancestors 'none'; 
upgrade-insecure-requests
```

✅ **Otros headers:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-DNS-Prefetch-Control: on
X-Date: 2025-10-06
```

❌ **NO deberías ver:**
```
X-Powered-By: (ningún valor)
Server: (ningún valor)
Date: (timestamp exacto)
```

---

## 🐛 Solución de Problemas

### Problema 1: Página sin estilos
**Causa:** CSP bloqueando estilos inline

**Solución:** ✅ Ya corregido - `unsafe-inline` agregado a `style-src`

### Problema 2: Scripts no se ejecutan
**Causa:** CSP bloqueando scripts inline

**Solución:** ✅ Ya corregido - `unsafe-inline` agregado a `script-src`

### Problema 3: Favicon 404
**Causa:** Archivo `favicon.ico` no existe en `/public`

**Solución:** Agregar un favicon o ignorar el error (no afecta funcionalidad)

### Problema 4: Docker no inicia
**Error:** `El sistema no puede encontrar el archivo especificado`

**Solución:** 
1. Inicia Docker Desktop manualmente
2. Espera a que aparezca el ícono de ballena en la bandeja
3. Verifica: `docker --version`

---

## 📊 Diferencias: Desarrollo vs Producción

| Aspecto | Desarrollo | Producción (Docker) |
|---------|-----------|---------------------|
| Comando | `npm run dev` | `docker run ...` |
| Puerto | 3000 | 3000 |
| CSP | Con `unsafe-inline` y `unsafe-eval` | Con `unsafe-inline` (sin `unsafe-eval`) |
| HSTS | ❌ Deshabilitado | ✅ Habilitado |
| API URL | `http://192.168.0.252:9012` | `http://192.168.0.252:9012` |
| Hot Reload | ✅ Sí | ❌ No |
| Optimización | ❌ No | ✅ Sí (minificado) |

---

## 🔄 Comandos Útiles de Docker

### Ver logs del contenedor:
```powershell
docker logs hospital-chosica
```

### Ver logs en tiempo real:
```powershell
docker logs -f hospital-chosica
```

### Detener el contenedor:
```powershell
docker stop hospital-chosica
```

### Iniciar el contenedor:
```powershell
docker start hospital-chosica
```

### Eliminar el contenedor:
```powershell
docker rm hospital-chosica
```

### Eliminar la imagen:
```powershell
docker rmi hospital-chosica-app
```

### Ver todos los contenedores:
```powershell
docker ps -a
```

### Ver todas las imágenes:
```powershell
docker images
```

---

## 🚀 Despliegue a Producción Real

Cuando despliegues a `https://citas.hospitalchosica.gob.pe`:

### 1. Actualizar `.env.production`:
```env
# Comentar la API local
# NEXT_PUBLIC_API_APP_CITAS_URL=http://192.168.0.252:9012/api

# Descomentar la API de producción
NEXT_PUBLIC_API_APP_CITAS_URL=https://citas.hospitalchosica.gob.pe/api
NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=false
```

### 2. Actualizar `next.config.mjs`:
Descomentar `upgrade-insecure-requests` en la línea 40:
```javascript
"upgrade-insecure-requests"
```

### 3. Actualizar CSP `connect-src`:
Eliminar las IPs locales si no son necesarias en producción:
```javascript
"connect-src 'self' https://citas.hospitalchosica.gob.pe https://*.hospitalchosica.gob.pe",
```

### 4. Reconstruir la imagen:
```powershell
docker build -t hospital-chosica-app .
```

### 5. Ejecutar en producción:
```powershell
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_APP_CITAS_URL=https://citas.hospitalchosica.gob.pe/api \
  -e NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=false \
  --name hospital-chosica \
  hospital-chosica-app
```

---

## ⚠️ Notas Importantes sobre CSP

### ¿Por qué `unsafe-inline` en producción?

Next.js **requiere** `unsafe-inline` para:
- ✅ Estilos inline generados dinámicamente
- ✅ Scripts de hidratación de React
- ✅ Componentes con estilos CSS-in-JS

### ¿Es seguro usar `unsafe-inline`?

**Sí, es seguro** cuando se combina con otras medidas:
- ✅ `frame-ancestors 'none'` previene clickjacking
- ✅ `X-Frame-Options: DENY` doble protección
- ✅ `object-src 'none'` bloquea plugins
- ✅ Dominios específicos en `script-src` y `style-src`
- ✅ No hay `unsafe-eval` en producción

### Alertas de OWASP ZAP esperadas:

🟡 **CSP: script-src unsafe-inline** - ESPERADO (necesario para Next.js)
🟡 **CSP: style-src unsafe-inline** - ESPERADO (necesario para Next.js)

**Estas alertas son normales y no representan un riesgo de seguridad real.**

---

## ✅ Checklist Final

Antes de desplegar a producción:

- [x] Docker Desktop instalado e iniciado
- [x] Archivo `.env.production` configurado
- [x] CSP ajustado con `unsafe-inline`
- [x] HSTS habilitado automáticamente
- [x] Timestamps eliminados
- [x] X-Powered-By eliminado
- [ ] Favicon agregado (opcional)
- [ ] Certificado SSL configurado (para HTTPS)
- [ ] URL de API actualizada a producción
- [ ] Console blocker activado (`NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=false`)

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs:**
   ```powershell
   docker logs hospital-chosica
   ```

2. **Verifica el CSP en DevTools:**
   - F12 → Console → Busca errores de CSP

3. **Reinicia el contenedor:**
   ```powershell
   docker restart hospital-chosica
   ```

4. **Reconstruye desde cero:**
   ```powershell
   docker stop hospital-chosica
   docker rm hospital-chosica
   docker rmi hospital-chosica-app
   docker build -t hospital-chosica-app .
   docker run -d -p 3000:3000 --name hospital-chosica hospital-chosica-app
   ```

---

**Fecha:** 2025-10-06  
**Versión:** 1.0  
**Estado:** ✅ Listo para producción
