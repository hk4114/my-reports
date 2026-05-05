import { useState, useMemo, useCallback } from "react";
import type { ReportTable } from "@/data/tables";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableTableProps {
  table: ReportTable;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

function parseCellValue(value: string): number | string {
  const numMatch = value.match(/([-\d,.]+)/);
  if (!numMatch) return value.toLowerCase();
  const cleaned = numMatch[1].replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? value.toLowerCase() : num;
}

export default function SortableTable({ table, className = "" }: SortableTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        if (sortDir === "asc") {
          setSortDir("desc");
        } else if (sortDir === "desc") {
          setSortKey(null);
          setSortDir(null);
        } else {
          setSortDir("asc");
        }
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey, sortDir]
  );

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir || !table.sortable) return table.rows;
    return [...table.rows].sort((a, b) => {
      const aVal = parseCellValue(a[sortKey] || "");
      const bVal = parseCellValue(b[sortKey] || "");
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [table.rows, sortKey, sortDir, table.sortable]);

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    if (sortDir === "asc") return <ArrowUp className="ml-1 h-3 w-3" />;
    if (sortDir === "desc") return <ArrowDown className="ml-1 h-3 w-3" />;
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  };

  return (
    <div className={`overflow-x-auto my-6 ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-900 dark:border-gray-100">
            {table.headers.map((header) => (
              <th
                key={header}
                className={`px-4 py-3 text-left font-semibold whitespace-nowrap ${
                  table.sortable
                    ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    : ""
                }`}
                onClick={() => table.sortable && handleSort(header)}
              >
                <span className="flex items-center">
                  {header}
                  {table.sortable && getSortIcon(header)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {table.headers.map((header) => (
                <td key={header} className="px-4 py-3 whitespace-nowrap">
                  {row[header] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.caption && (
        <p className="mt-2 text-xs text-gray-500 dark:text-slate-400 italic">{table.caption}</p>
      )}
    </div>
  );
}
