
window.DropiApp = window.DropiApp || {};
window.DropiApp.Fields = window.DropiApp.Fields || {};

/**
 * Módulo para interactuar con el campo "Ubicación" en Facebook Marketplace.
 */
window.DropiApp.Fields.Location = {

    async set(locationText) {
        if (!locationText) return false;
        console.log(`[DropiLocation] Configurando: "${locationText}"`);

        // 1. Encontrar campo
        const input = await this.findInput();
        if (!input) {
            console.error('[DropiLocation] No se encontró el campo de Ubicación.');
            return false;
        }

        // 2. Limpiar y escribir
        input.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 500));
        
        // Simular borrado y escritura
        input.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        document.execCommand('insertText', false, locationText);
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // 3. Esperar a que aparezcan las sugerencias
        console.log('[DropiLocation] Esperando sugerencias de Facebook...');
        await new Promise(r => setTimeout(r, 2000));

        // 4. Seleccionar la PRIMERA sugerencia (Teclado + Clic)
        const success = await this.selectFirstSuggestion(input);
        
        if (!success) {
            console.warn('[DropiLocation] Falló selección automática. Intentando forzado por teclado...');
            input.focus();
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true }));
            await new Promise(r => setTimeout(r, 500));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        }

        return true; 
    },

    async findInput() {
        // Selector basado en el aria-label="Ubicación" que proporcionó el usuario
        const selectors = [
            'input[aria-label="Ubicación"]',
            'input[placeholder="Ubicación"]',
            'input[id^="location-input"]'
        ];

        for (const s of selectors) {
            const el = document.querySelector(s);
            if (el) return el;
        }

        // Fallback XPath
        try {
            const xpath = "//*[contains(text(), 'Ubicación')]/following::input[1]";
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue;
        } catch (e) { return null; }
    },

    async selectFirstSuggestion(input) {
        console.log('[DropiLocation] Intentando clickear la primera sugerencia con selector preciso...');
        if (input) input.focus();

        // 1. Intentar encontrar el SPAN de "Ciudad" o "Provincia"
        try {
            const xpath = "//span[text()='Ciudad' or text()='Provincia' or text()='Estado']";
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const spanNode = result.singleNodeValue;

            if (spanNode && spanNode.offsetParent !== null) {
                console.log('[DropiLocation] 🎯 "Ciudad" detectada. Buscando contenedor principal...');

                // Basado en tu HTML, el contenedor clicable es un div con clases como x1n2onr6 o x1ja2u2z
                // Subimos hasta encontrar el div que engloba toda la sugerencia
                const container = spanNode.closest('.x1n2onr6') || 
                                  spanNode.closest('.x1ja2u2z') || 
                                  spanNode.parentElement.parentElement.parentElement.parentElement;

                if (container) {
                    console.log('[DropiLocation] ✅ Contenedor encontrado. Clickeando...');
                    container.scrollIntoView({ block: 'center' });
                    await new Promise(r => setTimeout(r, 200));

                    // Click TRIPLE para asegurar (Simulado, Nativo y MouseEvent)
                    container.click();
                    container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    container.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                    
                    return true;
                }
            }
        } catch (e) {
            console.warn('[DropiLocation] Error en buscador de sugerencia:', e);
        }

        // Fallback: Si no lo encuentra por SPAN, buscamos cualquier botón dentro del menú desplegable x1n2onr6
        const anyButton = document.querySelector('.x1n2onr6 div[role="button"]') || document.querySelector('.x1n2onr6 .x1ja2u2z');
        if (anyButton) {
            console.log('[DropiLocation] Fallback: Clickeando primer botón del menú detectado.');
            anyButton.click();
            return true;
        }

        console.warn('[DropiLocation] ❌ No se pudo confirmar la sugerencia automáticamente.');
        return false;
    }
};
