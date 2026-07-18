// Calligraphy archive: filter works by script style (楷/行/草/隶/篆).
(function () {
  const filters = document.querySelectorAll(".work-filter");
  const cards = document.querySelectorAll(".work-card");
  if (!filters.length || !cards.length) return;

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      filters.forEach((f) => f.setAttribute("aria-pressed", "false"));
      filter.setAttribute("aria-pressed", "true");

      const active = filter.dataset.filter;
      cards.forEach((card) => {
        const show = active === "all" || card.dataset.style === active;
        card.hidden = !show;
      });
    });
  });
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
    switchBtn.setAttribute("aria-label", next === "zh" ? "切换到 English" : "切换到中文");

    panels.forEach((panel) => {
      const isActive = panel.dataset.lang === next;
      panel.dataset.active = isActive ? "true" : "false";
      panel.hidden = !isActive;
    });
  });
})();
