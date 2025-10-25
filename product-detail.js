/**
 * Менеджер детальной страницы товара
 * Работает с галереей, характеристиками и слайдером
 */

class ProductDetailManager {
    constructor() {
        this.productId = this.getProductId();
        this.product = null;
        this.currentImageIndex = 0;
        
        this.init();
    }

    /**
     * Получить ID товара из URL
     */
    getProductId() {
        const urlParams = new URLSearchParams(window.location.search);
        const idFromUrl = urlParams.get('id');
        
        if (idFromUrl) {
            return parseInt(idFromUrl);
        }
        
        // Альтернативно из localStorage (если переходили с карточки)
        const idFromStorage = localStorage.getItem('selectedProductId');
        if (idFromStorage) {
            return parseInt(idFromStorage);
        }
        
        return null;
    }

    /**
     * Инициализация
     */
    async init() {
        if (!this.productId) {
            this.showError('Товар не найден');
            return;
        }

        await this.loadProduct();
    }

    /**
     * Загрузка данных товара
     */
    async loadProduct() {
        try {
            this.showLoader();
            
            // Получаем детальную информацию о товаре
            this.product = await apiClient.getProductDetail(this.productId);
            
            // Отрисовываем
            this.render();
            
        } catch (error) {
            console.error('Failed to load product:', error);
            this.showError('Ошибка загрузки товара');
        } finally {
            this.hideLoader();
        }
    }

    /**
     * Отрисовка страницы товара
     */
    render() {
        const container = document.querySelector('#product-detail-container');
        
        if (!container) {
            console.error('Product detail container not found');
            return;
        }

        // Генерируем HTML
        container.innerHTML = this.generateHTML();
        
        // Инициализируем галерею
        this.initGallery();
        
        // Инициализируем слайдер для мобилок
        this.initMobileSlider();
    }

    /**
     * Генерация HTML страницы
     */
    // generateHTML() {
    //     const images = this.product.images || [];
    //     const hasMultipleImages = images.length > 1;

    //     return `
    //         <div class="product-detail-layout">
    //             <!-- Галерея для десктопа -->
    //             <div class="product-gallery">
    //                 ${this.generateGalleryHTML(images)}
    //             </div>

    //             <!-- Слайдер для мобилок -->
    //             <div class="product-slider">
    //                 ${this.generateSliderHTML(images)}
    //             </div>

    //             <!-- Информация о товаре -->
    //             <div class="product-detail-info">
    //                 ${this.product.category_name ? `
    //                     <div class="product-detail-category">${this.product.category_name}</div>
    //                 ` : ''}
                    
    //                 <h1 class="product-detail-title">${this.product.title}</h1>
                    
    //                 <div class="product-detail-price">${this.formatPrice(this.product.price)}</div>
                    
    //                 ${this.product.description ? `
    //                     <div class="product-detail-description">${this.product.description}</div>
    //                 ` : ''}
                    
    //                 ${this.generateCharacteristicsHTML()}
    //             </div>
    //         </div>
    //     `;
    // }
    /**
 * Генерация HTML страницы
 */
    generateHTML() {
        const images = this.product.images || [];

        return `
            <div class="product-detail-layout">
                <!-- ЛЕВАЯ КОЛОНКА: Галерея для десктопа -->
                <div class="product-gallery">
                    ${this.generateGalleryHTML(images)}
                </div>

                <!-- Слайдер для мобилок -->
                <div class="product-slider">
                    ${this.generateSliderHTML(images)}
                </div>

                <!-- ПРАВАЯ КОЛОНКА: Информация о товаре -->
                <div class="product-detail-info">
                    ${this.product.category_name ? `
                        <div class="product-detail-category">${this.product.category_name}</div>
                    ` : ''}
                    
                    <h1 class="product-detail-title">${this.product.title}</h1>
                    
                    <div class="product-detail-price">${this.formatPrice(this.product.price)}</div>
                    
                    ${this.product.description ? `
                        <div class="product-detail-description">${this.product.description}</div>
                    ` : ''}
                    
                    ${this.generateCharacteristicsHTML()}
                </div>
            </div>
        `;
    }

    /**
     * Генерация HTML галереи для десктопа
     */
    // generateGalleryHTML(images) {
    //     if (images.length === 0) {
    //         return `
    //             <img 
    //                 src="/images/placeholder.jpg" 
    //                 alt="${this.product.title}"
    //                 class="product-main-image"
    //             >
    //         `;
    //     }

    //     const mainImage = images[0];
        
    //     let thumbnailsHTML = '';
    //     if (images.length > 1) {
    //         thumbnailsHTML = `
    //             <div class="product-thumbnails">
    //                 ${images.map((img, index) => `
    //                     <img 
    //                         src="${img.image}" 
    //                         alt="Фото ${index + 1}"
    //                         class="product-thumbnail ${index === 0 ? 'active' : ''}"
    //                         data-index="${index}"
    //                     >
    //                 `).join('')}
    //             </div>
    //         `;
    //     }

    //     return `
    //         <img 
    //             src="${mainImage.image}" 
    //             alt="${this.product.title}"
    //             class="product-main-image"
    //             id="main-image"
    //         >
    //         ${thumbnailsHTML}
    //     `;
    // }
    /**
 * Генерация HTML галереи для десктопа (с красивыми стрелками)
 */
    generateGalleryHTML(images) {
        if (images.length === 0) {
            return `
                <div class="product-main-image-wrapper">
                    <img 
                        src="/images/placeholder.jpg" 
                        alt="${this.product.title}"
                        class="product-main-image"
                        id="main-image"
                    >
                </div>
            `;
        }

        const mainImage = images[0];
        
        // Стрелки навигации (показываем только если больше 1 фото)
        const navButtons = images.length > 1 ? `
            <button class="gallery-nav-btn gallery-nav-prev" id="gallery-prev">
                ‹
            </button>
            <button class="gallery-nav-btn gallery-nav-next" id="gallery-next">
                ›
            </button>
        ` : '';

        // Счётчик изображений (1 / 4)
        const counter = images.length > 1 ? `
            <div class="gallery-counter">
                <span id="current-image">1</span> / ${images.length}
            </div>
        ` : '';

        // Миниатюры (показываем только если больше 1 фото)
        let thumbnailsHTML = '';
        if (images.length > 1) {
            thumbnailsHTML = `
                <div class="product-thumbnails">
                    ${images.map((img, index) => `
                        <img 
                            src="${img.image}" 
                            alt="Фото ${index + 1}"
                            class="product-thumbnail ${index === 0 ? 'active' : ''}"
                            data-index="${index}"
                        >
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="product-main-image-wrapper">
                <img 
                    src="${mainImage.image}" 
                    alt="${this.product.title}"
                    class="product-main-image"
                    id="main-image"
                >
                ${navButtons}
                ${counter}
            </div>
            ${thumbnailsHTML}
        `;
    }

    /**
     * Генерация HTML слайдера для мобилок
     */
    // generateSliderHTML(images) {
    //     if (images.length === 0) {
    //         return `
    //             <div class="product-slider-track">
    //                 <img 
    //                     src="/images/placeholder.jpg" 
    //                     alt="${this.product.title}"
    //                     class="product-slider-image"
    //                 >
    //             </div>
    //         `;
    //     }

    //     const dotsHTML = images.length > 1 ? `
    //         <div class="product-slider-dots">
    //             ${images.map((_, index) => `
    //                 <span class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
    //             `).join('')}
    //         </div>
    //     ` : '';

    //     return `
    //         <div class="product-slider-track" id="slider-track">
    //             ${images.map((img, index) => `
    //                 <img 
    //                     src="${img.image}" 
    //                     alt="Фото ${index + 1}"
    //                     class="product-slider-image"
    //                 >
    //             `).join('')}
    //         </div>
    //         ${dotsHTML}
    //     `;
    // }
    /**
 * Генерация HTML слайдера для мобилок (с счётчиком)
 */
    generateSliderHTML(images) {
        if (images.length === 0) {
            return `
                <div class="product-slider-track">
                    <img 
                        src="/images/placeholder.jpg" 
                        alt="${this.product.title}"
                        class="product-slider-image"
                    >
                </div>
            `;
        }

        // Счётчик слайдов
        const counter = images.length > 1 ? `
            <div class="product-slider-counter">
                <span id="slider-current">1</span> / ${images.length}
            </div>
        ` : '';

        // Стрелки навигации
        const navButtons = images.length > 1 ? `
            <button class="slider-nav-btn slider-nav-prev" id="slider-prev">‹</button>
            <button class="slider-nav-btn slider-nav-next" id="slider-next">›</button>
        ` : '';

        // Точки-индикаторы
        const dotsHTML = images.length > 1 ? `
            <div class="product-slider-dots">
                ${images.map((_, index) => `
                    <span class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
                `).join('')}
            </div>
        ` : '';

        return `
            ${counter}
            ${navButtons}
            <div class="product-slider-track" id="slider-track">
                ${images.map((img, index) => `
                    <img 
                        src="${img.image}" 
                        alt="Фото ${index + 1}"
                        class="product-slider-image"
                    >
                `).join('')}
            </div>
            ${dotsHTML}
        `;
    }

    /**
     * Генерация HTML характеристик
     * Здесь нужно будет адаптировать под твою структуру данных
     */
    generateCharacteristicsHTML() {
        // Пока у тебя нет характеристик в модели, но добавим заготовку
        // Когда добавишь характеристики, раскомментируй и адаптируй
        
        /*
        if (!this.product.characteristics || this.product.characteristics.length === 0) {
            return '';
        }

        return `
            <div class="product-characteristics">
                <h2 class="product-characteristics-title">Характеристики</h2>
                ${this.product.characteristics.map(char => `
                    <div class="characteristic-item">
                        <span class="characteristic-label">${char.name}</span>
                        <span class="characteristic-value">${char.value}</span>
                    </div>
                `).join('')}
            </div>
        `;
        */
        
        // Временная заглушка
        return `
            <div class="product-characteristics">
                <h2 class="product-characteristics-title">Характеристики</h2>
                <div class="characteristic-item">
                    <span class="characteristic-label">Категория</span>
                    <span class="characteristic-value">${this.product.category_name || 'Не указано'}</span>
                </div>
                <div class="characteristic-item">
                    <span class="characteristic-label">Статус</span>
                    <span class="characteristic-value">${this.product.status_display || 'В наличии'}</span>
                </div>
            </div>
        `;
    }

    /**
     * Инициализация галереи (переключение между фото)
     */
    // initGallery() {
    //     const mainImage = document.getElementById('main-image');
    //     const thumbnails = document.querySelectorAll('.product-thumbnail');

    //     if (!mainImage || thumbnails.length === 0) {
    //         return;
    //     }

    //     thumbnails.forEach((thumbnail, index) => {
    //         thumbnail.addEventListener('click', () => {
    //             // Меняем главное изображение
    //             mainImage.src = thumbnail.src;
                
    //             // Обновляем активный thumbnail
    //             thumbnails.forEach(t => t.classList.remove('active'));
    //             thumbnail.classList.add('active');
                
    //             this.currentImageIndex = index;
    //         });
    //     });
    // }
    /**
 * Инициализация галереи с навигацией по стрелкам
 */
    initGallery() {
        const mainImage = document.getElementById('main-image');
        const thumbnails = document.querySelectorAll('.product-thumbnail');
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        const counterCurrent = document.getElementById('current-image');

        if (!mainImage || thumbnails.length === 0) {
            return;
        }

        const images = this.product.images || [];
        
        // Функция обновления изображения
        const updateImage = (index) => {
            if (index < 0 || index >= images.length) return;
            
            this.currentImageIndex = index;
            
            // Меняем главное изображение
            mainImage.src = images[index].image;
            
            // Обновляем активную миниатюру
            thumbnails.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
            
            // Обновляем счётчик
            if (counterCurrent) {
                counterCurrent.textContent = index + 1;
            }
            
            // Обновляем кнопки (отключаем если достигли края)
            if (prevBtn) {
                prevBtn.disabled = index === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = index === images.length - 1;
            }
        };

        // Клик по миниатюрам
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                updateImage(index);
            });
        });

        // Клик по стрелке "назад"
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateImage(this.currentImageIndex - 1);
            });
        }

        // Клик по стрелке "вперёд"
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateImage(this.currentImageIndex + 1);
            });
        }

        // Навигация с клавиатуры (стрелки)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                updateImage(this.currentImageIndex - 1);
            } else if (e.key === 'ArrowRight') {
                updateImage(this.currentImageIndex + 1);
            }
        });

        // Инициализация состояния кнопок
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn && images.length <= 1) nextBtn.disabled = true;
    }

    /**
     * Инициализация мобильного слайдера
     */
    // initMobileSlider() {
    //     const sliderTrack = document.getElementById('slider-track');
    //     const dots = document.querySelectorAll('.slider-dot');

    //     if (!sliderTrack || dots.length === 0) {
    //         return;
    //     }

    //     // Обработчик скролла для обновления точек
    //     sliderTrack.addEventListener('scroll', () => {
    //         const scrollLeft = sliderTrack.scrollLeft;
    //         const slideWidth = sliderTrack.offsetWidth;
    //         const currentIndex = Math.round(scrollLeft / slideWidth);

    //         // Обновляем активную точку
    //         dots.forEach((dot, index) => {
    //             dot.classList.toggle('active', index === currentIndex);
    //         });

    //         this.currentImageIndex = currentIndex;
    //     });

    //     // Клик по точкам для навигации
    //     dots.forEach((dot, index) => {
    //         dot.addEventListener('click', () => {
    //             const slideWidth = sliderTrack.offsetWidth;
    //             sliderTrack.scrollTo({
    //                 left: slideWidth * index,
    //                 behavior: 'smooth'
    //             });
    //         });
    //     });
    // }

    /**
 * Инициализация мобильного слайдера с навигацией
 */
    initMobileSlider() {
        const sliderTrack = document.getElementById('slider-track');
        const dots = document.querySelectorAll('.slider-dot');
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');
        const counterCurrent = document.getElementById('slider-current');

        if (!sliderTrack) {
            return;
        }

        const images = this.product.images || [];
        if (images.length <= 1) return;

        let currentSlide = 0;

        // Функция обновления слайда
        const updateSlide = (index) => {
            if (index < 0 || index >= images.length) return;
            
            currentSlide = index;
            const slideWidth = sliderTrack.offsetWidth;
            
            sliderTrack.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth'
            });
            
            // Обновляем точки
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            // Обновляем счётчик
            if (counterCurrent) {
                counterCurrent.textContent = index + 1;
            }
        };

        // Обработчик скролла для автоматического обновления
        sliderTrack.addEventListener('scroll', () => {
            const scrollLeft = sliderTrack.scrollLeft;
            const slideWidth = sliderTrack.offsetWidth;
            const newIndex = Math.round(scrollLeft / slideWidth);

            if (newIndex !== currentSlide) {
                currentSlide = newIndex;
                
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentSlide);
                });
                
                if (counterCurrent) {
                    counterCurrent.textContent = currentSlide + 1;
                }
            }
        });

        // Клик по точкам
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateSlide(index);
            });
        });

        // Стрелки навигации
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateSlide(currentSlide - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateSlide(currentSlide + 1);
            });
        }

        // Свайпы (touch events)
        let touchStartX = 0;
        let touchEndX = 0;

        sliderTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        sliderTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Свайп влево - следующий слайд
                    updateSlide(currentSlide + 1);
                } else {
                    // Свайп вправо - предыдущий слайд
                    updateSlide(currentSlide - 1);
                }
            }
        };
    }

    /**
     * Форматирование цены
     */
    formatPrice(price) {
        if (!price) return 'Цена не указана';
        const formatted = Number(price).toLocaleString('ru-RU');
        return `${formatted} ₴`;
    }

    /**
     * Показать лоадер
     */
    showLoader() {
        const container = document.querySelector('#product-detail-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 100px 20px;">
                    <div class="spinner" style="margin: 0 auto 20px;"></div>
                    <p>Загрузка товара...</p>
                </div>
            `;
        }
    }

    /**
     * Скрыть лоадер
     */
    hideLoader() {
        // Лоадер заменяется контентом в render()
    }

    /**
     * Показать ошибку
     */
    showError(message) {
        const container = document.querySelector('#product-detail-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 100px 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                    <p style="font-size: 18px; color: #999;">${message}</p>
                    <button onclick="window.history.back()" 
                            style="margin-top: 20px; padding: 12px 24px; cursor: pointer; 
                                   background: #000; color: white; border: none; border-radius: 8px;">
                        Вернуться назад
                    </button>
                </div>
            `;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем что мы на странице детального просмотра
    const detailContainer = document.querySelector('#product-detail-container');
    
    if (detailContainer) {
        window.productDetailManager = new ProductDetailManager();
        console.log('Product detail manager initialized');
    }
});
