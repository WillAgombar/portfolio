const container = document.querySelector(".hero-middle");
const cards = document.querySelectorAll(".hero-image");
const baseTransforms = Array.from(cards).map(card => card.style.transform || "");

container.addEventListener("mousemove", (e) => {
  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // find the closest card to the mouse
  let closestIndex = 0;
  let minDistance = Infinity;

  cards.forEach((card, i) => {
    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2 - rect.left;
    const cardCenterY = cardRect.top + cardRect.height / 2 - rect.top;

    const dx = mouseX - cardCenterX;
    const dy = mouseY - cardCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  });

  cards.forEach((card, i) => {
    const rectCard = card.getBoundingClientRect();
    const centerX = rectCard.width / 2;
    const centerY = rectCard.height / 2;

    const dx = mouseX - (rectCard.left - rect.left + centerX);
    const dy = mouseY - (rectCard.top - rect.top + centerY);

    // strength depends on how far from closest index this card is
    const distanceFromActive = Math.abs(i - closestIndex);

    let intensity;
    if (distanceFromActive === 0) intensity = 2;      // active card = strong
    else if (distanceFromActive === 1) intensity = 0.4; // neighbors = medium
    else intensity = 0;                                // farthest = still

    const moveX = (dx / centerX) * 200 * intensity;
    const moveY = (dy / centerY) * 200 * intensity;
    const rotate = (dx / centerX) * 15 * intensity;

    card.style.transform = `${baseTransforms[i]} translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;
  });
});

// reset when leaving container
container.addEventListener("mouseleave", () => {
  cards.forEach((c, i) => {
    c.style.transform = baseTransforms[i];
  });
});



// === Embla init & transforms ===
const viewport = document.querySelector('.embla__viewport');
const embla = EmblaCarousel(viewport, {
  loop: true,
  align: 'center',
  slidesToScroll: 1,
  containScroll: 'trimSnaps',
});

const button = document.getElementById('slide-button');
const slideButtonLabels = [
  "ismybillfair",
  "Borciani London",
  "Quiz App",
  "Styled By",
  "ismybillfair App",
  "Multicam",
];


// Wait a tick to allow Embla to finish setup
setTimeout(() => {
 function updateTransforms() {
  const engine = embla.internalEngine();
  const scrollProgress = embla.scrollProgress();
  const slides = embla.slideNodes();
  const snaps = embla.scrollSnapList();
  let centerIndex = 0;  // track center slide

  slides.forEach((slide, i) => {
    const inner = slide.querySelector('.embla__slide__inner') || slide;
    let target = snaps[i];
    let diff = target - scrollProgress;

    if (engine.options.loop) {
      if (diff > 0.5) diff -= 1;
      if (diff < -0.5) diff += 1;
    }

    const abs = Math.abs(diff);
    const scale = 1 - Math.min(abs * 0.15, 0.25);

    let translateY = abs * 80;
    let rotateX = diff * -40;
    let zIndex = Math.round(100 - abs * 10);

    inner.style.transition = 'none';
    inner.style.transform = `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`;
    slide.style.zIndex = zIndex;

    // Center slide
    if (abs < 0.15) {
      inner.setAttribute('data-center', 'true');
      centerIndex = i;  // store center slide index
    } else {
      inner.removeAttribute('data-center');
    }

    requestAnimationFrame(() => {
      inner.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), box-shadow 320ms';
    });
  });

  // Update button text based on center slide
  button.textContent = slideButtonLabels[centerIndex];
}


embla.on('init', updateTransforms);
embla.on('scroll', updateTransforms);
embla.on('resize', updateTransforms);
embla.on('reInit', updateTransforms);
updateTransforms();

}, 50); // 50ms delay ensures layout is stable
