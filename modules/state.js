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

    hasProducts() {
        return this.products.length > 0;
    }
};
