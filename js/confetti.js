window.triggerConfetti = function(options = {}) {
    const particleCount = options.particleCount || 100;
    const duration = options.duration || 3000;
    const colors = options.colors || ['#ffd700', '#ff0000', '#f5f5f5', '#ffeb73'];
    
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    
    class ConfettiParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.r = Math.random() * 7 + 5; // size 5-12
            this.dx = Math.random() * 6 - 3;
            this.dy = Math.random() * 4 + 2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.tilt = Math.floor(Math.random() * 10) - 10;
            this.tiltAngleInc = (Math.random() * 0.07) + 0.05;
            this.tiltAngle = 0;
            this.opacity = 1;
        }
        
        draw(ctx) {
            ctx.beginPath();
            ctx.lineWidth = this.r;
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.moveTo(this.x + this.tilt + this.r, this.y);
            ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        update(progress) {
            this.tiltAngle += this.tiltAngleInc;
            this.y += (Math.cos(this.tiltAngle) + this.dy + this.r / 2) / 2;
            this.x += Math.sin(this.tiltAngle) * 2;
            
            // Fade out at end
            if (progress > 0.8) {
                this.opacity = 1 - ((progress - 0.8) * 5);
            }
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new ConfettiParticle());
    }
    
    let animationId;
    const startTime = Date.now();
    
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        particles.forEach(p => {
            p.update(progress);
            p.draw(ctx);
        });
        
        if (progress < 1) {
            animationId = requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationId);
        }
    }
    
    render();
    
    // Resize handler
    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
};

function initParticles(containerSelector) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const containers = document.querySelectorAll(containerSelector);
    
    containers.forEach(container => {
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'background-particle';
            
            // Random properties
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 10;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.top = `${top}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            // Basic styles for particle
            particle.style.position = 'absolute';
            particle.style.background = Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '0';
            
            container.appendChild(particle);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initParticles('.particles-container');
});
