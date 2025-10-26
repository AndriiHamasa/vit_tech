/**
 * API Client для работы с бэкендом
 * Универсальный модуль для всех страниц
 */

const API_CONFIG = {
    // Когда запускаешь бэк локально
    // BASE_URL: 'https://web-production-7d99b.up.railway.app/api',
    BASE_URL: 'http://127.0.0.1:8000/api',
    
    
    // Когда задеплоишь бэк, поменяй на:
    // BASE_URL: 'https://your-backend.com/api',
    
    ENDPOINTS: {
        products: '/products/',
        productDetail: '/products/:id/',
        categories: '/categories/',
        newArrivals: '/products/new_arrivals/',
        byCategory: '/products/by_category/'
    }
};

class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    /**
     * Базовый метод для всех запросов
     */
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Получить список товаров с пагинацией
     * @param {Object} params - параметры запроса
     * @param {number} params.page - номер страницы (по умолчанию 1)
     * @param {number} params.limit - количество товаров на странице (по умолчанию 20)
     * @param {number} params.category - ID категории для фильтрации
     * @param {string} params.status - статус товара (например, 'new')
     * @param {string} params.search - поисковый запрос
     */
    async getProducts(params = {}) {
        const queryParams = new URLSearchParams();
        
        // Добавляем параметры пагинации
        queryParams.append('page', params.page || 1);
        queryParams.append('limit', params.limit || 20);
        
        // Добавляем фильтры если они есть
        if (params.category) {
            queryParams.append('category', params.category);
        }
        if (params.status) {
            queryParams.append('status', params.status);
        }
        if (params.search) {
            queryParams.append('search', params.search);
        }

        const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.products}?${queryParams}`;
        return await this.request(url);
    }

    /**
     * Получить товары по категории (альтернативный эндпоинт)
     */
    async getProductsByCategory(categoryId, page = 1, limit = 20) {
        const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.byCategory}?category_id=${categoryId}&page=${page}&limit=${limit}`;
        return await this.request(url);
    }

    /**
     * Получить детальную информацию о товаре
     * @param {number} productId - ID товара
     */
    async getProductDetail(productId) {
        const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.productDetail.replace(':id', productId)}`;
        return await this.request(url);
    }

    /**
     * Получить все категории
     */
    async getCategories() {
        const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.categories}`;
        return await this.request(url);
    }

    /**
     * Получить новые поступления
     */
    async getNewArrivals(page = 1, limit = 20) {
        const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.newArrivals}?page=${page}&limit=${limit}`;
        return await this.request(url);
    }
}

// Создаём единственный экземпляр API клиента
const apiClient = new APIClient();
