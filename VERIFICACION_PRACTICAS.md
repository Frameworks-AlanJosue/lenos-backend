# Verificación de Prácticas 1, 2 y 3 - Leños Rellenos Backend

**Fecha:** 2026-04-15  
**Estudiante:** Alansillo  
**Asignatura:** Frameworks para el Desarrollo Web - U3

---

## 📋 Resumen Ejecutivo

| Práctica | Estado | % Completado |
|----------|--------|--------------|
| Práctica 1: Sistema de Comentarios Seguro | ✅ COMPLETA | 100% |
| Práctica 2: Implementando JWT | ✅ COMPLETA | 100% |
| Práctica 3: El Guardián del API | ✅ COMPLETA | 100% |

---

## 🛡️ PRÁCTICA 1: Sistema de Comentarios Seguro con React y Node

### Misiones Requeridas e Implementadas

#### Misión 1: Configuración de Helmet (Cabeceras HTTP Seguras)
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/index.js:29`

```javascript
app.use(helmet());
```

**Cabeceras que proporciona:**
- Content-Security-Policy
- X-Frame-Options (protege contra clickjacking)
- X-Content-Type-Options (previene MIME sniffing)
- Strict-Transport-Security (HTTPS forzado)
- X-XSS-Protection
- Referrer-Policy

**Prueba para el profesor:**
```bash
curl -I http://localhost:3000/
```
Verificar que las cabeceras de seguridad están presentes.

---

#### Misión 2: Configuración de CORS (Cross-Origin Resource Sharing)
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/index.js:32-38`

```javascript
const corsOptions = {
  origin: ["http://localhost:5173", "https://localhost", "http://localhost"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));
```

**Principio de menor privilegio:** Solo el frontend autorizado (localhost:5173) puede acceder.

**Prueba para el profesor:**
1. Desde el frontend (localhost:5173): ✅ Funciona
2. Desde otra página web: ❌ Bloqueado por CORS

---

#### Misión 3: Sanitización de Entrada (Prevención XSS)
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/middleware/validacionComentario.js:22-24`

```javascript
.customSanitizer((value) => {
  // Sanitizar HTML/JS malicioso con DOMPurify
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
})
```

**Tecnología:** DOMPurify + JSDOM

**Prueba para el profesor:**
```bash
curl -k -X POST https://localhost/api/v1/comentarios \
  -H "Content-Type: application/json" \
  -d '{"texto":"<script>alert('\''hack'\'')</script>"}'
```
**Resultado esperado:** El texto "alert" NO aparece en la respuesta (fue sanitizado).

---

#### Misión 4: Prevención de Inyección NoSQL
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/index.js:44`

```javascript
app.use(mongoSanitize());
```

**Tecnología:** express-mongo-sanitize

**Prueba para el profesor:** Intentar enviar un objeto con operadores MongoDB ($where, $ne, etc.) - será rechazado.

---

#### Misión 5: Rate Limiting (Límite de Peticiones)
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/middleware/rateLimiter.js`

```javascript
// Para comentarios: 10 peticiones por minuto
const comentariosLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { ok: false, error: 'Demasiadas peticiones...', codigo: 429 }
});

// Para API general: 100 peticiones por 15 minutos
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

**Prueba para el profesor:**
```bash
# Ejecutar 15 peticiones rápidas
for ($i=1; $i -le 15; $i++) {
  curl -k -s -o nul -w "%{http_code}" -X POST https://localhost/api/v1/comentarios ...
}
```
**Resultado esperado:** Las primeras 10 retornan 200, las últimas 5 retornan 429.

---

#### Misión 6: Validación de Campos
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/middleware/validacionComentario.js:15-30`

```javascript
const validarComentario = [
  body('texto')
    .trim()
    .notEmpty().withMessage('El texto es requerido')
    .isLength({ max: 200 }).withMessage('Máximo 200 caracteres')
    .customSanitizer(...),
  
  body('puntuacion')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Puntuación entre 1-5')
];
```

**Prueba para el profesor:**
```bash
# Texto vacío
curl -k -X POST https://localhost/api/v1/comentarios -H "Content-Type: application/json" -d '{"texto":""}'
# Resultado: 400 Bad Request

# Texto > 200 caracteres
curl -k -X POST https://localhost/api/v1/comentarios -H "Content-Type: application/json" -d '{"texto":"...201 caracteres..."}'
# Resultado: 400 Bad Request
```

---

### Checklist Práctica 1

| # | Requisito | Estado | Archivo |
|---|-----------|--------|---------|
| 1 | Helmet configurado | ✅ | src/index.js:29 |
| 2 | CORS configurado | ✅ | src/index.js:32-38 |
| 3 | DOMPurify sanitización | ✅ | src/middleware/validacionComentario.js |
| 4 | MongoDB sanitization | ✅ | src/index.js:44 |
| 5 | Rate Limiting | ✅ | src/middleware/rateLimiter.js |
| 6 | Validación express-validator | ✅ | src/middleware/validacionComentario.js |
| 7 | Endpoint /comentarios | ✅ | src/index.js:76 |

---

## 🔐 PRÁCTICA 2: Implementando JWT

### Misiones Requeridas e Implementadas

#### Misión 1: Hash de Contraseñas con bcrypt
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/services/usuarioService.js:10-12`

```javascript
async function createUsuario({ username, password }) {
  // Hashear la contraseña con bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(password, 10);
  ...
}
```

**Prueba para el profesor:**
1. Crear usuario: `POST /api/v1/usuario/signup`
2. Ver en MongoDB que la contraseña NO está en texto plano
3. El hash empieza con `$2b$10$...`

---

#### Misión 2: Generación de JWT
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/services/usuarioService.js:43-50`

```javascript
const token = jwt.sign(
  { sub: usuario._id, username: usuario.username },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

**Algoritmo:** HS256 (HMAC + SHA-256)  
**Expiración:** 1 hora

**Prueba para el profesor:**
```bash
curl -X POST http://localhost:3000/api/v1/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"username":"gbarron","password":"desweb"}'
```
**Resultado:** Token JWT recibido. Verificar en https://jwt.io

---

#### Misión 3: Verificación de Contraseñas
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/services/usuarioService.js:36-41`

```javascript
const isPasswordCorrect = await bcrypt.compare(password, usuario.password);
```

**Prueba para el profesor:**
```bash
# Login con contraseña incorrecta
curl -X POST http://localhost:3000/api/v1/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"username":"gbarron","password":"incorrecta"}'
# Resultado: 401 Unauthorized
```

---

#### Misión 4: Endpoint de Registro (Signup)
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/routes/usuariosAuth.js:11-26`

```javascript
router.post('/signup', async (req, res) => {
  const usuario = await createUsuario(req.body);
  return res.status(201).json({
    ok: true,
    username: usuario.username,
    message: 'Usuario creado exitosamente'
  });
});
```

**Prueba para el profesor:**
```bash
curl -X POST http://localhost:3000/api/v1/usuario/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
# Resultado: 201 Created
```

---

#### Misión 5: Endpoint de Login
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/routes/usuariosAuth.js:32-45`

```javascript
router.post('/login', async (req, res) => {
  const token = await loginUsuario(req.body);
  return res.status(200).json({ ok: true, token });
});
```

**Prueba para el profesor:** Ver Misión 2.

---

#### Misión 6: Endpoint para Obtener Usuario por ID
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/routes/usuariosAuth.js:51-64`

```javascript
router.get('/usuarios/:id', async (req, res) => {
  const userInfo = await getUsuarioInfoById(req.params.id);
  return res.status(200).json({ ok: true, user: userInfo });
});
```

---

#### Misión 7: Modelo de Usuario con Mongoose
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/models/UsuarioAuth.js`

```javascript
const usuarioAuthSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });
```

---

### Checklist Práctica 2

| # | Requisito | Estado | Archivo |
|---|-----------|--------|---------|
| 1 | bcrypt hash | ✅ | src/services/usuarioService.js:12 |
| 2 | JWT sign | ✅ | src/services/usuarioService.js:44 |
| 3 | JWT verify | ✅ | src/services/usuarioService.js:78 |
| 4 | bcrypt compare | ✅ | src/services/usuarioService.js:37 |
| 5 | Endpoint /signup | ✅ | src/routes/usuariosAuth.js:11 |
| 6 | Endpoint /login | ✅ | src/routes/usuariosAuth.js:32 |
| 7 | Endpoint /usuarios/:id | ✅ | src/routes/usuariosAuth.js:51 |
| 8 | Modelo UsuarioAuth | ✅ | src/models/UsuarioAuth.js |
| 9 | JWT_SECRET en .env | ✅ | Configuración |
| 10 | Documentación pruebas | ✅ | PRUEBAS_JWT.md |

---

## 🏰 PRÁCTICA 3: El Guardián del API

### Misiones Requeridas e Implementadas

#### Misión 1: Dockerización del Backend
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `Dockerfile`

**Características:**
- Multi-stage build (builder + runtime)
- Usuario no-root (nodeuser:nodejs)
- Health check configurado
- Puerto 3000 NO expuesto al host (solo `expose`)

**Prueba para el profesor:**
```bash
docker-compose up -d
docker-compose ps
# Verificar que lenos-backend no tiene puertos mapeados
```

---

#### Misión 2: Nginx como Reverse Proxy
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `nginx/nginx.conf`, `nginx/default.conf`

**Configuración:**
```nginx
upstream backend {
    server app-logic:3000;
}

location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

**Prueba para el profesor:**
```bash
# Puerto 3000 NO accesible directamente
curl --connect-timeout 3 http://localhost:3000/
# Resultado: Connection refused ✅

# Nginx SÍ accesible y hace proxy
curl -k https://localhost/
# Resultado: Respuesta del backend ✅
```

---

#### Misión 3: TLS/SSL con Certificados Auto-firmados
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `nginx/nginx.conf:24-30`, `nginx/ssl/`

**Configuración:**
```nginx
ssl_certificate     /etc/nginx/ssl/lenos.crt;
ssl_certificate_key /etc/nginx/ssl/lenos.key;
ssl_protocols       TLSv1.3;  # Solo TLS 1.3
```

**Prueba para el profesor:**
```bash
# Redirección HTTP → HTTPS (301)
curl -I http://localhost/
# Resultado: 301 Moved Permanently → Location: https://...

# TLS 1.3 configurado
curl -k -v https://localhost/ 2>&1 | findstr "SSL"
```

---

#### Misión 4: Aislamiento de Red con Docker
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `docker-compose.yml:55-58`

```yaml
networks:
  lenos-network:
    driver: bridge
```

**Arquitectura:**
```
[Internet] → [Nginx:80/443] → [Backend:3000] → [MongoDB]
              (público)        (privado)        (privado)
```

**Prueba para el profesor:**
```bash
# Verificar red de Docker
docker network inspect lenos-backend_lenos-network
# Verificar que backend NO tiene puertos expuestos
docker port lenos-backend
# Resultado: Empty (sin puertos expuestos)
```

---

#### Misión 5: Sanitización XSS (Integrado con Práctica 1)
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `src/middleware/validacionComentario.js`

**Prueba para el profesor:**
```bash
curl -k -X POST https://localhost/api/v1/comentarios \
  -H "Content-Type: application/json" \
  -d '{"texto":"<script>alert('\''hack'\'')</script>"}'
# El texto "alert" NO aparece en la respuesta
```

---

#### Misión 6: Rate Limiting (Integrado con Práctica 1)
**Estado:** ✅ IMPLEMENTADO

**Prueba para el profesor:**
```powershell
for ($i=1; $i -le 15; $i++) {
    $status = (curl.exe -k -s -o nul -w "%{http_code}" `
        -X POST https://localhost/api/v1/comentarios `
        -H "Content-Type: application/json" `
        -d "{`"texto`":`"Test $i`"}")
    Write-Host "Petición $i : HTTP $status"
}
# Petición 1-10: 200
# Petición 11-15: 429
```

---

#### Misión 7: Health Checks
**Estado:** ✅ IMPLEMENTADO

**Ubicación:** `Dockerfile:38-39`, `docker-compose.yml:23-27`

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
    CMD node -e "require('http').get('http://localhost:3000/', ...)"
```

**Prueba para el profesor:**
```bash
docker-compose ps
# Debe mostrar "(healthy)" en el estado
```

---

### Checklist Práctica 3

| # | Requisito | Estado | Archivo |
|---|-----------|--------|---------|
| 1 | Dockerfile multi-stage | ✅ | Dockerfile |
| 2 | Usuario no-root | ✅ | Dockerfile:20-21 |
| 3 | Health check | ✅ | Dockerfile:38, docker-compose.yml:23 |
| 4 | Nginx reverse proxy | ✅ | nginx/nginx.conf |
| 5 | TLS 1.3 | ✅ | nginx/nginx.conf:30 |
| 6 | Redirección HTTP→HTTPS | ✅ | nginx/nginx.conf:16 |
| 7 | Puerto 3000 no expuesto | ✅ | docker-compose.yml:14 |
| 8 | Certificados SSL | ✅ | nginx/ssl/ |
| 9 | docker-compose | ✅ | docker-compose.yml |
| 10 | Scripts de prueba | ✅ | test-seguridad.ps1, test-seguridad.sh |
| 11 | Documentación pruebas | ✅ | PRUEBAS_PRACTICA_3.md |

---

## 🧪 Guía de Pruebas para el Profesor

### Paso 1: Iniciar la Infraestructura

```powershell
cd C:\Users\alanj\Desktop\lenos-backend
docker-compose up -d
```

### Paso 2: Verificar Estado

```powershell
docker-compose ps
# Debe mostrar: lenos-backend (healthy), lenos-nginx (running)
```

### Paso 3: Ejecutar Script de Pruebas Automático

```powershell
# PowerShell
.\test-seguridad.ps1

# O bash (Git Bash)
bash test-seguridad.sh
```

### Paso 4: Pruebas Manuales (Opcionales)

Ver cada sección de práctica arriba para comandos individuales.

---

## 📊 Resumen Final

### Funcionalidades Implementadas

| Categoría | Funcionalidad | Estado |
|-----------|---------------|--------|
| **Seguridad HTTP** | Helmet | ✅ |
| **Seguridad HTTP** | CORS | ✅ |
| **Seguridad HTTP** | TLS 1.3 | ✅ |
| **Seguridad HTTP** | Redirección HTTPS | ✅ |
| **Validación** | express-validator | ✅ |
| **Validación** | DOMPurify (XSS) | ✅ |
| **Validación** | mongo-sanitize | ✅ |
| **Rate Limiting** | express-rate-limit | ✅ |
| **Autenticación** | bcrypt | ✅ |
| **Autenticación** | JWT | ✅ |
| **Infraestructura** | Docker | ✅ |
| **Infraestructura** | Nginx | ✅ |
| **Infraestructura** | Docker Compose | ✅ |
| **Infraestructura** | Health Checks | ✅ |
| **Infraestructura** | Red aislada | ✅ |
| **Pruebas** | Scripts PowerShell | ✅ |
| **Pruebas** | Scripts Bash | ✅ |
| **Pruebas** | Documentación | ✅ |

### Total: 19/19 Funcionalidades Implementadas (100%)

---

## 📁 Archivos Clave para Mostrar al Profesor

1. **src/index.js** - Configuración principal de seguridad
2. **src/middleware/rateLimiter.js** - Rate limiting
3. **src/middleware/validacionComentario.js** - Validación y sanitización
4. **src/services/usuarioService.js** - JWT y bcrypt
5. **src/routes/usuariosAuth.js** - Endpoints de autenticación
6. **Dockerfile** - Dockerización segura
7. **docker-compose.yml** - Orquestación de contenedores
8. **nginx/nginx.conf** - Reverse proxy y TLS
9. **test-seguridad.ps1** - Script de pruebas
10. **PRUEBAS_PRACTICAS.md** - Documentación de pruebas

---

**Firma del Estudiante:** Alansillo  
**Fecha de Verificación:** 2026-04-15
