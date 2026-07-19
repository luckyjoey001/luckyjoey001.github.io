// Calligraphy gallery: museum view — left thumb list, right stage.
// 21 works, vertical postcard format. Description fields are editable
// and auto-saved to localStorage so the user can fill in titles, years,
// dimensions, and notes without touching code.
(function () {
  const list = document.querySelector(".gallery-list");
  const stage = document.querySelector(".gallery-stage");
  if (!list || !stage) return;

  const thumbs = Array.from(list.querySelectorAll(".gallery-thumb"));
  const stageImg = stage.querySelector(".stage-img");
  const fields = stage.querySelectorAll("[data-field]");
  const counter = stage.querySelector(".stage-counter");
  const btnPrev = stage.querySelector(".stage-prev");
  const btnNext = stage.querySelector(".stage-next");
  const exportBtn = document.querySelector(".export-btn");

  const STORAGE_KEY = "joeylu.calligraphy.edits";
  const STYLE_LABELS = {
    regular: "楷书",
    running: "行书",
    cursive: "草书",
    clerical: "隶书",
    seal: "篆书",
  };

  // ----- persistence -----
  function loadEdits() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveEdits(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable */
    }
  }

  let edits = loadEdits();
  let active = thumbs[0] ? thumbs[0].dataset.index : null;

  // ----- helpers -----
  function getThumb(index) {
    return thumbs.find((t) => t.dataset.index === index);
  }

  function setCounter() {
    if (!active || !counter) return;
    counter.textContent = `${active} / ${thumbs.length}`;
  }

  function setActive(index) {
    const thumb = getThumb(index);
    if (!thumb) return;
    active = index;

    thumbs.forEach((t) =>
      t.classList.toggle("is-active", t === thumb),
    );

    stage.dataset.current = index;

    const thumbImg = thumb.querySelector(".thumb-img");
    if (thumbImg && stageImg) {
      stageImg.src = thumbImg.getAttribute("src");
      stageImg.alt = thumbImg.alt || "";
    }

    // Populate editable fields from saved edits (or per-work defaults).
    const data = edits[index] || {};
    fields.forEach((f) => {
      const field = f.dataset.field;
      let val;
      if (data[field] != null) {
        val = data[field];
      } else if (field === "notes") {
        val = ""; // leave empty so :empty::before shows the hint
      } else if (field === "line") {
        val = f.dataset.placeholder || "";
      } else {
        val = f.dataset.placeholder || "";
      }
      f.textContent = val;
    });

    setCounter();
  }

  // ----- populate thumb titles from saved edits on first load -----
  thumbs.forEach((t) => {
    const idx = t.dataset.index;
    const titleEl = t.querySelector(".thumb-title");
    if (edits[idx] && edits[idx].title && titleEl) {
      titleEl.textContent = edits[idx].title;
    }
  });

  // ----- thumb click → set active -----
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => setActive(thumb.dataset.index));
  });

  // ----- editable description fields -----
  fields.forEach((f) => {
    f.addEventListener("input", () => {
      const field = f.dataset.field;
      if (!edits[active]) edits[active] = {};
      edits[active][field] = f.textContent;
      saveEdits(edits);

      // Mirror title into the left thumb so the list stays in sync.
      if (field === "title") {
        const thumb = getThumb(active);
        const tEl = thumb && thumb.querySelector(".thumb-title");
        if (tEl) {
          tEl.textContent =
            f.textContent || f.dataset.placeholder || "《作品名》";
        }
      }
    });
  });

  // ----- prev / next -----
  function step(delta) {
    if (!thumbs.length) return;
    const idx = thumbs.findIndex((t) => t.dataset.index === active);
    const target = thumbs[(idx + delta + thumbs.length) % thumbs.length];
    if (target) setActive(target.dataset.index);
  }

  if (btnPrev) btnPrev.addEventListener("click", () => step(-1));
  if (btnNext) btnNext.addEventListener("click", () => step(1));

  document.addEventListener("keydown", (e) => {
    // Don't hijack arrow keys while the user is editing a field.
    const a = document.activeElement;
    if (a && a.matches && a.matches("[contenteditable]")) return;
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  // ----- export edits (copy to clipboard + download JSON file) -----
  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      const json = JSON.stringify(edits, null, 2);
      let copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(json);
          copied = true;
        }
      } catch (e) {
        /* fall through to prompt */
      }
      // Also download a JSON file so edits can be saved / synced back to code.
      try {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "calligraphy-edits.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        /* download not available — clipboard/prompt is the fallback */
      }
      if (!copied) {
        window.prompt("Copy this JSON to bake edits into the site:", json);
        return;
      }
      showToast("✓ EDITS COPIED + DOWNLOADED");
    });
  }

  function showToast(msg) {
    let toast = document.querySelector(".export-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "export-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  // ----- init -----
  if (thumbs.length) setActive(active);
})();

// Profile page: bilingual language switch (中 / EN).
(function () {
  const switchBtn = document.querySelector(".lang-switch");
  const panels = document.querySelectorAll(".lang-panel");
  if (!switchBtn || !panels.length) return;

  switchBtn.addEventListener("click", () => {
    const current = switchBtn.dataset.active || "en";
    const next = current === "en" ? "zh" : "en";

    switchBtn.dataset.active = next;
    switchBtn.setAttribute(
      "aria-label",
      next === "zh" ? "切换到 English" : "切换到中文",
    );

    panels.forEach((panel) => {
      const isActive = panel.dataset.lang === next;
      panel.dataset.active = isActive ? "true" : "false";
      panel.hidden = !isActive;
    });
  });
})();
