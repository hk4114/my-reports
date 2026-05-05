import { useState, useMemo } from "react";
import { companyPoolTable } from "@/data/tables";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

const marketOptions = ["全部", "A股", "港股", "美股"];
const ratingOptions = ["全部", "强烈关注", "谨慎买入", "持有观察", "等待回调", "回避"];
const riskOptions = ["全部", "低", "中低", "中", "中高", "高"];

export default function CompanyFilter() {
  const [market, setMarket] = useState("全部");
  const [rating, setRating] = useState("全部");
  const [risk, setRisk] = useState("全部");

  const filteredRows = useMemo(() => {
    return companyPoolTable.rows.filter((row) => {
      const matchMarket = market === "全部" || row["市场"] === market;
      const matchRating = rating === "全部" || row["建议动作"] === rating;
      const matchRisk = risk === "全部" || row["风险等级"] === risk;
      return matchMarket && matchRating && matchRisk;
    });
  }, [market, rating, risk]);

  const hasFilters = market !== "全部" || rating !== "全部" || risk !== "全部";

  const clearFilters = () => {
    setMarket("全部");
    setRating("全部");
    setRisk("全部");
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "强烈关注":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "谨慎买入":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "持有观察":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "等待回调":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "回避":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const getValuationColor = (val: string) => {
    switch (val) {
      case "低估":
        return "text-green-600 dark:text-green-400 font-medium";
      case "合理":
        return "text-gray-700 dark:text-slate-300";
      case "高估":
        return "text-red-600 dark:text-red-400 font-medium";
      default:
        return "";
    }
  };

  const FilterGroup = ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}:</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === opt
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="my-6">
      {/* Filter bar */}
      <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold">标的筛选器</span>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-3 w-3" /> 清除筛选
            </button>
          )}
        </div>
        <FilterGroup label="市场" options={marketOptions} value={market} onChange={setMarket} />
        <FilterGroup label="建议动作" options={ratingOptions} value={rating} onChange={setRating} />
        <FilterGroup label="风险等级" options={riskOptions} value={risk} onChange={setRisk} />
        <p className="text-xs text-gray-500 dark:text-slate-400">
          显示 {filteredRows.length} / {companyPoolTable.rows.length} 个标的
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-900 dark:border-gray-100">
              <th className="px-3 py-3 text-left font-semibold">标的</th>
              <th className="px-3 py-3 text-left font-semibold">市场</th>
              <th className="px-3 py-3 text-left font-semibold">所属方向</th>
              <th className="px-3 py-3 text-left font-semibold">核心指标</th>
              <th className="px-3 py-3 text-left font-semibold">估值</th>
              <th className="px-3 py-3 text-left font-semibold">风险</th>
              <th className="px-3 py-3 text-left font-semibold">建议</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-3 py-3 font-medium whitespace-nowrap">{row["标的"]}</td>
                <td className="px-3 py-3 whitespace-nowrap">{row["市场"]}</td>
                <td className="px-3 py-3 whitespace-nowrap">{row["所属方向"]}</td>
                <td className="px-3 py-3 max-w-xs truncate" title={row["核心指标"]}>
                  {row["核心指标"]}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap ${getValuationColor(row["当前估值判断"])}`}>
                  {row["当前估值判断"]}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">{row["风险等级"]}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <Badge className={getRatingColor(row["建议动作"])} variant="outline">
                    {row["建议动作"]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
