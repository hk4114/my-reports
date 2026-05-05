export interface ChartInfo {
  id: string;
  src: string;
  title: string;
  caption?: string;
}

export const charts: ChartInfo[] = [
  { id: `chart_credit_shift`, src: `/assets/chart_credit_shift.png`, title: `信用派生机制切换：政府债券扩张 vs 房地产贷款收缩`, caption: `2019-2026年社会融资结构变迁：政府债券占社融存量比重从15.0%攀升至21.6%，房地产相关贷款占比从28.7%回落至20.5%` },
  { id: `chart_five_sources`, src: `/assets/chart_five_sources.png`, title: `五路资金来源：规模、增速与确定性三维比较`, caption: `政策驱动与财政资金合计约6.8万亿/年，是产业升级资金的主体` },
  { id: `radar_chart`, src: `/assets/radar_chart.png`, title: `五大产业方向六维度评分雷达图`, caption: `数据来源：各维度研究报告汇总，评分截至2026年5月` },
  { id: `composite_scores`, src: `/assets/composite_scores.png`, title: `五大产业方向综合评分对比`, caption: `虚线为配置参考线（3.5分），高于此线方向建议积极关注` },
  { id: `fig3_1_profit_margins`, src: `/assets/fig3_1_profit_margins.png`, title: `产业升级核心产业链环节利润率对比`, caption: `GPU芯片设计（英伟达毛利率75%）与AI服务器代工（工业富联毛利率5.7%）之间利润率差距高达12倍以上` },
  { id: `fig_sec04_profit_vs_pe`, src: `/assets/fig_sec04_profit_vs_pe.png`, title: `产业升级核心标的：利润增速 vs 估值水平`, caption: `气泡大小反映市值对数。左上角高增速·低估值区以中际旭创、美团为代表` },
  { id: `fig_sec04_etf_valuation`, src: `/assets/fig_sec04_etf_valuation.png`, title: `主要指数与ETF估值历史分位对比`, caption: `截至2026年4月，A股科技ETF估值处于历史85%-99%分位` },
  { id: `chart5_1_revenue_profit_growth`, src: `/assets/chart5_1_revenue_profit_growth.png`, title: `重点公司2025年营收与净利润增速对比`, caption: `从营收与净利润增速的剪刀差可清晰识别三类公司` },
  { id: `chart5_2_margin_comparison`, src: `/assets/chart5_2_margin_comparison.png`, title: `重点公司毛利率与净利率对比`, caption: `毛利率与净利率的差距揭示了不同公司的费用结构与盈利效率` },
  { id: `chart5_3_pe_comparison`, src: `/assets/chart5_3_pe_comparison.png`, title: `重点公司估值水平（PE-TTM）对比`, caption: `估值分层特征鲜明，第一梯队低PE+高成长风险收益比最优` },
  { id: `portfolio_risk_return`, src: `/assets/portfolio_risk_return.png`, title: `三档组合风险收益定位`, caption: `保守型组合预期年化4%-7%、最大回撤<8%；均衡型预期8%-12%、最大回撤<15%；进攻型预期12%-18%、最大回撤<25%` },
  { id: `portfolio_allocation_structure`, src: `/assets/portfolio_allocation_structure.png`, title: `三档组合资产结构对比`, caption: `保守型权益类占比40%，均衡型75%，进攻型90%` },
  { id: `fig_ch07_thresholds`, src: `/assets/fig_ch07_thresholds.png`, title: `四大方向核心资产：当前状态 vs 操作阈值`, caption: `截至2026年5月，电网招标同比增速（+25.3%）已处于触发减仓区间之上` },
  { id: `fig8_1_valuation_trap`, src: `/assets/fig8_1_valuation_trap.png`, title: `概念炒作标的：高估值 vs 实际业绩增速`, caption: `科大讯飞营收增速16%、PE 130倍，属低增长+极高估值陷阱` },
  { id: `fig8_2_policy_lag`, src: `/assets/fig8_2_policy_lag.png`, title: `政策→股价→订单→利润四阶段滞后与散户追高陷阱`, caption: `散户典型买入时点恰好落在政策最热、股价最高区域` },
  { id: `chart9_1_risk_return`, src: `/assets/chart9_1_risk_return.png`, title: `三条主线与三类回避机会的 收益-确定性 定位`, caption: `能源网络位于高确定性区间，算力硬件处于中等确定性边界` },
  { id: `chart9_2_portfolio_default`, src: `/assets/chart9_2_portfolio_default.png`, title: `普通投资者默认配置方案（均衡型）`, caption: `均衡型组合将75%权益仓位分布于A股宽基和行业主题` },
];
