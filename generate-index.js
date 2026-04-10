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

const entries = [];
const items = fs.readdirSync(reportsDir);

for (const name of items) {
  if (name.startsWith(".") || name.startsWith("_")) continue;

  const itemPath = path.join(reportsDir, name);
  const stat = fs.statSync(itemPath);

  if (stat.isFile() && name.endsWith(".html")) {
    entries.push({
      type: "file",
      href: `./reports/${encodeURIComponent(name)}`,
      title: name.replace(/\.html$/i, ""),
      sortKey: name,
    });
  } else if (stat.isDirectory() && !excludedDirs.has(name)) {
    if (!fs.existsSync(path.join(itemPath, "index.html"))) continue;

    const title =
      titleAliases[name] || readTitleFromIndexHtml(itemPath) || name;

    entries.push({
      type: "dir",
      href: `./reports/${encodeURIComponent(name)}/`,
      title,
      sortKey: name,
    });
  }
}

entries.sort((a, b) => {
  if (a.type === b.type) {
    if (a.type === "dir") {
      return a.title.localeCompare(b.title, "zh-CN");
    }
    return b.sortKey.localeCompare(a.sortKey);
  }
  return a.type === "dir" ? -1 : 1;
});

const totalCount = entries.length;

const linksHtml = entries
  .map((e) => `<a href="${e.href}" target="_blank">${e.title}</a>`)
  .join("\n    ");

const emptyHtml =
  '<p>暂无报告，请在 reports 目录下添加 HTML 文件。</p>';

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>报告聚合页</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 3rem auto; padding: 0 1rem; line-height: 1.6; background: #fafafa; color: #333; }
    h1 { border-bottom: 2px solid #eaeaea; padding-bottom: 0.5rem; }
    .report-list { display: flex; flex-direction: column; gap: 10px; }
    a { display: block; padding: 12px 16px; background: white; border: 1px solid #eaeaea; border-radius: 6px; text-decoration: none; color: #0070f3; transition: all 0.2s ease; }
    a:hover { border-color: #0070f3; box-shadow: 0 4px 6px rgba(0,0,0,0.04); }
  </style>
</head>
<body>
  <h1>Data Reports</h1>
  <div class="report-list">
    ${entries.length === 0 ? emptyHtml : linksHtml}
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "index.html"), html);
console.log(`[Success] 索引已生成，共挂载 ${totalCount} 份报告。`);
