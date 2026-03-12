const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setHeaderElevation() {
  const header = $(".header");
  if (!header) return;
  const elevated = window.scrollY > 6;
  header.setAttribute("data-elevate", elevated ? "true" : "false");
}

function setupMobileNav() {
  const toggle = $("[data-nav-toggle]");
  const panel = $("[data-nav-panel]");
  const links = $$("[data-nav-link]");
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    panel.dataset.open = open ? "true" : "false";
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  setOpen(false);

  toggle.addEventListener("click", () => {
    const open = panel.dataset.open !== "true";
    setOpen(open);
  });

  links.forEach((a) =>
    a.addEventListener("click", () => {
      setOpen(false);
    }),
  );

  document.addEventListener("click", (e) => {
    if (panel.dataset.open !== "true") return;
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (panel.contains(target) || toggle.contains(target)) return;
    setOpen(false);
  });
}

function setupActiveNav() {
  const links = $$("[data-nav-link]");
  if (!links.length) return;

  // Multi-page mode: highlight current page link (e.g., about.html)
  const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const pageLinks = links.filter((a) => {
    const href = (a.getAttribute("href") || "").trim().toLowerCase();
    return href && !href.startsWith("#");
  });

  if (pageLinks.length) {
    links.forEach((a) => a.removeAttribute("aria-current"));
    pageLinks.forEach((a) => {
      const href = (a.getAttribute("href") || "").trim().toLowerCase();
      const file = href.split("/").pop();
      if (file === currentFile) a.setAttribute("aria-current", "page");
    });
    return;
  }

  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute("href")?.slice(1);
    const section = id ? document.getElementById(id) : null;
    if (section) map.set(section, a);
  });

  const clear = () => links.forEach((a) => a.removeAttribute("aria-current"));

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
      if (!visible?.target) return;
      clear();
      const a = map.get(visible.target);
      if (a) a.setAttribute("aria-current", "page");
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: [0.1, 0.25, 0.6] },
  );

  map.forEach((_, section) => io.observe(section));
}

function setupGalleryModal() {
  const modal = $("[data-modal]");
  const modalImg = $("[data-modal-img]");
  const closeBtn = $("[data-modal-close]");
  const items = $$("[data-gallery] .galleryItem");

  if (!modal || !modalImg || !items.length) return;

  const open = (src, alt) => {
    modalImg.src = src;
    modalImg.alt = alt || "Preview";
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  };

  const close = () => {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
    modalImg.src = "";
  };

  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src");
      const img = $("img", btn);
      const alt = img?.getAttribute("alt") || "Gallery image";
      if (src) open(src, alt);
    });
  });

  closeBtn?.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function setupContactMailto() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const subject = encodeURIComponent(`Contact from ${name || "Website"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`,
    );

    // TODO: ganti ke email kamu
    const to = "you@email.com";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
}

function setupProfileBinding() {
  const nameSource = $("[data-profile-name]");
  const taglineSource = $("[data-profile-tagline]");

  const fallbackName =
    ($("[data-bio-name]")?.textContent || "").trim() ||
    ($("[data-footer-name]")?.textContent || "").trim();

  const name =
    (nameSource?.textContent || "").trim() ||
    fallbackName ||
    "INTAN PERTIWI";
  const tagline =
    (taglineSource?.textContent || "").trim() ||
    "Tagline kamu di sini — singkat, confident, dan keren.";

  $$("[data-profile-name], [data-bio-name], [data-footer-name]").forEach(
    (el) => (el.textContent = name),
  );
  $$("[data-profile-tagline]").forEach((el) => (el.textContent = tagline));

  const wrap = $(".hero__nameWrap");
  const ghosts = $$(".hero__nameGhost", wrap || document);
  ghosts.forEach((el) => (el.textContent = name));
}

function setupRevealOnScroll() {
  const els = $$(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el instanceof HTMLElement) el.classList.add("is-in");
        io.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );

  els.forEach((el) => io.observe(el));
}

function setupNameGlitchLoop() {
  const wrap = $(".hero__nameWrap");
  if (!wrap) return;

  const tick = () => {
    wrap.dataset.glitch = "on";
    window.setTimeout(() => {
      delete wrap.dataset.glitch;
    }, 520);

    const next = 2600 + Math.floor(Math.random() * 2200);
    window.setTimeout(tick, next);
  };

  window.setTimeout(tick, 900);
}

setHeaderElevation();
window.addEventListener("scroll", setHeaderElevation, { passive: true });

setupMobileNav();
setupActiveNav();
setupGalleryModal();
setupContactMailto();
setupProfileBinding();
setupRevealOnScroll();
setupNameGlitchLoop();

