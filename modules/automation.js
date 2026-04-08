window.DropiApp = window.DropiApp || {};

window.DropiApp.Automation = {
    get USER_IDS() {
        // Anti-Trap Protection: Selectors come from Server
        if (window.DropiApp.License && window.DropiApp.License.state.config) {
            return window.DropiApp.License.state.config.selectors;
        }
        // Fallback or Dummy (Empty objects breaks automation if license invalid)
        return { title: 'DUMMY_PROTECTED', price: 'DUMMY_PROTECTED', description: '', location: '' };
    },

    // Cache simple para evitar re-descargas en la misma sesión
    blobCache: new Map(),
    imageBlobs: [], // Inicializado para evitar crash

    fetchImageViaBackground(url) {
        // Verificar caché primero
        if (this.blobCache.has(url)) {
            return Promise.resolve(this.blobCache.get(url));
        }

        return new Promise((resolve, reject) => {
            // Timeout de seguridad reducido para fallar rápido si se cuelga
            const timeout = setTimeout(() => reject(new Error('Timeout descarga imagen')), 8000);

            chrome.runtime.sendMessage({ action: 'downloadImage', url: url }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));

                if (response && response.success) {
                    fetch(response.data)
                        .then(res => res.blob())
                        .then(blob => {
                            // Guardar en caché
                            this.blobCache.set(url, blob);
                            resolve(blob);
                        })
                        .catch(reject);
                } else {
                    reject(new Error('Error descarga background'));
                }
            });
        });
    },

    async prepareImages(imageUrls) {
        if (!imageUrls || !Array.isArray(imageUrls)) imageUrls = [];

        if (imageUrls.length > 10) {
            console.log(`[DropiAuto] ✂️ Recortando imágenes de ${imageUrls.length} a 10 (Límite FB).`);
            imageUrls = imageUrls.slice(0, 10);
        }

        this.imageBlobs = [];
        console.log(`[DropiAuto] ⚡ Iniciando carga de ${imageUrls.length} imágenes...`);

        const promises = imageUrls.map(async (url, index) => {
            try {
                let blob;
                if (url.startsWith('data:')) {
                    // Convert Data URL to Blob
                    const resp = await fetch(url);
                    blob = await resp.blob();
                } else {
                    blob = await this.fetchImageViaBackground(url);
                }

                if (blob && blob.size > 0) {
                    return { blob, name: `img_${index}.jpg`, type: blob.type || 'image/jpeg' };
                }
                return null;
            } catch (e) {
                console.warn(`[DropiAuto] Falló img ${index}:`, e.message);
                return null;
            }
        });

        const results = await Promise.all(promises);
        this.imageBlobs = results.filter(item => item !== null);
        console.log(`[DropiAuto] ✅ ${this.imageBlobs.length} Imágenes listas en memoria.`);
    },

    injectImagesInstant() {
        if (this.imageBlobs.length === 0) return false;

        const allInputs = Array.from(document.querySelectorAll('input[type="file"]'));
        // Buscar específicamente el input que acepta múltiples archivos (el principal de Facebook)
        // Usualmente tiene accept="image/*" y multiple=""
        const fileInput = allInputs.find(input =>
            !input.id.startsWith('dropi-') &&
            input.hasAttribute('multiple') // Clave: Debe aceptar múltiples
        ) || allInputs.find(input => !input.id.startsWith('dropi-')); // Fallback al primero disponible

        if (!fileInput) return false;

        const dataTransfer = new DataTransfer();

        // Agregar TODAS las imágenes al DataTransfer
        this.imageBlobs.forEach(item => {
            const file = new File([item.blob], item.name, { type: item.type });
            dataTransfer.items.add(file);
        });

        try {
            // Asignación directa
            fileInput.files = dataTransfer.files;

            // Eventos críticos para que React/Facebook detecte el cambio de golpe
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            fileInput.dispatchEvent(new Event('input', { bubbles: true }));

            console.log(`[DropiAuto] 📸 Inyectadas ${this.imageBlobs.length} imágenes en el input.`);
            return true;
        } catch (e) {
            console.error('[DropiAuto] Error inyectando imágenes:', e);
            return false;
        }
    },

    // Helper para UI Shadow DOM
    getUiElement(id) {
        return (window.DropiApp.UI && window.DropiApp.UI.shadowRoot)
            ? window.DropiApp.UI.shadowRoot.getElementById(id)
            : null;
    },

    async fillProduct(product) {
        if (!product) return;

        // 🔒 BLOQUEO GLOBAL: Marca de estado ocupado
        window.DROPI_IS_FILLING = true;

        // 🔒 BLOQUEO DE BUCLE: Avisamos al AutoLoop que estamos ocupados para que no salte de producto
        if (window.DropiApp.AutoLoop) {
            console.log('[DropiAuto] 🔒 Bloqueando AutoLoop durante el llenado...');
            window.DropiApp.AutoLoop.isProcessing = true;
        }

        console.log('[DropiAuto] Iniciando llenado INTELIGENTE...');

        // 🛡️ MÓDULO DE SEGURIDAD (PolicyGuard)
        if (window.DropiApp.PolicyGuard) {
            const securityCheck = await window.DropiApp.PolicyGuard.checkProduct(product);
            if (!securityCheck.safe) {
                console.error(`⛔ PRODUCTO BLOQUEADO POR POLÍTICAS FB: ${securityCheck.reason}. Saltando al siguiente...`);

                // LOGICA DE SALTO INTELIGENTE (Auto-Skip) - ACTIVA
                const nextBtn = this.getUiElement('dropi-next-btn'); // SHADOW DOM FIX
                if (nextBtn) {
                    console.log('[DropiAuto] ⏭️ Saltando producto prohibido...');

                    // 1. Liberar semáforo del intento actual
                    window.DROPI_IS_FILLING = false;
                    if (window.DropiApp.AutoLoop) window.DropiApp.AutoLoop.isProcessing = false;

                    // 2. Avanzamos de producto
                    nextBtn.click();

                    // 3. Reiniciamos llenado en 4 segundos
                    setTimeout(() => {
                        const fillBtn = this.getUiElement('dropi-fill-btn'); // SHADOW DOM FIX
                        if (fillBtn) {
                            console.log('[DropiAuto] 🔄 Reintentando con nuevo producto...');
                            fillBtn.click();
                        }
                    }, 4000);
                }
                return; // DETENER este intento fallido
            }
        }

        // 1. Imágenes
        let injected = this.injectImagesInstant();
        if (!injected && product.images?.length > 0) {
            await this.prepareImages(product.images);
            injected = this.injectImagesInstant();
        }

        if (!injected) {
            const addPhotoBtn = this.findAddPhotoButton();
            if (addPhotoBtn) {
                if (typeof addPhotoBtn.click === 'function') {
                    addPhotoBtn.click();
                } else {
                    addPhotoBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
                await new Promise(r => setTimeout(r, 1000));
                this.injectImagesInstant();
            }
        }

        await new Promise(r => setTimeout(r, 1000));

        // 3. Título
        let finalTitle = product.title || '';

        // REGLA OBLIGATORIA: Agregar sufijo de pago contraentrega (si se desea, pero el usuario dijo 'unicamente desde inputs')
        // Vamos a respetar lo que esté en el input.
        const suffix = "";
        const maxTotalLength = 100;
        const maxTitleLength = maxTotalLength - suffix.length;

        if (finalTitle.length > maxTitleLength) {
            let trimmed = finalTitle.substring(0, maxTitleLength);
            const lastSpace = trimmed.lastIndexOf(' ');
            if (lastSpace > 0) trimmed = trimmed.substring(0, lastSpace);
            finalTitle = trimmed;
        }

        await this.smartFill('Título', finalTitle, this.USER_IDS.title);

        // 3.2 Estado
        if (window.DropiApp.Fields && window.DropiApp.Fields.Condition) {
            await window.DropiApp.Fields.Condition.set("Nuevo");
            await new Promise(r => setTimeout(r, 500));
        }

        // 4. Precio
        let finalPrice = product.providerPrice || product.suggestedPrice || 0;
        await this.smartFill('Precio', String(finalPrice), this.USER_IDS.price);

        // 5. Expandir "Más detalles"
        await new Promise(r => setTimeout(r, 1000));
        await this.expandMoreDetails();

        // 6. Descripción
        let finalDescription = product.description || '';
        await this.smartFill('Descripción', finalDescription, this.USER_IDS.description);

        // 7. Etiquetas
        if (window.DropiApp.Fields && window.DropiApp.Fields.Tags) {
            let combinedTags = product.tags || [];

            // REGLA ESTRICTA 2025: MÁXIMO 20 TAGS (Facebook permite hasta 20)
            if (combinedTags.length > 20) {
                combinedTags = combinedTags.slice(0, 20);
            }

            await window.DropiApp.Fields.Tags.set(combinedTags);
        }

        // 8. Preferencias de Entrega
        if (window.DropiApp.Fields && window.DropiApp.Fields.Delivery) {
            await window.DropiApp.Fields.Delivery.set();
        }

        // 8.5 SELECCIÓN DE CATEGORÍA
        let finalCategory = product.category;
        if (window.DropiApp.Fields && window.DropiApp.Fields.Category && finalCategory) {
            await window.DropiApp.Fields.Category.set(finalCategory);
            await new Promise(r => setTimeout(r, 500));
        }

        // 9. UBICACIÓN (CON ROTACIÓN)
        if (window.DropiApp.Fields && window.DropiApp.Fields.Location && product.locations && product.locations.length > 0) {
            // Tomamos la primera ubicación
            const targetLocation = product.locations[0]; 
            console.log(`[DropiAuto] 📍 Usando ubicación rotativa: ${targetLocation}`);
            
            await window.DropiApp.Fields.Location.set(targetLocation);
            
            // ROTACIÓN: Movemos la ubicación usada al final de la lista para la próxima vez
            product.locations.push(product.locations.shift());
            window.DropiApp.State.save(); // Persistir rotación
            
            await new Promise(r => setTimeout(r, 500));
        }

        console.log('[DropiAuto] 🏁 Formulario completo. Avanzando...');

        // 9. CLICK EN SIGUIENTE (Con Auto-Reparación)
        await new Promise(r => setTimeout(r, 1000));

        try {
            // Función helper para buscar el botón
            const findNextBtn = () => document.evaluate(
                "//div[@role='button' and @aria-label='Siguiente']",
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;

            let nextBtn = findNextBtn();

            // --- LÓGICA DE RECUPERACIÓN ---
            if (!nextBtn) {
                console.warn('[DropiAuto] ⚠️ Botón "Siguiente" no visible. Posible error de categoría. Reparando...');

                // Intento 1: Re-aplicar la categoría que traíamos (IA o JSON)
                if (finalCategory) {
                    console.log(`[DropiAuto] 🔄 Reintentando poner categoría: "${finalCategory}"`);
                    await window.DropiApp.Fields.Category.set(finalCategory);
                    await new Promise(r => setTimeout(r, 1500)); // Esperar a que UI reaccione
                    nextBtn = findNextBtn();
                }

                // Intento 2: Si sigue fallando, usar "Hogar" (Comodín)
                if (!nextBtn) {
                    console.warn('[DropiAuto] ⚠️ Falló la categoría original. Aplicando fallback de emergencia: "Hogar"');
                    await window.DropiApp.Fields.Category.set("Hogar");
                    await new Promise(r => setTimeout(r, 1500));
                    nextBtn = findNextBtn();
                }
            }
            // ------------------------------

            if (nextBtn) {
                nextBtn.scrollIntoView({ block: 'center', inline: 'nearest' });
                await new Promise(r => setTimeout(r, 500));

                nextBtn.click();
                console.log('[DropiAuto] ✅ Click en "Siguiente" realizado.');
            } else {
                console.error('[DropiAuto] ❌ Botón "Siguiente" no apareció ni con fallback. Revisión manual requerida.');
            }
        } catch (e) {
            console.error('[DropiAuto] Error al dar click en Siguiente:', e);
        }

        // 10. CLICK EN PUBLICAR
        console.log('[DropiAuto] Esperando a botón Publicar...');
        // Esperamos la transición (puede tardar unos segundos)
        await new Promise(r => setTimeout(r, 4000)); // Aumentado levemente para seguridad

        try {
            let publishBtn = null;
            // Intentos para encontrar el botón (máximo 5 segundos extra)
            for (let i = 0; i < 5; i++) {
                publishBtn = document.evaluate(
                    "//div[@role='button' and @aria-label='Publicar']",
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;

                if (publishBtn) break;
                await new Promise(r => setTimeout(r, 1000));
            }

            if (publishBtn) {
                // Scroll suave y espera
                publishBtn.scrollIntoView({ block: 'center', inline: 'nearest' });
                await new Promise(r => setTimeout(r, 800));

                // CLICK ÚNICO y SEGURO
                // Se eliminó el dispatchEvent consecutivo que enviaba una segunda señal
                publishBtn.click();

                console.log('[DropiAuto] 🚀 ¡PUBLICADO EXITOSAMENTE! (Click único)');
            } else {
                console.warn('[DropiAuto] ⚠️ Botón "Publicar" no encontrado tras espera.');
            }
        } catch (e) {
            console.error('[DropiAuto] Error Global en Automatización:', e);

            // 🔓 DESBLOQUEO DE EMERGENCIA
            window.DROPI_IS_FILLING = false;

            if (window.DropiApp.AutoLoop) {
                console.log('[DropiAuto] 🔓 Desbloqueando AutoLoop por error...');
                window.DropiApp.AutoLoop.isProcessing = false;
            }
        }

        // 11. REDIRECCIÓN AUTO-CICLO (MONITOREO ACTIVO)
        console.log('[DropiAuto] ⏳ Monitoreando cambio de URL para autoredirección (Máx 30s)...');

        // Intentamos detectar el cambio de URL durante 30 segundos
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 1000)); // Chequeo cada 1 segundo

            if (window.location.href.includes('/marketplace/you/selling')) {
                console.log('[DropiAuto] 🔄 ¡Éxito detectado! Redirigiendo a crear nuevo producto...');

                // 🔓 LIBERAR SEMÁFORO DEL BUCLE
                window.DROPI_IS_FILLING = false;
                localStorage.setItem('dropi_loop_step', 'next');

                window.location.href = 'https://www.facebook.com/marketplace/create/item';
                return; // Terminamos aquí
            }
        }

        console.warn('[DropiAuto] ⚠️ Tiempo agotado. No se detectó redirección a "/selling".');
        console.log('[DropiAuto] Finalizado.');
    },

    async expandMoreDetails() {
        console.log('[DropiAuto] Verificando estado de "Más detalles"...');

        // 1. Verificación precisa basada en tu HTML:
        // Buscamos el SPAN que dice "Descripción" literalmente.
        // Tu código: <span ...>Descripción</span>
        const descriptionLabel = document.evaluate(
            "//span[text()='Descripción']",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (descriptionLabel) {
            // Si el texto "Descripción" existe en la página, es porque ya se expandió.
            // Verificamos visibilidad básica por si acaso (height > 0)
            if (descriptionLabel.offsetParent !== null) {
                console.log('[DropiAuto] ✅ Panel ya expandido (Etiqueta "Descripción" visible).');
                return;
            }
        }

        // 2. Si no encontramos "Descripción", buscamos el botón "Más detalles" para abrirlo.
        // Tu código: <span ...>Más detalles</span>
        let expandBtn = document.evaluate(
            "//span[text()='Más detalles']",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (expandBtn) {
            console.log('[DropiAuto] Botón "Más detalles" encontrado. Expandiendo...');

            // Intentar click en el padre div si el span no responde, o directo al span
            // Tu código muestra el span dentro de un div class="xu06os2..."
            // A veces el evento está en el div contenedor.
            const parentDiv = expandBtn.closest('div[role="button"]') || expandBtn.parentElement;

            expandBtn.scrollIntoView({ block: 'center', inline: 'nearest' });
            await new Promise(r => setTimeout(r, 300));

            // Click Dual (Span y Padre) para asegurar
            expandBtn.click();
            if (parentDiv) parentDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            // Espera generosa para que React monte el DOM
            await new Promise(r => setTimeout(r, 1500));
        } else {
            console.warn('[DropiAuto] ⚠️ No se encontró botón "Más detalles" ni campo "Descripción".');
        }
    },

    findAddPhotoButton() {
        const xpath = "//*[contains(text(), 'Agregar fotos')]";
        try {
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return (result.singleNodeValue && result.singleNodeValue.nodeType === Node.ELEMENT_NODE) ? result.singleNodeValue : null;
        } catch (e) {
            console.warn('[DropiAuto] XPath Error:', e);
            return null;
        }
    },

    async smartFill(fieldName, text, specificId) {
        // Búsqueda Robusta con Reintentos
        let element = await this.findFieldWithRetry(fieldName, specificId);

        if (element) {
            element.scrollIntoView({ block: 'center', inline: 'nearest' });
            await new Promise(r => setTimeout(r, 300)); // Espera tras scroll
            await this.simulateTyping(element, text);
        } else {
            console.error(`[DropiAuto] ❌ NO SE ENCONTRÓ: ${fieldName}`);
            alert(`No encontré el campo "${fieldName}". Por favor llénalo manualmente.`);
        }
    },

    async findFieldWithRetry(fieldName, specificId, retries = 3) {
        for (let i = 0; i < retries; i++) {
            let el = this.findField(fieldName, specificId);
            if (el) return el;
            await new Promise(r => setTimeout(r, 500));
        }
        return null;
    },

    findField(fieldName, specificId) {
        // 1. ID Específico
        if (specificId) {
            const el = document.querySelector(specificId);
            if (el) return el;
        }
        // 2. Aria Label
        let el = document.querySelector(`[aria-label*="${fieldName}" i]`);
        if (el) return el;
        // 3. Placeholder
        el = document.querySelector(`[placeholder*="${fieldName}" i]`);
        if (el) return el;
        // 4. Label Text (Búsqueda profunda)
        const labels = Array.from(document.querySelectorAll('label'));
        const targetLabel = labels.find(l => l.innerText.toLowerCase().includes(fieldName.toLowerCase()));
        if (targetLabel) {
            return targetLabel.querySelector('input, textarea') || document.getElementById(targetLabel.getAttribute('for'));
        }
        return null;
    },

    setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else {
            valueSetter.call(element, value);
        }
    },

    async simulateTyping(element, text) {
        element.focus();
        element.click();

        // Método 1: execCommand (Legacy pero fiable)
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        const success = document.execCommand('insertText', false, text);

        // Método 2: setNativeValue (React Hack)
        if (!success) {
            this.setNativeValue(element, text);
        }

        // Disparar eventos SIEMPRE
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        await new Promise(r => setTimeout(r, 100));
    },

    async copyImageToClipboard(url) {
        try {
            const blob = await this.fetchImageViaBackground(url);
            await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
            return true;
        } catch (e) { return false; }
    }
};
