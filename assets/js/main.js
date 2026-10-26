(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.getElementById("nav");
  const toggle = nav.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  const progress = document.getElementById("progress");
  const heroImg = document.querySelector(".hero-media img");
  const story = document.getElementById("story");
  const slides = [...story.querySelectorAll(".slide")];
  const panes = [...story.querySelectorAll(".pane")];
  const storyButtons = [...story.querySelectorAll(".story-index button")];
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const markers = ["overview", "signal", "tough", "mesh", "colors", "specs"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function closeMenu() {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "打开菜单");
  }

  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  function setStory(index) {
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle("is-on", on);
      slide.setAttribute("aria-hidden", on ? "false" : "true");
    });
    panes.forEach((pane, i) => pane.classList.toggle("is-on", i === index));
    storyButtons.forEach((button, i) => button.classList.toggle("is-on", i === index));
  }

  storyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.go);
      const total = story.offsetHeight - window.innerHeight;
      const top = story.getBoundingClientRect().top + window.scrollY + (total * index) / slides.length + 2;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    });
  });

  const frame = document.querySelector(".colors-frame");
  const cards = [...document.querySelectorAll(".color-card")];
  const zones = [...document.querySelectorAll(".colors-zones button")];
  let colorLocked = 0;

  const dimSpans = [...frame.querySelectorAll(".colors-dims span")];

  function setColor(index) {
    colorLocked = index;
    frame.dataset.active = String(index);
    dimSpans.forEach((span, i) => {
      span.style.opacity = i === index ? "0" : "1";
    });
    cards.forEach((card, i) => {
      const on = i === index;
      card.classList.toggle("is-on", on);
      card.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => setColor(Number(card.dataset.color)));
  });
  zones.forEach((zone) => {
    const index = Number(zone.dataset.color);
    zone.addEventListener("mouseenter", () => {
      frame.dataset.active = String(index);
      dimSpans.forEach((span, i) => {
        span.style.opacity = i === index ? "0" : "1";
      });
      cards.forEach((card, i) => card.classList.toggle("is-on", i === index));
    });
    zone.addEventListener("mouseleave", () => setColor(colorLocked));
    zone.addEventListener("focus", () => setColor(index));
    zone.addEventListener("click", () => setColor(index));
  });

  const form = document.getElementById("reserve-form");
  const done = document.getElementById("reserve-done");
  const summary = document.getElementById("reserve-summary");
  const error = document.getElementById("form-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const nameField = form.elements.name.closest(".field");
    const contactField = form.elements.contact.closest(".field");
    nameField.classList.toggle("is-error", !name);
    contactField.classList.toggle("is-error", !contact);
    if (!name || !contact) {
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const scene = data.get("scene");
    const color = data.get("color");
    const note = String(data.get("note") || "").trim();
    summary.textContent = `${name}，${contact}。场景是${scene}，关注${color}。${note ? "备注已留在这台设备上。" : ""}这是展示页面，内容没有发送。`;
    form.hidden = true;
    done.hidden = false;
  });

  document.getElementById("reserve-reset").addEventListener("click", () => {
    form.reset();
    form.hidden = false;
    done.hidden = true;
    form.querySelectorAll(".is-error").forEach((field) => field.classList.remove("is-error"));
  });

  const dock = document.getElementById("dock");
  const reserve = document.getElementById("reserve");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    }, { threshold: 0.18 });
    document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

    const dockObserver = new IntersectionObserver((entries) => {
      dock.classList.toggle("is-hidden", entries.some((entry) => entry.isIntersecting));
    }, { threshold: 0.15 });
    dockObserver.observe(reserve);
  } else {
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("in"));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? scrolled / max : 0})`;

      let current = null;
      markers.forEach((marker) => {
        if (marker.getBoundingClientRect().top <= 120) current = marker;
      });
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", current && link.getAttribute("href") === `#${current.id}`);
      });

      const rect = story.getBoundingClientRect();
      const total = story.offsetHeight - window.innerHeight;
      const into = Math.min(Math.max(-rect.top, 0), total);
      const ratio = total > 0 ? into / total : 0;
      const index = ratio >= 1 ? slides.length - 1 : Math.floor(ratio * slides.length);
      setStory(index);

      if (!reduce && window.innerWidth > 800) {
        const shift = Math.min(scrolled, window.innerHeight) * 0.08;
        heroImg.style.transform = `translate3d(0, ${shift}px, 0)`;
      } else {
        heroImg.style.transform = "";
      }
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  setStory(0);
  onScroll();
})();
