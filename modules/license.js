window.DropiApp = window.DropiApp || {};
/**
 * LICENSE MODULE — Conectado al PANEL MAESTRO (Alcanzia)
 * ------------------------------------------------------
 * Reemplaza el backend anterior (Google Apps Script) por la API del panel.
 * Mantiene la MISMA interfaz pública para no romper ui.js / automation.js.
 */
window.DropiApp.License = {
    API_BASE: 'https://api.alcanzia.co/api',
    EXTENSION_ID: 'autopost-marketplace',
    EXTENSION_NAME: 'AutoPost Marketplace',

    state: {
        key: null,
        plan: 'NONE',   // NONE | PRO
        email: null,
        daysLeft: 0,
        expires: null,
        isValid: false,
        loading: true,
        deviceId: null,
        config: null     // selectores remotos (no usados; se usan los locales)
    },

    async init() {
        this.state.deviceId = await this.getDeviceId();
        await this.loadFromStorage();
        this.validateCurrentLicense();
    },

    // ----- Huella de dispositivo (determinística, anti-clonación) -----
    async getDeviceId() {
        const stored = await new Promise(r => chrome.storage.local.get('dropi_device_fingerprint', r));
        if (stored.dropi_device_fingerprint) return stored.dropi_device_fingerprint;
        try {
            const components = [
                navigator.userAgent, navigator.language, screen.colorDepth,
                new Date().getTimezoneOffset(), navigator.hardwareConcurrency,
                navigator.deviceMemory || 'na'
            ];
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = "top"; ctx.font = "14px 'Arial'";
            ctx.fillStyle = "#f60"; ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069"; ctx.fillText("MKT_HASH", 2, 15);
            components.push(canvas.toDataURL().slice(-50));
            const raw = components.join('||');
            let hash = 0;
            for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash = hash & hash; }
            const finalId = 'DEV-' + Math.abs(hash).toString(36).toUpperCase();
            await chrome.storage.local.set({ dropi_device_fingerprint: finalId });
            return finalId;
        } catch (e) {
            return 'UNK-' + Date.now();
        }
    },

    async loadFromStorage() {
        return new Promise(resolve => {
            chrome.storage.local.get(['dropi_license_info'], (result) => {
                if (result.dropi_license_info) {
                    this.state.key = result.dropi_license_info.key;
                    this.state.plan = result.dropi_license_info.plan || 'PRO';
                    this.state.isValid = true; // optimista hasta verificar
                }
                resolve();
            });
        });
    },

    daysLeftFrom(expiresAt) {
        if (!expiresAt) return 0;
        const p = String(expiresAt).split('-');
        if (p.length !== 3) return 0;
        const exp = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        const today = new Date();
        const mid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return Math.round((exp.getTime() - mid.getTime()) / (1000 * 60 * 60 * 24));
    },

    // ----- Validación contra el panel -----
    async validateCurrentLicense() {
        if (!this.state.key) {
            this.state.isValid = false;
            this.triggerAuthRequired();
            return;
        }
        this.state.loading = true;
        try {
            const url = `${this.API_BASE}/verify?key=${encodeURIComponent(this.state.key)}&deviceId=${encodeURIComponent(this.state.deviceId)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.valid) {
                this.updateState({
                    isValid: true,
                    plan: 'PRO',
                    email: data.email || this.state.email,
                    expires: data.expiresAt || null,
                    daysLeft: this.daysLeftFrom(data.expiresAt)
                });
            } else {
                const msg = (data.message || '').toUpperCase();
                if (msg.includes('OTRO DISPOSITIVO')) {
                    alert('⚠️ ALERTA DE SEGURIDAD\nEsta licencia no pertenece a este dispositivo.\nSe cerrará la sesión por seguridad.');
                } else if (msg.includes('EXPIRADA')) {
                    alert('⚠️ Tu licencia ha expirado. Por favor renueva tu plan.');
                }
                this.invalidate();
                this.triggerAuthRequired();
            }
        } catch (e) {
            // Sin conexión: mantenemos el estado del caché (modo offline)
            console.warn('[License] Sin conexión, manteniendo sesión.');
        } finally {
            this.state.loading = false;
            this.updateBadge();
        }
    },

    // ----- Registro de prueba -----
    async registerTrial(email, whatsapp) {
        if (!whatsapp.match(/^\+\d{7,}$/)) {
            return { success: false, error: 'WhatsApp debe incluir "+" y código país (Ej: +57...)' };
        }
        const deviceId = await this.getDeviceId();
        try {
            const res = await fetch(`${this.API_BASE}/licenses/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email, phone: whatsapp, deviceId,
                    extensionId: this.EXTENSION_ID, extensionName: this.EXTENSION_NAME
                })
            });
            const data = await res.json();
            if (data.key) {
                this.state.key = data.key;
                this.updateState({ isValid: true, plan: 'PRO' });
                chrome.storage.local.set({ dropi_license_info: { key: data.key, plan: 'PRO' } });
                this.validateCurrentLicense();
                return { success: true, message: '¡Prueba activada! Tienes 3 días.' };
            }
            return { success: false, error: data.error || 'No se pudo activar la prueba' };
        } catch (e) {
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    },

    // ----- Activación manual de licencia -----
    async activateLicenseKey(key) {
        if (!key) return { success: false, error: 'Clave vacía' };
        const deviceId = await this.getDeviceId();
        try {
            const url = `${this.API_BASE}/verify?key=${encodeURIComponent(key)}&deviceId=${encodeURIComponent(deviceId)}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.valid) {
                this.state.key = key;
                this.updateState({
                    isValid: true, plan: 'PRO', email: data.email || null,
                    expires: data.expiresAt || null, daysLeft: this.daysLeftFrom(data.expiresAt)
                });
                chrome.storage.local.set({ dropi_license_info: { key: key, plan: 'PRO' } });
                return { success: true };
            }
            const msg = (data.message || '').toUpperCase();
            return { success: false, error: msg.includes('OTRO DISPOSITIVO') ? 'Licencia ya usada en otro PC' : (data.message || 'Licencia inválida') };
        } catch (e) {
            return { success: false, error: 'Error de conexión' };
        }
    },

    invalidate() {
        this.state.key = null;
        this.state.isValid = false;
        this.state.plan = 'NONE';
        chrome.storage.local.remove('dropi_license_info');
    },

    // ----- UI -----
    updateState(newData) {
        Object.assign(this.state, newData);
        this.updateBadge();
        if (this.state.isValid) {
            const modal = document.getElementById('dropi-welcome-modal');
            if (modal) modal.style.display = 'none';
        }
    },

    updateBadge() {
        const badge = document.querySelector('.pro-badge');
        if (badge) {
            badge.textContent = this.state.plan || 'OFF';
            if (this.state.plan === 'PRO') badge.style.background = '#4ade80';
            else if (this.state.isValid) badge.style.background = '#3b82f6';
            else badge.style.background = '#ef4444';
        }
    },

    triggerAuthRequired() {
        window.dispatchEvent(new CustomEvent('DropiAuthRequired'));
    },

    // ----- Presencia online (antes "estadísticas") -----
    async recordAction(_type, _count = 1) {
        if (!this.state.key || !this.state.isValid) return;
        try {
            fetch(`${this.API_BASE}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: this.state.key })
            });
        } catch (e) { /* ignore */ }
    }
};
