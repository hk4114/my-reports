const fs = require("fs");
const path = require("path");

const reportsDir = path.join(__dirname, "reports");

// 防呆设计：目录不存在时自动创建，防止 Vercel 报错
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// 降序排列，确保最新生成的报告在最上面 (假设你按时间命名)
const files = fs
  .readdirSync(reportsDir)
  .filter((f) => f.endsWith(".html"))
  .sort((a, b) => b.localeCompare(a));

// 注入极简 CSS，避免纯文本瞎眼
const html = `
<!DOCTYPE html>
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
    ${
      files.length === 0
        ? "<p>暂无报告，请在 reports 目录下添加 HTML 文件。</p>"
        : files
            .map(
              (f) =>
                `<a href="/reports/${encodeURIComponent(f)}" target="_blank">${f.replace(".html", "")}</a>`,
            )
            .join("\n")
    }
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "index.html"), html);
console.log(`[Success] 索引已生成，共挂载 ${files.length} 份报告。`);
