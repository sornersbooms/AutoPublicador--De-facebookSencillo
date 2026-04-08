// background.js - Gestor de descargas y Scraping Rápido (Tabs + Smart Wait)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 1. Image Download Handler
    if (request.action === 'downloadImage') {
        fetch(request.url)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => sendResponse({ success: true, data: reader.result });
                reader.readAsDataURL(blob);
            })
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    // 2. FAST Scrape URL Logic (Tab + Smart Retry)
    if (request.action === 'scrape_url_fast') {
        (async () => {
            let tempTab = null;
            try {
                // A. Create new tab (background)
                // Usamos 'active: false' para que no le quite el foco al usuario si está haciendo otra cosa
                tempTab = await chrome.tabs.create({ url: request.url, active: false });

                // B. Wait for tab status 'complete'
                await new Promise((resolve) => {
                    const listener = (tabId, changeInfo) => {
                        if (tabId === tempTab.id && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve();
                        }
                    };
                    chrome.tabs.onUpdated.addListener(listener);
                    setTimeout(() => { chrome.tabs.onUpdated.removeListener(listener); resolve(); }, 15000);
                });

                // C. INMEDIATAMENTE intentamos contactar con el content script.
                // NO esperamos X segundos fijos. Hacemos retries rápidos hasta que el script responda.
                let response = null;
                // Intentar durante 10 segundos máximo (20 intentos * 500ms)
                for (let i = 0; i < 20; i++) {
                    try {
                        response = await chrome.tabs.sendMessage(tempTab.id, { action: 'do_scrape_smart' });
                        if (response && response.success) break;
                    } catch (e) {
                        // El content script puede no estar listo aun, esperamos un poco
                        await new Promise(r => setTimeout(r, 500));
                    }
                }

                // D. Close tab immediately after success or fail
                if (tempTab) await chrome.tabs.remove(tempTab.id);

                if (response && response.success) {
                    sendResponse({ success: true, data: response.data });
                } else {
                    sendResponse({ success: false, error: 'Timeout: El scraper no respondió a tiempo.' });
                }

            } catch (err) {
                console.error('Scrape Fast Error:', err);
                if (tempTab) try { await chrome.tabs.remove(tempTab.id); } catch (e) { }
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }
});
