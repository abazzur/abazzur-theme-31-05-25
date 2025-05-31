if (!customElements.get('lookbook-card')) {
  customElements.define(
    'lookbook-card',
    class LookbookCard extends ModalComponent {
      constructor() {
        super();

        this.card = this.closest('.lbcard');

        const mql = window.matchMedia(FoxTheme.config.mediaQueryMobile);
        mql.onchange = () => {
          this.removeAttribute('open');
          document.body.classList.remove(this.classes.show);
        };
      }

      get isLockingNeeded() {
        return FoxTheme.config.mqlMobile;
      }
    
      get requiresBodyAppended() {
        return FoxTheme.config.mqlMobile;
      }

      prepareToShow() {
        super.prepareToShow();

        this.card.classList.add('is-open');
      }

      handleAfterHide() {
        super.handleAfterHide();

        this.card.classList.remove('is-open');
      }
    }
  );
}
