
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
        console.log('[DropiLocation] Iniciando búsqueda en lista de sugerencias...');
        if (input) input.focus();

        // 1. REINTENTOS: El menú de Facebook puede tardar unos ms en ser "clicable"
        for (let i = 0; i < 10; i++) {
            // Buscamos la lista y la primera opción según tu HTML
            const list = document.querySelector('ul[role="listbox"]');
            const firstOption = list ? list.querySelector('li[role="option"]') : null;

            if (firstOption) {
                console.log('[DropiLocation] ✅ Lista detectada. Clickeando primera opción...');
                
                // Asegurar visibilidad
                firstOption.scrollIntoView({ block: 'nearest' });
                
                // Clic Progresivo (Varios métodos para asegurar React)
                firstOption.click();
                const innerClickable = firstOption.querySelector('div[role="none"]') || firstOption.querySelector('div');
                if (innerClickable) innerClickable.click();

                // PEQUÉÑA ESPERA para que FB procese el clic
                await new Promise(r => setTimeout(r, 500));
                
                // Si después del clic sigue habiendo error, usamos el teclado como martillo final
                const stillError = document.querySelector('input[aria-invalid="true"][aria-label="Ubicación"]');
                if (stillError) {
                    console.log('[DropiLocation] ⌨️ Clic no bastó. Usando Enter de teclado...');
                    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                }

                return true;
            }

            // Esperar 300ms antes del siguiente reintento
            await new Promise(r => setTimeout(r, 300));
        }

        console.warn('[DropiLocation] ❌ No se encontró la lista de sugerencias tras 3 segundos.');
        return false;
    }
};
