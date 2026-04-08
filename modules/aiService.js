
window.DropiApp = window.DropiApp || {};

window.DropiApp.AiService = {
    // API CONFIG
    // API CONFIG
    API_KEY: '', // CLAVE ELIMINADA - USUARIO DEBE PROVEERLA
    API_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: 'llama-3.1-8b-instant',

    /**
     * Genera TODO el contenido necesario para el listing: Título, Descripción y Categoría.
     * @param {Object} product - Objeto del producto (title, description, etc.)
     * @returns {Object} { title, description, category }
     */
    async generateContent(product) {
        console.log('[AiService] Generando contenido inteligente...');

        // 0. Validar API Key del Usuario (OBLIGATORIO)
        const userKey = window.DropiApp.UserAIKey;

        if (!userKey || userKey.length < 10) {
            alert('⚠️ ATENCIÓN: Para usar la IA, debes configurar TU PROPIA API KEY de IA.\n\nVe a la pestaña "Licencia" > "Configuración IA" y pega tu clave.');
            console.error('[AiService] Falta API Key del usuario.');
            return null;
        }

        console.log('[AiService] Usando API Key Personal.');

        // 1. Validar Dependencias (Categorías)
        if (!window.DropiApp.Fields || !window.DropiApp.Fields.Category) {
            console.error('[AiService] Error: Módulo Category no cargado.');
            return null;
        }
        const validCategories = window.DropiApp.Fields.Category.SUPPORTED_CATEGORIES;

        // 2. Construir Prompt
        const prompt = this.buildPrompt(product, validCategories);

        // 3. Llamar API
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userKey}`
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `Eres un motor de procesamiento de datos para Facebook Marketplace. 
                            REGLA DE ORO: Las "INSTRUCCIONES DEL USUARIO" son órdenes ejecutivas que sobreescriben cualquier otra lógica. 
                            Si el usuario pide una suma, hazla con precisión exacta. 
                            Si el usuario pide un estilo, úsalo. 
                            Responde ÚNICAMENTE en JSON.`
                        },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.1, // Temperatura casi 0 para evitar alucinaciones matemáticas y ser ultra-fiel al prompt
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            console.log('[AiService] Respuesta Raw:', content);

            // Parsear JSON
            let parsed = null;
            try {
                parsed = JSON.parse(content);
            } catch (e) {
                // Fallback si devuelve markdown ```json ... ```
                const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
                parsed = JSON.parse(clean);
            }

            // Validar Categoría
            if (parsed.category) {
                const exactMatch = validCategories.find(c => c.toLowerCase() === parsed.category.toLowerCase());
                if (exactMatch) parsed.category = exactMatch;
                else {
                    console.warn(`[AiService] Categoría inválida "${parsed.category}".`);
                    parsed.category = null; // Dejar null para fallback
                }
            }

            return parsed;

        } catch (error) {
            console.error('[AiService] Fallo:', error);
            return null;
        }
    },

    buildPrompt(product, categories) {
        let userCustomPrompt = window.DropiApp.UserAIPrompt || "Genera contenido de venta optimizado.";

        // Datos reales
        const basePrice = product.providerPrice || 0;
        const title = product.title || 'Sin Título';
        const description = (product.description || 'Sin Descripción').substring(0, 1000);
        const category = product.category || 'Varios';

        // REEMPLAZO PREVIO: Para que la IA no tenga que adivinar etiquetas.
        // Recibe las instrucciones ya masticadas con los datos del producto actual.
        let finalInstructions = userCustomPrompt
            .replace(/{{TITULO}}/g, title)
            .replace(/{{DESCRIPCION}}/g, description)
            .replace(/{{PRECIO_PROVEEDOR}}/g, basePrice)
            .replace(/{{CATEGORIA}}/g, category);

        return `
            PRODUCTO ACTUAL:
            - Título original: ${title}
            - Precio base: ${basePrice}
            - Categoría sugerida: ${category}

            INSTRUCCIONES SUPREMAS (DEL USUARIO):
            "${finalInstructions}"

            ---
            REQUISITOS TÉCNICOS:
            1. El campo "category" debe ser uno de estos: ${JSON.stringify(categories)}.
            2. El campo "listing_price" debe ser un NÚMERO entero sin símbolos.
            3. Estructura JSON: {"category":"","listing_title":"","listing_description":"","listing_tags":[],"listing_price":0}
        `;
    }
};
