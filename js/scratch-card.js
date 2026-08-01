/* ==========================================================================
   ForeverTogether - Interactive Scratch Card Component
   ========================================================================== */

class ScratchCard {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.isRevealed = false;
    this.options = Object.assign({
      brushSize: 26,
      thresholdPercentage: 45,
      onComplete: null
    }, options);

    this.scratchedPixels = 0;
    this.lastSoundTime = 0;

    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 440;
    this.canvas.height = rect.height || 220;

    // Draw Gold Glitter Gradient Base Layer
    const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    grad.addColorStop(0, '#d97706');
    grad.addColorStop(0.3, '#f59e0b');
    grad.addColorStop(0.6, '#fbbf24');
    grad.addColorStop(1, '#b45309');

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Subtle Pattern Noise / Glitter Sparkles
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 3 + 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Add Overlay Text Instructions
    this.ctx.font = 'bold 1.3rem "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 6;
    this.ctx.fillText('✨ Scratch Here to Reveal Secret! ✨', this.canvas.width / 2, this.canvas.height / 2 + 6);
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startScratch = (e) => {
      if (this.isRevealed) return;
      this.isDrawing = true;
      const pos = getPos(e);
      this.scratch(pos.x, pos.y);
    };

    const moveScratch = (e) => {
      if (!this.isDrawing || this.isRevealed) return;
      if (e.cancelable) e.preventDefault();
      const pos = getPos(e);
      this.scratch(pos.x, pos.y);

      // Sound FX throttle
      const now = Date.now();
      if (now - this.lastSoundTime > 120 && window.soundEngine) {
        window.soundEngine.playScratchSound();
        this.lastSoundTime = now;
      }
    };

    const stopScratch = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.checkScratchProgress();
    };

    this.canvas.addEventListener('mousedown', startScratch);
    this.canvas.addEventListener('mousemove', moveScratch);
    window.addEventListener('mouseup', stopScratch);

    this.canvas.addEventListener('touchstart', startScratch, { passive: false });
    this.canvas.addEventListener('touchmove', moveScratch, { passive: false });
    window.addEventListener('touchend', stopScratch);
  }

  scratch(x, y) {
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.options.brushSize, 0, Math.PI * 2);
    this.ctx.fill();
  }

  checkScratchProgress() {
    if (this.isRevealed) return;

    const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }

    const percentage = (transparentCount / (pixels.length / 16)) * 100;

    if (percentage >= this.options.thresholdPercentage) {
      this.revealFully();
    }
  }

  revealFully() {
    this.isRevealed = true;
    this.canvas.style.opacity = '0';
    setTimeout(() => {
      this.canvas.style.display = 'none';
    }, 400);

    if (typeof this.options.onComplete === 'function') {
      this.options.onComplete();
    }
  }
}

window.ScratchCard = ScratchCard;
