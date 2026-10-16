/* ==========================================================================
   three-bg.js — fondo 3D del hero (Three.js)
   Partículas + icosaedro wireframe que reaccionan al ratón y al scroll.
   ========================================================================== */
import * as THREE from "three";

const canvas = document.getElementById("bg3d");
const hero = canvas ? canvas.closest(".hero") : null;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && hero) {
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    renderer = null;
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    camera.position.z = 6;

    /* --- Partículas en esfera hueca --- */
    const COUNT = 1100;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 6 + Math.random() * 12;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(
      pgeo,
      new THREE.PointsMaterial({ color: 0x34d399, size: 0.05, transparent: true, opacity: 0.85 })
    );
    scene.add(points);

    /* --- Icosaedro wireframe (objeto principal) --- */
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.5, 1),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.32 })
    );
    mesh.position.set(2.7, 0.4, -1);
    scene.add(mesh);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25, 2),
      new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.2 })
    );
    mesh.add(inner);

    /* --- Interacción --- */
    let mx = 0, my = 0, tx = 0, ty = 0, sy = 0;
    window.addEventListener("pointermove", (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    window.addEventListener("scroll", () => { sy = window.scrollY; }, { passive: true });

    function resize() {
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    let visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    }

    const clock = new THREE.Clock();
    function frame() {
      if (!visible) return;
      const t = clock.getElapsedTime();
      tx += (mx * 0.5 - tx) * 0.05;
      ty += (my * 0.5 - ty) * 0.05;

      mesh.rotation.y = t * 0.18 + tx;
      mesh.rotation.x = t * 0.12 - ty;
      mesh.position.y = 0.4 - sy * 0.0016;

      points.rotation.y = -t * 0.04 - tx * 0.3;
      points.rotation.x = -ty * 0.2;

      camera.position.x = tx * 0.7;
      camera.position.y = -ty * 0.45;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    if (reduce) {
      renderer.render(scene, camera);
    } else {
      renderer.setAnimationLoop(frame);
    }
  }
}
