
window.DropiApp = window.DropiApp || {};
window.DropiApp.Fields = window.DropiApp.Fields || {};

/**
 * Módulo para gestionar "Preferencias de entrega".
 * Objetivo: Activar siempre "Entrega en la puerta".
 */
window.DropiApp.Fields.Delivery = {

    async set() {
        console.log('[DropiDelivery] Intentando activar "Entrega en la puerta"...');

        // 1. Buscar la opción por texto
        const targetText = "Entrega en la puerta";
        const xpath = `//span[contains(text(), '${targetText}')]`;

        try {
            const spanNode = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (!spanNode) {
                console.warn('[DropiDelivery] No se encontró el texto de la opción.');
                return false;
            }

            // 2. Encontrar el contenedor interactivo (checkbox o botón)
            // Normalmente en FB es un div con role="checkbox" o button
            let clickable = spanNode.closest('[role="checkbox"]') || spanNode.closest('[role="button"]');

            // Fallback: Si no tiene role explícito, buscar el contenedor de fila común en FB
            if (!clickable) {
                // Buscamos un ancestro con alguna clase de interactividad o el contenedor de la fila
                clickable = spanNode.closest('.x1ja2u2z.x78zum5.x2lah0s'); // Clase común en tu snippet para la fila
                if (!clickable) clickable = spanNode.parentElement.parentElement.parentElement; // Subir niveles genéricos
            }

            if (clickable) {
                // 3. Verificar estado (Evitar desmarcar si ya está activo)
                const isChecked = clickable.getAttribute('aria-checked') === 'true';

                if (isChecked) {
                    console.log('[DropiDelivery] "Entrega en la puerta" ya está activado. Saltando.');
                    return true;
                }

                // Scroll y Click
                clickable.scrollIntoView({ block: 'center', inline: 'nearest' });
                await new Promise(r => setTimeout(r, 300));

                if (clickable.click) clickable.click();
                else clickable.dispatchEvent(new MouseEvent('click', { bubbles: true }));

                console.log('[DropiDelivery] ✅ Opción activada.');
                return true;
            }
        } catch (e) {
            console.error('[DropiDelivery] Error al intentar activar entrega:', e);
        }
        return false;
    }
};
