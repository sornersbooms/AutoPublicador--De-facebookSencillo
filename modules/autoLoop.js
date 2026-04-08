window.DropiApp = window.DropiApp || {};

/**
 * Módulo de Auto-Loop (Ciclo Infinito de Publicación)
 * Se encarga de reiniciar el ciclo cuando detecta la página de "Crear nuevo item".
 * Flujo: Detectar URL -> Avanzar Producto -> Esperar -> Rellenar.
 */
window.DropiApp.AutoLoop = {

    monitorInterval: null,
    isProcessing: false,
    lastUrl: '',


    init() {
        console.log('[DropiLoop] 🔄 Inicializando Monitor de Bucle (SPA)...');
        
        if (!localStorage.getItem('dropi_loop_step')) {
            localStorage.setItem('dropi_loop_step', 'fill');
        }

        // Evitar duplicados
        if (this.monitorInterval) clearInterval(this.monitorInterval);

        // Monitor activo cada 1 segundo (Para detectar cambios de URL sin recarga)
        this.monitorInterval = setInterval(() => {
            this.checkLoopCondition();
        }, 1000);
    },

    checkLoopCondition() {
        // 1. Verificar Activación (Por defecto ON si es nulo)
        let isEnabled = localStorage.getItem('dropi_loop_enabled');
        if (isEnabled === null) {
            isEnabled = 'true';
            localStorage.setItem('dropi_loop_enabled', 'true');
        }

        if (isEnabled !== 'true') return;

        // 2. Verificar URL correcta
        const currentUrl = window.location.href;
        const isCreatePage = currentUrl.includes('/marketplace/create/item');

        // Si cambiamos de URL, reseteamos el flag de bloqueo
        if (currentUrl !== this.lastUrl) {
            this.lastUrl = currentUrl;
            this.isProcessing = false; // Nueva página = Nuevo intento permitido
            console.log('[DropiLoop] 📍 Nueva URL detectada. Estado desbloqueado.');
        }

        // 3. Ejecutar SOLO si es la página correcta y NO estamos procesando ya
        if (isCreatePage && !this.isProcessing) {
            this.startCycle();
        }
    },

    startCycle() {
        if (this.isProcessing) return; // Doble check
        this.isProcessing = true;
        console.log('[DropiLoop] 🟢 Detectada página de creación. Esperando estabilidad (5s)...');

        // Aumentamos espera inicial a 5 segundos para asegurar que no es una carga transitoria
        setTimeout(() => {
            // Verificar si seguimos en la misma página y el usuario no canceló
            if (window.location.href.includes('/marketplace/create/item') && localStorage.getItem('dropi_loop_enabled') === 'true') {
                this.triggerNextProduct();
            } else {
                this.isProcessing = false; // Falsa alarma o cancelación
            }
        }, 5000);
    },

    // Helper para acceder al Shadow DOM de la UI
    getUiElement(id) {
        if (window.DropiApp.UI && window.DropiApp.UI.shadowRoot) {
            return window.DropiApp.UI.shadowRoot.getElementById(id);
        }
        return null;
    },

    triggerNextProduct() {
        const nextBtn = this.getUiElement('dropi-next-btn'); // Acceso Shadow DOM
        const loopStep = localStorage.getItem('dropi_loop_step');

        console.log(`[DropiLoop] ⛽ Paso actual: ${loopStep || 'fill'}`);

        if (loopStep === 'next') {
            console.log('[DropiLoop] ⏩ Detectada bandera de avance. Moviendo al siguiente...');
            localStorage.setItem('dropi_loop_step', 'fill'); // Consumir bandera
            
            if (nextBtn) {
                nextBtn.click();
                setTimeout(() => this.scheduleFill(), 3000);
            } else {
                console.warn('[DropiLoop] Botón siguiente no encontrado. Intentando rellenar actual.');
                this.scheduleFill();
            }
            return;
        }

        // Si no hay bandera de 'next' (Primer inicio o manual), simplemente rellenamos el actual
        console.log('[DropiLoop] 🚀 Rellenando producto actual...');
        this.scheduleFill();
    },

    scheduleFill() {
        console.log('[DropiLoop] ⏳ Esperando 5 segundos para "Rellenar Datos"...');

        setTimeout(() => {
            if (localStorage.getItem('dropi_loop_enabled') !== 'true') return;

            const fillBtn = this.getUiElement('dropi-fill-btn'); // Acceso Shadow DOM
            if (fillBtn) {
                console.log('[DropiLoop] 🚀 ¡DISPARANDO RELLENADO!');
                fillBtn.click();
            } else {
                console.error('[DropiLoop] ❌ No se encontró el botón de rellenar en UI.');
                this.isProcessing = false;
            }
        }, 5000);
    }
};
