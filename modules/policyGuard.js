window.DropiApp = window.DropiApp || {};

/**
 * Módulo de Seguridad: PolicyGuard (Versión 3.0 - Sincronización Total Meta)
 * Basado en las 24 políticas oficiales de Meta: https://www.facebook.com/policies_center/commerce/
 */
window.DropiApp.PolicyGuard = {

    // Categorías de riesgo basadas en las 24 políticas de contenido prohibido y contenido restringido de Meta
    POLICIES: {
        ADULT: ["sexo", "sexual", "vibrador", "desnudo", "xxx", "adulto", "lenceria erotica", "juguete sexual", "estimulante sexual", "viagra", "porno", "connotacion sexual"],
        ALCOHOL: ["alcohol", "licor", "cerveza", "vino", "whisky", "tequila", "vodka", "ron", "aguardiente", "bebida alcoholica"],
        BODY_PARTS: ["organo", "sangre", "fluido corporal", "cabello humano", "diente", "hueso", "parte del cuerpo"],
        DIGITAL_DEVICES: ["iptv", "streaming no autorizado", "decodificador", "jailbreak", "crack", "hack", "dispositivo de streaming", "cuenta premium"],
        DISCRIMINATION: ["raza", "etnia", "religion", "orientacion sexual", "identidad de genero", "discapacidad", "condicion medica"],
        FINANCIAL: ["dinero", "billete", "moneda", "prestamo", "credito", "tarjeta de debito", "tarjeta de credito", "inversion", "forex", "trading", "bitcoins", "divisa", "cheque", "instrumento financiero"],
        GAMBLING: ["apuesta", "casino", "loteria", "rifa", "sorteo", "bingo", "poker", "juego de azar"],
        HAZARDOUS: ["material peligroso", "sustancia toxica", "veneno", "quimico explosivo", "gas inflamable", "acido"],
        HUMAN_EXPLOITATION: ["trata de personas", "prostitucion", "acompañante", "servicio sexual", "masaje erotico"],
        JOBS: ["empleo", "vacante", "trabajo", "busco personal", "oportunidad laboral", "contratamos"],
        ANIMALS: ["animal", "perro", "gato", "mascota", "cachorro", "adoptar", "semental", "monta", "cachorros", "pajaros", "reptil", "ganado", "caballo", "piel de animal", "marfil", "hueso de animal"],
        MEDICAL_HEALTH: ["medicina", "medicamento", "pastilla", "suplemento medico", "insulina", "botox", "relleno dermico", "prueba de embarazo", "oximetro", "termometro clinico", "lente de contacto", "jarabe", "antibiotico", "recetado", "cura para", "baja de peso", "adelgazante", "quemador de grasa", "suplemento ingerible"],
        MISLEADING_VIOLENT: ["odio", "violencia", "engañoso", "estafa", "discriminatorio", "ofensivo", "arma blanca"],
        NO_ITEM: ["noticia", "humor", "meme", "chiste", "opinion", "no se vende"],
        PRESCRIPTION_DRUGS: ["receta medica", "droga", "marihuana", "cbd", "thc", "bonga", "pipa", "estupefaciente", "vape", "vaporizador", "pod", "esencia para vape"],
        RECALLED_PRODUCTS: ["producto defectuoso", "retirado del mercado", "falla de fabrica"],
        STOLEN_GOODS: ["articulo robado", "ilegal", "sin autorizacion", "encontrado"],
        SUBSCRIPTIONS: ["netflix", "spotify", "cuenta digital", "disney+", "hbo", "prime video", "suscripcion", "codigo de descarga", "membresia"],
        INFRINGEMENT_COPIES: ["falsificacion", "replica", "clon", "imitacion", "calidad aaa", "identico al original", "espejo", "inspirado en", "fake", "1.1", "calidad g5", "top quality", "copyright", "derechos de autor", "marca registrada"],
        TOBACCO: ["tabaco", "cigarro", "nicotina", "cigarrillo electronico", "puro", "habano", "cenicero", "parafernalia de tabaco"],
        USED_COSMETICS: ["cosmetico usado", "maquillaje usado", "perfume abierto", "crema usada"],
        VEHICLE_PARTS: ["repuesto usado", "parte de vehiculo", "motor usado", "transmision", "airbag", "bolsa de aire"],
        WEAPONS: ["arma", "pistola", "rifle", "municion", "taser", "electrochoque", "gas pimienta", "navaja tactica", "navaja militar", "balines", "polvora", "explosivo", "fuego artificial", "silenciador", "mira telescopica", "honda", "ballesta", "arco y flecha"],
        RESTRICTED_SERVICES: ["boleto", "entrada", "ticket", "tarjeta de regalo", "cupon", "gift card", "adopcion de mascota", "servicio"],
    },

    /**
     * Verifica si un producto es seguro para publicar.
     * @param {Object} product - El objeto producto (title, description)
     * @returns {Promise<{safe: boolean, reason: string}>}
     */
    async checkProduct(product) {
        console.log('[PolicyGuard 🛡️] Iniciando análisis basado en Meta Commerce Policies...');
        const title = (product.title || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        const fullText = `${title} ${description}`;

        // 1. FILTRO DE PALABRAS CLAVE (Detección Determinista de las 24 categorías)
        for (const [category, keywords] of Object.entries(this.POLICIES)) {
            for (const word of keywords) {
                // Regex para palabra exacta o plural
                const regex = new RegExp(`\\b${word.replace(/\+/g, '\\+')}s?\\b`, 'i');
                if (regex.test(fullText)) {
                    console.warn(`[PolicyGuard ❌] BLOQUEO: Política de "${this.getFriendlyCategoryName(category)}" detectada por palabra: "${word}"`);
                    return {
                        safe: false,
                        reason: `Meta Commerce Policy (${this.getFriendlyCategoryName(category)}): Palabra prohibida "${word}"`
                    };
                }
            }
        }

        // 2. FILTRO DE FRASES DE ALTO RIESGO
        const riskyPhrases = [
            "garantizado bajar de peso", "cura el cancer", "cura la diabetes",
            "original?", "no es original", "identico al de", "inspirado en la marca",
            "mas barato que en la tienda oficial", "réplica exacta", "calidad top tier"
        ];
        if (riskyPhrases.some(phrase => fullText.includes(phrase))) {
            return { safe: false, reason: "Frase de riesgo o claim de salud engañoso detectado." };
        }

        // 3. ANÁLISIS SEMÁNTICO CON IA
        if (window.DropiApp.UserAIKey) {
            try {
                const aiVerdict = await this.askAiModerator(product);
                if (!aiVerdict.safe) {
                    console.warn(`[PolicyGuard ❌] BLOQUEADO POR AUDITORÍA IA: ${aiVerdict.reason}`);
                    return aiVerdict;
                }
            } catch (e) {
                console.error('[PolicyGuard ⚠️] Error en Auditoria IA:', e);
            }
        }

        console.log('[PolicyGuard ✅] Producto alineado con las políticas de Meta.');
        return { safe: true, reason: 'OK' };
    },

    getFriendlyCategoryName(cat) {
        const names = {
            ADULT: "Contenido para adultos",
            ALCOHOL: "Alcohol",
            BODY_PARTS: "Partes del cuerpo",
            DIGITAL_DEVICES: "Streaming no autorizado",
            DISCRIMINATION: "Discriminación",
            FINANCIAL: "Instrumentos financieros",
            GAMBLING: "Juegos de azar",
            HAZARDOUS: "Materiales peligrosos",
            HUMAN_EXPLOITATION: "Explotación humana",
            JOBS: "Ofertas de empleo",
            ANIMALS: "Animales",
            MEDICAL_HEALTH: "Salud (suplementos/dispositivos)",
            MISLEADING_VIOLENT: "Engañoso o Violento",
            NO_ITEM: "No es un artículo para la venta",
            PRESCRIPTION_DRUGS: "Drogas y parafernalia",
            RECALLED_PRODUCTS: "Productos defectuosos",
            STOLEN_GOODS: "Artículos robados",
            SUBSCRIPTIONS: "Suscripciones/Contenido digital",
            INFRINGEMENT_COPIES: "Propiedad Intelectual/Falsificaciones",
            TOBACCO: "Tabaco y accesorios",
            USED_COSMETICS: "Cosméticos usados",
            VEHICLE_PARTS: "Ciertas partes de vehículos",
            WEAPONS: "Armas y explosivos",
            RESTRICTED_SERVICES: "Servicios y contenido restringido"
        };
        return names[cat] || cat;
    },

    /**
     * Auditoría de IA configurada como Auditor de Cumplimiento de Meta.
     */
    async askAiModerator(product) {
        const prompt = `
            ACTÚA COMO UN AUDITOR OFICIAL DE POLÍTICAS DE COMERCIO DE META.
            Tu misión es CERO TOLERANCIA con infracciones para proteger la cuenta del vendedor.

            REGLAS DE ORO (BLOQUEA SI):
            - Es un suplemento que se ingiere (pastillas de dieta, vitaminas, "quemadores").
            - Es un dispositivo médico (oxímetros, termómetros, gafas con medida).
            - Es un animal vivo o servicio de cruce/monta.
            - Es contenido digital (cuentas, suscripciones).
            - Parece una falsificación o usa nombres de marca sin ser original ("tipo Nike", "inspirado en LV").
            - Es un arma, aunque sea de balines, de juguete muy real, o navaja táctica.
            - Promete resultados de salud milagrosos o cura enfermedades.

            PRODUCTO:
            "${product.title}"
            "${product.description ? product.description.substring(0, 400) : ''}"

            RESPONDE ÚNICAMENTE JSON:
            {"allowed": true/false, "reason": "Política exacta de Meta infringida"}
        `;

        const apiKey = window.DropiApp.UserAIKey;
        const model = window.DropiApp.AiService?.MODEL || "llama-3.3-70b-versatile";

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    model: model,
                    temperature: 0,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                const json = JSON.parse(data.choices[0].message.content);
                return { safe: json.allowed === true, reason: json.reason };
            }
        } catch (e) { return { safe: true, reason: "Skip" }; }
        return { safe: true, reason: "Skip" };
    }
};
