
window.DropiApp = window.DropiApp || {};
window.DropiApp.Fields = window.DropiApp.Fields || {};

/**
 * Módulo para gestionar el campo "Etiquetas de productos" en FB Marketplace.
 * Permite ingresar múltiples etiquetas y confirmarlas con ENTER.
 */
window.DropiApp.Fields.Tags = {

    /**
     * Ingresa una lista de etiquetas en el campo correspondiente.
     * @param {string[]} tags - Array de strings con las etiquetas.
     * @returns {Promise<boolean>}
     */
    async set(tags) {
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            console.log('[DropiTags] No hay etiquetas para ingresar.');
            return false;
        }

        console.log(`[DropiTags] Iniciando ingreso de ${tags.length} etiquetas...`);

        // 1. Encontrar el textarea de etiquetas
        const textarea = await this.findInput();
        if (!textarea) {
            console.error('[DropiTags] No se encontró el campo "Etiquetas de productos" (textarea).');
            return false;
        }

        // 2. Focus inicial
        textarea.scrollIntoView({ block: 'center', inline: 'nearest' });
        await new Promise(r => setTimeout(r, 500));
        textarea.focus();

        // 3. Iterar e ingresar cada etiqueta
        for (const tag of tags) {
            if (!tag || tag.trim() === '') continue;

            await this.typeAndEnter(textarea, tag.trim());

            // Pequeña pausa entre etiquetas para no saturar
            await new Promise(r => setTimeout(r, 300));
        }

        console.log('[DropiTags] Proceso de etiquetas finalizado.');
        return true;
    },

    /**
     * Busca el textarea basado en el label "Etiquetas de productos".
     */
    async findInput() {
        // Estrategia 1: XPath Robusto buscando la etiqueta visible y su input asociado
        // El input suele estar dentro de un label que contiene el texto "Etiquetas de productos"
        const xpathStrategies = [
            "//label[.//span[contains(text(), 'Etiquetas de productos')]]//textarea",
            "//label[.//span[contains(text(), 'Etiquetas de productos')]]//input",
            "//div[.//span[contains(text(), 'Etiquetas de productos')]]//textarea", // A veces es un div contenedor
            "//textarea[@aria-label='Etiquetas de productos']"
        ];

        for (const xpath of xpathStrategies) {
            const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (el) {
                console.log(`[DropiTags] ✅ Campo encontrado vía XPath: ${xpath}`);
                return el;
            }
        }

        // Fallback: Query Selector genérico
        return document.querySelector('textarea[aria-label*="Etiquetas"]') || document.querySelector('input[aria-label*="Etiquetas"]');
    },

    /**
     * Escribe el texto y simula ENTER.
     */
    async typeAndEnter(element, text) {
        console.log(`[DropiTags] Escribiendo etiqueta: "${text}"`);

        // 1. Escribir texto (Simulación nativa para React)
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        nativeInputValueSetter.call(element, text);

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        await new Promise(r => setTimeout(r, 100));

        // 2. Simular ENTER (Keydown -> Keypress -> Keyup)
        const keyEventOptions = {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
            view: window
        };

        element.dispatchEvent(new KeyboardEvent('keydown', keyEventOptions));
        element.dispatchEvent(new KeyboardEvent('keypress', keyEventOptions));
        element.dispatchEvent(new KeyboardEvent('keyup', keyEventOptions));
    }
};
