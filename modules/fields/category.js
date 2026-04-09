
window.DropiApp = window.DropiApp || {};
window.DropiApp.Fields = window.DropiApp.Fields || {};

/**
 * Módulo para interactuar con el campo "Categoría" en Facebook Marketplace.
 * Lógica Restaurada: Versión Clásica + Check de estado actual.
 */
window.DropiApp.Fields.Category = {

    SUPPORTED_CATEGORIES: [
        "Herramientas",
        "Muebles",
        "Hogar",
        "Jardinería",
        "Electrodomésticos",
        "Videojuegos",
        "Libros, películas y música",
        "Bolsos y equipaje",
        "Ropa y calzado de mujer",
        "Ropa y calzado de hombre",
        "Joyas y accesorios",
        "Salud y belleza",
        "Productos para mascotas",
        "Bebés y niños",
        "Juguetes y juegos",
        "Electrónica e informática",
        "Teléfonos celulares",
        "Bicicletas",
        "Arte y manualidades",
        "Deportes y actividades al aire libre",
        "Autopartes",
        "Instrumentos musicales",
        "Antigüedades y artículos de colección",
        "Venta de garaje",
        "Varios"
    ],

    async set(categoryName) {
        if (!categoryName) return false;
        categoryName = categoryName.trim();
        console.log(`[DropiCategory] Objetivo: "${categoryName}"`);

        // 1. Verificar si YA ESTÁ seleccionada (para no hacer nada)
        // Buscamos si el texto de la categoría aparece dentro del label activo
        const alreadySet = this.checkIfAlreadySelected(categoryName);
        if (alreadySet) {
            console.log('[DropiCategory] Categoría ya establecida. Saltando.');
            return true;
        }

        // 2. Encontrar Trigger (Lógica Original)
        // Buscamos el label combobox que dice "Categoría"
        const trigger = await this.findTrigger();
        if (!trigger) {
            console.error('[DropiCategory] No se encontró el desplegable.');
            return false;
        }

        try {
            trigger.scrollIntoView({ block: 'center', inline: 'nearest' });
            await new Promise(r => setTimeout(r, 500));
            trigger.click();
            trigger.dispatchEvent(new MouseEvent('click', { bubbles: true })); // Fallback
            console.log('[DropiCategory] Menú abierto.');
        } catch (e) {
            console.error('[DropiCategory] Error trigger click', e);
            return false;
        }

        // Esperar menú
        await new Promise(r => setTimeout(r, 1500));

        // 3. Seleccionar Opción (Lógica Original Robusta)
        return await this.selectOption(categoryName);
    },

    checkIfAlreadySelected(targetCat) {
        // Busca si el texto de la categoría objetivo existe visible en el formulario
        // Ojo: Solo text nodes visibles.
        try {
            const xpath = `//label[@role='combobox']//span[contains(text(), '${targetCat}')]`;
            const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return !!node;
        } catch (e) { return false; }
    },

    async findTrigger() {
        // En tu HTML original:
        // <label aria-labelledby="..." role="combobox">
        //    <span>Categoría</span> ...
        // </label>

        const xpath = "//label[@role='combobox' and .//span[contains(text(), 'Categoría')]]";
        const labelNode = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (labelNode) return labelNode;

        // Fallback simple por si cambia algo
        const spanXpath = "//span[text()='Categoría']";
        const spanNode = document.evaluate(spanXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (spanNode) {
            return spanNode.closest('label') || spanNode.closest('[role="button"]');
        }

        return null;
    },

    async selectOption(categoryName) {
        // --- FUNCIÓN HELPER PRO PARA INTENTAR CLICKEAR ---
        const attemptClick = async (targetName, retries = 5) => {
            console.log(`[DropiCategory] 🔎 Buscando opción: "${targetName}" (Intentos restantes: ${retries})`);

            // Lista de estrategias de búsqueda (Selectores)
            const strategies = [
                `//div[@role='dialog']//span[text()='${targetName}']`, // Exacto en dialogo
                `//span[text()='${targetName}']`, // Exacto global (por si no detecta dialog)
                `//div[@role='dialog']//span[contains(text(), '${targetName}')]`, // Contiene texto
                `//div[@aria-label="${targetName}"]` // Aria label
            ];

            for (let i = 0; i < retries; i++) {
                for (const xpath of strategies) {
                    const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                    // Verificamos que el nodo exista y tenga cierta visibilidad (offsetParent)
                    if (node && node.offsetParent !== null) {
                        console.log(`[DropiCategory] ✅ Opción "${targetName}" encontrada. Clickeando...`);

                        node.scrollIntoView({ block: 'center', inline: 'nearest' });
                        await new Promise(r => setTimeout(r, 300));

                        // Hacemos el click en el nodo y en su padre interactivo por seguridad
                        node.click();
                        const parent = node.closest('[role="button"]');
                        if (parent) parent.click();

                        return true; // Éxito
                    }
                }
                // Si no se encuentra, esperamos un poco antes del siguiente reintento (Polling)
                await new Promise(r => setTimeout(r, 600));
            }
            return false; // Falló tras todos los intentos
        };

        // --- FLUJO BLINDADO ---
        // 1. Intento Principal: La categoría exacta
        if (await attemptClick(categoryName)) return true;

        // 2. Si falló, intentar buscar una que CONTENGA el texto (más flexible)
        console.warn(`[DropiCategory] ⚠️ No se encontró "${categoryName}" exacto. Intentando búsqueda flexible...`);
        if (await attemptClick(categoryName.substring(0, 5))) return true;

        return false;
    }
};
