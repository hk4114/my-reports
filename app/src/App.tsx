import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Lightbox from "@/components/Lightbox";
import SortableTable from "@/components/SortableTable";
import CompanyFilter from "@/components/CompanyFilter";
import PortfolioCalculator from "@/components/PortfolioCalculator";
import { reportSections } from "@/data/report";
import { charts } from "@/data/charts";
import {
  coreConclusionsTable,
  fiveIndustriesTable,
  capitalMigrationTable,
  profitDistributionTable,
  comprehensiveComparisonTable,
  trackingMetricsTable,
  fiveSourcesTable,
  riskTrapTable,
} from "@/data/tables";
import { Calendar, ChevronDown } from "lucide-react";

const tableMap: Record<string, typeof coreConclusionsTable> = {
  core_conclusions: coreConclusionsTable,
  five_industries: fiveIndustriesTable,
  capital_migration: capitalMigrationTable,
  profit_distribution: profitDistributionTable,
  comprehensive_comparison: comprehensiveComparisonTable,
  tracking_metrics: trackingMetricsTable,
  five_sources: fiveSourcesTable,
  risk_trap: riskTrapTable,
};

export default function App() {
  const { isDark, toggle } = useDarkMode();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [, setSearchQuery] = useState("");
  const [matchIndices, setMatchIndices] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track active section via intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((prev, curr) =>
            prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
          );
          setActiveSection(topmost.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Scroll to section
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 56;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  // Search highlighting
  const performSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        // Remove all highlights
        document.querySelectorAll("mark.search-highlight").forEach((el) => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ""), el);
            parent.normalize();
          }
        });
        setMatchIndices([]);
        setCurrentMatchIndex(0);
        return;
      }

      // Remove previous highlights
      document.querySelectorAll("mark.search-highlight").forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ""), el);
          parent.normalize();
        }
      });

      const walker = document.createTreeWalker(
        contentRef.current!,
        NodeFilter.SHOW_TEXT,
        null
      );
      const nodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        if (
          node.parentElement &&
          !node.parentElement.closest("mark") &&
          !node.parentElement.closest("nav") &&
          !node.parentElement.closest("aside") &&
          node.textContent
        ) {
          nodes.push(node as Text);
        }
      }

      const regex = new RegExp(
        query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      const indices: number[] = [];
      let globalCount = 0;

      nodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        const matches = Array.from(text.matchAll(regex));
        if (matches.length === 0) return;

        const parent = textNode.parentNode!;
        let lastIndex = 0;
        const fragments: (Text | HTMLElement)[] = [];

        matches.forEach((match) => {
          const start = match.index!;
          const end = start + match[0].length;

          if (start > lastIndex) {
            fragments.push(document.createTextNode(text.slice(lastIndex, start)));
          }

          const mark = document.createElement("mark");
          mark.className = "search-highlight";
          mark.style.backgroundColor = isDark ? "#713f12" : "#fef3c7";
          mark.style.color = "inherit";
          mark.textContent = text.slice(start, end);
          fragments.push(mark);
          indices.push(globalCount++);
        });

        if (lastIndex < text.length) {
          fragments.push(document.createTextNode(text.slice(lastIndex)));
        }

        fragments.forEach((frag) => parent.insertBefore(frag, textNode));
        parent.removeChild(textNode);
      });

      setMatchIndices(indices);
      setCurrentMatchIndex(0);

      // Scroll to first match
      if (indices.length > 0) {
        const firstMark = document.querySelector("mark.search-highlight");
        if (firstMark) {
          firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    },
    [isDark]
  );

  const navigateMatch = useCallback(
    (direction: "next" | "prev") => {
      if (matchIndices.length === 0) return;
      let nextIndex = currentMatchIndex;
      if (direction === "next") {
        nextIndex = (currentMatchIndex + 1) % matchIndices.length;
      } else {
        nextIndex = (currentMatchIndex - 1 + matchIndices.length) % matchIndices.length;
      }
      setCurrentMatchIndex(nextIndex);
      const marks = document.querySelectorAll("mark.search-highlight");
      if (marks[nextIndex]) {
        marks[nextIndex].scrollIntoView({ behavior: "smooth", block: "center" });
        (marks[nextIndex] as HTMLElement).style.outline = "2px solid #2563eb";
        setTimeout(() => {
          (marks[nextIndex] as HTMLElement).style.outline = "none";
        }, 1500);
      }
    },
    [matchIndices.length, currentMatchIndex]
  );

  // Chart lightbox handlers
  const openLightbox = useCallback((chartId: string) => {
    const idx = charts.findIndex((c) => c.id === chartId);
    if (idx >= 0) {
      setCurrentChartIndex(idx);
      setLightboxOpen(true);
    }
  }, []);

  const nextChart = useCallback(() => {
    setCurrentChartIndex((prev) => (prev + 1) % charts.length);
  }, []);

  const prevChart = useCallback(() => {
    setCurrentChartIndex((prev) => (prev - 1 + charts.length) % charts.length);
  }, []);

  const sectionList = useMemo(
    () =>
      reportSections.map((s) => ({
        id: s.id,
        title: s.title,
        level: s.level,
      })),
    []
  );

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors`}>
      <Navbar
        isDark={isDark}
        onToggleDark={toggle}
        onSearch={performSearch}
        onNavigateMatch={navigateMatch}
        matchCount={matchIndices.length}
        currentMatch={currentMatchIndex}
        sections={sectionList}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
      />

      <Lightbox
        open={lightboxOpen}
        currentIndex={currentChartIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={nextChart}
        onPrev={prevChart}
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-20 pb-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-slate-400 mb-4 flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            2026年5月3日
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            中国新一轮产业升级浪潮投资报告
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            五大产业方向 · 六维度评分 · 38个投资标的 · 三档组合方案
          </p>
          <button
            onClick={() => scrollToSection("executive-summary")}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            向下滚动阅读 <ChevronDown className="h-4 w-4 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-screen-2xl px-4 py-8 flex gap-8">
        <Sidebar
          sections={sectionList}
          activeSection={activeSection}
          onScrollTo={scrollToSection}
        />

        <main ref={contentRef} className="flex-1 min-w-0 max-w-5xl">
          {reportSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              data-section
              className="mb-12 scroll-mt-20"
            >
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 dark:border-slate-700">
                {section.title}
              </h2>

              {section.content.map((paragraph, idx) => {
                if (paragraph.startsWith("### ")) {
                  return (
                    <h4 key={idx} className="text-lg font-semibold mt-6 mb-3">
                      {paragraph.replace("### ", "")}
                    </h4>
                  );
                }
                if (paragraph.startsWith("## ")) {
                  return (
                    <h3 key={idx} className="text-xl font-semibold mt-6 mb-3">
                      {paragraph.replace("## ", "")}
                    </h3>
                  );
                }
                if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                  return (
                    <p
                      key={idx}
                      className="my-4 text-base font-semibold text-gray-800 dark:text-slate-200"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(paragraph) }}
                    />
                  );
                }
                return (
                  <p
                    key={idx}
                    className="my-4 text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(paragraph) }}
                  />
                );
              })}

              {/* Render tables */}
              {section.tables?.map((tableId) => {
                const table = tableMap[tableId];
                if (!table) return null;
                if (tableId === "company_pool") {
                  return <CompanyFilter key={tableId} />;
                }
                return <SortableTable key={tableId} table={table} />;
              })}

              {/* Render charts */}
              {section.charts?.map((chartId) => {
                const chart = charts.find((c) => c.id === chartId);
                if (!chart) return null;
                return (
                  <div key={chartId} className="my-8">
                    <div
                      className="rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openLightbox(chartId)}
                    >
                      <img
                        src={chart.src}
                        alt={chart.title}
                        className="w-full rounded"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-2 text-sm text-center font-medium text-gray-700 dark:text-slate-300">
                      {chart.title}
                    </p>
                    {chart.caption && (
                      <p className="mt-1 text-xs text-center text-gray-500 dark:text-slate-400 italic">
                        {chart.caption}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Portfolio Calculator after ch6 */}
              {section.id === "ch6-portfolio" && <PortfolioCalculator />}
            </section>
          ))}

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-slate-400 text-center">
            <p>报告日期：2026年5月3日 · 数据截止日期：2026年4月30日</p>
            <p className="mt-2">
              本报告分析基于公开可获取数据，前瞻性判断不构成对实际市场走势的承诺。
            </p>
            <p className="mt-1 text-xs">
              数据来源：各公司年报、券商研报、Wind、新浪财经、华证指数、上交所公告
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\^\d+\^/g, "")
    .replace(/\[\^(.*?)\^\]/g, "");
  return html;
}
