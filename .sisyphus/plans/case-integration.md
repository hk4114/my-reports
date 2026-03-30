# 整合 case 目录到 reports 项目

## TL;DR

> **目标**: 将迁移过来的 `case/` 目录（"市场备忘录 2026.3-4" Vite 构建产物）整合到 my-reports 项目中
> 
> **访问路径**: `/reports/case/`
> 
> **首页展示**: 在报告列表中显示为 "2026-3投资战略备忘录"
> 
> **交付物**:
> - `reports/case/` 目录（移动后的完整 case 内容）
> - 修改后的 `generate-index.js`（支持 case 链接生成）
> - 重新生成的 `index.html`
> 
> **预计耗时**: 15-20 分钟
> **执行方式**: 顺序执行（3个独立任务）

---

## Context

### 原始需求
用户从其他项目迁移了一个 `case/` 目录到 my-reports 项目，希望将其整合为项目的一部分。

### 当前项目结构
```
my-reports/
├── case/                      # ← 待整合的 Vite 构建产物
│   ├── index.html
│   └── assets/
│       ├── index-BmdMgrkb.js
│       └── index-DKUwxkYT.css
├── reports/                   # 现有报告目录
│   ├── 20260303.html
│   ├── 20260311.html
│   └── 20260326.html
├── generate-index.js          # 首页生成脚本
└── index.html                 # 生成的首页
```

### 确认的方案
| 项目 | 决策 |
|------|------|
| **访问路径** | `/reports/case/`（通过 `/reports/case/` 访问 case 首页） |
| **首页展示** | 混入报告列表，显示为 "2026-3投资战略备忘录" |
| **展示位置** | 与现有 HTML 报告一起排序显示 |

### Metis Gap 分析（预防措施）
**已识别的风险点**:
1. **case 目录存在性检查**: 移动前要确保 case 目录存在
2. **assets 路径正确性**: case/index.html 中的相对路径在移动后仍然有效（`./assets/` → 相对 reports/case/ 依然正确）
3. **generate-index.js 兼容性**: 需要同时处理 `.html` 文件和 `case` 目录
4. **首页链接生成**: case 的链接需要指向 `/reports/case/` 而非 `.html`

---

## Work Objectives

### Core Objective
将独立的 `case/` 目录整合进 `reports/` 子目录，使其可以通过 `/reports/case/` 路径访问，并在首页生成相应的入口链接。

### Concrete Deliverables
- `reports/case/` 目录包含完整的 case 内容
- `generate-index.js` 生成指向 case 的链接
- 首页展示 "2026-3投资战略备忘录" 入口链接

### Definition of Done
- [ ] `reports/case/index.html` 存在且可访问
- [ ] `reports/case/assets/` 目录完整
- [ ] 首页包含指向 `/reports/case/` 的链接
- [ ] 点击链接能正常显示 "市场备忘录" 页面

### Must Have
- case 目录移动到 reports/case/
- 首页显示 "2026-3投资战略备忘录" 链接
- 链接指向 `/reports/case/`

### Must NOT Have
- 不修改 case 内部的任何文件（保持原样）
- 不重构 case 的源码
- 不影响现有报告的正常显示

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO（无测试框架）
- **Automated tests**: NO（简单任务，QA 场景足够）
- **Agent-Executed QA**: YES（每个任务完成后手动验证）

### QA Policy
每个任务完成后，使用 Browser QA 验证实际功能。

---

## Execution Strategy

### 并行执行分析
本任务为**顺序执行**，任务之间存在依赖关系：
- 任务 2 依赖任务 1 完成（移动目录后才能修改脚本）
- 任务 3 依赖任务 2 完成（修改脚本后才能生成首页）

```
Wave 1 (顺序执行):
├── Task 1: 移动 case 目录到 reports/case/
├── Task 2: 修改 generate-index.js 支持 case 链接（依赖 T1）
└── Task 3: 运行构建并验证结果（依赖 T2）

Critical Path: T1 → T2 → T3
```

---

## TODOs

- [x] 1. 移动 case 目录到 reports/case/

  **What to do**:
  1. 确认根目录的 `case/` 存在且包含 `index.html` 和 `assets/`
  2. 使用 `mv case/ reports/case/` 移动目录
  3. 确认 `reports/case/` 目录结构完整

  **Must NOT do**:
  - 不修改 case 内部的任何文件
  - 不删除任何现有文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的文件移动操作
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1（顺序）
  - **Blocks**: Task 2
  - **Blocked By**: None（可立即开始）

  **References**:
  - 源目录: `./case/`（根目录）
  - 目标目录: `./reports/case/`
  - 当前 reports 目录内容: `20260303.html`, `20260311.html`, `20260326.html`

  **Acceptance Criteria**:
  - [ ] `reports/case/` 目录存在
  - [ ] `reports/case/index.html` 文件存在
  - [ ] `reports/case/assets/` 目录存在且包含 JS/CSS 文件
  - [ ] 原根目录的 `case/` 已不存在

  **QA Scenarios**:

  ```
  Scenario: 验证目录移动成功
    Tool: Bash (ls命令)
    Preconditions: 无
    Steps:
      1. 运行: ls -la reports/case/
      2. 验证输出包含: index.html 和 assets/
      3. 运行: ls -la case/ 2>&1
      4. 验证输出显示: No such file or directory
    Expected Result: case 目录成功移动到 reports/case/，原位置已删除
    Evidence: .sisyphus/evidence/task-1-directory-move.txt
  ```

  **Evidence to Capture**:
  - [ ] 目录列表输出截图/文本

  **Commit**: YES
  - Message: `chore: move case directory to reports/case/`
  - Files: `reports/case/`
  - Pre-commit: 无

---

- [x] 2. 修改 generate-index.js 支持 case 链接

  **What to do**:
  1. 读取当前的 `generate-index.js`
  2. 修改脚本逻辑：
     - 扫描 reports 目录时，除了 `.html` 文件，还要识别 `case/` 目录
     - 对 `case/` 目录生成特殊链接：`/reports/case/`
     - 显示名称为："2026-3投资战略备忘录"
     - 保持与 HTML 报告相同的排序逻辑（按文件名降序，case 应该排在哪里？建议手动置顶或按字母排序）
  3. 建议实现方式：
     - 在扫描文件后，手动添加 case 条目
     - 使用特殊标记或放在列表最前面

  **Must NOT do**:
  - 不改变现有 HTML 报告的显示逻辑
  - 不删除现有功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的脚本修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1（顺序）
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - 原脚本: `generate-index.js`（51行）
  - 关键代码段:
    ```javascript
    const files = fs
      .readdirSync(reportsDir)
      .filter((f) => f.endsWith(".html"))
      .sort((a, b) => b.localeCompare(a));
    ```
  - 期望的 case 链接: `<a href="/reports/case/" ...>2026-3投资战略备忘录</a>`

  **Acceptance Criteria**:
  - [ ] 脚本成功读取 `reports/case/` 目录
  - [ ] 生成的首页包含指向 `/reports/case/` 的链接
  - [ ] 链接显示文本为 "2026-3投资战略备忘录"
  - [ ] 现有 HTML 报告链接不受影响

  **QA Scenarios**:

  ```
  Scenario: 验证脚本逻辑修改正确
    Tool: Bash (node命令)
    Preconditions: Task 1 已完成（reports/case/ 存在）
    Steps:
      1. 运行: node generate-index.js
      2. 验证输出: [Success] 索引已生成，共挂载 4 份报告。
      3. 读取生成的 index.html
      4. 验证内容包含: href="/reports/case/"
      5. 验证内容包含: 2026-3投资战略备忘录
    Expected Result: 脚本成功生成包含 case 链接的首页
    Evidence: .sisyphus/evidence/task-2-script-output.txt
  ```

  **Evidence to Capture**:
  - [ ] 脚本运行输出
  - [ ] 生成的 index.html 内容片段

  **Commit**: YES
  - Message: `feat: add case directory link to index generator`
  - Files: `generate-index.js`
  - Pre-commit: `node generate-index.js`（测试脚本能运行）

---

- [x] 3. 验证整合结果

  **What to do**:
  1. 运行 `node generate-index.js` 重新生成首页
  2. 启动本地服务器验证（如 `npx serve .` 或 `python -m http.server`）
  3. 打开首页，确认：
     - 能看到 "2026-3投资战略备忘录" 链接
     - 链接位置合适（建议置顶或按排序规则）
     - 现有报告链接正常
  4. 点击 case 链接，验证：
     - 页面能加载（显示 "市场备忘录 2026.3-4"）
     - 样式正确（CSS 加载）
     - 交互正常（JS 加载）

  **Must NOT do**:
  - 不修改 case 内部文件来"修复"问题（如有问题应回滚检查路径）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 验证任务
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1（顺序）
  - **Blocks**: 无
  - **Blocked By**: Task 2

  **References**:
  - 首页文件: `index.html`（生成后）
  - case 首页: `reports/case/index.html`
  - case 资源: `reports/case/assets/`

  **Acceptance Criteria**:
  - [ ] 首页显示 "2026-3投资战略备忘录" 链接
  - [ ] 链接可点击且跳转到正确路径
  - [ ] case 页面正常加载（无 404）
  - [ ] case 页面样式和交互正常
  - [ ] 现有报告链接正常工作

  **QA Scenarios**:

  ```
  Scenario: 验证首页显示正确
    Tool: Browser (Playwright / 手动)
    Preconditions: 已运行 node generate-index.js
    Steps:
      1. 启动本地服务器: npx serve . -p 3000
      2. 访问: http://localhost:3000
      3. 验证页面包含文本: "2026-3投资战略备忘录"
      4. 验证链接 href: "/reports/case/"
      5. 截图保存
    Expected Result: 首页正确显示 case 入口链接
    Evidence: .sisyphus/evidence/task-3-homepage.png
  ```

  ```
  Scenario: 验证 case 页面可访问
    Tool: Browser (Playwright / 手动)
    Preconditions: 本地服务器运行中
    Steps:
      1. 点击 "2026-3投资战略备忘录" 链接
      2. 验证 URL: http://localhost:3000/reports/case/
      3. 验证页面标题: "市场备忘录 2026.3-4"
      4. 验证页面内容加载（非空白页）
      5. 检查 Console 无 404 错误（特别是 assets 加载）
      6. 截图保存
    Expected Result: case 页面完整加载，CSS/JS 资源正确
    Evidence: .sisyphus/evidence/task-3-case-page.png
  ```

  ```
  Scenario: 验证现有报告不受影响
    Tool: Browser (Playwright / 手动)
    Preconditions: 本地服务器运行中
    Steps:
      1. 返回首页
      2. 点击任意现有报告（如 20260326）
      3. 验证报告正常打开
      4. 截图保存
    Expected Result: 现有报告功能完整
    Evidence: .sisyphus/evidence/task-3-existing-report.png
  ```

  **Evidence to Capture**:
  - [ ] 首页截图（显示 case 链接）
  - [ ] case 页面截图
  - [ ] Console 面板截图（验证无 404 错误）
  - [ ] 现有报告截图

  **Commit**: YES
  - Message: `chore: regenerate index with case integration`
  - Files: `index.html`
  - Pre-commit: 无

---

## Final Verification Wave

> 单任务无需并行审查，但建议确认以下检查点：

- [ ] F1. **目录结构检查**
  确认 `reports/case/` 结构完整，assets 文件未损坏。
  检查命令: `find reports/case -type f | wc -l`（应输出 3+ 文件）

- [ ] F2. **链接有效性检查**
  确认所有链接可点击，无 404 错误。
  检查方法: 在浏览器中点击测试，检查 Network 面板。

- [ ] F3. **路径正确性检查**
  确认 case 的 assets 路径是相对路径且正确。
  检查内容: `reports/case/index.html` 中的 `src="./assets/..."` 保持不变。

---

## Commit Strategy

- **1**: `chore: move case directory to reports/case/` — 移动目录
- **2**: `feat: add case directory link to index generator` — 修改脚本
- **3**: `chore: regenerate index with case integration` — 生成首页

---

## Success Criteria

### Verification Commands
```bash
# 1. 检查目录结构
ls -la reports/case/
ls -la reports/case/assets/

# 2. 重新生成首页
node generate-index.js

# 3. 本地验证
npx serve . -p 3000
# 然后访问 http://localhost:3000 和 http://localhost:3000/reports/case/
```

### Final Checklist
- [ ] `reports/case/` 目录存在且结构完整
- [ ] `generate-index.js` 支持 case 链接生成
- [ ] 首页显示 "2026-3投资战略备忘录" 链接
- [ ] 链接指向 `/reports/case/`
- [ ] case 页面能正常加载和显示
- [ ] 现有报告不受影响

---

## 附：generate-index.js 修改建议

### 修改思路
在原脚本的基础上，添加对 `case/` 目录的特殊处理：

```javascript
// 在生成 files 数组后，添加 case 条目
const caseEntry = {
  type: 'case',
  name: '2026-3投资战略备忘录',
  href: '/reports/case/',
  sortKey: '9999-99-99' // 确保排序在最前或指定位置
};

// 在渲染时特殊处理 case 类型
```

### 最小改动方案
如果不想大幅修改脚本逻辑，可以直接在 HTML 模板中硬编码 case 链接：

```javascript
// 在 map 函数之前，先添加 case 链接
const caseLink = `<a href="/reports/case/" target="_blank">2026-3投资战略备忘录</a>`;

// 然后合并到 files 的 map 结果中
const links = [caseLink, ...files.map(...)];
```

具体实现由执行者决定，只要达到效果即可。
