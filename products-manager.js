/**
 * Менеджер товаров с бесконечным скроллингом
 * Используется на страницах категорий
 */

function fixImageUrl(url) {
    if (!url) return '/images/placeholder.jpg';
    
    // Если URL содержит склеенные ссылки
    if (url.includes('https') && url.split('https').length > 2) {
        // Разделяем по 'https'
        const parts = url.split('https');
        // Берём вторую часть (индекс 2, т.к. parts[0] пустой)
        let secondPart = parts[2];
        
        // Заменяем %3A/ на ://
        secondPart = secondPart.replace('%3A/', '://');
        
        // Собираем правильный URL
        return 'https' + secondPart;
    }
    
    return url;
}

class ProductsManager {
    constructor(options = {}) {
        // ID категории (берём из настроек страницы)
        this.categoryId = options.categoryId || null;
        
        // Контейнер для товаров
        this.container = document.querySelector(options.containerSelector || '#products-container');
        
        // Настройки пагинации
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.hasMorePages = true;
        this.isLoading = false;
        
        // Фильтры
        this.filters = {
            status: options.status || null,
            search: options.search || null
        };
        
        // Инициализация
        this.init();
    }

    /**
     * Инициализация менеджера
     */
    async init() {
        if (!this.container) {
            console.error('Products container not found!');
            return;
        }

        // Создаём структуру
        this.createStructure();
        
        // Загружаем первую страницу
        await this.loadProducts();
        
        // Настраиваем бесконечный скроллинг
        this.setupInfiniteScroll();
    }

    /**
     * Создаём HTML структуру для товаров
     */
    createStructure() {
        this.container.innerHTML = `
            <div class="products-grid"></div>
            <div class="products-loader">
                <div class="spinner"></div>
                <p>Загрузка товаров...</p>
            </div>
            <div class="products-empty" style="display: none;">
                <div class="products-empty-icon">📦</div>
                <p class="products-empty-text">Товары не найдены</p>
            </div>
        `;

        this.gridElement = this.container.querySelector('.products-grid');
        this.loaderElement = this.container.querySelector('.products-loader');
        this.emptyElement = this.container.querySelector('.products-empty');
    }

    /**
     * Загрузка товаров
     */
    async loadProducts() {
        if (this.isLoading || !this.hasMorePages) {
            return;
        }

        this.isLoading = true;
        this.showLoader();

        try {
            // Параметры запроса
            const params = {
                page: this.currentPage,
                limit: this.itemsPerPage
            };

            // Добавляем категорию если есть
            if (this.categoryId) {
                params.category = this.categoryId;
            }

            // Добавляем фильтры
            if (this.filters.status) {
                params.status = this.filters.status;
            }
            if (this.filters.search) {
                params.search = this.filters.search;
            }

            // Запрос к API
            const response = await apiClient.getProducts(params);
            
            // Обрабатываем результат
            if (response.results && response.results.length > 0) {
                this.renderProducts(response.results);
                
                // Проверяем есть ли ещё страницы
                this.hasMorePages = response.next !== null;
                this.currentPage++;
            } else if (this.currentPage === 1) {
                // Если это первая страница и товаров нет
                this.showEmpty();
            }

        } catch (error) {
            console.error('Failed to load products:', error);
            this.showError();
        } finally {
            this.isLoading = false;
            this.hideLoader();
        }
    }

    /**
     * Отрисовка товаров
     */
    renderProducts(products) {
        products.forEach(product => {
            const card = this.createProductCard(product);
            this.gridElement.appendChild(card);
        });

        // Скрываем пустое состояние если товары есть
        if (this.gridElement.children.length > 0) {
            this.emptyElement.style.display = 'none';
        }
    }

    /**
     * Создание карточки товара
     */
    // createProductCard(product) {
    //     const card = document.createElement('div');
    //     card.className = 'product-card';
    //     card.dataset.productId = product.id;

    //     // Получаем первое изображение
    //     // const mainImage = product.images && product.images.length > 0
    //     //     ? product.images[0].image
    //     //     : '/images/placeholder.jpg'; // Путь к заглушке

    //     // Получаем правильный URL картинки
    //     let mainImage = '/images/placeholder.jpg';
    //     if (product.images && product.images.length > 0) {
    //         let imageUrl = product.images[0].image;
            
    //         // Фикс склеенных URL
    //         if (imageUrl.includes('https://') && imageUrl.match(/https:\/\//g).length > 1) {
    //             const parts = imageUrl.split('https://');
    //             imageUrl = 'https://' + parts[2];
    //         }
            
    //         mainImage = imageUrl;
    //     }

    //     // Определяем есть ли бейдж
    //     let badgeHTML = '';
    //     if (product.status_display && product.status !== 'in_stock') {
    //         const badgeClass = product.status === 'new' ? 'new' : 'sale';
    //         badgeHTML = `<div class="product-badge ${badgeClass}">${product.status_display}</div>`;
    //     }

    //     card.innerHTML = `
    //         <div class="product-image-container">
    //             ${badgeHTML}
    //             <img 
    //                 src="${mainImage}" 
    //                 alt="${product.title}"
    //                 class="product-image"
    //                 loading="lazy"
    //             >
    //         </div>
    //         <div class="product-info">
    //             <div class="product-category">${product.category_name || 'Без категории'}</div>
    //             <h3 class="product-title">${product.title}</h3>
    //             <div class="product-price">${this.formatPrice(product.price)}</div>
    //         </div>
    //     `;

    //     // Обработчик клика - переход на детальную страницу
    //     card.addEventListener('click', () => {
    //         this.openProductDetail(product.id);
    //     });

    //     return card;
    // }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;
    
        // Получаем правильный URL картинки
        let mainImage = '/images/placeholder.jpg';
        if (product.images && product.images.length > 0) {
            mainImage = fixImageUrl(product.images[0].image);
        }
    
        // Определяем бейдж
        let badgeHTML = '';
        if (product.status_display && product.status !== 'in_stock') {
            const badgeClass = product.status === 'new' ? 'new' : 'sale';
            badgeHTML = `<div class="product-badge ${badgeClass}">${product.status_display}</div>`;
        }
    
        card.innerHTML = `
            <div class="product-image-container">
                ${badgeHTML}
                <img 
                    src="${mainImage}" 
                    alt="${product.title}"
                    class="product-image"
                    loading="lazy"
                    onerror="this.src='/images/placeholder.jpg'"
                >
            </div>
            <div class="product-info">
                <div class="product-category">${product.category_name || 'Без категории'}</div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">${this.formatPrice(product.price)}</div>
            </div>
        `;
    
        card.addEventListener('click', () => {
            this.openProductDetail(product.id);
        });
    
        return card;
    }

    /**
     * Форматирование цены
     */
    formatPrice(price) {
        if (!price) return 'Цена не указана';
        
        // Форматируем число с разделителями тысяч
        const formatted = Number(price).toLocaleString('ru-RU');
        return `${formatted} €`; // Можешь изменить валюту
    }

    /**
     * Переход на детальную страницу товара
     */
    openProductDetail(productId) {
        // Сохраняем ID товара в localStorage для детальной страницы
        localStorage.setItem('selectedProductId', productId);
        
        // Переходим на страницу товара
        // Можешь настроить путь под свою структуру
        window.location.href = `/product.html?id=${productId}`;
    }

    /**
     * Настройка бесконечного скроллинга
     */
    setupInfiniteScroll() {
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            // Дебаунс для оптимизации
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.checkScroll();
            }, 100);
        });
    }

    /**
     * Проверка нужно ли загружать ещё товары
     */
    checkScroll() {
        if (this.isLoading || !this.hasMorePages) {
            return;
        }

        // Получаем позицию скролла
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Если докрутили до 80% страницы - загружаем ещё
        const scrollPercent = (scrollTop + windowHeight) / documentHeight;
        
        if (scrollPercent > 0.8) {
            this.loadProducts();
        }
    }

    /**
     * Применить фильтры
     */
    applyFilters(newFilters) {
        // Обновляем фильтры
        this.filters = { ...this.filters, ...newFilters };
        
        // Сбрасываем пагинацию
        this.currentPage = 1;
        this.hasMorePages = true;
        
        // Очищаем сетку
        this.gridElement.innerHTML = '';
        
        // Загружаем товары заново
        this.loadProducts();
    }

    /**
     * Показать лоадер
     */
    showLoader() {
        this.loaderElement.classList.add('active');
    }

    /**
     * Скрыть лоадер
     */
    hideLoader() {
        this.loaderElement.classList.remove('active');
    }

    /**
     * Показать пустое состояние
     */
    showEmpty() {
        this.emptyElement.style.display = 'block';
        this.gridElement.style.display = 'none';
    }

    /**
     * Показать ошибку
     */
    showError() {
        this.emptyElement.innerHTML = `
            <div class="products-empty-icon">⚠️</div>
            <p class="products-empty-text">Ошибка загрузки товаров</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
                Обновить страницу
            </button>
        `;
        this.emptyElement.style.display = 'block';
    }
}

// ==================== УТИЛИТЫ ==================== 

/**
 * Получить ID категории из URL или из data-атрибута
 */
function getCategoryIdFromPage() {
    // Вариант 1: Из URL параметра
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    
    if (categoryFromUrl) {
        return parseInt(categoryFromUrl);
    }
    
    // Вариант 2: Из data-атрибута контейнера
    const container = document.querySelector('#products-container');
    if (container && container.dataset.categoryId) {
        return parseInt(container.dataset.categoryId);
    }
    
    // Вариант 3: Из глобальной переменной (если задана в HTML)
    if (typeof CATEGORY_ID !== 'undefined') {
        return CATEGORY_ID;
    }
    
    return null;
}

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем есть ли контейнер для товаров на странице
    const productsContainer = document.querySelector('#products-container');
    
    if (productsContainer) {
        // Получаем ID категории
        const categoryId = getCategoryIdFromPage();
        
        // Создаём менеджер товаров
        window.productsManager = new ProductsManager({
            categoryId: categoryId,
            containerSelector: '#products-container'
        });
        
        console.log('Products manager initialized for category:', categoryId);
    }
});
