
window.DropiApp = window.DropiApp || {};
/**
 * UI MODULAR V6 PRO (SHADOW DOM + ANTI-HACKER)
 * ------------------------------------------------
 * Aislado completamente del sitio web para evitar conflictos CSS.
 * Usa Shadow DOM open para encapsular estilos y evitar detección simple.
 */
window.DropiApp.UI = {
    shadowRoot: null,
    host: null,

    Icons: {
        logo: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        minimize: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        publisher: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
        image: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        extractor: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        license: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
        folder: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        prev: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
        next: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
        rocket: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
        loop: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
        tag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
        plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
        trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
        globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        stop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
        play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        chat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
        send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
        copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        save: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
    },

    init() {
        // 1. Limpieza de versiones antiguas (Global DOM)
        const oldLegacy = document.getElementById('dropi-extension-root');
        if (oldLegacy) oldLegacy.remove();
        const oldOverlay = document.getElementById('dropi-overlay-root');
        if (oldOverlay) oldOverlay.remove();

        // 2. Verificar si ya existe el Host Shadow
        if (document.getElementById('dropi-app-host')) return;

        this.createShadowDOM();
        this.bindEvents();
        this.makeDraggable();

        // 3. Render inicial
        this.render();

        // 4. Chequeo proactivo de licencia (Modal)
        if (window.DropiApp.License && !window.DropiApp.License.state.key) {
            const modal = this.shadowRoot.getElementById('dropi-welcome-modal');
            if (modal) modal.style.display = 'flex';
        }
    },

    createShadowDOM() {
        // Crear HOST asilado
        this.host = document.createElement('div');
        this.host.id = 'dropi-app-host';
        // Reset total para que no herede nada de la página host
        this.host.style.cssText = "all: initial; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2147483647; pointer-events: none; background: transparent; border: none;";

        // Adjuntar Shadow
        this.shadowRoot = this.host.attachShadow({ mode: 'open' });

        // Inyectar Estilos (CSS Linkeado)
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('styles.css');
        this.shadowRoot.appendChild(link);

        // Crear Contenedor Principal (Overlay dentro del Shadow)
        const overlay = document.createElement('div');
        overlay.id = 'dropi-overlay-root';
        // Este overlay es invisible pero ocupa todo el shadow
        overlay.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; background: transparent;";

        overlay.innerHTML = `
            <!-- TARJETA FLOTANTE -->
            <div id="dropi-extension-card" class="glass-panel" style="pointer-events: auto; position: absolute; top: 20px; right: 20px; width: 400px;">
                <!-- HEADER -->
                <div id="dropi-header">
                    <div class="dropi-brand">
                        <span class="dropi-logo-icon" style="color:#4ade80;">${this.Icons.logo}</span>
                        <h1 id="dropi-title">AutoPublicador Marketplace</h1>
                        <div id="dropi-expire-warning" class="expire-warning" style="display:none;">⚠️ Expira en 3 días</div>
                    </div>
                    <div class="dropi-window-controls">
                        <button id="dropi-minimize-btn" class="dropi-icon-btn" title="Minimizar">${this.Icons.minimize}</button>
                    </div>
                </div>
                
                <!-- TABS -->
                <div id="dropi-tabs">
                    <div class="dropi-tab active" data-tab="publisher">
                        <span class="tab-icon">${this.Icons.publisher}</span> Publicador
                    </div>
                    <div class="dropi-tab" data-tab="license">
                        <span class="tab-icon">${this.Icons.license}</span> Licencia
                    </div>
                </div>

                <!-- CONTENT WRAPPER -->
                <div class="dropi-content-body">
                    
                    <!-- === PUBLISHER SECTION === -->
                    <div id="dropi-content-publisher">
                        
                        <!-- PRODUCT FORM (MANUAL INPUT) -->
                        <div id="dropi-product-form" class="dropi-section" style="padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-light); border-radius: 12px; display: flex; flex-direction: column; gap: 10px;">
                            
                            <!-- Counter & Nav -->
                            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px;">
                                <button id="dropi-prev-btn" class="dropi-nav-btn">${this.Icons.prev}</button>
                                <div id="dropi-counter" class="dropi-counter-badge" style="font-size: 11px;">1 / 1</div>
                                <button id="dropi-next-btn" class="dropi-nav-btn">${this.Icons.next}</button>
                                <button id="dropi-delete-btn" class="dropi-nav-btn" style="color: #ef4444;" title="Eliminar producto">${this.Icons.trash}</button>
                            </div>

                            <div class="input-group">
                                <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block;">Título del Producto</label>
                                <input type="text" id="dropi-input-title" class="dropi-input" placeholder="Ej: Reloj Inteligente Series 8">
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; box-sizing: border-box;">
                                <div class="input-group">
                                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block;">Precio ($)</label>
                                    <input type="number" id="dropi-input-price" class="dropi-input" placeholder="0">
                                </div>
                                <div class="input-group">
                                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block;">Categoría</label>
                                    <div style="position: relative; width: 100%;">
                                        <select id="dropi-input-category" class="dropi-input" style="appearance: none; padding-right: 32px; color: white; cursor: pointer;">
                                            <option value="" disabled selected style="background: #0f172a; color: white;">Elegir...</option>
                                            ${window.DropiApp.Fields?.Category?.SUPPORTED_CATEGORIES?.map(cat => `<option value="${cat}" style="background: #0f172a; color: white;">${cat}</option>`).join('') || `
                                            <option value="Herramientas" style="background: #0f172a; color: white;">Herramientas</option>
                                            <option value="Muebles" style="background: #0f172a; color: white;">Muebles</option>
                                            <option value="Hogar" style="background: #0f172a; color: white;">Hogar</option>
                                            <option value="Jardinería" style="background: #0f172a; color: white;">Jardinería</option>
                                            <option value="Electrodomésticos" style="background: #0f172a; color: white;">Electrodomésticos</option>
                                            <option value="Videojuegos" style="background: #0f172a; color: white;">Videojuegos</option>
                                            <option value="Libros, películas y música" style="background: #0f172a; color: white;">Libros, películas y música</option>
                                            <option value="Bolsos y equipaje" style="background: #0f172a; color: white;">Bolsos y equipaje</option>
                                            <option value="Ropa y calzado de mujer" style="background: #0f172a; color: white;">Ropa y calzado de mujer</option>
                                            <option value="Ropa y calzado de hombre" style="background: #0f172a; color: white;">Ropa y calzado de hombre</option>
                                            <option value="Joyas y accesorios" style="background: #0f172a; color: white;">Joyas y accesorios</option>
                                            <option value="Salud y belleza" style="background: #0f172a; color: white;">Salud y belleza</option>
                                            <option value="Productos para mascotas" style="background: #0f172a; color: white;">Productos para mascotas</option>
                                            <option value="Bebés y niños" style="background: #0f172a; color: white;">Bebés y niños</option>
                                            <option value="Juguetes y juegos" style="background: #0f172a; color: white;">Juguetes y juegos</option>
                                            <option value="Electrónica e informática" style="background: #0f172a; color: white;">Electrónica e informática</option>
                                            <option value="Teléfonos celulares" style="background: #0f172a; color: white;">Teléfonos celulares</option>
                                            <option value="Bicicletas" style="background: #0f172a; color: white;">Bicicletas</option>
                                            <option value="Arte y manualidades" style="background: #0f172a; color: white;">Arte y manualidades</option>
                                            <option value="Deportes y actividades al aire libre" style="background: #0f172a; color: white;">Deportes y actividades al aire libre</option>
                                            <option value="Autopartes" style="background: #0f172a; color: white;">Autopartes</option>
                                            <option value="Instrumentos musicales" style="background: #0f172a; color: white;">Instrumentos musicales</option>
                                            <option value="Antigüedades y artículos de colección" style="background: #0f172a; color: white;">Antigüedades y artículos de colección</option>
                                            <option value="Venta de garaje" style="background: #0f172a; color: white;">Venta de garaje</option>
                                            <option value="Varios" style="background: #0f172a; color: white;">Varios</option>
                                            `}
                                        </select>
                                        <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; display: flex; align-items: center; color: #4ade80;">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="input-group">
                                <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block;">Descripción</label>
                                <textarea id="dropi-input-description" class="dropi-textarea" style="min-height: 80px; font-size: 12px;" placeholder="Detalles del producto..."></textarea>
                            </div>

                            <div class="input-group">
                                <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block;">Etiquetas (Separadas por coma)</label>
                                <textarea id="dropi-input-tags" class="dropi-textarea" style="min-height: 40px; font-size: 11px;" placeholder="reloj, smart, series 8..."></textarea>
                            </div>

                            <div class="input-group">
                                <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block;">Ubicaciones (${this.Icons.globe}) <span style="font-size: 8px;">(Enter p/ agregar)</span></label>
                                <div id="dropi-location-chips" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px;">
                                    <!-- Chips here -->
                                </div>
                                <input type="text" id="dropi-input-location" class="dropi-input" placeholder="Ej: Buenos Aires [Enter]">
                            </div>

                            <div class="input-group" style="display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; display: block;">Imágenes (${this.Icons.image})</label>
                                <label for="dropi-img-upload" class="dropi-btn dropi-btn-outline" style="width: 100%; box-sizing: border-box; font-size: 11px; padding: 10px; height: auto; text-transform: none;">
                                    Haga clic para subir desde la PC
                                </label>
                                <input type="file" id="dropi-img-upload" accept="image/*" multiple class="dropi-hidden">
                                
                                <div id="dropi-image-gallery" style="
                                    display: flex; 
                                    gap: 10px; 
                                    overflow-x: auto; 
                                    padding: 10px 5px; 
                                    scrollbar-width: thin;
                                    min-height: 80px;
                                    background: rgba(0,0,0,0.2);
                                    border-radius: 8px;
                                    border: 1px dashed var(--border-light);
                                ">
                                    <!-- Images injected here -->
                                </div>
                            </div>
                        </div>

                        <div id="dropi-copy-hint" class="hint-text" style="text-align: center; font-size: 10px; color: var(--text-muted); margin: 12px 0; display:flex; align-items:center; justify-content:center; gap:5px;">
                            ${this.Icons.copy} Las imágenes se guardan automáticamente.
                        </div>

                        <!-- ACTIONS -->
                        <div id="dropi-actions" style="display: flex; flex-direction: column; gap: 10px;">
                            
                            <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center;">
                                <button id="dropi-fill-btn" class="dropi-btn dropi-btn-primary" style="justify-content: center; gap:8px; height: 50px;">
                                    ${this.Icons.rocket} RELLENAR FACEBOOK
                                </button>
                                <label style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; border: 1px solid var(--border-light); height: 50px; box-sizing: border-box;">
                                    <input type="checkbox" id="dropi-loop-check" style="margin-bottom: 4px;">
                                    <div style="display:flex; align-items:center; gap:2px;">${this.Icons.loop}<span style="font-size: 9px; color: var(--text-muted);">LOOP</span></div>
                                </label>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <button id="dropi-add-item-btn" class="dropi-btn dropi-btn-outline" style="justify-content: center; font-size: 11px; padding: 10px; gap:4px;">
                                    ${this.Icons.plus} Nuevo Item
                                </button>
                                <button id="dropi-new-post-btn" class="dropi-btn dropi-btn-outline" style="justify-content: center; font-size: 11px; padding: 10px; gap:4px;">
                                    ${this.Icons.plus} Ir a Marketplace
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- === EXTRACTOR SECTION === -->
                    <div id="dropi-content-extractor" class="dropi-hidden">
                        
                        <!-- Visual Steps Guide -->
                        <div class="dropi-card-section" style="background: rgba(74, 222, 128, 0.03); border-color: rgba(74, 222, 128, 0.15); margin-bottom: 20px;">
                            <div class="card-body" style="padding: 12px; gap: 8px;">
                                <div class="extraction-steps-container">
                                    <div class="extract-step-item">
                                        <div class="step-number">1</div>
                                        <div class="step-text">Extrae las <b>URLs</b> del catálogo. (Dropi Colombia Unicamente)</div>
                                    </div>
                                    <div class="extract-step-arrow">↓</div>
                                    <div class="extract-step-item">
                                        <div class="step-number">2</div>
                                        <div class="step-text">Sube el <b>JSON</b> descargado abajo.</div>
                                    </div>
                                    <div class="extract-step-arrow">↓</div>
                                    <div class="extract-step-item">
                                        <div class="step-number">3</div>
                                        <div class="step-text">Pulsa <b>INICIAR</b> para extraer todo.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- URL Extraction Card -->
                        <div class="dropi-card-section">
                            <div class="card-header">
                                <span class="card-title">FEED SCRAPER</span>
                            </div>
                            <div class="card-body">
                                <!-- URL Extraction Actions -->
                                <div class="dropi-row" style="margin-bottom: 15px; display: flex; gap: 10px;">
                                    <button id="dropi-extract-urls-btn" class="dropi-btn dropi-btn-pro dropi-btn-autoscroll" style="gap:12px; flex: 1; height: 55px; font-size: 1.1em;">
                                        ${this.Icons.globe} EXTRAER URLS (Autoscroll)
                                    </button>
                                    <button id="dropi-stop-urls-btn" class="dropi-btn dropi-stop-btn-slim" style="display:none; width: 55px; height: 55px; border-radius:14px; padding: 0;" title="Detener">
                                        ${this.Icons.stop}
                                    </button>
                                </div>
                                
                                

                                <div style="margin-top: 8px; font-size: 0.85em; opacity: 0.7; text-align: center;">
                                    Usa <b>Autoscroll</b> para cargar todo el catálogo o <b>Rápido</b> para lo que ves ahora.
                                </div>
                            </div>
                        </div>

                        <!-- Detail Extraction Card -->
                        <div class="dropi-card-section">
                            <div class="card-header">
                                <span class="card-title">DETAIL SCRAPER</span>
                            </div>
                            <div class="card-body">
                                <label for="dropi-urls-input" class="dropi-mini-upload" style="gap:5px;">
                                    ${this.Icons.folder} Cargar Lista URLs
                                </label>
                                <input type="file" id="dropi-urls-input" accept=".json" class="dropi-hidden">
                                <div id="dropi-scrape-status" class="status-indicator" style="display: none;">
                                    <span class="status-dot"></span>
                                    <span id="dropi-scrape-count">0 URLs listas</span>
                                </div>
                                <div class="dropi-row">
                                    <button id="dropi-start-scrape-btn" class="dropi-btn dropi-btn-primary" disabled style="gap:5px;">
                                        ${this.Icons.play} Iniciar
                                    </button>
                                    <button id="dropi-stop-scrape-btn" class="dropi-btn dropi-btn-danger dropi-stop-btn" style="display:none; width: 45px; justify-content:center;" title="Detener">
                                        ${this.Icons.stop}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Console -->
                        <div id="dropi-console-container" class="console-terminal" style="display:none;">
                            <div class="console-header">
                                <span class="console-title">_TERMINAL PROCESS_</span>
                                <div class="dropi-progress-bar">
                                     <div id="dropi-progress-fill" class="dropi-progress-fill"></div>
                                </div>
                            </div>
                            <div id="dropi-console-logs" class="console-body">
                                <div class="log-entry log-info">[System] Ready...</div>
                            </div>
                        </div>

                    </div>
                    </div>
                    <!-- End Extractor -->

                    <!-- === LICENSE SECTION === -->
                    <div id="dropi-content-license" class="dropi-hidden">
                        
                        <div class="dropi-card-section">
                            <div class="card-header">
                                <span class="card-title">ACTIVAR PLAN</span>
                            </div>
                            <div class="card-body">
                                <p style="font-size:12px; color:#94a3b8; margin:0 0 10px 0;">
                                    Ingresa tu clave para activar o renovar tu plan PRO.
                                </p>
                                <div class="license-input-group">
                                    <input type="text" id="dropi-license-input" class="dropi-input" placeholder="Pegar licencia aquí..." autocomplete="off">
                                    <button id="dropi-activate-btn" class="dropi-btn dropi-btn-primary" style="padding: 10px 16px;">
                                        ACTIVAR
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- AI CONFIG SECTION -->
                        <div class="dropi-card-section">
                            <div class="card-header">
                                <span class="card-title">CONFIGURACIÓN IA</span>
                            </div>
                            <div class="card-body">
                                <p style="font-size:11px; color:#94a3b8; margin:0 0 8px 0;">
                                    Key de API (Groq/OpenAI compatible)
                                </p>
                                <div class="license-input-group" style="display: flex; gap: 8px; margin-bottom: 12px;">
                                    <input type="password" id="dropi-ai-key-input" class="dropi-input" placeholder="sk-..." autocomplete="off" style="flex:1;">
                                    <button id="dropi-save-ai-btn" class="dropi-btn dropi-btn-primary" style="padding: 0; width: 42px; display:flex; justify-content:center; align-items:center;" title="Guardar Key">
                                        ${this.Icons.save}
                                    </button>
                                </div>

                                <div class="card-title" style="margin-bottom: 8px; display: block;">ENTRENAMIENTO IA (Prompt)</div>
                                <p style="font-size:11px; color:#94a3b8; margin:0 0 8px 0;">
                                    Instrucciones para generar el contenido:
                                </p>
                                
                                <div class="ai-editor-container">
                                    <textarea id="dropi-ai-prompt-input" class="dropi-textarea" placeholder="Escribe cómo quieres que la IA procese tus productos..."></textarea>
                                    
                                    <div class="ai-variables-bar">
                                        <span class="variable-chip" data-var="{{TITULO}}">TITULO</span>
                                        <span class="variable-chip" data-var="{{DESCRIPCION}}">DESC</span>
                                        <span class="variable-chip" data-var="{{PRECIO_PROVEEDOR}}">PRECIO_P</span>
                                        <span class="variable-chip" data-var="{{CATEGORIA}}">CATEGORIA</span>
                                    </div>
                                </div>

                                <button id="dropi-save-prompt-btn" class="dropi-btn dropi-btn-pro dropi-btn-autoscroll" style="width: 100%; height: 38px; font-size: 12px; margin-top: 10px;">
                                    ${this.Icons.save} GUARDAR ENTRENAMIENTO
                                </button>
                            </div>
                        </div>

                        <div class="dropi-card-section">
                            <div class="card-header">
                                <span class="card-title">SOPORTE Y VENTAS</span>
                            </div>
                            <div class="card-body">
                                <div class="social-grid">
                                    <a href="https://wa.link/q6l1dw" target="_blank" class="social-btn" id="dropi-social-wa" style="gap:5px;">
                                        <span class="social-icon">${this.Icons.chat}</span>
                                        <span style="font-size:12px; font-weight:600;">Contactar</span>
                                    </a>
                                    <a href="https://t.me/ProgramadorMillonary" target="_blank" class="social-btn" id="dropi-social-tg" style="gap:5px;">
                                        <span class="social-icon">${this.Icons.send}</span>
                                        <span style="font-size:12px; font-weight:600;">Telegram</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <div class="dropi-card-section" style="border:none; background:none;">
                            <div style="text-align:center; color:#64748b; font-size:11px;">
                                ID de Instalación:<br>
                                <span id="dropi-uuid-display" style="font-family:monospace; color:#94a3b8;">...</span>
                            </div>
                        </div>

                    </div>
                </div>
                
                <div class="dropi-footer">
                    v6.0 PRO | By AntiGravity
                </div>
            </div>

            <!-- MODAL DE BIENVENIDA / AUTH (NUEVO) -->
            <div id="dropi-welcome-modal" style="
                display:none; 
                position:fixed; 
                top:0; 
                left:0; 
                width:100% !important; 
                height:100% !important; 
                background:rgba(15, 23, 42, 0.98); 
                z-index:2147483647; 
                justify-content:center; 
                align-items:center; 
                backdrop-filter: blur(5px);
                pointer-events: auto;
            ">
                <div style="
                    width: 400px;
                    max-width: 90%;
                    background: #000000;
                    border: 1px solid #4ade80;
                    border-radius: 16px;
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    box-shadow: 0 0 50px rgba(74, 222, 128, 0.2);
                    color: white;
                ">
                    <div style="margin-bottom:16px; color:#4ade80; transform: scale(2);">${this.Icons.logo}</div>
                    <h2 style="color:#4ade80; margin:0 0 8px 0; font-size:22px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px;">SYSTEM ACCESS</h2>
                    <p style="color:#94a3b8; font-size:14px; line-height:1.5; margin-bottom:24px; font-family: sans-serif;">
                        Autenticación requerida para iniciar<br>
                        <b style="color:white;">FB MARKETPLACE AUTOMATION V6</b>
                    </p>
                    
                    <input type="email" id="dropi-reg-email" placeholder="Correo Electrónico" 
                        style="width:100%; box-sizing:border-box; padding:12px; margin-bottom:10px; border-radius:8px; border:1px solid #475569; background:#0f172a; color:white; outline:none; font-size:14px;">
                        
                    <input type="text" id="dropi-reg-whatsapp" placeholder="WhatsApp (Ej: +57300...)" 
                        style="width:100%; box-sizing:border-box; padding:12px; margin-bottom:20px; border-radius:8px; border:1px solid #475569; background:#0f172a; color:white; outline:none; font-size:14px;">
                        
                    <button id="dropi-start-trial-btn" style="width:100%; padding:14px; background:#2563eb; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:15px; margin-bottom:16px; transition:0.2s;">
                        COMENZAR PRUEBA
                    </button>
                    
                    <p id="dropi-reg-error" style="color:#f87171; font-size:13px; margin-bottom:12px; display:none;"></p>
                    
                    <div style="width:100%; height:1px; background:#334155; margin-bottom:16px;"></div>

                    <p style="font-size:12px; color:#64748b; margin-bottom:8px; font-family: sans-serif;">¿Ya tienes licencia?</p>
                    <div style="display:flex; gap:8px; width:100%;">
                        <input type="text" id="dropi-quick-key" placeholder="Pega tu clave aquí..." style="flex:1; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #475569; background:#0f172a; color:#fff; font-size:12px;">
                        <button id="dropi-quick-login-btn" style="padding:8px 16px; background:#334155; color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px; white-space:nowrap;">Validar</button>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.appendChild(overlay);
        document.body.appendChild(this.host);
    },

    bindEvents() {
        // --- HELPER: Use shadowRoot instead of document ---
        const $ = (id) => this.shadowRoot.getElementById(id);
        const $$ = (sel) => this.shadowRoot.querySelectorAll(sel);

        // --- AUTH EVENTS ---
        window.addEventListener('DropiAuthRequired', () => {
            const modal = $('dropi-welcome-modal');
            if (modal) modal.style.display = 'flex';
        });

        // Register Button
        const btnTrial = $('dropi-start-trial-btn');
        if (btnTrial) {
            btnTrial.addEventListener('click', async () => {
                const email = $('dropi-reg-email').value.trim();
                const whatsapp = $('dropi-reg-whatsapp').value.trim();
                const err = $('dropi-reg-error');

                if (!email.includes('@')) {
                    err.textContent = 'Email inválido'; err.style.display = 'block'; return;
                }

                // Strict Whatsapp Check
                if (!/^\+\d{7,}$/.test(whatsapp)) {
                    err.textContent = 'WhatsApp debe iniciar con "+" (Ej: +57...)'; err.style.display = 'block'; return;
                }

                btnTrial.innerText = 'Registrando...';
                btnTrial.disabled = true;
                err.style.display = 'none';

                if (window.DropiApp.License) {
                    const res = await window.DropiApp.License.registerTrial(email, whatsapp);
                    if (res.success) {
                        alert(res.message);
                        $('dropi-welcome-modal').style.display = 'none';
                    } else {
                        err.textContent = res.error;
                        err.style.display = 'block';
                    }
                }
                btnTrial.innerText = 'COMENZAR PRUEBA';
                btnTrial.disabled = false;
            });
        }

        // Quick Login Button
        const btnLogin = $('dropi-quick-login-btn');
        if (btnLogin) {
            btnLogin.addEventListener('click', async () => {
                const key = $('dropi-quick-key').value.trim();
                if (!key) return alert('Escribe una clave');

                btnLogin.innerText = '...';
                const res = await window.DropiApp.License.activateLicenseKey(key);
                if (res.success) {
                    alert('¡Licencia Activada!');
                    $('dropi-welcome-modal').style.display = 'none';
                } else {
                    alert('Error: ' + res.error);
                }
                btnLogin.innerText = 'Validar';
            });
        }

        // --- FIX: Prevent Facebook from stealing 'q', '@' and other keys ---
        const stopKeyProp = (e) => {
            e.stopPropagation();
            // No hacemos preventDefault para que el carácter SE escriba en el input, 
            // pero sí evitamos que Facebook lo detecte como un atajo de teclado.
        };

        const allInputs = this.shadowRoot.querySelectorAll('input, textarea');
        allInputs.forEach(input => {
            input.addEventListener('keydown', stopKeyProp);
            input.addEventListener('keypress', stopKeyProp);
            input.addEventListener('keyup', stopKeyProp);
        });

        // --- TABS ---
        const tabs = $$('.dropi-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabId = tab.dataset.tab;

                $('dropi-content-publisher').classList.toggle('dropi-hidden', tabId !== 'publisher');
                $('dropi-content-extractor').classList.toggle('dropi-hidden', tabId !== 'extractor');
                $('dropi-content-license').classList.toggle('dropi-hidden', tabId !== 'license');

                // Extra UI updates for License tab
                if (tabId === 'license') {
                    if (window.DropiApp.License && window.DropiApp.License.state) {
                        $('dropi-uuid-display').innerText = window.DropiApp.License.state.deviceId || 'Cargando...';
                    }
                }
            });
        });

        // --- PUBLISHER ---
        // Removido dropi-file-input

        $('dropi-prev-btn').addEventListener('click', () => {
            if (window.DropiApp.State.navigate(-1)) this.render();
        });
        $('dropi-next-btn').addEventListener('click', () => {
            if (window.DropiApp.State.navigate(1)) this.render();
        });
        $('dropi-delete-btn').addEventListener('click', () => {
            if (window.DropiApp.State.deleteProduct()) this.render();
        });

        // --- BUCLE INFINITO LISTENER ---
        const loopCheck = $('dropi-loop-check');
        if (loopCheck) {
            // Cargar estado guardado
            const savedState = localStorage.getItem('dropi_loop_enabled') === 'true';
            loopCheck.checked = savedState;

            loopCheck.addEventListener('change', (e) => {
                const isEnabled = e.target.checked;
                localStorage.setItem('dropi_loop_enabled', isEnabled);
                console.log(`[DropiUI] Bucle Infinito: ${isEnabled ? 'ON' : 'OFF'}`);

                // Si se activa, intentamos iniciar el ciclo si estamos en la pag correcta
                if (isEnabled && window.DropiApp.AutoLoop) {
                    window.DropiApp.AutoLoop.init();
                }
            });
        }

        $('dropi-fill-btn').addEventListener('click', async () => {
            const btn = $('dropi-fill-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '⚡ Inyectando...';
            btn.disabled = true;

            try {
                const product = window.DropiApp.State.getCurrentProduct();

                // License Check
                if (window.DropiApp.License && !window.DropiApp.License.state.isValid) {
                    throw new Error('Licencia inválida o expirada.');
                }

                await window.DropiApp.Automation.fillProduct(product);
                btn.innerHTML = '✅ ¡Listo!';
            } catch (error) {
                console.error('[DropiUI]', error);
                btn.innerHTML = '❌ Error';
                alert('Error: ' + error.message);
            } finally {
                btn.disabled = false;
                setTimeout(() => btn.innerHTML = originalText, 2000);
            }
        });

        const extrasBtn = $('dropi-extras-btn');
        if (extrasBtn) {
            extrasBtn.addEventListener('click', async () => {
                const originalText = extrasBtn.innerText;
                extrasBtn.innerText = '⏳ ...';
                extrasBtn.disabled = true;
                try {
                    const product = window.DropiApp.State.getCurrentProduct();
                    if (window.DropiApp.Extras) {
                        await window.DropiApp.Extras.run(product);
                        extrasBtn.innerText = '✅ OK';
                    } else {
                        alert('Extras module missing.');
                    }
                } catch (error) {
                    extrasBtn.innerText = '❌';
                } finally {
                    extrasBtn.disabled = false;
                    setTimeout(() => extrasBtn.innerText = originalText, 2000);
                }
            });
        }

        const newPostBtn = $('dropi-new-post-btn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => {
                window.location.href = 'https://www.facebook.com/marketplace/create/item';
            });
        }

        const minBtn = $('dropi-minimize-btn');
        if (minBtn) {
            minBtn.addEventListener('click', () => this.toggleMinimize());
        }

        // --- PRODUCT FORM SYNC ---
        const syncForm = () => {
            const product = window.DropiApp.State.getCurrentProduct();
            if (!product) return;

            product.title = $('dropi-input-title').value;
            product.providerPrice = $('dropi-input-price').value;
            product.category = $('dropi-input-category').value;
            product.description = $('dropi-input-description').value;
            
            const tagsText = $('dropi-input-tags').value;
            product.tags = tagsText.split(',').map(t => t.trim()).filter(t => t.length > 0);
            
            const imagesText = $('dropi-input-images').value;
            product.images = imagesText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            window.DropiApp.State.save();
        };

        ['dropi-input-title', 'dropi-input-price', 'dropi-input-category', 'dropi-input-description', 'dropi-input-tags'].forEach(id => {
            const el = $(id);
            if (el) {
                const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
                el.addEventListener(eventType, syncForm);
            }
        });

        // --- LOCATION CHIPS LOGIC ---
        const locInput = $('dropi-input-location');
        if (locInput) {
            locInput.addEventListener('keydown', (e) => {
                e.stopPropagation(); // Asegurar que FB no robe la tecla
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = locInput.value.trim();
                    if (val) {
                        const product = window.DropiApp.State.getCurrentProduct();
                        if (!product.locations) product.locations = [];
                        if (!product.locations.includes(val)) {
                            product.locations.push(val);
                            window.DropiApp.State.save();
                            this.render(); // Re-render chips
                        }
                        locInput.value = '';
                    }
                }
            });
        }

        const imgUpload = $('dropi-img-upload');
        if (imgUpload) {
            imgUpload.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;

                const product = window.DropiApp.State.getCurrentProduct();
                if (!product) return;

                const base64Promises = files.map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => resolve(ev.target.result);
                        reader.readAsDataURL(file);
                    });
                });

                const base64Images = await Promise.all(base64Promises);
                product.images = [...(product.images || []), ...base64Images];
                
                window.DropiApp.State.save();
                this.renderGallery(product);
                imgUpload.value = ''; // Reset for next selection
            });
        }

        // --- ADD ITEM BUTTON ---
        const addItemBtn = $('dropi-add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                window.DropiApp.State.addProduct();
                this.render();
            });
        }

        // --- LICENSE TAB ACTIONS ---
        $('dropi-activate-btn').addEventListener('click', async () => {
            const input = $('dropi-license-input');
            const key = input.value.trim();
            const btn = $('dropi-activate-btn');

            if (key) {
                if (window.DropiApp.License) {
                    btn.innerText = '⏳';
                    btn.disabled = true;

                    const res = await window.DropiApp.License.activateLicenseKey(key);
                    btn.innerText = 'ACTIVAR';
                    btn.disabled = false;

                    if (res.success) {
                        alert(`✅ ¡Licencia ACTIVADA!`);
                        input.value = ''; // clear
                        // La UI se actualiza via License.updateBadge
                    } else {
                        alert(`❌ Error: ${res.error}`);
                    }
                }
            } else {
                alert('Por favor, ingresa una clave.');
            }
        });

        // --- AI API KEY SAVE ---
        const aiSaveBtn = $('dropi-save-ai-btn');
        const aiKeyInput = $('dropi-ai-key-input');

        // Load saved key
        chrome.storage.local.get(['user_ai_api_key'], (result) => {
            if (result.user_ai_api_key && aiKeyInput) {
                aiKeyInput.value = result.user_ai_api_key;
                window.DropiApp.UserAIKey = result.user_ai_api_key; // Expose globally
            }
        });

        if (aiSaveBtn && aiKeyInput) {
            aiSaveBtn.addEventListener('click', async () => {
                const key = aiKeyInput.value.trim();

                aiSaveBtn.innerHTML = '⏳';
                aiSaveBtn.disabled = true;

                try {
                    // Save to Chrome Storage
                    await new Promise((resolve) => {
                        chrome.storage.local.set({ 'user_ai_api_key': key }, resolve);
                    });

                    window.DropiApp.UserAIKey = key; // Update runtime

                    aiSaveBtn.innerHTML = '✅';
                    setTimeout(() => aiSaveBtn.innerHTML = this.Icons.save, 2000);
                } catch (e) {
                    console.error(e);
                    aiSaveBtn.innerHTML = '❌';
                    setTimeout(() => aiSaveBtn.innerHTML = this.Icons.save, 2000);
                } finally {
                    aiSaveBtn.disabled = false;
                }
            });
        }

        // --- AI PROMPT TRAINING ---
        const promptInput = $('dropi-ai-prompt-input');
        const savePromptBtn = $('dropi-save-prompt-btn');

        // Load saved prompt
        chrome.storage.local.get(['user_ai_prompt'], (res) => {
            if (res.user_ai_prompt && promptInput) {
                promptInput.value = res.user_ai_prompt;
                window.DropiApp.UserAIPrompt = res.user_ai_prompt;
            } else if (promptInput) {
                // Default Prompt (matching the current behavior in buildPrompt)
                const defaultPrompt = "Actúa como un experto en ventas. Genera un título llamativo para {{TITULO}}, calcula un precio sumando 30k a {{PRECIO_PROVEEDOR}} y crea una descripción vendedora usando {{DESCRIPCION}}.";
                promptInput.value = defaultPrompt;
                window.DropiApp.UserAIPrompt = defaultPrompt;
            }
        });

        if (savePromptBtn) {
            savePromptBtn.addEventListener('click', async () => {
                const prompt = promptInput.value.trim();
                savePromptBtn.disabled = true;
                savePromptBtn.innerHTML = '⏳ Guardando...';

                try {
                    await new Promise(resolve => chrome.storage.local.set({ 'user_ai_prompt': prompt }, resolve));
                    window.DropiApp.UserAIPrompt = prompt;
                    savePromptBtn.innerHTML = '✅ Entrenamiento Guardado';
                    setTimeout(() => savePromptBtn.innerHTML = `${this.Icons.save} GUARDAR ENTRENAMIENTO`, 3000);
                } catch (e) {
                    savePromptBtn.innerHTML = '❌ Error';
                } finally {
                    savePromptBtn.disabled = false;
                }
            });
        }

        // Variable chip clicks
        const variableChips = $$('.variable-chip');
        variableChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const variable = chip.dataset.var;
                const start = promptInput.selectionStart;
                const end = promptInput.selectionEnd;
                const text = promptInput.value;
                const before = text.substring(0, start);
                const after = text.substring(end, text.length);
                promptInput.value = (before + variable + after);
                promptInput.selectionStart = promptInput.selectionEnd = start + variable.length;
                promptInput.focus();
            });
        });

        // --- REMOVED EXTRACTOR UNUSED LISTENERS ---
    },

    makeDraggable() {
        const root = this.shadowRoot.getElementById('dropi-extension-card');
        const header = this.shadowRoot.getElementById('dropi-header');

        if (!root || !header) return;

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = root.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            root.style.right = 'auto';
            root.style.left = `${initialLeft}px`;
            root.style.top = `${initialTop}px`;
            header.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            root.style.left = `${initialLeft + dx}px`;
            root.style.top = `${initialTop + dy}px`;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'grab';
        });
    },

    toggleMinimize() {
        const card = this.shadowRoot.getElementById('dropi-extension-card');
        const btn = this.shadowRoot.getElementById('dropi-minimize-btn');
        card.classList.toggle('minimized');
        btn.innerText = card.classList.contains('minimized') ? '□' : '_';
    },

    render() {
        const $ = (id) => this.shadowRoot.getElementById(id);
        const hasProducts = window.DropiApp.State.hasProducts();
        
        const elementsToToggle = ['dropi-product-form', 'dropi-actions', 'dropi-copy-hint'];
        elementsToToggle.forEach(id => {
            const el = $(id);
            if (el) el.classList.toggle('dropi-hidden', !hasProducts);
        });

        if (hasProducts) {
            const product = window.DropiApp.State.getCurrentProduct();
            const total = window.DropiApp.State.products.length;
            const index = window.DropiApp.State.currentIndex;

            $('dropi-counter').textContent = `${index + 1} / ${total}`;
            $('dropi-input-title').value = product.title || '';
            $('dropi-input-price').value = product.providerPrice || product.suggestedPrice || '';
            $('dropi-input-category').value = product.category || '';
            $('dropi-input-description').value = product.description || '';
            $('dropi-input-tags').value = (product.tags || []).join(', ');

            this.renderLocationChips(product);
            this.renderGallery(product);
        }

        if (window.DropiApp.License && window.DropiApp.License.state) {
            const uuidEl = $('dropi-uuid-display');
            if (uuidEl) uuidEl.innerText = window.DropiApp.License.state.deviceId || '...';

            const badge = this.shadowRoot.querySelector('.pro-badge');
            const plan = window.DropiApp.License.state.plan;
            if (badge) {
                badge.textContent = plan || 'OFF';
                badge.style.background = plan === 'PRO' ? '#4ade80' : (window.DropiApp.License.state.isValid ? '#3b82f6' : '#ef4444');
            }
        }
    },

    renderGallery(product) {
        const gallery = this.shadowRoot.getElementById('dropi-image-gallery');
        if (!gallery) return;
        gallery.innerHTML = '';
        if (product.images && product.images.length > 0) {
            product.images.forEach((imgData, idx) => {
                const container = document.createElement('div');
                container.style.cssText = "position:relative; flex-shrink:0; width:60px; height:60px;";
                
                const img = document.createElement('img');
                img.src = imgData;
                img.className = 'dropi-image-thumb';
                img.style.cssText = "width:100\%; height:100\%; object-fit:cover; border-radius:6px; border: 1px solid rgba(255,255,255,0.1);";
                
                const delBtn = document.createElement('button');
                delBtn.innerHTML = '×';
                delBtn.style.cssText = "position:absolute; top:-5px; right:-5px; width:18px; height:18px; border-radius:50%; background:#ef4444; color:white; border:none; line-height:1; cursor:pointer; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; z-index:1;";
                
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    product.images.splice(idx, 1);
                    window.DropiApp.State.save();
                    this.renderGallery(product);
                });

                container.appendChild(img);
                container.appendChild(delBtn);
                gallery.appendChild(container);
            });
        } else {
            gallery.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; width:100\%; color:rgba(255,255,255,0.3); font-size:10px;">Sin imágenes</div>';
        }
    },

    renderLocationChips(product) {
        const container = this.shadowRoot.getElementById('dropi-location-chips');
        if (!container) return;

        container.innerHTML = '';
        const locations = product.locations || [];

        locations.forEach((loc, index) => {
            const chip = document.createElement('div');
            chip.style.cssText = `
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: rgba(74, 222, 128, 0.15);
                color: #4ade80;
                border: 1px solid rgba(74, 222, 128, 0.3);
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.2s;
            `;

            const text = document.createElement('span');
            text.innerText = loc;
            
            const removeBtn = document.createElement('span');
            removeBtn.innerHTML = '&times;';
            removeBtn.style.cssText = "cursor:pointer; font-size:14px; color:rgba(255,255,255,0.4); margin-left:4px;";
            removeBtn.addEventListener('click', () => {
                product.locations.splice(index, 1);
                window.DropiApp.State.save();
                this.render();
            });

            chip.appendChild(text);
            chip.appendChild(removeBtn);
            container.appendChild(chip);
        });
    }
};
