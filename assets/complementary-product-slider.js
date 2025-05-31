if (!customElements.get('complementary-product-slider')) {
  customElements.define(
    'complementary-product-slider',
    class ComplementaryProductSlider extends HTMLElement {
      constructor() {
        super();

        this.columns = this.dataset.columns;
        this.enableSlider = this.dataset.enableSlider === 'true';

        this.selectors = {
          productsWrap: '.products-wrap',
          products: '.products',
        };

        this.classes = {
          grid: 'f-grid',
          swiper: 'swiper',
          swiperWrapper: 'swiper-wrapper',
        };

        this.productsWrap = this.querySelector(this.selectors.productsWrap);
        this.products = this.querySelector(this.selectors.products);
        this.sliderInstance = false;

        const mql = window.matchMedia(FoxTheme.config.mediaQueryMobile);
        mql.onchange = this.init.bind(this);
        this.init();
      }

      init() {
        if (FoxTheme.config.mqlMobile || !this.enableSlider) {
          this.destroySlider();
        } else {
          this.initSlider();
        }
      }

      initSlider() {
        const columnGap = window.getComputedStyle(this.products).getPropertyValue('--f-column-gap');
        const spaceBetween = columnGap !== '' ? parseFloat(columnGap.replace('rem', '')) * 10 : 10;

        this.sliderOptions = {
          slidesPerView: this.columns,
          spaceBetween: spaceBetween,
          loop: true,
          grabCursor: false,
          allowTouchMove: true,
          autoHeight: true,
          navigation: {
            prevEl: this.querySelector('.swiper-button-prev'),
            nextEl: this.querySelector('.swiper-button-next'),
          },
        };

        this.productsWrap.classList.add(this.classes.swiper);
        this.products.classList.remove(this.classes.grid);
        this.products.classList.add(this.classes.swiperWrapper);
        this.sliderInstance = new window.FoxTheme.Carousel(this.productsWrap, this.sliderOptions);
        this.sliderInstance.init();

        this.fixQuickviewDuplicate();
        this.calcNavButtonsPosition();
      }

      fixQuickviewDuplicate() {
        let modalIds = [];
        Array.from(this.querySelectorAll('quick-view-modal')).forEach((modal) => {
          const modalID = modal.getAttribute('id');
          if (modalIds.includes(modalID)) {
            modal.remove();
          } else {
            modalIds.push(modalID);
          }
        });
      }

      calcNavButtonsPosition() {
        if (!this.dataset.calcButtonPosition === 'true') return;

        const firstMedia = this.querySelector('.product-card__image-wrapper');
        if (firstMedia && firstMedia.clientHeight > 0) {
          this.style.setProperty('--swiper-navigation-top-offset', parseInt(firstMedia.clientHeight) / 2 + 'px');
        }
      }

      destroySlider() {
        this.productsWrap.classList.remove(this.classes.swiper);
        this.products.classList.remove(this.classes.swiperWrapper);
        this.products.classList.add(this.classes.grid);
        if (typeof this.sliderInstance !== 'object') return;
        this.sliderInstance.slider.destroy();
        this.sliderInstance = false;
      }
    }
  );
}
