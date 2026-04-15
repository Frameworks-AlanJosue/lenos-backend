#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# FASE 4: Pruebas de Seguridad - "La Prueba de Fuego"
# ═══════════════════════════════════════════════════════════════

echo "=========================================="
echo "  PRUEBAS DE SEGURIDAD - PRÁCTICA 3"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════
# PRUEBA 1: Intentar XSS (Debe llegar sanitizado)
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[PRUEBA 1]${NC} Intentando inyección XSS..."
echo "Payload: <script>alert('hack')</script>"
echo ""

RESPONSE=$(curl.exe -k -s -X POST https://localhost/api/v1/comentarios \
  -H "Content-Type: application/json" \
  -d '{"texto":"<script>alert('\''hack'\'')</script>"}')

echo "Respuesta del servidor:"
echo "$RESPONSE" | head -20
echo ""

# Verificar si el script fue sanitizado
if echo "$RESPONSE" | grep -q "alert"; then
    echo -e "${RED}❌ ALERTA: El script NO fue sanitizado completamente${NC}"
else
    echo -e "${GREEN}✅ ÉXITO: El script fue sanitizado${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# PRUEBA 2: Rate Limiting (15 requests rápidos = 429)
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[PRUEBA 2]${NC} Probando Rate Limiting (15 peticiones)..."
echo "Enviando 15 peticiones seguidas..."
echo ""

COUNT=0
BLOCKED=0
for i in {1..15}; do
    STATUS=$(curl.exe -k -s -o /dev/null -w "%{http_code}" -X POST https://localhost/api/v1/comentarios \
      -H "Content-Type: application/json" \
      -d '{"texto":"Rate limit test '$i'"}')

    if [ "$STATUS" == "429" ]; then
        echo -e "  Petición $i: ${RED}429 Too Many Requests${NC} ✅"
        BLOCKED=$((BLOCKED + 1))
    else
        echo -e "  Petición $i: Status $STATUS"
    fi
    COUNT=$((COUNT + 1))
done

echo ""
if [ $BLOCKED -gt 0 ]; then
    echo -e "${GREEN}✅ ÉXITO: Rate limiting funcionando ($BLOCKED peticiones bloqueadas)${NC}"
else
    echo -e "${RED}❌ ALERTA: Rate limiting NO funcionó${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# PRUEBA 3: Redirección HTTP → HTTPS (301)
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[PRUEBA 3]${NC} Probando redirección HTTP → HTTPS..."
echo "Accediendo a http://localhost/ (debe redirigir a HTTPS)"
echo ""

# -L sigue redirects, -I muestra headers
REDIRECT=$(curl.exe -s -I -L http://localhost/ 2>&1 | grep -E "(HTTP/|Location:|301)")
echo "$REDIRECT"

if echo "$REDIRECT" | grep -q "301"; then
    echo -e "${GREEN}✅ ÉXITO: Redirección 301 HTTP → HTTPS funcionando${NC}"
else
    echo -e "${RED}❌ ALERTA: Redirección NO funcionó${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# PRUEBA 4: Puerto 3000 no accesible directamente
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[PRUEBA 4]${NC} Verificando que backend NO es accesible directamente..."
echo "Intentando: curl http://localhost:3000/"
echo ""

if curl.exe -s --connect-timeout 2 http://localhost:3000/ 2>&1 | grep -q "Failed to connect"; then
    echo -e "${GREEN}✅ ÉXITO: Puerto 3000 NO expuesto (protegido por Docker)${NC}"
else
    echo -e "${RED}❌ ALERTA: Puerto 3000 accesible (debería estar protegido)${NC}"
fi
echo ""

echo "=========================================="
echo "  PRUEBAS COMPLETADAS"
echo "=========================================="
