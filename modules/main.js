// main.js - Punto de entrada
(async function bootstrap() {
    console.log('[Dropi] Iniciando extensión modular...');

    // 1. Inicializar Estado (Cargar datos guardados)
    if (window.DropiApp.State) {
        await window.DropiApp.State.init();
    }

    // 2. Inicializar Extractor
    // Init License First
    if (window.DropiApp.License) {
        await window.DropiApp.License.init();
    }
    if (window.DropiApp.Extractor) {
        await window.DropiApp.Extractor.init();
    }

    // 3. Inicializar UI
    if (window.DropiApp.UI) {
        // Esperar a que el DOM esté listo si es necesario
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => window.DropiApp.UI.init());
        } else {
            window.DropiApp.UI.init();
        }
    }
    // 4. Inicializar AutoLoop (Ciclo Infinito Modular)
    if (window.DropiApp.AutoLoop) {
        window.DropiApp.AutoLoop.init();
    }
})();
