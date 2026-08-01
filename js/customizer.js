/* ==========================================================================
   ForeverTogether - Live Customizer & Share Link Generator
   ========================================================================== */

class Customizer {
  constructor() {
    this.modal = document.getElementById('customizer-modal');
    this.openBtn = document.getElementById('btn-open-customizer');
    this.closeBtn = document.getElementById('modal-close-btn');
    this.copyBtn = document.getElementById('btn-copy-link');
    this.previewBtn = document.getElementById('btn-preview-link');
    this.shareInput = document.getElementById('share-url-input');

    this.inputs = {
      name: document.getElementById('input-name'),
      from: document.getElementById('input-from'),
      years: document.getElementById('input-years'),
      msg: document.getElementById('input-msg'),
      secret: document.getElementById('input-secret')
    };

    this.bindEvents();
  }

  bindEvents() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.openModal());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // Input changes live update generated URL
    Object.values(this.inputs).forEach(input => {
      if (input) {
        input.addEventListener('input', () => this.updateGeneratedUrl());
      }
    });

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => this.copyLinkToClipboard());
    }

    if (this.previewBtn) {
      this.previewBtn.addEventListener('click', () => this.applyPreview());
    }
  }

  openModal() {
    if (window.soundEngine) window.soundEngine.playClickSound();

    // Populate values from active page configuration
    const config = window.appConfig || {};
    if (this.inputs.name) this.inputs.name.value = config.name || 'Bestie';
    if (this.inputs.from) this.inputs.from.value = config.from || 'Your Friend';
    if (this.inputs.years) this.inputs.years.value = config.years || '3';
    if (this.inputs.msg) this.inputs.msg.value = config.msg || '';
    if (this.inputs.secret) this.inputs.secret.value = config.secret || '';

    this.updateGeneratedUrl();
    this.modal.classList.add('active');
  }

  closeModal() {
    if (window.soundEngine) window.soundEngine.playClickSound();
    this.modal.classList.remove('active');
  }

  generateUrl() {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    const name = this.inputs.name ? this.inputs.name.value.trim() : '';
    const from = this.inputs.from ? this.inputs.from.value.trim() : '';
    const years = this.inputs.years ? this.inputs.years.value.trim() : '';
    const msg = this.inputs.msg ? this.inputs.msg.value.trim() : '';
    const secret = this.inputs.secret ? this.inputs.secret.value.trim() : '';

    if (name) params.set('name', name);
    if (from) params.set('from', from);
    if (years) params.set('years', years);
    if (msg) params.set('msg', msg);
    if (secret) params.set('secret', secret);

    return `${baseUrl}?${params.toString()}`;
  }

  updateGeneratedUrl() {
    if (this.shareInput) {
      this.shareInput.value = this.generateUrl();
    }
  }

  copyLinkToClipboard() {
    const url = this.generateUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('✨ Custom link copied to clipboard!');
      if (window.soundEngine) window.soundEngine.playConfettiSound();
    }).catch(() => {
      this.showToast('📋 Copy failed, please manually select the link');
    });
  }

  applyPreview() {
    const params = new URLSearchParams(this.generateUrl().split('?')[1]);
    if (window.appInstance) {
      window.appInstance.applyConfigurationFromParams(params);
      this.showToast('🎉 Preview updated on live page!');
      this.closeModal();
    }
  }

  showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

window.Customizer = Customizer;
