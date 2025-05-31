if (!customElements.get('featured-collection')) {
  customElements.define(
    'featured-collection',
    class FeaturedCollection extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.selectors = {
          sliderWrapper: '.featured-collection__items',
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
          pagination: '.swiper-pagination',
        };
        this.classes = {
          grid: 'f-grid',
          swiper: 'swiper',
          swiperWrapper: 'swiper-wrapper',
        };

        this.blockId = this.dataset.blockId;
        this.block = this.closest(`[data-id="${this.blockId}"`);
        this.sliderWrapper = this.querySelector(this.selectors.sliderWrapper);

        this.enableSlider = this.dataset.enableSlider === 'true';
        this.items = parseInt(this.dataset.items);
        this.tabletItems = parseInt(this.dataset.tabletItems);
        this.paginationType = this.dataset.paginationType || 'bullets';

        this.sliderInstance = false;

        if (!this.enableSlider) return;

        const mql = window.matchMedia(FoxTheme.config.mediaQueryMobile);
        mql.onchange = this.init.bind(this);
        this.init();
      }

      init() {
        if (FoxTheme.config.mqlMobile) {
          this.destroySlider();
        } else {
          this.initSlider();
        }
      }

      initSlider() {
        if (typeof this.sliderInstance === 'object') return;
        const columnGap = window.getComputedStyle(this.sliderWrapper).getPropertyValue('--f-column-gap');
        const spaceBetween = parseFloat(columnGap.replace('rem', '')) * 10;

        this.sliderOptions = {
          slidesPerView: 2,
          spaceBetween: spaceBetween,
          navigation: {
            nextEl: this.block.querySelector(this.selectors.nextEl),
            prevEl: this.block.querySelector(this.selectors.prevEl),
          },
          pagination: {
            el: this.block.querySelector(this.selectors.pagination),
            type: this.paginationType,
          },
          breakpoints: {
            768: {
              slidesPerView: this.tabletItems,
            },
            1280: {
              slidesPerView: this.items,
            },
          },
          loop: false,
          threshold: 2,
          watchSlidesProgress: true,
          mousewheel: {
            enabled: true,
            forceToAxis: true,
          },
        };

        this.classList.add(this.classes.swiper);
        this.sliderWrapper.classList.remove(this.classes.grid);
        this.sliderWrapper.classList.add(this.classes.swiperWrapper);

        this.sliderInstance = new window.FoxTheme.Carousel(this, this.sliderOptions, [FoxTheme.Swiper.Mousewheel]);
        this.sliderInstance.init();

        // const focusableElements = FoxTheme.a11y.getFocusableElements(this);

        // focusableElements.forEach((element) => {
        //   element.addEventListener('focusin', () => {
        //     const slide = element.closest('.swiper-slide');
        //     this.sliderInstance && this.sliderInstance.slider.slideTo(this.sliderInstance.slider.slides.indexOf(slide));
        //   });
        // });

        this.fixQuickviewDuplicate();
      }

      destroySlider() {
        this.classList.remove(this.classes.swiper);
        this.sliderWrapper.classList.remove(this.classes.swiperWrapper);
        this.sliderWrapper.classList.add(this.classes.grid);
        if (typeof this.sliderInstance !== 'object') return;
        this.sliderInstance.slider.destroy();
        this.sliderInstance = false;
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

if (!customElements.get('product-tabs')) {
  customElements.define(
    'product-tabs',
    class ProductTabs extends HTMLDivElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.sectionId = this.dataset.sectionId;
        this.sectionContent = this.querySelector('.section__content');
        this.tabBtns = this.querySelectorAll('.tabs-btn');
        this.currentIndex = 0;
        this.init();
      }

      init() {
        this.tabBtns.forEach((btn) => {
          btn.addEventListener('click', this.onClick.bind(this));
        });

        if (Shopify.designMode) {
          this.addEventListener('shopify:block:select', (e) => {
            if (e.detail.sectionId != this.sectionId) return;
            let { target } = e;
            const index = Number(target.dataset.index);

            this.setActiveTab(index);
          });
        }
      }

      onClick(e) {
        e.preventDefault();
        let { target } = e;
        const index = Number(target.dataset.index);
        this.setActiveTab(index);
      }

      setActiveTab(index) {
        if (this.currentIndex === index) return;

        let newTab, newBtn, currentItem;

        currentItem = this.tabBtns[this.currentIndex];
        newBtn = this.tabBtns[index];

        currentItem.classList.remove('active');
        newBtn.classList.add('active');

        const collectionContent = this.sectionContent.querySelectorAll('.featured-collection__content');
        collectionContent.forEach((collection) => {
          collection.hidden = true;
        });

        newTab = this.sectionContent.querySelector(`.featured-collection__content[data-index="${index}"]`);

        if (!newTab) {
          const template = this.sectionContent.querySelector(`template[data-index="${index}"]`);
          newTab = template.content.cloneNode(true).firstElementChild;
          this.sectionContent.appendChild(newTab);
        }
        const translateY = FoxTheme.config.motionReduced ? 0 : 2.5;

        FoxTheme.Motion.animate(newTab, { transform: `translateY(${translateY}rem)`, opacity: 0.01 }, { duration: 0 });

        newTab.hidden = false;

        setTimeout(() => {
          FoxTheme.Motion.animate(
            newTab,
            { transform: 'translateY(0)', opacity: 1 },
            { duration: 0.5, delay: this.animationDelay, easing: [0, 0, 0.3, 1] }
          );
        }, 50);

        this.currentIndex = index;
      }
    },
    { extends: 'div' }
  );
}
