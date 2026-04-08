
window.DropiApp = window.DropiApp || {};
window.DropiApp.Fields = window.DropiApp.Fields || {};

/**
 * Módulo para interactuar con el campo "Estado" (Condition) en Facebook Marketplace.
 * Parte de la arquitectura modular.
 */
window.DropiApp.Fields.Condition = {

    /**
     * Establece el estado del producto.
     * Según instrucciones, SIEMPRE debe ser "Nuevo".
     */
    async set() {
        console.log('[DropiCondition] Estableciendo estado a "Nuevo"...');

        // 1. Encontrar el "Trigger" o etiqueta de Estado
        const trigger = await this.findTrigger();
        if (!trigger) {
            console.error('[DropiCondition] No se encontró el campo "Estado"');
            return false;
        }

        // 2. Abrir el menú
        try {
            trigger.scrollIntoView({ block: 'center', inline: 'nearest' });
            await new Promise(r => setTimeout(r, 500));

            if (trigger.click) trigger.click();
            else trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            console.log('[DropiCondition] Click en campo Estado realizado.');
        } catch (e) {
            console.error('[DropiCondition] Error al hacer click en el campo Estado', e);
            return false;
        }

        // 3. Esperar que el menú se abra
        await new Promise(r => setTimeout(r, 1000));

        // 4. Seleccionar "Nuevo"
        return await this.selectNewOption();
    },

    /**
     * Busca el elemento que activa el selector de Estado.
     */
    async findTrigger() {
        // Snippet proporcionado: <span ...>Estado</span>
        // Buscamos el span con texto exacto "Estado"
        const xpathLabel = "//span[text()='Estado']";
        const labelNode = document.evaluate(xpathLabel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (labelNode) {
            // Generalmente el input/combobox es el siguiente elemento interactivo o el padre
            // Buscamos un label o un div role button cercano

            // Intento 1: Label wrapper
            const parentLabel = labelNode.closest('label');
            if (parentLabel) return parentLabel;

            // Intento 2: Siguiente div con role button (común en diseño FB nuevo)
            const xpathButton = "./following::div[@role='button'][1]";
            const btnNode = document.evaluate(xpathButton, labelNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (btnNode) return btnNode;

            return labelNode;
        }

        // Fallback: aria-label
        const ariaEl = document.querySelector('[aria-label="Estado"], [aria-label="Condition"]');
        if (ariaEl) return ariaEl;

        return null;
    },

    /**
     * Busca y clickea la opción "Nuevo".
     */
    async selectNewOption() {
        // Buscamos la opción específica "Nuevo" dentro del menú desplegado.

        // Estrategia 1: Buscar por texto exacto en las opciones visibles (divs/spans de menu items)
        // El snippet de "Nuevo" es: <span ...>Nuevo</span>

        const xpathOption = "//span[text()='Nuevo']";
        // Buscamos todos los nodos que coincidan, y tomamos el que esté visible o dentro de un role="option" / "menuitem"
        const snapshot = document.evaluate(xpathOption, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0; i < snapshot.snapshotLength; i++) {
            let el = snapshot.snapshotItem(i);

            // Verificamos si es clickeable o está dentro de un clickeable
            // Normalmente está dentro de un div con role="option"
            let clickable = el.closest('[role="option"]') || el.closest('[role="button"]') || el;

            // Verificamos si parece ser parte del menú flotante (flotantes suelen estar al final del body o en capas superiores)
            // Una heurística simple es intentar clickear el último encontrado, ya que los menús se renderizan al final.
            // O probar visibilidad.

            if (clickable) {
                try {
                    clickable.scrollIntoView({ block: 'center', inline: 'nearest' });
                    // No esperamos mucho aquí para que se sienta fluido, pero un poco por si hay animaciones
                    await new Promise(r => setTimeout(r, 200));

                    if (clickable.click) clickable.click();
                    else clickable.dispatchEvent(new MouseEvent('click', { bubbles: true }));

                    console.log('[DropiCondition] Opción "Nuevo" seleccionada.');
                    return true;
                } catch (e) {
                    console.warn('[DropiCondition] Error clickeando opción candidato', e);
                    continue; // Probar siguiente si falla
                }
            }
        }

        console.error('[DropiCondition] No se encontró la opción "Nuevo".');
        return false;
    }
};
