/* ==========================================================================
   scene.js — WebGL del hero (Three.js)
   Campo de partículas + nudo wireframe, reactivos al ratón y al scroll.
   ========================================================================== */
import * as THREE from "three";

const canvas = document.getElementById("scene");
const hero = document.querySelector(".hero");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && hero) {
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { renderer = null; }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 140);
    camera.position.z = 6.4;

    /* --- Partículas --- */
    const COUNT = 1600;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 7 + Math.random() * 15;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(pgeo, new THREE.PointsMaterial({
      color: 0xc6ff3d, size: 0.055, transparent: true, opacity: 0.85, sizeAttenuation: true
    }));
    scene.add(points);

    /* --- Nudo toroidal wireframe (objeto principal) --- */
    const mesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.05, 0.52, 160, 20, 2, 3),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, wireframe: true, transparent: true, opacity: 0.30 })
    );
    mesh.position.set(2.9, 0.7, -1.2);
    scene.add(mesh);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 2),
      new THREE.MeshBasicMaterial({ color: 0xc6ff3d, wireframe: true, transparent: true, opacity: 0.22 })
    );
    mesh.add(core);

    /* --- Interacción --- */
    let mx = 0, my = 0, tx = 0, ty = 0, sy = 0;
    window.addEventListener("pointermove", (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    window.addEventListener("scroll", () => { sy = window.scrollY; }, { passive: true });

    function resize() {
      const w = hero.clientWidth, h = hero.clientHeight;
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
      tx += (mx * 0.6 - tx) * 0.05;
      ty += (my * 0.6 - ty) * 0.05;

      mesh.rotation.x = t * 0.16 - ty;
      mesh.rotation.y = t * 0.22 + tx;
      mesh.position.y = 0.7 - sy * 0.0018;

      points.rotation.y = -t * 0.035 - tx * 0.35;
      points.rotation.x = -ty * 0.25;

      camera.position.x = tx * 0.8;
      camera.position.y = -ty * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    if (reduce) renderer.setAnimationLoop(frame);
    else renderer.setAnimationLoop(frame);
  }
}
