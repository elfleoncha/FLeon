// Año dinámico en el footer
document.getElementById("year").textContent = new Date().getFullYear();

// Borde del nav al hacer scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Menú móvil
const toggle = document.getElementById("navToggle");
const links = document.querySelector(".nav__links");
if (toggle && links) {
  toggle.addEventListener("click", () => links.classList.toggle("is-open"));
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") links.classList.remove("is-open");
  });
}

// Animación de aparición al hacer scroll
const revealTargets = document.querySelectorAll(".card, .section__title, .about p");
revealTargets.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach((el) => io.observe(el));
