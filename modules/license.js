window.DropiApp = window.DropiApp || {};
/**
 * LICENSE MODULE V6 PRO (Anti-Hack + Fingerprint)
 * ------------------------------------------------
 * Maneja la validación de licencia, registro obligatorio y fingerprinting.
 */
window.DropiApp.License = {
    // ⚠️ REEMPLAZA ESTO CON LA URL DE TU SCRIPT DE GOOGLE APPS ACTUALIZADO ⚠️
    API_URL: 'https://script.google.com/macros/s/AKfycbxjprlb_4UBC0RbY8ziv-quzFt2kn3Doj1-uhX2EHsIq0eRKVfOlYh1MO5OzODh98LX/exec',

    state: {
        key: null,
        plan: 'NONE', // NONE, TRIAL, PRO
        email: null,
        daysLeft: 0,
        isValid: false,
        loading: true,
        deviceId: null
    },

    async init() {
        this.state.deviceId = await this.getDeviceId();
        await this.loadFromStorage();
        // Intentar validar en segundo plano
        this.validateCurrentLicense();
    },

    // -------------------------------------------------------------
    // 🕵️ FINGERPRINTING DE DISPOSITIVO (ANTI-CLONACIÓN)
    // -------------------------------------------------------------
    async getDeviceId() {
        // 1. Intentar recuperar memoria rápida
        const stored = await new Promise(r => chrome.storage.local.get('dropi_device_fingerprint', r));
        if (stored.dropi_device_fingerprint) return stored.dropi_device_fingerprint;

        // 2. Generar nueva huella digital hardware
        try {
            const components = [
                navigator.userAgent,
                navigator.language,
                screen.colorDepth,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency,
                navigator.deviceMemory || 'na'
            ];
            // Canvas Hash (Dibuja imagen invisible y saca hash único de la GPU)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = "top"; ctx.font = "14px 'Arial'";
            ctx.fillStyle = "#f60"; ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069"; ctx.fillText("MKT_HASH", 2, 15);
            const canvasHash = canvas.toDataURL().slice(-50); // Últimos 50 chars

            components.push(canvasHash);

            const raw = components.join('||');
            // Simple Hash
            let hash = 0;
            for (let i = 0; i < raw.length; i++) {
                const char = raw.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }

            const finalId = 'DEV-' + Math.abs(hash).toString(36).toUpperCase();
            await chrome.storage.local.set({ dropi_device_fingerprint: finalId });
            return finalId;

        } catch (e) {
            console.error("Fingerprint error", e);
            return 'UNK-' + Date.now();
        }
    },

    // -------------------------------------------------------------
    // 📥 CARGA & VALIDACIÓN
    // -------------------------------------------------------------
    async loadFromStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(['dropi_license_info'], (result) => {
                if (result.dropi_license_info) {
                    const info = result.dropi_license_info;
                    this.state.key = info.key;
                    this.state.plan = info.plan;
                    this.state.isValid = true; // Asumimos válido hasta verificar
                    console.log('[License] Loaded cached:', info);
                }
                resolve();
            });
        });
    },

    async validateCurrentLicense() {
        if (!this.state.key) {
            this.state.isValid = false;
            this.triggerAuthRequired(); // No hay key -> pedir registro
            return;
        }

        this.state.loading = true;
        try {
            // Petición POST segura al backend
            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'validate_license',
                    key: this.state.key,
                    deviceId: this.state.deviceId
                })
            });
            const json = await response.json();

            if (json.success) {
                // Todo OK
                this.updateState({
                    isValid: true,
                    plan: json.plan,
                    expires: json.expires,
                    config: json.config // Selectores remotos
                });
            } else {
                console.warn('[License] Validation Failed:', json.reason);

                // SOLO invalidamos si la razón es definitiva (No encontrada, Expirada o Mal Dispositivo)
                // Si es un error de servidor o timeout (json.error), NO cerramos la sesión para evitar molestias.
                const fatalReasons = ['not_found', 'expired', 'inactive', 'device_mismatch'];

                if (fatalReasons.includes(json.reason)) {
                    if (json.reason === 'device_mismatch') {
                        alert('⚠️ ALERTA DE SEGURIDAD\nEsta licencia no pertenece a este dispositivo.\nSe cerrará la sesión por seguridad.');
                    } else if (json.reason === 'expired') {
                        alert('⚠️ Tu licencia ha expirado. Por favor renueva tu plan.');
                    }

                    this.invalidate(); // Borrar todo
                    this.triggerAuthRequired();
                } else {
                    console.log('[License] Error temporal de servidor, manteniendo sesión activa por ahora.');
                }
            }
        } catch (e) {
            console.error('[License] Network fail, offline mode active');
            // En modo offline mantenemos el estado del caché
        } finally {
            this.state.loading = false;
            this.updateBadge(); // Actualizar UI
        }
    },

    // -------------------------------------------------------------
    // ✏️ REGISTRO (TRIAL) & ACTIVACIÓN MANUAL
    // -------------------------------------------------------------

    async registerTrial(email, whatsapp) {
        // Validar WhatsApp (+Country)
        if (!whatsapp.match(/^\+\d{7,}$/)) {
            return { success: false, error: 'WhatsApp debe incluir "+" y código país (Ej: +57...)' };
        }

        const deviceId = await this.getDeviceId();

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'register_trial',
                    email: email,
                    whatsapp: whatsapp,
                    deviceId: deviceId
                })
            });
            const json = await response.json();

            if (json.success) {
                this.state.key = json.key;
                this.updateState({
                    isValid: true,
                    plan: json.plan, // PRO (Trial)
                    expires: json.expires
                });
                // Guardar persistentemente
                chrome.storage.local.set({ dropi_license_info: { key: json.key, plan: json.plan } });
                return { success: true, message: json.message };
            } else {
                return { success: false, error: json.error || 'Error en registro' };
            }
        } catch (e) {
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    },

    async activateLicenseKey(key) {
        if (!key) return { success: false, error: 'Clave vacía' };
        this.state.key = key; // Temporal para validar

        // Simplemente llamamos a validateCurrentLicense
        // Pero necesitamos esperar la respuesta, mejor hacer la llamada directa aquí
        const deviceId = await this.getDeviceId();

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'validate_license',
                    key: key,
                    deviceId: deviceId
                })
            });
            const json = await response.json();

            if (json.success) {
                this.updateState({
                    isValid: true,
                    plan: json.plan,
                    expires: json.expires
                });
                chrome.storage.local.set({ dropi_license_info: { key: key, plan: json.plan } });
                return { success: true };
            } else {
                return { success: false, error: json.reason === 'device_mismatch' ? 'Licencia ya usada en otro PC' : 'Licencia Inválida' };
            }
        } catch (e) { return { success: false, error: 'Error conexion' }; }
    },

    invalidate() {
        this.state.key = null;
        this.state.isValid = false;
        this.state.plan = 'NONE';
        chrome.storage.local.remove('dropi_license_info');
    },

    // -------------------------------------------------------------
    // 🎨 UI UPDATERS
    // -------------------------------------------------------------

    updateState(newData) {
        Object.assign(this.state, newData);
        this.updateBadge();

        // Si ya es válido, ocultamos modal si existe
        if (this.state.isValid) {
            const modal = document.getElementById('dropi-welcome-modal');
            if (modal) modal.style.display = 'none';
        }
    },

    updateBadge() {
        // Busca el badge en el UI principal (si existe, ui.js lo crea)
        const badge = document.querySelector('.pro-badge'); // Clase en tu UI
        const statusText = document.getElementById('license-status-text'); // ID en tu UI

        if (badge) {
            badge.textContent = this.state.plan || 'OFF';
            if (this.state.plan === 'PRO') badge.style.background = '#4ade80'; // Green
            else if (this.state.isValid) badge.style.background = '#3b82f6'; // Blue
            else badge.style.background = '#ef4444'; // Red
        }
    },

    triggerAuthRequired() {
        // Le dice al UI.js que muestre el modal de login
        // Disparando evento personalizado
        window.dispatchEvent(new CustomEvent('DropiAuthRequired'));
    },

    // -------------------------------------------------------------
    // 📊 ESTADÍSTICAS & ANALÍTICA
    // -------------------------------------------------------------
    async recordAction(type, count = 1) {
        if (!this.state.key || !this.state.isValid) return;

        try {
            fetch(this.API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update_stats',
                    key: this.state.key,
                    type: type,
                    count: count,
                    deviceId: this.state.deviceId
                })
            });
            // No esperamos el await para no bloquear el flujo principal
            console.log(`[License] Action recorded: ${type}`);
        } catch (e) {
            console.warn('[License] Failed to record action');
        }
    }
};
