const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("section[id]");
const particleCanvas = document.querySelector("#hero-particles");
const particleContext = particleCanvas.getContext("2d");
let canvasWidth = 0;
let canvasHeight = 0;
let particles = [];

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

links.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
  revealObserver.observe(item);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      links.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isActive);
      });
    });
  },
  {
    rootMargin: "-45% 0px -45% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

function resizeParticleCanvas() {
  const hero = document.querySelector(".hero");
  const rect = hero.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvasWidth = rect.width;
  canvasHeight = rect.height;
  particleCanvas.width = canvasWidth * dpr;
  particleCanvas.height = canvasHeight * dpr;
  particleCanvas.style.width = `${canvasWidth}px`;
  particleCanvas.style.height = `${canvasHeight}px`;
  particleContext.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particleCount = Math.min(78, Math.max(34, Math.floor(canvasWidth / 14)));
  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.38,
    vy: (Math.random() - 0.5) * 0.38,
    size: Math.random() * 1.7 + 1,
  }));
}

function drawParticleNetwork() {
  particleContext.clearRect(0, 0, canvasWidth, canvasHeight);
  particleContext.fillStyle = "rgba(245, 247, 251, 0.72)";
  particleContext.strokeStyle = "rgba(71, 215, 172, 0.28)";
  particleContext.lineWidth = 1;

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > canvasWidth) particle.vx *= -1;
    if (particle.y < 0 || particle.y > canvasHeight) particle.vy *= -1;

    particleContext.beginPath();
    particleContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    particleContext.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);

      if (distance < 125) {
        particleContext.globalAlpha = 1 - distance / 125;
        particleContext.beginPath();
        particleContext.moveTo(particle.x, particle.y);
        particleContext.lineTo(other.x, other.y);
        particleContext.stroke();
        particleContext.globalAlpha = 1;
      }
    }
  });

  requestAnimationFrame(drawParticleNetwork);
}

if (particleCanvas && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  window.addEventListener("resize", resizeParticleCanvas);
  resizeParticleCanvas();
  drawParticleNetwork();
}
