window.DropiApp = window.DropiApp || {};
/**
 * Extractor Module (Fast Mode Control)
 * Uses background tabs + user interruption.
 */
window.DropiApp.Extractor = {
    isExtracting: false,
    isStopped: false,

    async init() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'do_scrape_smart') {
                console.log('[Dropi Worker] Smart scrape requested.');
                this.scrapeSmartly().then(data => {
                    sendResponse({ success: true, data: data });
                }).catch(err => {
                    console.error('[Dropi Worker] Error:', err);
                    sendResponse({ success: false, error: err.message });
                });
                return true;
            }
        });
    },

    stop() {
        this.isStopped = true;
        this.log('🛑 Solicitud de detención recibida. Deteniendo...', 'warn');
        this.isExtracting = false;

        // Disable stop buttons in UI immediately (Shadow DOM aware)
        const root = window.DropiApp.UI ? window.DropiApp.UI.shadowRoot : document;
        const stopBtns = root.querySelectorAll('.dropi-stop-btn');
        stopBtns.forEach(btn => btn.style.display = 'none');
    },

    getUIElement(id) {
        if (window.DropiApp.UI && window.DropiApp.UI.shadowRoot) {
            return window.DropiApp.UI.shadowRoot.getElementById(id);
        }
        return document.getElementById(id);
    },

    // --- WORKER ---
    async scrapeSmartly() {
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout finding elements (10s)')), 10000);

            // Poll every 100ms for key elements (Faster polling)
            const interval = setInterval(() => {
                const title = document.querySelector('.product_info_top h2');
                const priceContainer = document.querySelector('.price-providers') || document.querySelector('tr td:nth-child(4) currency');

                if (title && priceContainer) {
                    clearInterval(interval);
                    clearTimeout(timeout);

                    // Ultra-short buffer just to let Angular flush bindings
                    setTimeout(() => {
                        try {
                            const data = this.scrapeProductDetails(window.location.href);
                            resolve(data);
                        } catch (e) {
                            reject(e);
                        }
                    }, 200);
                }
            }, 100);
        });
    },

    // --- UTILS ---
    log(msg, type = 'info') {
        const consoleEl = this.getUIElement('dropi-console-logs');
        if (consoleEl) {
            const entry = document.createElement('div');
            entry.className = `log-entry log-${type}`;
            const time = new Date().toLocaleTimeString().split(' ')[0];
            entry.innerText = `[${time}] ${msg}`;
            consoleEl.appendChild(entry);
            consoleEl.scrollTop = consoleEl.scrollHeight;
        }
    },

    updateProgress(current, total) {
        const countEl = this.getUIElement('dropi-scrape-count');
        const barEl = this.getUIElement('dropi-progress-fill');
        if (countEl) countEl.innerText = `${current} / ${total}`;
        if (barEl) {
            const pct = Math.round((current / total) * 100);
            barEl.style.width = `${pct}%`;
        }
    },

    // --- URL EXTRACTION ---

    slugify(text) {
        if (!text) return '';
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },

    extractFromCards(cards) {
        return cards.map(card => {
            const imageElement = card.querySelector('.card-image__img') || card.querySelector('img');
            const titleElement = card.querySelector('.tittle-product') || card.querySelector('.title-product') || card.querySelector('.name-product') || card.querySelector('h2') || card.querySelector('h5');
            const detailLink = card.querySelector('a[href*="product-details"]');

            const src = imageElement ? imageElement.src : null;
            const title = titleElement ? titleElement.textContent.trim() : null;
            let productId = null;

            if (detailLink) {
                const linkMatch = detailLink.href.match(/product-details\/(\d+)/);
                if (linkMatch && linkMatch[1]) productId = linkMatch[1];
            }
            if (!productId && src) {
                const match = src.match(/\/products\/(\d+)\//) || src.match(/(\d+)\.(jpg|png|webp|jpeg)/);
                if (match && match[1]) productId = match[1];
            }
            return { productId, title };
        }).filter(p => p.productId && p.title);
    },

    async extractUrlsInstant() {
        this.log('Extrayendo productos visibles actualmente...', 'info');
        const productCardSelectors = ['.card-box', '.product-card', 'app-product-card', '.card.h-100'];

        let productCards = [];
        for (const sel of productCardSelectors) {
            const found = document.querySelectorAll(sel);
            if (found.length > 0) {
                productCards = Array.from(found);
                break;
            }
        }

        if (productCards.length === 0) {
            this.log('No se detectaron productos en la página.', 'warn');
            return [];
        }

        const products = this.extractFromCards(productCards);
        const finalUrls = products.map(p => {
            return `https://app.dropi.co/dashboard/product-details/${p.productId}/${this.slugify(p.title)}`;
        });

        if (!this.isStopped) {
            this.log(`¡Éxito! ${finalUrls.length} URLs procesadas.`, 'success');
            return finalUrls;
        }
        return [];
    },

    async extractUrlsFromFeed() {
        this.isStopped = false;
        this.isExtracting = true;
        this.log('Iniciando extracción de URLs...', 'info');

        const loadMoreSelector = 'div.container-button div';
        const productCardSelector = '.card-box';
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const consoleContainer = this.getUIElement('dropi-console-container');
        if (consoleContainer) consoleContainer.style.display = 'flex';

        let retries = 0;
        const MAX_RETRIES = 3;
        let lastCount = 0;

        try {
            while (retries < MAX_RETRIES) {
                if (this.isStopped) {
                    this.log('🛑 Extracción de URLs cancelada.', 'warn');
                    break;
                }

                window.scrollTo(0, document.body.scrollHeight);
                await delay(1000); // Fast scroll

                const loadMoreBtn = document.querySelector(loadMoreSelector);
                const currentCount = document.querySelectorAll(productCardSelector).length;
                this.log(`Productos encontrados: ${currentCount}`, 'info');

                if (loadMoreBtn && loadMoreBtn.offsetParent !== null) {
                    loadMoreBtn.click();
                    await delay(2000);
                    const newCount = document.querySelectorAll(productCardSelector).length;
                    if (newCount === currentCount) retries++; else retries = 0;
                } else {
                    if (currentCount > lastCount) {
                        lastCount = currentCount;
                        retries = 0;
                    } else {
                        retries++;
                    }
                }
            }

            const productCards = Array.from(document.querySelectorAll(productCardSelector));
            const products = productCards.map(card => {
                const imageElement = card.querySelector('.card-image__img');
                const titleElement = card.querySelector('.tittle-product');
                const src = imageElement ? imageElement.src : null;
                const title = titleElement ? titleElement.textContent.trim() : null;
                let productId = null;
                if (src) {
                    const match = src.match(/\/products\/(\d+)\//);
                    if (match && match[1]) productId = match[1];
                }
                return { productId, title };
            }).filter(p => p.productId && p.title);

            const finalUrls = products.map(p => {
                const slugify = t => t.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/-+$/, '');
                return `https://app.dropi.co/dashboard/product-details/${p.productId}/${slugify(p.title)}`;
            });

            if (!this.isStopped) {
                this.log(`¡Éxito! ${finalUrls.length} URLs extraídas.`, 'success');
                return finalUrls;
            } else {
                return [];
            }

        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
            throw error;
        } finally {
            this.isExtracting = false;
        }
    },

    // --- DETAIL EXTRACTION ---
    async startDetailedExtraction(urls) {
        if (!urls || urls.length === 0) {
            alert('No hay URLs para procesar.');
            return;
        }

        this.isStopped = false;
        this.isExtracting = true;

        const job = {
            queue: urls,
            results: [],
            total: urls.length,
            processed: 0
        };

        const consoleContainer = this.getUIElement('dropi-console-container');
        if (consoleContainer) consoleContainer.style.display = 'flex';

        const statusDiv = this.getUIElement('dropi-scrape-status');
        if (statusDiv) statusDiv.style.display = 'flex';

        this.log(`⚡ Iniciando extracción RÁPIDA de ${job.total} productos...`, 'warn');
        this.processQueueFast(job);
    },

    async processQueueFast(job) {
        while (job.queue.length > 0) {
            if (this.isStopped) {
                this.log('🛑 Proceso de extracción detenido manualmente.', 'warn');
                break;
            }

            const url = job.queue[0];
            const name = url.split('/').pop().substring(0, 20) + '...';
            this.log(`${job.processed + 1}/${job.total} | ${name}`, 'info');
            this.updateProgress(job.processed, job.total);

            try {
                const start = Date.now();
                const response = await new Promise(resolve => {
                    chrome.runtime.sendMessage({ action: 'scrape_url_fast', url: url }, resolve);
                });
                const duration = ((Date.now() - start) / 1000).toFixed(1);

                if (response && response.success) {
                    const data = response.data;
                    this.log(`✅ OK (${duration}s)`, 'success');
                    job.results.push(data);

                    if (window.DropiApp.License) window.DropiApp.License.recordAction('extract');
                } else {
                    this.log(`❌ Error`, 'error');
                    job.results.push({ url_source: url, error: 'Failed', title: 'Error Extraction' });
                }

            } catch (err) {
                this.log(`❌ Excepción: ${err.message}`, 'error');
            }

            job.processed++;
            job.queue.shift();
        }

        if (job.results.length > 0) {
            this.finishExtraction(job);
        } else {
            this.log('No se extrajeron resultados.', 'warn');
        }
        this.isExtracting = false;
    },

    scrapeProductDetails(currentUrl) {
        const getText = (selector) => document.querySelector(selector)?.innerText.trim() || null;
        const cleanPrice = (priceString) => {
            if (!priceString) return null;
            const numberString = priceString.replace(/[^0-9,]/g, '').replace(',', '.');
            return parseFloat(numberString) || null;
        };

        const title = getText('.product_info_top h2');
        const description = getText('#descriptionContainer');
        let providerPrice = cleanPrice(getText('div.price-providers p.price_product'));

        if (providerPrice === null) {
            const tableCurrencies = document.querySelectorAll('tr td:nth-child(4) currency');
            for (const el of tableCurrencies) {
                const val = cleanPrice(el.innerText);
                if (val !== null) {
                    providerPrice = val;
                    break;
                }
            }
        }

        const suggestedPrice = cleanPrice(getText('div.price-suggested p.price_product'));

        let images = [];
        const galleryImages = document.querySelectorAll('p-galleria .p-galleria-thumbnail-container img');
        if (galleryImages.length > 0) {
            images = Array.from(galleryImages).map(img => img.src).filter(Boolean);
        }
        if (images.length === 0) {
            const mainImage = document.querySelector('#pn_id_10_item_0 > p-galleriaitemslot > img') || document.querySelector('p-galleriaitemslot > img');
            if (mainImage && mainImage.src) images.push(mainImage.src);
        }

        const chips = Array.from(document.querySelectorAll('app-product-info .chips-container > div'));
        const category = chips.length > 0 ? chips[0].innerText.trim() : null;
        const tags = chips.length > 1 ? chips.slice(1).map(chip => chip.innerText.trim()) : [];

        const idMatch = currentUrl.match(/product-details\/(\d+)/);
        const id = idMatch ? parseInt(idMatch[1], 10) : null;
        const slugify = t => t ? t.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/-+$/, '') : '';

        return {
            id,
            url_source: currentUrl,
            title,
            description,
            category,
            tags,
            providerPrice,
            suggestedPrice,
            images,
            slug: slugify(title)
        };
    },

    async finishExtraction(job) {
        this.log('¡PROCESO FINALIZADO!', 'success');
        this.updateProgress(job.total, job.total);
        this.downloadJSON(job.results, 'productos_extraidos_dropi.json');
    },

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    async downloadUrls() {
        try {
            const urls = await this.extractUrlsFromFeed();
            if (urls && urls.length > 0) {
                this.downloadJSON(urls, 'product_urls_long.json');
            }
            return urls;
        } catch (e) {
            this.log(`Error URLs: ${e.message}`, 'error');
        }
    },

    async downloadUrlsInstant() {
        try {
            const urls = await this.extractUrlsInstant();
            if (urls && urls.length > 0) {
                this.downloadJSON(urls, 'product_urls_instant.json');
            }
            return urls;
        } catch (e) {
            this.log(`Error Instant: ${e.message}`, 'error');
        }
    }
}
