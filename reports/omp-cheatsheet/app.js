(function () {
  "use strict";

  // Load data from the inline JSON script tag so file:// protocol works.
  function loadData() {
    const script = document.getElementById("cheatsheet-data");
    const raw = script ? script.textContent.trim() : "";
    if (!raw) {
      throw new Error("未找到速查表数据");
    }
    return JSON.parse(raw);
  }

  const data = loadData();
  const items = data.items || [];
  const categories = data.categories || [];

  // DOM refs
  const tabsEl = document.getElementById("category-tabs");
  const searchInput = document.getElementById("search-input");
  const mainEl = document.getElementById("main");
  const emptyState = document.getElementById("empty-state");
  const emptyQuery = document.getElementById("empty-query");
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("drawer-overlay");
  const drawerClose = document.getElementById("drawer-close");
  const drawerTitle = document.getElementById("drawer-title");
  const drawerSummary = document.getElementById("drawer-summary");
  const drawerBody = document.getElementById("drawer-body");

  // State
  let currentCategory = categories[0] || "";
  let searchQuery = "";
  let selectedItem = null;

  // Search helper: returns a test function. Invalid regex falls back to substring.
  function buildMatcher(query) {
    const trimmed = query.trim();
    if (!trimmed) return null;

    let regex = null;
    if (trimmed.startsWith("/") && trimmed.length > 1) {
      const lastSlash = trimmed.lastIndexOf("/");
      if (lastSlash > 1) {
        const pattern = trimmed.slice(1, lastSlash);
        const flags = trimmed.slice(lastSlash + 1);
        try {
          regex = new RegExp(pattern, flags);
        } catch (_) {
          regex = null;
        }
      }
    }

    if (regex) {
      return (text) => regex.test(text);
    }

    const lower = trimmed.toLowerCase();
    return (text) => text.toLowerCase().includes(lower);
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function groupByPanel(itemsInCategory) {
    const map = new Map();
    for (const item of itemsInCategory) {
      const panel = item.panel || "其他";
      if (!map.has(panel)) map.set(panel, []);
      map.get(panel).push(item);
    }
    return map;
  }

  function renderTabs() {
    tabsEl.innerHTML = "";
    for (const category of categories) {
      const btn = document.createElement("button");
      btn.className = "tab" + (category === currentCategory ? " active" : "");
      btn.textContent = category;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", category === currentCategory ? "true" : "false");
      btn.type = "button";
      btn.addEventListener("click", () => switchCategory(category));
      tabsEl.appendChild(btn);
    }
  }

  function render() {
    const matcher = buildMatcher(searchQuery);
    const filtered = items.filter((item) => {
      if (item.category !== currentCategory) return false;
      if (!matcher) return true;
      return matcher(item.title) || matcher(item.summary);
    });

    mainEl.innerHTML = "";

    if (!filtered.length) {
      emptyState.classList.remove("hidden");
      emptyQuery.textContent = searchQuery || "";
      return;
    }

    emptyState.classList.add("hidden");

    const grouped = groupByPanel(filtered);
    let panelIndex = 0;

    for (const [panelName, panelItems] of grouped) {
      const panel = document.createElement("section");
      panel.className = "panel";
      panel.style.animationDelay = `${Math.min(panelIndex * 0.06, 0.4)}s`;

      const header = document.createElement("div");
      header.className = "panel-header";
      const title = document.createElement("h2");
      title.className = "panel-title";
      title.textContent = panelName;
      header.appendChild(title);
      panel.appendChild(header);

      const body = document.createElement("div");
      body.className = "panel-body";

      for (const item of panelItems) {
        const row = document.createElement("div");
        row.className = "row";
        row.setAttribute("role", "button");
        row.setAttribute("tabindex", "0");
        row.setAttribute("aria-label", `${item.title}：${item.summary}`);
        row.dataset.id = item.id;

        const rowTitle = document.createElement("span");
        rowTitle.className = "row-title";
        rowTitle.textContent = item.title;

        const rowSummary = document.createElement("span");
        rowSummary.className = "row-summary";
        rowSummary.textContent = item.summary;

        row.appendChild(rowTitle);
        row.appendChild(rowSummary);

        row.addEventListener("click", () => openDrawer(item));
        row.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDrawer(item);
          }
        });

        body.appendChild(row);
      }

      panel.appendChild(body);
      mainEl.appendChild(panel);
      panelIndex += 1;
    }
  }

  function switchCategory(category) {
    if (category === currentCategory) return;
    currentCategory = category;
    searchQuery = "";
    searchInput.value = "";
    renderTabs();
    render();
  }

  function openDrawer(item) {
    selectedItem = item;
    drawerTitle.textContent = item.title;
    drawerSummary.textContent = item.summary;
    drawerBody.innerHTML = item.detail || "<p>暂无详情</p>";

    overlay.classList.add("open");
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Move focus to close button for accessibility.
    requestAnimationFrame(() => {
      drawerClose.focus();
    });
  }

  function closeDrawer() {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    selectedItem = null;

    // Return focus to search input if available, without scrolling the page.
    if (searchInput) searchInput.focus({ preventScroll: true });
  }

  // Event listeners
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    render();
  });

  overlay.addEventListener("click", closeDrawer);
  drawerClose.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && selectedItem) {
      closeDrawer();
    }
  });

  // Swipe down to close on mobile.
  let touchStartY = 0;
  drawer.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  });
  drawer.addEventListener("touchend", (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY > 80) {
      closeDrawer();
    }
  });

  // Initial render
  renderTabs();
  render();
})();
