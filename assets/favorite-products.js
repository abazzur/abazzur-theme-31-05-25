if (!customElements.get('favorite-products')) {
  customElements.define(
    'favorite-products',
    class FavoriteProducts extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.enableSlider = this.dataset.enableSlider === 'true';

        this.sectionId = this.dataset.sectionId;
        this.testimonialsWrapper = this.querySelector('.favorite-products__testimonials');
        this.productWrapper = this.querySelector('.favorite-products__products');
        this.mediaWrapper = this.querySelector('.favorite-products__media');

        this.TestimonialSlider = false;
        this.ProductSlider = false;
        this.MediaSlider = false;

        if (!this.enableSlider) return;

        this.initSlider();
      }

      initSlider() {
        this.initProductSlider();
        this.initMediaSlider();
        this.initTestimonialSlider();

        this.TestimonialSlider.slider.controller.control = [this.ProductSlider.slider, this.MediaSlider.slider];
        this.ProductSlider.slider.controller.control = this.TestimonialSlider.slider;

        this.TestimonialSlider.slider.on('slideChange', (swiper) => {
          const { slides, activeIndex } = swiper;
          const currentSlide = slides[activeIndex];

          this.refreshAnimation(this.ProductSlider.slider.slides[activeIndex]);
          this.refreshAnimation(this.MediaSlider.slider.slides[activeIndex]);
          this.updateControlsScheme(currentSlide);
        });

        if (Shopify.designMode) {
          document.addEventListener('shopify:block:select', (e) => {
            if (e.detail.sectionId != this.sectionId) return;
            let { target } = e;
            const index = Number(target.dataset.index);

            this.TestimonialSlider.slider.slideToLoop(index);
          });
        }

        this.fixQuickviewDuplicate();
      }

      initProductSlider() {
        const sliderOptions = {
          slidesPerView: 1,
          loop: false,
          threshold: 2,
        };

        this.ProductSlider = new window.FoxTheme.Carousel(this.productWrapper, sliderOptions, [
          FoxTheme.Swiper.Controller,
        ]);
        this.ProductSlider.init();
      }

      initMediaSlider() {
        const sliderOptions = {
          slidesPerView: 1,
          loop: false,
          threshold: 2,
          allowTouchMove: false,
        };

        this.MediaSlider = new window.FoxTheme.Carousel(this.mediaWrapper.querySelector('.swiper'), sliderOptions);
        this.MediaSlider.init();
      }

      initTestimonialSlider() {
        const sliderOptions = {
          slidesPerView: 1,
          navigation: {
            nextEl: this.querySelector('.swiper-button-next'),
            prevEl: this.querySelector('.swiper-button-prev'),
          },
          pagination: {
            el: this.querySelector('.swiper-pagination'),
            clickable: true,
          },
          loop: false,
          threshold: 2,
          on: {
            init: this.handleAfterInit.bind(this),
          },
        };

        this.TestimonialSlider = new window.FoxTheme.Carousel(
          this.testimonialsWrapper.querySelector('.swiper'),
          sliderOptions,
          [FoxTheme.Swiper.Controller]
        );
        this.TestimonialSlider.init();
      }

      updateControlsScheme(activeSlide) {
        if (this.testimonialsWrapper) {
          const classesToRemove = Array.from(this.testimonialsWrapper.classList).filter((className) =>
            className.startsWith('color-')
          );
          classesToRemove.forEach((className) => this.testimonialsWrapper.classList.remove(className));
          const colorScheme = activeSlide.dataset.colorScheme;
          this.testimonialsWrapper.classList.add(colorScheme);
        }
      }

      handleAfterInit() {
        // Fix active bullet not transition on the first time.
        const activeBullet = this.querySelector('.swiper-pagination-bullet-active');

        if (activeBullet) {
          activeBullet.classList.remove('swiper-pagination-bullet-active');
          activeBullet.offsetHeight; // Trigger reflow.
          activeBullet.classList.add('swiper-pagination-bullet-active');
        }
      }

      refreshAnimation(activeSlide) {
        if (!activeSlide) return;
        activeSlide.querySelectorAll('motion-element').forEach((motionEl) => {
          setTimeout(() => {
            motionEl && motionEl.refreshAnimation();
          });
        });
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
    }
  );
}
