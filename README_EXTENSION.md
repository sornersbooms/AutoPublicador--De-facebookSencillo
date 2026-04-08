# AutoPublicador Marketplace FB - Chrome Extension

Esta extensión permite automatizar la publicación de productos en Facebook Marketplace directamente desde el navegador, utilizando una interfaz flotante moderna y ligera.

## 🚀 Instalación

1. Abre Google Chrome y ve a `chrome://extensions/`.
2. Activa el **Modo de desarrollador** (esquina superior derecha).
3. Haz clic en **Cargar descomprimida**.
4. Selecciona la carpeta `extension` que está dentro de este proyecto (`.../FacebookMarketplaceBot/extension`).

## 🛠️ Uso

1. Ve a [Facebook Marketplace - Crear Venta](https://www.facebook.com/marketplace/create/item).
2. Verás un panel flotante a la derecha ("AutoPublicador").
3. Haz clic en **📂 Cargar JSON** y selecciona tu archivo `products_final.json`.
4. Navega entre los productos con las flechas `◀` y `▶`.
5. **Imágenes**: Arrastra las imágenes desde la galería del panel hacia el recuadro de "Fotos" de Facebook.
6. **Datos**: Haz clic en **✨ Rellenar Datos** para completar automáticamente Título, Precio y Descripción.
   - *Nota*: Debes seleccionar la Categoría manualmente si no se rellena sola.
7. Revisa y publica.

## ✨ Características Técnicas

- **Manifest V3**: Estándar moderno de Chrome.
- **Vanilla JS & CSS**: Sin frameworks pesados, ultraligero.
- **Glassmorphism UI**: Diseño flotante elegante y no intrusivo.
- **Simulación Nativa**: Usa `execCommand` para escribir en campos de React como un usuario real.
- **Persistencia**: Guarda tu progreso y archivo cargado automáticamente.

## 📁 Estructura

- `manifest.json`: Configuración de la extensión.
- `content.js`: Lógica principal (UI, automatización).
- `styles.css`: Estilos aislados y modernos.
