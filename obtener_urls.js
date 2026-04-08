require('dotenv').config({ path: require('path').resolve(__dirname, '.env') }); // Load .env file variables
const puppeteer = require('puppeteer');
const fs = require('fs-extra');

// Get credentials from .env file
const userEmail = process.env.DROPI_EMAIL;
const userPassword = process.env.DROPI_PASSWORD;

async function scrape() {
    if (!userEmail || !userPassword) {
        console.error('Error: Las credenciales de Dropi no se encontraron en el archivo .env.');
        console.error('Asegúrate de que el archivo scraper/.env existe y contiene DROPI_EMAIL y DROPI_PASSWORD.');
        return;
    }

    console.log('Iniciando el scraper con inicio de sesión...');
    let browser;

    try {
        browser = await puppeteer.launch({ headless: true }); // Use headless: false for debugging
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // 1. Navigate to Login Page
        const loginUrl = 'https://app.dropi.co/auth/login';
        console.log(`Navegando a la página de login: ${loginUrl}`);
        await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 100000 });

        // 2. Fill and submit login form
        console.log('Ingresando credenciales...');
        await page.waitForSelector('input[id="email"]', { visible: true, timeout: 60000 });
        await page.type('input[id="email"]', userEmail, { delay: 100 });
        await page.type('input[id="password"]', userPassword, { delay: 100 });
        
        console.log('Haciendo clic en el botón de inicio de sesión...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
            page.click('.default')
        ]);

        // 3. Verify login success and navigate to search page
        const dashboardUrl = 'https://app.dropi.co/dashboard';
        if (!page.url().startsWith(dashboardUrl)) {
            throw new Error('El inicio de sesión falló. La URL no redirigió al dashboard. Revisa las credenciales y los selectores.');
        }
        console.log('¡Inicio de sesión exitoso!');

        const searchUrl = 'https://app.dropi.co/dashboard/provider/55394/jesus?isFavorite=false';
        console.log(`Navegando a la página de búsqueda de productos: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // 4. Click "Load More" until it disappears
        const loadMoreButtonSelector = 'div.container-button div';
        const productCardSelector = '.card-box';
        let lastProductCount = 0;

        while (true) {
            try {
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });

                console.log('Buscando el botón "Mostrar más productos"...');
                await page.waitForSelector(loadMoreButtonSelector, { visible: true, timeout: 90000 });
                
                lastProductCount = await page.evaluate((selector) => document.querySelectorAll(selector).length, productCardSelector);
                console.log(`Productos encontrados hasta ahora: ${lastProductCount}. Haciendo clic para cargar más...`);
                
                await page.click(loadMoreButtonSelector);
                
                // Wait for the number of products to increase, with a longer timeout
                await page.waitForFunction(
                    (selector, count) => document.querySelectorAll(selector).length > count,
                    { timeout: 90000 },
                    productCardSelector,
                    lastProductCount
                );

                // Add a small delay to allow new content to render fully
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.log('No se encontró o no se cargaron más productos. Asumiendo que hemos terminado.');
                break; // Exit the loop
            }
        }

        // 5. Extract all URLs after loading all products
        console.log('Todos los productos han sido cargados. Esperando que la información se asiente...');
        await page.waitForSelector(productCardSelector, { visible: true, timeout: 10000 });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Final wait for stability

        console.log('Extrayendo todas las URLs...');
        const productData = await page.evaluate((selector) => {
            const productCards = Array.from(document.querySelectorAll(selector));
            console.log(`Se encontraron ${productCards.length} tarjetas de producto en el DOM para evaluar.`);
            return productCards.map(card => {
                const imageElement = card.querySelector('.card-image__img');
                const titleElement = card.querySelector('.tittle-product');
                const src = imageElement ? imageElement.src : null;
                const title = titleElement ? titleElement.textContent.trim() : null;
                let productId = null;

                if (src) {
                    const match = src.match(/\/products\/(\d+)\//);
                    if (match && match[1]) {
                        productId = match[1];
                    }
                }
                return { productId, title };
            }).filter(p => p.productId && p.title);
        }, productCardSelector);

        // 6. Build final URLs with slugs
        console.log(`Se encontraron ${productData.length} productos con datos completos. Construyendo URLs...`);

        const slugify = (text) => {
            if (!text) return '';
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        };

        const finalUrls = productData.map(p => {
            const slug = slugify(p.title);
            return `https://app.dropi.co/dashboard/product-details/${p.productId}/${slug}`;
        });

        console.log('Ejemplo de URLs finales construidas:', finalUrls.slice(0, 5));

        // 7. Save URLs to a JSON file
        const outputPath = 'product_urls2.json';
        console.log(`Guardando URLs en ${outputPath}...`);
        await fs.writeJson(outputPath, finalUrls, { spaces: 2 });
        console.log(`¡URLs guardadas exitosamente en scraper /${outputPath}!`);

    } catch (error) {
        console.error('Ocurrió un error durante el scraping:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('Navegador cerrado.');
        }
    }
}

scrape();
