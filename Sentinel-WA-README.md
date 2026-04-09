# 🛡️ Moderador-WA: WhatsApp Moderation System

Este sistema consiste en dos partes:
1.  **Servidor (Motor de WhatsApp):** Usa `baileys` para conectarse y moderar en tiempo real.
2.  **Dashboard (Panel de Control):** Una interfaz React premium para gestionar el bot.

## 🚀 Cómo ejecutarlo

### 1. Iniciar el Servidor
```bash
cd BOT_WHATSAPP_SERVER
node index.js
```
*El servidor correrá en http://localhost:3001.*

### 2. Iniciar el Dashboard
```bash
cd BOT_WHATSAPP_DASHBOARD
npm run dev
```
*Abre http://localhost:5173 en tu navegador.*

## 🛠️ Funcionalidades
- **Conexión QR:** Vincula tu cuenta escaneando el código desde el Dashboard.
- **Moderación Automática:** 
  - Elimina enlaces externos (Anti-Link).
  - Filtra palabras prohibidas.
  - Mensajes de bienvenida automáticos.
- **Diseño Premium:** Interfaz oscura, fluida y moderna.

## 💡 Próximos Pasos (Sugerencias)
- **Integración con OpenAI:** Para que el bot responda de forma inteligente.
- **Log de Actividad:** Ver quién fue expulsado y por qué.
- **Dashboard Multi-Grupo:** Seleccionar reglas diferentes por grupo.
