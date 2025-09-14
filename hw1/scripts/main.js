// Minimal bootstrap for static site. No framework.
// - Injects Header/Footer HTML
// - Sets active nav state
// - Adds small UX niceties

/** Fetch and inject an HTML partial into a target element. */
async function injectPartial(targetSelector, url) {
  const el = document.querySelector(targetSelector);
  if (!el) return;
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div role="alert">Failed to load ${url}</div>`;
  }
}

/** Mark the current nav link with aria-current based on pathname. */
function setActiveNav(container = document) {
  const current = (location.pathname || "/").replace(/\/+$/, "") || "/";
  container.querySelectorAll('[data-path]').forEach((link) => {
    const path = link.getAttribute('data-path') || '';
    const normalized = path.replace(/\/+$/, '') || '/';
    if (current === normalized || current.startsWith(normalized + "/")) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/** Initialize footer dynamic year. */
function setFooterYear(container = document) {
  const y = container.querySelector("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function initContactForm(doc = document) {
  const form = doc.querySelector("#contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent navigation
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    console.info("Contact payload:", payload); // debug log

    const toast = doc.querySelector("#toast");
    if (toast) {
      toast.textContent = "Message sent (fake).";
      toast.style.color = "var(--success)";
    }
    form.reset();
  });
}


/** Main entry. */
async function bootstrap() {
  await Promise.all([
    injectPartial("#site-header", "/components/Header.html"),
    injectPartial("#site-footer", "/components/Footer.html"),
  ]);
  setActiveNav(document);
  setFooterYear(document);
  initContactForm(document);
  console.info("Bootstrap complete");
}

bootstrap();

