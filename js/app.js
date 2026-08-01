/* ==========================================================================
   ForeverTogether - Core Application Logic
   ========================================================================== */

class App {
  constructor() {
    this.config = {
      name: 'Bestie',
      from: 'Your Forever Friend',
      years: '4',
      msg: `Dear Bestie,\n\nThrough every high and low, every random late-night talk, and every hilarious moment we couldn't stop laughing — having you in my life has been one of my greatest blessings.\n\nThank you for always listening, for always keeping it real, and for being the truest friend anyone could ever ask for. Here's to infinitely more memories together! Happy Friendship Day! ✨❤️`,
      secret: `☕ Lifetime Voucher:\nValid for unlimited 3 AM vent sessions, emergency iced coffee, and instant mood boosts on demand!`
    };

    this.isUnwrapped = false;
    this.typewriterIndex = 0;
    this.typewriterTimer = null;

    this.initUrlParams();
    window.appConfig = this.config;

    this.initTheme();
    this.initParticles();
    this.bindEvents();
    this.initScrollObserver();
  }

  initUrlParams() {
    const params = new URLSearchParams(window.location.search);
    this.applyConfigurationFromParams(params);
  }

  applyConfigurationFromParams(params) {
    if (params.has('name')) this.config.name = params.get('name');
    if (params.has('from')) this.config.from = params.get('from');
    if (params.has('years')) this.config.years = params.get('years');
    if (params.has('msg')) this.config.msg = params.get('msg');
    if (params.has('secret')) this.config.secret = params.get('secret');

    this.updateDOMContent();
  }

  updateDOMContent() {
    // Landing Text
    const landingTitle = document.getElementById('landing-recipient');
    if (landingTitle) landingTitle.textContent = `For ${this.config.name} ✨`;

    // Hero Title
    const heroName = document.getElementById('hero-friend-name');
    if (heroName) heroName.textContent = this.config.name;

    // Recipient Header
    const avatar = document.getElementById('recipient-avatar-char');
    if (avatar) avatar.textContent = this.config.name.charAt(0).toUpperCase();

    const nameDisplay = document.getElementById('recipient-display-name');
    if (nameDisplay) nameDisplay.textContent = this.config.name;

    const fromDisplay = document.getElementById('message-sender-name');
    if (fromDisplay) fromDisplay.textContent = `— With love, ${this.config.from}`;

    // Secret Scratch Text
    const scratchText = document.getElementById('scratch-secret-text');
    if (scratchText) scratchText.textContent = this.config.secret;

    // Friendship Stats Counter
    const yearsNum = parseInt(this.config.years) || 4;
    const daysCount = Math.floor(yearsNum * 365.25);
    const statDays = document.getElementById('stat-days-num');
    if (statDays) statDays.setAttribute('data-target', daysCount);
  }

  /* --------------------------------------------------------------------------
     Theme System (Dark / Light Mode)
     -------------------------------------------------------------------------- */
  initTheme() {
    const savedTheme = localStorage.getItem('ft_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('ft_theme', next);
        this.updateThemeIcon(next);
        if (window.soundEngine) window.soundEngine.playClickSound();
      });
    }

    // Music Toggle
    const musicBtn = document.getElementById('music-toggle-btn');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        if (window.soundEngine) {
          const isPlaying = window.soundEngine.toggleMusic();
          musicBtn.style.color = isPlaying ? 'var(--accent-amber)' : 'var(--text-main)';
        }
      });
    }
  }

  updateThemeIcon(theme) {
    const iconContainer = document.getElementById('theme-icon');
    if (!iconContainer) return;
    if (theme === 'dark') {
      // Sun Icon
      iconContainer.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    } else {
      // Moon Icon
      iconContainer.innerHTML = `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }

  /* --------------------------------------------------------------------------
     Gift Opening & Unwrapping
     -------------------------------------------------------------------------- */
  bindEvents() {
    const openBtn = document.getElementById('btn-open-gift');
    const giftBox = document.getElementById('gift-box-trigger');
    const overlay = document.getElementById('landing-overlay');

    const triggerUnwrap = () => {
      if (this.isUnwrapped) return;
      this.isUnwrapped = true;

      if (window.soundEngine) {
        window.soundEngine.playUnwrapSound();
        window.soundEngine.startMusic();
      }

      if (giftBox) giftBox.classList.add('opening');

      // Trigger Confetti Burst
      this.triggerConfetti();

      setTimeout(() => {
        if (overlay) overlay.classList.add('opened');
        this.startTypewriter();
      }, 700);
    };

    if (openBtn) openBtn.addEventListener('click', triggerUnwrap);
    if (giftBox) giftBox.addEventListener('click', triggerUnwrap);

    // Celebrate Button
    const celebrateBtn = document.getElementById('btn-celebrate-burst');
    if (celebrateBtn) {
      celebrateBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playConfettiSound();
        this.triggerMultiConfetti();
      });
    }

    // Initialize Scratch Card
    setTimeout(() => {
      if (window.ScratchCard) {
        new window.ScratchCard('scratch-canvas', {
          thresholdPercentage: 40,
          onComplete: () => {
            if (window.soundEngine) window.soundEngine.playConfettiSound();
            this.triggerConfetti();
          }
        });
      }
    }, 500);

    // Initialize Customizer
    if (window.Customizer) {
      window.customizerInstance = new window.Customizer();
    }
  }

  /* --------------------------------------------------------------------------
     Typewriter Effect for Message
     -------------------------------------------------------------------------- */
  startTypewriter() {
    const container = document.getElementById('typewriter-text');
    if (!container) return;

    container.innerHTML = '';
    const fullText = this.config.msg;
    let i = 0;

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';

    const type = () => {
      if (i < fullText.length) {
        container.textContent = fullText.slice(0, i + 1);
        container.appendChild(cursor);
        i++;
        const char = fullText.charAt(i - 1);
        const delay = (char === '.' || char === '!' || char === '\n') ? 350 : 25;
        this.typewriterTimer = setTimeout(type, delay);
      } else {
        if (cursor.parentNode) cursor.remove();
      }
    };

    type();
  }

  /* --------------------------------------------------------------------------
     Confetti Explosions
     -------------------------------------------------------------------------- */
  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  triggerMultiConfetti() {
    if (typeof confetti === 'function') {
      const end = Date.now() + 2 * 1000;
      const colors = ['#f43f5e', '#fbbf24', '#ec4899', '#8b5cf6', '#3b82f6'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }

  /* --------------------------------------------------------------------------
     Scroll Intersection Observer & Counters
     -------------------------------------------------------------------------- */
  initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');

          // Check if target is stats container
          if (entry.target.classList.contains('stat-card')) {
            this.animateStatCard(entry.target);
          }

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.memory-card, .stat-card, .scratch-section').forEach(el => {
      observer.observe(el);
    });
  }

  animateStatCard(card) {
    const numEl = card.querySelector('.stat-number');
    if (!numEl || numEl.getAttribute('data-animated')) return;

    const target = parseInt(numEl.getAttribute('data-target')) || 0;
    if (target === 0) return;

    numEl.setAttribute('data-animated', 'true');
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);
      numEl.textContent = current.toLocaleString() + '+';

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        numEl.textContent = target.toLocaleString() + '+';
      }
    };

    requestAnimationFrame(step);
  }

  /* --------------------------------------------------------------------------
     Ambient Particles Canvas Background Engine
     -------------------------------------------------------------------------- */
  initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 4 + 1.5,
        speedY: Math.random() * 0.6 + 0.2,
        speedX: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.5 + 0.2,
        color: ['#fbbf24', '#f43f5e', '#ec4899', '#38bdf8'][Math.floor(Math.random() * 4)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new App();
});
