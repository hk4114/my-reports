import { useState, useMemo } from "react";
import { portfolioSchemes, type PortfolioItem, type PortfolioScheme } from "@/data/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrendingUp, Shield, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AllocationItem extends PortfolioItem {
  amount: number;
}

function formatAmount(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}亿`;
  }
  return `${value.toFixed(2)}万`;
}

export default function PortfolioCalculator() {
  const [principal, setPrincipal] = useState<number>(100);

  return (
    <div className="my-6 space-y-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold whitespace-nowrap">投入本金：</label>
        <Input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
          className="w-40"
          min={0}
          step={10}
        />
        <span className="text-sm text-gray-500 dark:text-slate-400">万元</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {portfolioSchemes.map((scheme) => (
          <PortfolioCard key={scheme.id} scheme={scheme} principal={principal} />
        ))}
      </div>
    </div>
  );
}

function PortfolioCard({ scheme, principal }: { scheme: PortfolioScheme; principal: number }) {
  const allocations = useMemo(() => {
    return scheme.items.map((item) => ({
      ...item,
      amount: (principal * item.ratio) / 100,
    }));
  }, [scheme.items, principal]);

  const total = allocations.reduce((sum, item) => sum + item.amount, 0);

  const getIcon = () => {
    switch (scheme.id) {
      case "conservative":
        return <Shield className="h-5 w-5 text-green-600" />;
      case "balanced":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "aggressive":
        return <Zap className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (scheme.id) {
      case "conservative":
        return "border-green-200 dark:border-green-900";
      case "balanced":
        return "border-blue-200 dark:border-blue-900";
      case "aggressive":
        return "border-orange-200 dark:border-orange-900";
      default:
        return "";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={`${getBorderColor()} border-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
          <CardHeader className="pb-3 px-4">
            <div className="flex items-center gap-2">
              {getIcon()}
              <CardTitle className="text-lg">{scheme.name}</CardTitle>
            </div>
            <div className="flex items-center gap-4 text-sm mt-1">
              <span className="text-gray-600 dark:text-slate-400">
                预期收益: <span className="font-semibold text-gray-900 dark:text-slate-100">{scheme.expectedReturn}</span>
              </span>
              <span className="text-gray-600 dark:text-slate-400">
                最大回撤: <span className="font-semibold text-gray-900 dark:text-slate-100">{scheme.maxDrawdown}</span>
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <PortfolioDetails allocations={allocations} total={total} scheme={scheme} />
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[50vw] p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-2">
              {getIcon()}
              <DialogTitle className="text-2xl">{scheme.name}</DialogTitle>
            </div>
            <div className="flex items-center gap-6 text-base mt-2">
              <span className="text-gray-600 dark:text-slate-400">
                预期收益: <span className="font-semibold text-gray-900 dark:text-slate-100">{scheme.expectedReturn}</span>
              </span>
              <span className="text-gray-600 dark:text-slate-400">
                最大回撤: <span className="font-semibold text-gray-900 dark:text-slate-100">{scheme.maxDrawdown}</span>
              </span>
            </div>
          </DialogHeader>
          <div className="mt-4">
            <PortfolioDetails allocations={allocations} total={total} scheme={scheme} isDialog />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PortfolioDetails({ 
  allocations, 
  total, 
  scheme,
  isDialog = false 
}: { 
  allocations: AllocationItem[]; 
  total: number; 
  scheme: PortfolioScheme;
  isDialog?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className={`grid grid-cols-12 gap-2 text-gray-500 dark:text-slate-400 pb-2 border-b border-gray-100 dark:border-slate-700 font-medium ${isDialog ? 'text-sm' : 'text-xs'}`}>
        <div className="col-span-4">标的</div>
        <div className="col-span-2">代码</div>
        <div className="col-span-1 text-right">比例</div>
        <div className="col-span-3 text-right">配置金额</div>
        <div className="col-span-2 text-right">费率</div>
      </div>
      {allocations.map((item, idx) => (
        <div
          key={idx}
          className={`grid grid-cols-12 gap-2 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded transition-colors ${isDialog ? 'text-base' : 'text-sm'}`}
        >
          <div className="col-span-4 font-medium truncate" title={item.name}>
            {item.name}
          </div>
          <div className="col-span-2 text-gray-500 dark:text-slate-400">{item.code}</div>
          <div className="col-span-1 text-right">{item.ratio}%</div>
          <div className="col-span-3 text-right font-mono">{formatAmount(item.amount)}</div>
          <div className="col-span-2 text-right text-gray-500 dark:text-slate-400">{item.fee}</div>
        </div>
      ))}
      <div className={`grid grid-cols-12 gap-2 pt-2 border-t border-gray-200 dark:border-slate-700 font-semibold ${isDialog ? 'text-base' : 'text-sm'}`}>
        <div className="col-span-6">合计</div>
        <div className="col-span-1 text-right">100%</div>
        <div className="col-span-3 text-right font-mono">{formatAmount(total)}</div>
        <div className="col-span-2" />
      </div>
      <p className={`mt-3 text-gray-500 dark:text-slate-400 ${isDialog ? 'text-sm' : 'text-xs'}`}>
        {scheme.equityRatio}%权益 · {scheme.fixedIncomeRatio}%固收 · {scheme.reitRatio}%REITs · {scheme.stockRatio}%个股 · {scheme.crossBorderRatio}%跨境
      </p>
    </div>
  );
}
