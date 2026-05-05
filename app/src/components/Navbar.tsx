import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Moon, Sun, Printer, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
  onSearch: (query: string) => void;
  onNavigateMatch: (direction: "next" | "prev") => void;
  matchCount: number;
  currentMatch: number;
  sections: { id: string; title: string }[];
  activeSection: string;
  onScrollTo: (id: string) => void;
}

export default function Navbar({
  isDark,
  onToggleDark,
  onSearch,
  onNavigateMatch,
  matchCount,
  currentMatch,
  sections,
  activeSection,
  onScrollTo,
}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchQuery(val);
      onSearch(val);
    },
    [onSearch]
  );

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
    setSearchOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm print:hidden">
      <div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold whitespace-nowrap hidden sm:block">
            中国产业升级投资报告
          </h1>
          <h1 className="text-sm font-bold whitespace-nowrap sm:hidden">投研报告</h1>
        </div>

        {/* Center: Section links (desktop) */}
        <div className="hidden lg:flex items-center gap-1 text-xs">
          {sections.slice(0, 6).map((section) => (
            <button
              key={section.id}
              onClick={() => onScrollTo(section.id)}
              className={`px-2 py-1 rounded transition-colors ${
                activeSection === section.id
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {section.title.slice(0, 8)}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-1">
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="搜索报告内容..."
                  className="h-8 w-48 text-xs"
                />
                {matchCount > 0 && (
                  <span className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                    {currentMatch + 1}/{matchCount}
                  </span>
                )}
                {matchCount > 0 && (
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onNavigateMatch("prev")}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onNavigateMatch("next")}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={clearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Dark mode */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleDark}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Print */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
