interface SidebarProps {
  sections: { id: string; title: string; level: number }[];
  activeSection: string;
  onScrollTo: (id: string) => void;
}

export default function Sidebar({ sections, activeSection, onScrollTo }: SidebarProps) {
  return (
    <aside className="hidden xl:block w-64 flex-shrink-0">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          目录
        </p>
        <nav className="space-y-0.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onScrollTo(section.id)}
              className={`block w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                section.level > 1 ? "pl-5 text-xs" : "font-medium"
              } ${
                activeSection === section.id
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
