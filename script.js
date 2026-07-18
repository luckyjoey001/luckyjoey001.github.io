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
