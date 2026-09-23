export function startBackground() {
  const canvas = document.getElementById('game-background');
  const context = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = null;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(110, Math.max(45, Math.floor((width * height) / 15000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.25,
      speed: Math.random() * 0.12 + 0.03,
      alpha: Math.random() * 0.45 + 0.12
    }));
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    for (const particle of particles) {
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(180, 205, 255, ${particle.alpha})`;
      context.fill();
    }
  }

  function animate() {
    for (const particle of particles) {
      particle.y += particle.speed;
      if (particle.y > height + 2) {
        particle.y = -2;
        particle.x = Math.random() * width;
      }
    }
    draw();
    animationFrame = window.requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  if (!reduceMotion) animationFrame = window.requestAnimationFrame(animate);

  return () => {
    window.removeEventListener('resize', resize);
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
  };
}
