# 🎓 Guía de Pruebas: Desafío de Seguridad e Infraestructura
## Proyecto: Leños Rellenos (Backend & Frontend)

---

**Estudiante:** Alansillo  
**Asignatura:** Frameworks para el Desarrollo Web - U3  
**Fecha:** 15 de Abril, 2026  
**Estado del Proyecto:** 🟢 100% Implementado (Prácticas 1, 2 y 3)

---

## 📋 Introducción
Esta guía permite verificar paso a paso la implementación de las medidas de seguridad, autenticación y despliegue del proyecto. Siga las secciones en orden para una demostración exitosa.

> [!IMPORTANT]
> **Requisito para PowerShell:** Si utiliza la terminal de PowerShell en Windows, ejecute el comando de **Bypass SSL** en la sección de Preparación para permitir la conexión con certificados auto-firmados sin errores.

---

## 🔧 1. CONFIGURACIÓN INICIAL (Preparación)

### 1.1 Bypass de Seguridad SSL (Solo PowerShell)
Ejecute este comando para configurar la sesión actual y permitir peticiones HTTPS a `localhost`:

```powershell
# Permitir certificados auto-firmados y habilitar protocolos TLS modernos
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
```

### 1.2 Iniciar la Infraestructura
Asegúrese de estar en la carpeta `lenos-backend` y ejecute:

```powershell
docker-compose up -d
```

### 1.3 Verificar Salud del Sistema
```powershell
docker-compose ps
```
**Resultado Esperado:** 
* `lenos-backend`: Status **Up (healthy)** 🟢
* `lenos-nginx`: Status **Up** 🟢

---

## 🛡️ 2. PRÁCTICA 1: Seguridad del API y Sanitización

### 2.1 Cabeceras de Seguridad (Helmet)
Verificamos que Nginx y el Backend entregan las cabeceras recomendadas por OWASP.

```powershell
curl.exe -k -I https://localhost/nginx-health
```
**Debe mostrar:** `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`.

### 2.2 Sanitización XSS (Prueba de Inyección)
Intentamos enviar un script malicioso. El sistema debe eliminar las etiquetas `<script>`.

```powershell
$body = '{"texto":"<script>alert(''Ataque XSS'')</script>"}'
Invoke-RestMethod -Uri "https://localhost/api/v1/comentarios" -Method Post -ContentType "application/json" -Body $body
```
**Resultado:** El JSON de respuesta muestra `"texto": ""` (o el texto sin el script).

### 2.3 Rate Limiting (Protección Anti-DoS)
Enviamos 15 peticiones rápidas. El sistema debe bloquear a partir de la 11ª.

```powershell
Write-Host "Enviando ráfaga de 15 peticiones..." -ForegroundColor Cyan
for ($i=1; $i -le 15; $i++) {
    try {
        $r = Invoke-RestMethod -Uri "https://localhost/api/v1/comentarios" -Method Post -ContentType "application/json" -Body '{"texto":"Prueba de Rate Limit"}'
        Write-Host "  Petición $i : HTTP 200 (OK)" -ForegroundColor Gray
    } catch {
        $code = $_.Exception.Response.StatusCode.Value__
        $color = if($code -eq 429) { "Red" } else { "Yellow" }
        Write-Host "  Petición $i : HTTP $code" -ForegroundColor $color
    }
}
```

---

## 🔐 3. PRÁCTICA 2: Autenticación JWT y Bcrypt

### 3.1 Flujo en el Frontend (Demostración Visual)
1. Navegue a `http://localhost:5173/signup`.
2. Cree un nuevo usuario: `test_profe` / `password123`.
3. El sistema lo redirigirá al **Login**.
4. Inicie sesión. Notará que ahora aparece el botón **"Panel Admin"** y un botón de **"Salir"** en la barra superior.

### 3.2 Protección de Rutas (Middleware JWT)
Intente entrar directamente a `http://localhost:5173/admin` después de cerrar sesión (o en modo incógnito).
**Resultado:** El sistema lo redirige automáticamente al Login. 🔒

### 3.3 Verificación Técnica del Token
Obtenga el token mediante PowerShell y valídelo en [JWT.io](https://jwt.io).

```powershell
$auth = @{ username="test_profe"; password="password123" } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/usuario/login" -Method Post -ContentType "application/json" -Body $auth
Write-Host "Token JWT generado:" -ForegroundColor Green
$res.token
```

---

## 🏰 4. PRÁCTICA 3: El Guardián del API (Infraestructura)

### 4.1 Aislamiento de Red (Redes Privadas)
El backend NO debe ser accesible directamente, solo a través del proxy Nginx.

```powershell
# Intentar acceso directo (Debe fallar)
curl.exe --connect-timeout 2 http://localhost:3000/
```
**Resultado:** `Connection refused`. ✅ (Aislamiento exitoso).

### 4.2 Endurecimiento TLS 1.3
Verificamos que el servidor SOLO acepta conexiones seguras y modernas.

```powershell
# Acceso por HTTPS (Exitoso)
curl.exe -k https://localhost/

# Intentar acceso con TLS 1.2 (Debe ser RECHAZADO)
curl.exe -k --tlsv1.2 --tls-max 1.2 https://localhost/
```
**Resultado:** La conexión TLS 1.2 debe fallar con error de protocolo.

### 4.3 Auditoría de Logs (Nginx)
Mostramos cómo Nginx registra y proxifica las peticiones.

```powershell
docker-compose logs --tail=5 web-server
```

---

## 📊 Checklist Final de Entrega

| Requisito | Tecnología | Estado |
| :--- | :--- | :---: |
| **Cabeceras Seguras** | Helmet | ✅ |
| **Sanitización XSS** | DOMPurify / JSDOM | ✅ |
| **Inyección NoSQL** | mongo-sanitize | ✅ |
| **Rate Limiting** | express-rate-limit | ✅ |
| **Hash Contraseñas** | bcrypt (10 salt rounds) | ✅ |
| **Autenticación** | JWT (Stateless) | ✅ |
| **Dockerización** | Multi-stage build | ✅ |
| **Seguridad Docker** | Non-root User | ✅ |
| **Proxy Inverso** | Nginx | ✅ |
| **Cifrado** | TLS 1.3 Únicamente | ✅ |

---

## 🧪 SCRIPT DE PRUEBA AUTOMÁTICO
Si desea una demostración rápida de todos los puntos de seguridad del backend, ejecute:

```powershell
.\test-seguridad.ps1
```

---

**Firma del Estudiante:** Alansillo  
**Leños Rellenos S.A. de C.V.** 🍞🔥
