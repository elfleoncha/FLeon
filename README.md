# Portafolio — Francesc Leon Chamizo

Portafolio personal estático. Sin build, sin dependencias: HTML + CSS + JS puro.
Pensado para publicarse con **GitHub Pages**.

## Estructura

```
portfolio/
├─ index.html      # página única (hero, sobre mí, skills, proyectos, contacto)
├─ css/style.css   # estilos (tema oscuro, responsive)
├─ js/main.js      # menú móvil, scroll y animaciones
└─ assets/         # CV y recursos (añadir cv.pdf aquí)
```

## Ver en local

```bash
python3 -m http.server 8080
# abre http://localhost:8080
```

## Pendiente de rellenar

- [ ] Sustituir `USUARIO` en los enlaces de GitHub y LinkedIn.
- [ ] Sustituir `EMAIL@ejemplo.com` por el correo real.
- [ ] Añadir `assets/cv.pdf` (CV actualizado).
- [ ] Revisar/ajustar los proyectos destacados.

## Publicar en GitHub Pages

1. Crea un repo en GitHub (por ejemplo `portfolio`).
2. `git remote add origin git@github.com:USUARIO/portfolio.git`
3. `git push -u origin main`
4. En el repo: **Settings → Pages → Source: `main` / root**.
5. Quedará en `https://USUARIO.github.io/portfolio/`.

> Opcional: renombra el repo a `USUARIO.github.io` para servirlo en la raíz.
