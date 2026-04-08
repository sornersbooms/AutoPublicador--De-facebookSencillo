window.DropiApp = window.DropiApp || {};

window.DropiApp.Extras = {
    IDS: {
        condition: '#_r_29___0', // ID original (puede fallar)
        tags: '#_r_2u_'          // ID textarea tags
    },

    async run(product) {
        console.log('[DropiExtras] --- Iniciando Extras ---');

        // 1. Estado: Nuevo
        await this.selectConditionNew();

        // 2. Etiquetas
        if (product.tags && product.tags.length > 0) {
            await this.fillTags(product.tags);
        }

        console.log('[DropiExtras] --- Fin Extras ---');
    },

    async selectConditionNew() {
        console.log('[DropiExtras] Intentando seleccionar Estado...');

        // A. Encontrar el Dropdown (Menú)
        let dropdown = document.querySelector(this.IDS.condition);

        // Estrategia B: Buscar por Aria Label
        if (!dropdown) dropdown = document.querySelector('[aria-label="Estado"]');
        if (!dropdown) dropdown = document.querySelector('[aria-label="Condition"]');

        // Estrategia C: Buscar por Label de texto
        if (!dropdown) {
            const labels = Array.from(document.querySelectorAll('label'));
            const label = labels.find(l => l.innerText.includes('Estado') || l.innerText.includes('Condition'));
            if (label) {
                dropdown = label.querySelector('[role="combobox"]') || label.nextElementSibling;
            }
        }

        if (!dropdown) {
            console.error('[DropiExtras] ❌ No encontré el menú de Estado.');
            alert('No encuentro el campo "Estado". Haz clic en él manualmente.');
            return;
        }

        // B. Abrir el menú
        dropdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 300));
        dropdown.click();
        console.log('[DropiExtras] Menú clickeado. Esperando opciones...');

        await new Promise(r => setTimeout(r, 1500)); // Espera vital para que React renderice el menú

        // C. Buscar y Clicar "Nuevo"
        // Buscamos en TODOS los spans del documento porque el menú suele estar en un layer al final del body
        const allSpans = Array.from(document.querySelectorAll('span'));
        const newOption = allSpans.find(s => s.innerText.trim() === 'Nuevo' || s.innerText.trim() === 'New');

        if (newOption) {
            newOption.click();
            console.log('[DropiExtras] ✅ Opción "Nuevo" seleccionada.');
        } else {
            console.warn('[DropiExtras] ⚠️ No encontré el texto "Nuevo" en ningún span visible.');
            // Intento desesperado: buscar divs
            const allDivs = Array.from(document.querySelectorAll('div[role="option"]'));
            const newDiv = allDivs.find(d => d.innerText.includes('Nuevo'));
            if (newDiv) newDiv.click();
        }
    },

    async fillTags(tags) {
        console.log('[DropiExtras] Intentando llenar etiquetas...');

        let tagInput = document.querySelector(this.IDS.tags);

        if (!tagInput) {
            // Buscar por label si el ID falló
            const labels = Array.from(document.querySelectorAll('label'));
            const label = labels.find(l => l.innerText.includes('Etiquetas') || l.innerText.includes('Tags'));
            if (label) tagInput = label.querySelector('textarea');
        }

        if (!tagInput) {
            console.error('[DropiExtras] ❌ No encontré el campo Etiquetas.');
            return;
        }

        tagInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 500));

        for (const tag of tags) {
            tagInput.focus();
            tagInput.click();

            // 1. Escribir texto
            if (!document.execCommand('insertText', false, tag)) {
                tagInput.value = tag; // Fallback directo
            }

            // 2. Disparar eventos de entrada para que React se entere
            tagInput.dispatchEvent(new Event('input', { bubbles: true }));

            await new Promise(r => setTimeout(r, 100));

            // 3. Simular ENTER (La clave del éxito)
            // Enviamos varios tipos de eventos Enter para asegurar compatibilidad
            const eventOptions = { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 };
            tagInput.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
            tagInput.dispatchEvent(new KeyboardEvent('keypress', eventOptions));
            tagInput.dispatchEvent(new KeyboardEvent('keyup', eventOptions));

            await new Promise(r => setTimeout(r, 500)); // Pausa entre etiquetas
        }
        console.log('[DropiExtras] ✅ Etiquetas finalizadas.');
    }
};
