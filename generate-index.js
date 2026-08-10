const fs = require("fs");
const path = require("path");

const reportsDir = path.join(__dirname, "reports");

// 防呆设计：目录不存在时自动创建，防止 Vercel 报错
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

const titleAliases = {
  case: "2026-3投资战略备忘录",
};

const excludedDirs = new Set(["assets", "shared", "lib"]);

function readTitleFromIndexHtml(dirPath) {
  try {
    const html = fs.readFileSync(path.join(dirPath, "index.html"), "utf8");
    const match = html.match(/<title>([^<]*)<\/title>/i);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// ── 日期提取 ──────────────────────────────────────────────
// 优先级：文件名 YYYYMMDD > 标题 "YYYY-M / YYYY年M" > birthtime > mtime
const DATE8_RE = /(20\d{2})(\d{2})(\d{2})/;
const DATEYM_RE = /(20\d{2})\s*[-年.]\s*(\d{1,2})/;

function dateFromName(name) {
  const m8 = name.match(DATE8_RE);
  if (m8) {
    return { date: new Date(+m8[1], +m8[2] - 1, +m8[3], 12), hasDay: true };
  }
  const my = name.match(DATEYM_RE);
  if (my) {
    return { date: new Date(+my[1], +my[2] - 1, 1, 12), hasDay: false };
  }
  return null;
}

function dateFromStat(stat) {
  const b = stat.birthtimeMs;
  const t = b > 0 && b <= Date.now() ? stat.birthtime : stat.mtime;
  return { date: t, hasDay: true };
}

function formatDate(d, hasDay) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  return hasDay ? `${y}-${m}-${pad2(d.getDate())}` : `${y}-${m}`;
}

// ── 扫描 reports/ ─────────────────────────────────────────
const entries = [];
const items = fs.readdirSync(reportsDir);

for (const name of items) {
  if (name.startsWith(".") || name.startsWith("_")) continue;

  const itemPath = path.join(reportsDir, name);
  const stat = fs.statSync(itemPath);

  if (stat.isFile() && name.endsWith(".html")) {
    const baseName = name.replace(/\.html$/i, "");
    const d = dateFromName(baseName) || dateFromStat(stat);
    entries.push({
      type: "file",
      href: `./reports/${encodeURIComponent(name)}`,
      title: baseName,
      date: d.date,
      hasDay: d.hasDay,
    });
  } else if (stat.isDirectory() && !excludedDirs.has(name)) {
    if (!fs.existsSync(path.join(itemPath, "index.html"))) continue;

    const title = titleAliases[name] || readTitleFromIndexHtml(itemPath) || name;
    const d = dateFromName(title) || dateFromStat(stat);

    entries.push({
      type: "dir",
      href: `./reports/${encodeURIComponent(name)}/`,
      title,
      date: d.date,
      hasDay: d.hasDay,
    });
  }
}

// 统一按时间倒序（由近及远），同日期的按标题升序保证确定性
entries.sort((a, b) => {
  if (a.date.getTime() !== b.date.getTime()) {
    return b.date.getTime() - a.date.getTime();
  }
  return a.title.localeCompare(b.title, "zh-CN");
});

// 按月分组（YYYY-MM）
const groups = new Map();
for (const e of entries) {
  const key = `${e.date.getFullYear()}-${pad2(e.date.getMonth() + 1)}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(e);
}
const groupKeys = [...groups.keys()].sort((a, b) => b.localeCompare(a));

// ── 渲染数据 ──────────────────────────────────────────────
const totalCount = entries.length;
const now = new Date();
const buildDate = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return `${y} 年 ${m} 月`;
}

const rangeLabel =
  groupKeys.length >= 2
    ? `${groupKeys[groupKeys.length - 1]} → ${groupKeys[0]}`
    : groupKeys.length === 1
      ? groupKeys[0]
      : "—";

const earliestLabel = groupKeys.length ? monthLabel(groupKeys[groupKeys.length - 1]) : "";

// 内联 SVG 图标（lucide 风格，编辑器调性禁用 Emoji）
const ICON_FOLDER =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>';
const ICON_DOC =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>';
const ICON_ARROW =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';

const groupsHtml = groupKeys
  .map((key) => {
    const list = groups.get(key);
    const cardsHtml = list
      .map((e) => {
        const icon = e.type === "dir" ? ICON_FOLDER : ICON_DOC;
        return `      <li class="reveal">
        <a class="card" href="${e.href}" target="_blank" rel="noopener">
          <span class="card-icon">${icon}</span>
          <span class="card-title">${escapeHtml(e.title)}</span>
          <time class="card-date" datetime="${formatDate(e.date, e.hasDay)}">${formatDate(e.date, e.hasDay)}</time>
          <span class="card-arrow">${ICON_ARROW}</span>
        </a>
      </li>`;
      })
      .join("\n");
    return `  <section class="group" id="g-${key}">
    <h2 class="reveal">${monthLabel(key)}<em>${list.length} 份</em></h2>
    <ul data-stagger>
${cardsHtml}
    </ul>
  </section>`;
  })
  .join("\n\n");

const emptyHtml = '<p class="empty">暂无报告，请在 reports 目录下添加 HTML 文件。</p>';
const endHtml = earliestLabel
  ? `    <p class="end">—— 归档完毕 · 最早一份：${earliestLabel} ——</p>`
  : "";

// ── 页面模板（DESIGN.md 规范实现）──────────────────────────
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>报告馆 · 个人研究归档</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap');

  :root {
    --bg: #f5f2ea;
    --bg-rgb: 245,242,234;
    --surface: #fdfbf5;
    --surface-alt: #efece1;
    --surface-hover: #ffffff;
    --border: #e3ded0;
    --border-hover: #b9b2a0;
    --text: #232019;
    --text-rgb: 35,32,25;
    --text-secondary: #6f6a5c;
    --text-tertiary: #a39d8d;
    --accent: #3d5bd5;
    --accent-rgb: 61,91,213;
    --accent-hover: #3048b8;
    --success: #2e8b57;
    --success-rgb: 46,139,87;
    --warning: #c98a1b;
    --warning-rgb: 201,138,27;
    --error: #b3392f;
    --error-rgb: 179,57,47;
    --radius: 10px;
    --font-sans: "Inter", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 1rem;
    line-height: 1.75;
    letter-spacing: 0.02em;
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: rgba(var(--accent-rgb), 0.18); }
  ::-moz-selection { background: rgba(var(--accent-rgb), 0.18); }

  .container { max-width: 720px; margin: 0 auto; padding: 0 24px; }

  /* ── Hero ── */
  .hero { position: relative; padding-top: 96px; padding-bottom: 56px; }
  .hero::before {
    content: "";
    position: absolute;
    top: -120px; right: -80px;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(var(--accent-rgb), 0.10), transparent 70%);
    pointer-events: none;
    animation: breath 9s ease-in-out infinite alternate;
  }
  @keyframes breath {
    from { opacity: 0.6; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1.05); }
  }
  .eyebrow {
    margin: 0 0 20px;
    font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--accent);
  }
  h1 {
    margin: 0 0 20px;
    font-size: clamp(2.75rem, 8vw, 4.25rem);
    font-weight: 700; line-height: 1.12; letter-spacing: 0.02em;
    clip-path: inset(0 0 100% 0);
    animation: revealMask 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
  }
  @keyframes revealMask { to { clip-path: inset(0 0 0 0); } }
  .h1-dot { color: var(--accent); }
  .subtitle {
    margin: 0 0 32px;
    max-width: 34em;
    font-size: 1.0625rem;
    color: var(--text-secondary);
  }
  .stats {
    display: flex; flex-wrap: wrap; gap: 8px 48px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .stat b {
    display: block;
    font-size: 1.375rem; font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }
  .stat span {
    font-size: 0.8125rem; letter-spacing: 0.06em;
    color: var(--text-tertiary);
  }

  /* ── Reveal（L2 滚动入场）── */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal.in-view { opacity: 1; transform: none; }

  /* ── 时间线 ── */
  .timeline { position: relative; padding-top: 8px; padding-bottom: 24px; padding-left: 36px; }
  .timeline::before {
    content: "";
    position: absolute; left: 7px; top: 16px; bottom: 16px;
    width: 1px;
    background: var(--border);
  }
  .group { position: relative; margin-bottom: 56px; }
  .group::before {
    content: "";
    position: absolute; left: -36px; top: 10px;
    width: 15px; height: 15px;
    border-radius: 50%;
    background: var(--bg);
    border: 2px solid var(--accent);
  }
  .group h2 {
    position: sticky; top: 0; z-index: 2;
    margin: -14px 0 16px;
    padding: 14px 0 10px;
    font-size: 1.375rem; font-weight: 600;
    line-height: 1.4; letter-spacing: 0.04em;
    background: var(--bg);
    position: -webkit-sticky;
  }
  .group h2 em {
    font-style: normal; font-weight: 500;
    font-size: 0.8125rem; letter-spacing: 0.06em;
    font-variant-numeric: tabular-nums;
    color: var(--text-tertiary);
    margin-left: 10px;
  }
  .group h2::after {
    content: "";
    position: absolute; left: 0; bottom: 6px;
    width: 0; height: 2px;
    background: var(--accent);
    transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
  }
  .group h2.in-view::after { width: 100%; }

  .group ul {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 10px;
  }

  /* ── 卡片（全部状态）── */
  .card {
    position: relative;
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px;
    min-height: 56px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--text);
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease,
                border-color 0.25s ease, background-color 0.25s ease;
  }
  .card::before {
    content: "";
    position: absolute; inset: 0;
    opacity: 0;
    background: radial-gradient(200px circle at var(--mx, 50%) var(--my, 50%),
                rgba(var(--accent-rgb), 0.08), transparent 65%);
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  .card:hover {
    transform: translateY(-2px);
    background: var(--surface-hover);
    border-color: var(--border-hover);
    box-shadow: 0 4px 14px rgba(var(--text-rgb), 0.07);
  }
  .card:hover::before { opacity: 1; }
  .card:active { transform: translateY(0) scale(0.995); }
  .card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .card-icon {
    flex: none;
    width: 36px; height: 36px;
    display: grid; place-items: center;
    border-radius: 8px;
    background: var(--surface-alt);
    color: var(--accent);
  }
  .card-title {
    flex: 1; min-width: 0;
    font-size: 1.0625rem; font-weight: 500; line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-date {
    flex: none;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    color: var(--text-tertiary);
    transition: color 0.25s ease;
  }
  .card:hover .card-date { color: var(--accent); }
  .card-arrow {
    flex: none;
    color: var(--text-tertiary);
    transition: transform 0.25s ease, color 0.25s ease;
  }
  .card:hover .card-arrow { transform: translateX(3px); color: var(--accent); }

  /* ── 空态 / 页脚 ── */
  .empty {
    padding: 24px 0 48px;
    color: var(--text-secondary);
  }
  footer { padding: 8px 0 56px; }
  .end {
    margin: 24px 0 16px;
    text-align: center;
    font-size: 0.8125rem; letter-spacing: 0.08em;
    color: var(--text-tertiary);
  }
  .meta {
    margin: 0;
    text-align: center;
    font-size: 0.75rem; letter-spacing: 0.06em;
    color: var(--text-tertiary);
  }

  /* ── 响应式 ── */
  @media (max-width: 599px) {
    .container { padding: 0 20px; }
    .hero { padding-top: 72px; padding-bottom: 48px; }
    .hero::before { display: none; }
    .timeline { padding-left: 30px; }
    .group::before { left: -30px; }
    .card { padding: 12px 14px; gap: 10px; }
    .card-icon { width: 32px; height: 32px; }
    .card-date { font-size: 0.75rem; }
  }

  /* ── 动效降级 ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0s !important;
      scroll-behavior: auto !important;
    }
  }
</style>
</head>
<body>
  <header class="hero container" data-stagger>
    <p class="eyebrow reveal">Personal Research Archive</p>
    <h1>报告馆<span class="h1-dot">.</span></h1>
    <div class="stats">
      <div class="stat reveal"><b data-count="${totalCount}">${totalCount}</b><span>已归档报告</span></div>
      <div class="stat reveal"><b>${rangeLabel}</b><span>时间范围</span></div>
      <div class="stat reveal"><b>${buildDate}</b><span>最近更新</span></div>
    </div>
  </header>

  <main class="timeline container">
${entries.length === 0 ? emptyHtml : groupsHtml}
  </main>

  <footer class="container">
${endHtml}
    <p class="meta">由 generate-index.js 自动生成 · 更新于 ${buildDate}</p>
  </footer>

<script>
(function () {
  "use strict";
  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 滚动 reveal + 交错入场 */
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (el.hasAttribute("data-stagger")) {
        Array.prototype.forEach.call(el.children, function (child, i) {
          child.style.transitionDelay = Math.min(i * 60, 480) + "ms";
        });
      }
      el.classList.add("in-view");
      obs.unobserve(el);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal, [data-stagger]").forEach(function (el) {
    obs.observe(el);
  });

  /* 归档数 count-up（900ms easeOutCubic） */
  if (!reduce) {
    var counter = document.querySelector("[data-count]");
    if (counter) {
      var target = parseInt(counter.getAttribute("data-count"), 10) || 0;
      var start = null;
      function tick(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / 900, 1);
        counter.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }

  /* 卡片聚光灯：全局委托 + rAF 节流，仅悬停设备 */
  if (!reduce && window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    var ticking = false;
    document.addEventListener("pointermove", function (ev) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var card = ev.target.closest ? ev.target.closest(".card") : null;
        if (card) {
          var r = card.getBoundingClientRect();
          card.style.setProperty("--mx", (ev.clientX - r.left) + "px");
          card.style.setProperty("--my", (ev.clientY - r.top) + "px");
        }
        ticking = false;
      });
    }, { passive: true });
  }
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "index.html"), html);
console.log(`[Success] 索引已生成，共挂载 ${totalCount} 份报告。`);