window.DropiApp = window.DropiApp || {};

window.DropiApp.State = {
    products: [],
    currentIndex: 0,
    currentStep: 0, // 0: Inactivo, 1: Título, 2: Precio, 3: Descripción

    async init() {
        await this.load();
    },

    async load() {
        const data = await chrome.storage.local.get(['dropi_products', 'dropi_index']);
        if (data.dropi_products && Array.isArray(data.dropi_products) && data.dropi_products.length > 0) {
            this.products = data.dropi_products;
            this.currentIndex = data.dropi_index || 0;
        } else {
            // Inicializar con un producto vacío para entrada manual
            this.products = [{
                title: '',
                description: '',
                providerPrice: '',
                suggestedPrice: '',
                category: '',
                locations: [],
                images: [],
                tags: []
            }];
            this.currentIndex = 0;
        }
    },

    setStep(step) {
        this.currentStep = step;
    },

    getStep() {
        return this.currentStep;
    },

    async save() {
        await chrome.storage.local.set({
            'dropi_products': this.products,
            'dropi_index': this.currentIndex
        });
    },

    addProduct() {
        this.products.push({
            title: '',
            description: '',
            providerPrice: '',
            suggestedPrice: '',
            category: '',
            locations: [],
            images: [],
            tags: []
        });
        this.currentIndex = this.products.length - 1;
        this.save();
    },
    setProducts(newProducts) {
        this.products = newProducts;
        this.currentIndex = 0;
        this.save();
    },

    getCurrentProduct() {
        if (this.products.length === 0) return null;
        return this.products[this.currentIndex];
    },

    navigate(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.products.length) {
            this.currentIndex = newIndex;
            this.save();
            return true;
        }
        return false;
    },

    deleteProduct() {
        if (this.products.length === 0) return;
        
        // Confirmar eliminación (Opcional, pero recomendado)
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

        this.products.splice(this.currentIndex, 1);
        
        // Ajustar índice si el producto eliminado era el último
        if (this.currentIndex >= this.products.length) {
            this.currentIndex = Math.max(0, this.products.length - 1);
        }

        // Si borramos todos, creamos uno vacío por defecto
        if (this.products.length === 0) {
            this.products = [{
                title: '',
                description: '',
                providerPrice: '',
                suggestedPrice: '',
                category: '',
                locations: [],
                images: [],
                tags: []
            }];
            this.currentIndex = 0;
        }

        // 🔓 SEGURIDAD: Reset de bloqueos si el usuario borra manualmente
        window.DROPI_IS_FILLING = false;
        if (window.DropiApp.AutoLoop) window.DropiApp.AutoLoop.isProcessing = false;

        this.save();
        return true;
    },

    hasProducts() {
        return this.products.length > 0;
    }
};
