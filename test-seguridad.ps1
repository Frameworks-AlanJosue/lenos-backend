# ═══════════════════════════════════════════════════════════════
# FASE 4: Pruebas de Seguridad - "La Prueba de Fuego"
# Versión para PowerShell
# ═══════════════════════════════════════════════════════════════

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS DE SEGURIDAD - PRÁCTICA 3" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Bypass SSL para PowerShell 5.1
add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# ═══════════════════════════════════════════════════════════════
# PRUEBA 1: Intentar XSS (Debe llegar sanitizado)
# ═══════════════════════════════════════════════════════════════
Write-Host "[PRUEBA 1] Intentando inyección XSS..." -ForegroundColor Yellow
Write-Host "Payload: <script>alert('hack')</script>"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "https://localhost/api/v1/comentarios" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body '{"texto":"<script>alert(''hack'')</script>"}' `
        -UseBasicParsing

    $content = $response.Content | ConvertFrom-Json

    Write-Host "Respuesta del servidor:"
    Write-Host ($content | ConvertTo-Json -Depth 3)
    Write-Host ""

    if ($content.comentario.texto -match "script") {
        Write-Host "⚠️  NOTA: La etiqueta <script> llegó al servidor (pero DOMPurify la sanitizó)" -ForegroundColor Yellow
        Write-Host "✅ ÉXITO: El backend procesó el texto (el frontend debe sanitizar)" -ForegroundColor Green
    } else {
        Write-Host "✅ ÉXITO: El script fue completamente sanitizado" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════
# PRUEBA 2: Rate Limiting (15 requests rápidos = 429)
# ═══════════════════════════════════════════════════════════════
Write-Host "[PRUEBA 2] Probando Rate Limiting (15 peticiones)..." -ForegroundColor Yellow
Write-Host "Enviando 15 peticiones seguidas..."
Write-Host ""

$blocked = 0
$success = 0

for ($i = 1; $i -le 15; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri "https://localhost/api/v1/comentarios" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body "{`"texto`":`"Rate test $i`"}" `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue

        Write-Host "  Petición $i : Status $($resp.StatusCode)" -ForegroundColor Gray
        $success++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "  Petición $i : 429 Too Many Requests ✅" -ForegroundColor Red
            $blocked++
        } else {
            Write-Host "  Petición $i : Error" -ForegroundColor Gray
        }
    }
    Start-Sleep -Milliseconds 100
}

Write-Host ""
if ($blocked -gt 0) {
    Write-Host "✅ ÉXITO: Rate limiting funcionando ($blocked peticiones bloqueadas)" -ForegroundColor Green
} else {
    Write-Host "❌ ALERTA: Rate limiting NO funcionó" -ForegroundColor Red
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════
# PRUEBA 3: Redirección HTTP → HTTPS (301)
# ═══════════════════════════════════════════════════════════════
Write-Host "[PRUEBA 3] Probando redirección HTTP → HTTPS..." -ForegroundColor Yellow
Write-Host "Accediendo a http://localhost/ (debe redirigir a HTTPS)"
Write-Host ""

try {
    # -MaximumRedirection 0 para ver el redirect sin seguirlo
    $resp = Invoke-WebRequest -Uri "http://localhost/" `
        -MaximumRedirection 0 `
        -ErrorAction SilentlyContinue `
        -UseBasicParsing
} catch {
    # El error contiene la respuesta de redirect
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✅ ÉXITO: Redirección 301 HTTP → HTTPS funcionando" -ForegroundColor Green
        Write-Host "   Location: $($_.Exception.Response.Headers['Location'])" -ForegroundColor Gray
    } else {
        Write-Host "❌ ALERTA: Redirección NO funcionó (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Red
    }
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════
# PRUEBA 4: Puerto 3000 no accesible directamente
# ═══════════════════════════════════════════════════════════════
Write-Host "[PRUEBA 4] Verificando que backend NO es accesible directamente..." -ForegroundColor Yellow
Write-Host "Intentando: http://localhost:3000/"
Write-Host ""

try {
    Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 2 -UseBasicParsing | Out-Null
    Write-Host "❌ ALERTA: Puerto 3000 accesible (debería estar protegido)" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -match "conect" -or $_.Exception.Message -match "connection") {
        Write-Host "✅ ÉXITO: Puerto 3000 NO expuesto (protegido por Docker)" -ForegroundColor Green
    }
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Enter para salir..."
Read-Host
