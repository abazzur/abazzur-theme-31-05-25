if (!customElements.get('testimonials-component')) {
  class Testimonials extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.selectors = {
        sliderWrapper: '.testimonials__items',
        pagination: '.swiper-pagination',
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      };
      this.classes = {
        grid: 'f-grid',
        swiper: 'swiper',
        swiperWrapper: 'swiper-wrapper',
      };

      this.sectionId = this.dataset.sectionId;
      this.section = this.closest(`.section-${this.sectionId}`);
      this.sliderWrapper = this.querySelector(this.selectors.sliderWrapper);

      this.enableSlider = this.dataset.enableSlider === 'true';
      this.items = parseInt(this.dataset.items);
      this.laptopItems = parseInt(this.dataset.laptopItems);
      this.tabletItems = parseInt(this.dataset.tabletItems);
      this.layout = this.dataset.layout;
      this.swipeMobile = this.dataset.swipeMobile === 'true';

      this.sliderInstance = false;

      if (!this.enableSlider) return;

      this.init();
      document.addEventListener('matchMobile', () => {
        this.init();
      });
      document.addEventListener('unmatchMobile', () => {
        this.init();
      });
    }

    init() {
      if (FoxTheme.config.mqlMobile && this.swipeMobile) {
        this.destroySlider()
      } else {
        this.initSlider();
      }
    }

    initSlider() {
      const columnGap = window.getComputedStyle(this.sliderWrapper).getPropertyValue('--f-column-gap');
      const columnGapMobile = window.getComputedStyle(this.sliderWrapper).getPropertyValue('--f-column-gap-mobile');
      const spaceBetween = parseFloat(columnGap.replace('rem', '')) * 10;
      const spaceBetweenMobile = parseFloat(columnGapMobile.replace('rem', '')) * 10;
      let additionModules = [];
      let slideToMethod = 'slideTo';

      this.defaultOptions = {
        slidesPerView: 1,
        spaceBetween: spaceBetween,
        navigation: {
          nextEl: this.section.querySelector(this.selectors.nextEl),
          prevEl: this.section.querySelector(this.selectors.prevEl),
        },
        pagination: false,
        breakpoints: {
          768: {
            slidesPerView: this.tabletItems > 3 ? 3 : this.tabletItems
          },
          1024: {
            slidesPerView: this.laptopItems > 3 ? 3 : this.laptopItems
          },
          1280: {
            slidesPerView: this.items
          },
        },
        loop: false,
        threshold: 2,
      };

      if ( this.layout === 'focused' ) {
        slideToMethod = 'slideToLoop';
        this.settings = {
          centeredSlides: true,
          spaceBetween: spaceBetweenMobile,
          pagination: {
            el: this.section.querySelector(this.selectors.pagination),
            clickable: true,
          },
          loop: true,
          breakpoints: {
            768: {
              slidesPerView: 2,
              spaceBetween: spaceBetween
            },
            1280: {
              slidesPerView: Math.max(2, this.getSlidesPerViewCentered(this.laptopItems)),
              spaceBetween: spaceBetween
            },
            1440: {
              slidesPerView: Math.max(2, this.getSlidesPerViewCentered(this.items)),
              spaceBetween: spaceBetween
            },
          }
        };
      } else {
        additionModules.push(FoxTheme.Swiper.Mousewheel);
        this.settings = {
          mousewheel: {
            enabled: true,
            forceToAxis: true,
          }
        }
      }

      if (typeof this.sliderInstance !== 'object') {
        this.classList.add(this.classes.swiper);
        this.sliderWrapper.classList.remove(this.classes.grid);
        this.sliderWrapper.classList.add(this.classes.swiperWrapper);
        this.sliderInstance = new window.FoxTheme.Carousel(this, {...this.defaultOptions,...this.settings}, additionModules);
        this.sliderInstance.init();

        const focusableElements = FoxTheme.a11y.getFocusableElements(this);

        focusableElements.forEach((element) => {
          element.addEventListener('focusin', () => {
            const slide = element.closest('.swiper-slide');
            this.sliderInstance.slider[slideToMethod](this.sliderInstance.slider.slides.indexOf(slide));
          });
        });
      }
      if (Shopify.designMode && typeof this.sliderInstance === 'object') {
        document.addEventListener('shopify:block:select', (e) => {
          if (e.detail.sectionId != this.sectionId) return;
          let { target } = e;
          const index = Number(target.dataset.index);

          this.sliderInstance.slider[slideToMethod](index);
        });
      }
    }

    destroySlider() {
      this.classList.remove(this.classes.swiper);
      this.sliderWrapper.classList.remove(this.classes.swiperWrapper);
      this.sliderWrapper.classList.add(this.classes.grid);
      if (typeof this.sliderInstance === 'object') {
        this.sliderInstance.slider.destroy();
        this.sliderInstance = false;
      }
    }
    getSlidesPerViewCentered(number) {
      if (number % 2 !== 0) return (number - 1);
      return number
    }
  }
  customElements.define('testimonials-component', Testimonials);
}
