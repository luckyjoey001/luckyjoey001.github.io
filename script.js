// Calligraphy gallery: museum view — left thumb list, right stage.
// 21 works, vertical postcard format. Titles, year/style, and dimensions are
// editable and auto-saved to localStorage so the user can curate metadata
// without touching code.
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

  // Default edits baked into the site. These values were entered by the user
  // in the browser and exported via the "EXPORT EDITS" button; they now serve
  // as the initial content so the site displays the curated titles / years / sizes
  // even for first-time visitors or after clearing localStorage.
  const DEFAULT_EDITS = {
    "01": {
      title: "度一切苦厄",
      line: "2025 · 行书",
      size: "15 × 15 cm · 水墨宣纸 Ink on xuan paper",
    },
    "02": {
      title: "世界是一个巨大的游乐场",
      line: "2025 · 行书",
      size: "10 × 14 cm · 水墨宣纸 Ink on xuan paper",
    },
    "03": {
      title: "浮生若梦",
      line: "2025 · 行草",
      size: "10 × 10 cm · 水墨宣纸 Ink on xuan paper",
    },
    "04": {
      title: "福",
      line: "2025 · 篆书",
      size: "10 × 10 cm · 水墨宣纸 Ink on xuan paper",
    },
    "05": {
      title: "心月同光· 梦里乾坤",
      line: "2025 · 篆书/ 隶书",
      size: "15 × 15 cm · 水墨宣纸 Ink on xuan paper",
    },
    "06": {
      title: "穿越周期",
      line: "2025 · 行书",
      size: "10 × 10 cm · 水墨宣纸 Ink on xuan paper",
    },
    "07": {
      title: "万类霜天竞自由",
      line: "2024 · 行草",
      size: "15 × 15 cm · 水墨宣纸 Ink on xuan paper",
    },
    "08": {
      title: "满船星梦压星河",
      line: "2024 · 草书",
      size: "15 × 15 cm · 水墨宣纸 Ink on xuan paper",
    },
    "09": {
      title: "上善若水",
      line: "2024 · 行草",
    },
    "10": {
      title: "如愿",
      line: "2024 · 行草",
      size: "10 × 10 cm · 水墨宣纸 Ink on xuan paper",
    },
    "11": {
      title: "上善若水",
      line: "2025 · 隶",
      size: "15 × 15 cm · 水墨宣纸 Ink on xuan paper",
    },
    "12": {
      line: "2025 · 草书",
      size: "21 × 29 cm · 水墨宣纸 Ink on xuan paper",
    },
    "13": {
      title: "天真",
      line: "2025 ",
      size: "15 × 15 cm · 和纸 Ink on xuan paper",
    },
    "14": {
      title: "觉",
      line: "2025 · 行书",
    },
    "15": {
      title: "夏风深深 有如海浪",
      line: "2024 · 行草",
      size: "21 × 29 cm · 水墨宣纸 Ink on xuan paper",
    },
    "16": {
      title: "我的心略大于整个宇宙",
      line: "2025 · 隶书/行书",
      size: "15 × 15 cm · 水墨宣纸 Ink on xuan paper",
    },
    "17": {
      title: "每个情绪都标明了颜色，或哭或笑，都是甜色",
      line: "2025 · 行草",
      size: "10 × 10 cm · 水墨宣纸 Ink on xuan paper",
    },
    "18": {
      title: "天真",
      line: "2024 · 行书",
      size: "138 × 69 cm · 水墨卡纸 Ink on xuan paper",
    },
    "19": {
      title: "Burning Child Loves the Fire",
      line: "2025 · 英文花体",
      size: "10 × 10 cm · 水墨宣纸 Ink on xuan paper",
    },
    "20": {
      title: "蓝色 · 宇宙之爱",
      line: "2025 · 行书",
      size: "10 × 10 cm · 水墨宣纸 Ink on xuan paper",
    },
    "21": {
      title: "允许一切发生",
      line: "2024 · 行草",
      size: "10 × 10 cm · 水墨宣纸 Ink on xuan paper",
    },
  };

  // ----- persistence -----
  function loadEdits() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...DEFAULT_EDITS, ...saved };
    } catch (e) {
      return { ...DEFAULT_EDITS };
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
      } else if (field === "line") {
        val = f.dataset.placeholder || "";
      } else {
        val = f.dataset.placeholder || "";
      }
      f.textContent = val;
    });

    // Reset scroll so the new work is shown from the top.
    stage.scrollTop = 0;

    setCounter();
  }

  // ----- populate thumb titles from saved edits on first load -----
  thumbs.forEach((t) => {
    const idx = t.dataset.index;
    const titleEl = t.querySelector(".thumb-title");
    const subEl = t.querySelector(".thumb-sub");
    if (edits[idx]) {
      if (edits[idx].title && titleEl) titleEl.textContent = edits[idx].title;
      if (edits[idx].line && subEl) subEl.textContent = edits[idx].line;
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
