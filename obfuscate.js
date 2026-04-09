const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs-extra');
const path = require('path');

async function obfuscateProject() {
    const srcDir = './'; // Source is root
    const distDir = './dist_pro'; // We use a new folder for professional version
    const ignoreFiles = ['node_modules', '.git', 'dist', 'dist_pro', 'package.json', 'package-lock.json', 'obfuscate.js', 'create_icon.ps1'];

    console.log('🚀 Iniciando ofuscación profesional...');

    // 1. Limpiar/Crear dist_pro
    if (await fs.exists(distDir)) {
        await fs.remove(distDir);
    }
    await fs.ensureDir(distDir);

    // 2. Copiar archivos y ofuscar JS
    async function processDirectory(currentDir, targetDir) {
        const items = await fs.readdir(currentDir);

        for (const item of items) {
            if (ignoreFiles.includes(item)) continue;

            const fullPath = path.join(currentDir, item);
            const targetPath = path.join(targetDir, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                await fs.ensureDir(targetPath);
                await processDirectory(fullPath, targetPath);
            } else {
                if (item.endsWith('.js')) {
                    console.log(`🔒 Ofuscando: ${fullPath}`);
                    const code = await fs.readFile(fullPath, 'utf8');
                    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
                        compact: true,
                        controlFlowFlattening: false, // OFF para alto rendimiento
                        deadCodeInjection: false,
                        debugProtection: false,
                        disableConsoleOutput: false,
                        identifierNamesGenerator: 'hexadecimal',
                        log: false,
                        numbersToExpressions: true,
                        renameGlobals: false,
                        rotateStringArray: true,
                        selfDefending: false,
                        shuffleStringArray: true,
                        simplify: true,
                        splitStrings: true,
                        stringArray: true,
                        stringArrayEncoding: ['base64'],
                        stringArrayThreshold: 0.75,
                        unicodeEscapeSequence: false
                    });
                    await fs.writeFile(targetPath, obfuscationResult.getObfuscatedCode());
                } else {
                    // Copiar otros archivos (css, json, png, etc)
                    console.log(`📄 Copiando: ${fullPath}`);
                    await fs.copy(fullPath, targetPath);
                }
            }
        }
    }

    await processDirectory(srcDir, distDir);
    console.log('✅ ¡Ofuscación completada! La carpeta lista para el cliente es: dist_pro');
}

obfuscateProject().catch(err => {
    console.error('❌ Error durante la ofuscación:', err);
});
