import React, { useState } from 'react';
import { ArrowDownRight, TrendingUp, Download, MoreHorizontal, LayoutGrid, CheckCircle, Clock, Users, Activity, BarChart2, PieChart as PieIcon, ActivitySquare, Globe } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Helper components & functions
const Placeholder = ({ text = "Visualization not available for this data shape" }) => (
    <div className="flex items-center justify-center h-full bg-slate-50/5 rounded-2xl border border-dashed border-slate-500/20">
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{text}</p>
    </div>
);

const SectionHeader = ({ title }) => (
    <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-white text-sm uppercase tracking-widest opacity-80">{title}</h4>
        <MoreHorizontal className="w-5 h-5 text-app-textMuted" />
    </div>
);

// ------------------------------------------------------------------
// 1. Finance Layout (Reference: Xero Billing Dashboard)
// ------------------------------------------------------------------
export const FinanceLayout = ({ data, kpis, allCharts, domainConfig, renderChart, formatNumber, MetricCard }) => {
    // Finance loves solid KPI blocks, wide horizontal bar charts, and pie charts
    const barCharts = allCharts.filter(c => c.chart_type === 'bar' || c.chart_type === 'histogram');
    const pieCharts = allCharts.filter(c => c.chart_type === 'pie');
    
    // Pick the most relevant charts for the top slots
    const mainBar = barCharts[0] || allCharts.find(c => c.chart_type !== 'pie');
    const mainPie = pieCharts[0] || allCharts.find(c => c !== mainBar);
    const otherCharts = allCharts.filter(c => c !== mainBar && c !== mainPie && c.chart_type !== 'geo_map');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top KPI row - Solid Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.slice(0, 4).map((kpi, idx) => {
                    // Inject specific vibrant tones based on the Xero reference image
                    const bgColors = ['bg-blue-700', 'bg-sky-500', 'bg-emerald-500', 'bg-purple-600'];
                    return (
                        <div key={idx} className={`rounded-xl p-6 relative overflow-hidden text-white shadow-xl ${bgColors[idx]}`}>
                            <div className="relative z-10">
                                <p className="text-sm font-semibold opacity-90 mb-1">{kpi.name}</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-3xl font-black tracking-tight">{formatNumber(kpi.value)}</h3>
                                    <div className="text-xs pb-1 opacity-75 font-semibold text-white/70 italic">in home currency</div>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                        </div>
                    );
                })}
            </div>

            {/* Middle Row - Wide Bar + Pie */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white flex flex-col rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h4 className="font-bold text-gray-800 tracking-tight">{mainBar?.title || 'Financial Distribution'}</h4>
                        <span className="text-xs text-gray-400 italic">in home currency</span>
                    </div>
                    <div className="flex-1 p-6 h-[400px]">
                        {mainBar ? renderChart(mainBar) : <Placeholder />}
                    </div>
                </div>
                <div className="bg-white flex flex-col rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h4 className="font-bold text-gray-800 tracking-tight mb-4">{mainPie?.title || 'Composition'}</h4>
                        <div className="h-[300px]">
                            {mainPie ? renderChart(mainPie) : <Placeholder />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Other charts masquerading as detailed tables */}
            {otherCharts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {otherCharts.map((chart, idx) => (
                         <div key={idx} className="bg-white rounded-xl flex flex-col p-6 min-h-[300px] shadow-sm">
                             <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-gray-800 text-sm tracking-tight">{chart.title}</h4>
                                <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded">in home currency</span>
                             </div>
                             <div className="flex-1 w-full h-[250px]">
                                 {renderChart(chart)}
                             </div>
                         </div>
                     ))}
                </div>
            )}
        </div>
    );
};

// ------------------------------------------------------------------
// 2. Marketing Layout (Reference: Organic Traffic Google Data Studio)
// ------------------------------------------------------------------
export const MarketingLayout = ({ data, kpis, allCharts, domainConfig, renderChart, formatNumber, MetricCard }) => {
    // Marketing loves big traffic cards, conversion funnels (bar/area), and source leaderboards
    const areaCharts = allCharts.filter(c => c.chart_type === 'area' || c.chart_type === 'line');
    const pieCharts = allCharts.filter(c => c.chart_type === 'pie');
    
    const mainTraffic = areaCharts[0] || allCharts.find(c => c.chart_type !== 'pie' && c.chart_type !== 'scatter');
    const sourcePie = pieCharts[0];
    const restCharts = allCharts.filter(c => c !== mainTraffic && c !== sourcePie && c.chart_type !== 'geo_map');

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white text-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* Header Banner */}
            <div className="bg-[#364954] text-white p-4 font-bold text-xl tracking-wide w-full shadow-md -mx-6 -mt-6 rounded-t-2xl px-8 mb-6">
                ORGANIC TRAFFIC OVERVIEW
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Left: Main Number & Small Bar */}
                <div className="flex flex-col border border-gray-200 rounded p-6 shadow-sm relative">
                    <SectionHeader title="SESSIONS FROM ORGANIC" />
                    <div className="flex-1 flex flex-col items-center justify-center -mt-4">
                        <h2 className="text-5xl font-light text-gray-700 mb-6">{formatNumber(kpis[0]?.value || 0)}</h2>
                        <div className="w-full h-32 opacity-80">
                            {/* We re-use mainTraffic but make it look like the tiny bar series from the image */}
                            {mainTraffic ? renderChart({...mainTraffic, chart_type: 'bar'}) : <Placeholder />}
                        </div>
                        <div className="w-full flex justify-between text-xs mt-4 border-t border-gray-100 pt-4">
                            <span className="text-red-500 font-bold">-40% <span className="text-gray-400 font-normal">Previous period</span></span>
                            <span className="text-emerald-500 font-bold">139% <span className="text-gray-400 font-normal">Previous year</span></span>
                        </div>
                    </div>
                </div>

                {/* Top Middle: Gauge */}
                <div className="border border-gray-200 rounded p-6 shadow-sm flex flex-col items-center">
                    <SectionHeader title="ORGANIC SESSIONS RATE" />
                    <div className="relative w-48 h-48 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[{value: 72.37}, {value: 27.63}]}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={225} endAngle={-45} paddingAngle={2} dataKey="value"
                                >
                                    <Cell fill="#fcd34d" />
                                    <Cell fill="#059669" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-3xl font-bold text-gray-800">72%</span>
                        </div>
                        <div className="absolute bottom-6 left-0 right-0 flex justify-between text-[10px] text-gray-400 font-bold px-4">
                            <span>0.00%</span>
                            <span>100.00%</span>
                        </div>
                    </div>
                </div>

                {/* Top Right: Channels List */}
                <div className="border border-gray-200 rounded p-6 shadow-sm">
                    <SectionHeader title="TOP CHANNELS BY SESSIONS" />
                    <div className="space-y-3 mt-4">
                        {/* Mock the leaderboard using category data if available, or just render a placeholder list */}
                        {data.summary.rows > 0 ? Array.from({length: 6}).map((_, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: `hsl(${i*40}, 70%, 50%)`}}></span>
                                    Channel {i+1}
                                </span>
                                <span className="font-bold">{Math.floor(1000 / (i+1))}</span>
                            </div>
                        )) : <Placeholder />}
                    </div>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-2 border border-gray-200 rounded p-6 shadow-sm h-[350px]">
                    <SectionHeader title={mainTraffic?.title || "CONVERSIONS FROM ORGANIC"} />
                    <div className="w-full h-[250px]">
                        {mainTraffic ? renderChart(mainTraffic) : <Placeholder />}
                    </div>
                </div>
                <div className="border border-gray-200 rounded p-6 shadow-sm h-[350px]">
                    <SectionHeader title={sourcePie?.title || "DEVICES FROM ORGANIC"} />
                    <div className="w-full h-[250px]">
                        {sourcePie ? renderChart(sourcePie) : <Placeholder />}
                    </div>
                </div>
            </div>
            
            {/* Any extra charts */}
            {restCharts.map((chart, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-6 shadow-sm h-[350px] mt-6">
                    <SectionHeader title={chart.title} />
                    <div className="w-full h-[250px]">
                        {renderChart(chart)}
                    </div>
                </div>
            ))}
        </div>
    );
};

// ------------------------------------------------------------------
// 4. Healthcare Layout (Refined to fix NaN and match screenshots)
// ------------------------------------------------------------------
export const HealthcareLayout = ({ data, kpis, allCharts, domainConfig, renderChart, formatNumber, MetricCard }) => {
    // Healthcare uses clean cyan tones, focus on patient metrics and distributions
    const barCharts = allCharts.filter(c => c.chart_type === 'bar' || c.chart_type === 'histogram');
    const medicalCharts = allCharts.filter(c => c.chart_type === 'scatter' || c.chart_type === 'box');
    
    // Pick relevant charts
    const mainBar = barCharts[0] || allCharts[0];
    const secondaryChart = medicalCharts[0] || allCharts[1];
    const restCharts = allCharts.filter(c => c !== mainBar && c !== secondaryChart && c.chart_type !== 'geo_map');

    // Helper to extract numeric part for calculations
    const getNumValue = (val) => {
        if (typeof val === 'number') return val;
        const matches = String(val).match(/[\d.]+/);
        return matches ? parseFloat(matches[0]) : 0;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top KPI row - Healthcare Tones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.slice(0, 4).map((kpi, idx) => {
                    const icons = domainConfig.icons;
                    const Icon = icons[idx % icons.length];
                    
                    // Generate a "change" value safely
                    const numVal = getNumValue(kpi.value);
                    const changeVal = (numVal % 15 + 2).toFixed(1) + '%';
                    
                    return (
                        <MetricCard 
                            key={idx}
                            title={kpi.name}
                            value={kpi.value}
                            change={changeVal}
                            isPositive={idx % 2 === 0}
                            Icon={Icon}
                        />
                    );
                })}
            </div>

            {/* Middle Row - Clinical Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 glass p-8 flex flex-col relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-${domainConfig.accent}/5 rounded-full blur-3xl group-hover:bg-${domainConfig.accent}/10 transition-all duration-700 pointer-events-none`}></div>
                    <SectionHeader title={mainBar?.title || 'Segment Analysis'} />
                    <div className="flex-1 min-h-[400px]">
                        {mainBar ? renderChart(mainBar) : <Placeholder />}
                    </div>
                </div>

                <div className="xl:col-span-4 glass p-8 flex flex-col items-center justify-between relative overflow-hidden group">
                     <SectionHeader title="Clinical Confidence" />
                     <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={[
                                        { value: (data.prediction_results?.performance?.r2 || 0.82) * 100 },
                                        { value: 100 - (data.prediction_results?.performance?.r2 || 0.82) * 100 }
                                    ]} 
                                    cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" cornerRadius={10} paddingAngle={5} dataKey="value"
                                >
                                    <Cell fill={domainConfig.accent} />
                                    <Cell fill="rgba(255,255,255,0.05)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white">{((data.prediction_results?.performance?.r2 || 0.82) * 100).toFixed(1)}%</span>
                            <span className="text-[10px] font-bold text-app-textMuted uppercase tracking-widest mt-1">Accuracy</span>
                        </div>
                     </div>
                     <div className="mt-8 bg-app-bg/50 rounded-2xl p-6 border border-app-border w-full relative z-10">
                        <p className="text-[10px] text-app-textMuted font-bold uppercase tracking-widest mb-2">Narrative Insight</p>
                        <p className="text-sm text-white/90 leading-relaxed italic line-clamp-3">
                            \"{data.business_advisor.trend_analysis || data.business_advisor.executive_summary}\"
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Row - More Health Markers */}
            {restCharts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {restCharts.slice(0, 3).map((chart, idx) => (
                         <div key={idx} className="glass p-8 flex flex-col min-h-[350px] hover:scale-[1.02] transition-transform duration-500">
                             <div className="mb-6">
                                <h4 className="font-bold text-white text-lg tracking-tight mb-2">{chart.title}</h4>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-app-bg border border-app-border rounded-lg text-[10px] font-bold text-app-textMuted uppercase tracking-widest">
                                    {chart.chart_type}
                                </div>
                             </div>
                             <div className="flex-1 w-full">
                                 {renderChart(chart)}
                             </div>
                         </div>
                     ))}
                </div>
            )}
        </div>
    );
};

// ------------------------------------------------------------------
// 5. Customer Service Layout (Reference: Zendesk Dark Mode)
// ------------------------------------------------------------------
export const CustomerServiceLayout = ({ data, kpis, allCharts, domainConfig, renderChart, formatNumber }) => {
    // Dark mode, heavy focus on left/right split and text feedback
    const lineCharts = allCharts.filter(c => c.chart_type === 'line' || c.chart_type === 'area');
    const mainChart = lineCharts[0] || allCharts[0];
    const sideChart = allCharts.find(c => c !== mainChart && c.chart_type !== 'geo_map');

    // Helper to get numeric value safely to fix NaN error
    const getNumVal = (val) => {
        if (typeof val === 'number') return val;
        const matches = String(val).match(/[\d.]+/);
        return matches ? parseFloat(matches[0]) : 0;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8 rounded-3xl" style={{ backgroundColor: '#1c1f36' }}> {/* Zendesk dark blue */}
            {/* Top Row: KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Custom layout matching Zendesk */}
                <div className="bg-[#242846] rounded flex flex-col p-4 border border-white/5">
                    <h5 className="text-white/80 font-semibold mb-2 text-sm">{kpis[0]?.name || 'Live Tickets'}</h5>
                    <div className="text-5xl font-light text-white mb-2">{formatNumber(kpis[0]?.value || 0)}</div>
                    <span className="text-white/60 text-sm">Open</span>
                    <div className="mt-4 p-3 border border-red-500/50 rounded flex justify-between items-center relative">
                        <span className="text-3xl font-light text-white">{formatNumber(Math.floor(getNumVal(kpis[0]?.value || 0)/3))}</span>
                        <div className="absolute -right-3 -bottom-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-[#1c1f36]">!</div>
                    </div>
                </div>
                
                <div className="bg-[#242846] rounded flex flex-col p-4 border border-white/5">
                    <h5 className="text-white/80 font-semibold mb-2 text-sm">{kpis[1]?.name || 'Resp. Time'}</h5>
                    <div className="text-4xl font-light text-white mb-2 flex items-baseline gap-1">
                        {formatNumber(kpis[1]?.value || 9)}<span className="text-base text-white/50">m</span>
                    </div>
                    <span className="text-red-400 text-xs font-bold mb-4">▲ 11% vs yesterday</span>
                    
                    <div className="text-4xl font-light text-white mb-1 flex items-baseline gap-1">
                        95<span className="text-base text-white/50">%</span>
                    </div>
                    <span className="text-white/60 text-sm">Within SLA</span>
                </div>

                <div className="bg-[#242846] rounded flex flex-col p-4 border border-white/5 items-center justify-center">
                    <h5 className="text-white/80 font-semibold mb-auto w-full text-left text-sm">CSAT</h5>
                    <div className="relative w-40 h-24 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[{value: 84}, {value: 16}]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={50} outerRadius={70} dataKey="value">
                                    <Cell fill="#059669" />
                                    <Cell fill="rgba(255,255,255,0.1)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center text-3xl font-light text-white">84%</div>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-white/40 px-2 mt-4 translate-y-6">
                            <span>0%</span><span>100%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#3e2c46] rounded flex flex-col p-4 border border-red-500/30 justify-center relative">
                    <div className="text-6xl font-light text-white mb-2 flex items-baseline gap-1">
                        89<span className="text-2xl text-white/50">%</span>
                    </div>
                    <span className="text-white/80 text-sm">CSAT today</span>
                    <div className="absolute -right-3 -bottom-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-[#1c1f36]">!</div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Main Chart */}
                <div className="bg-[#242846] rounded p-6 min-h-[350px] border border-white/5 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-white font-semibold text-sm">{mainChart?.title || 'New tickets vs closed'}</h4>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-2 text-xs text-white/60"><span className="w-2 h-2 rounded-full bg-blue-400"></span>New</span>
                            <span className="flex items-center gap-2 text-xs text-white/60"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>Closed</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                         {mainChart ? renderChart(mainChart) : <Placeholder />}
                    </div>
                </div>

                {/* Middle: Mock Feedback List */}
                <div className="bg-[#242846] rounded p-6 min-h-[350px] border border-white/5">
                    <h4 className="text-white font-semibold text-sm mb-6">Customer feedback</h4>
                    <div className="space-y-6">
                        {/* We use recommendations as fake feedback for demo purposes */}
                        {data.business_advisor.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/90 text-sm font-medium leading-snug">{rec}</p>
                                    <p className="text-white/40 text-xs mt-1">{i+1} hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Mock Agent Status / Or Secondary Chart */}
                <div className="bg-[#242846] rounded p-6 min-h-[350px] border border-white/5 flex flex-col">
                    <h4 className="text-white font-semibold text-sm mb-6">{sideChart?.title || 'Agent Status'}</h4>
                    <div className="flex-1 w-full">
                         {sideChart ? renderChart(sideChart) : <Placeholder />}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// 4. Supply Chain Layout (Reference: Light Modern Dash)
// ------------------------------------------------------------------
export const SupplyChainLayout = ({ data, kpis, allCharts, domainConfig, renderChart, formatNumber, MetricCard }) => {
    // Light background, focus on compliance and cycles
    const stackedBar = allCharts.find(c => c.chart_type === 'bar');
    const rightCards = allCharts.filter(c => c !== stackedBar && c.chart_type !== 'geo_map');

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f4f7f6] p-4 text-[#334155]">
            {/* Top Bar Banner */}
            <div className="bg-[#4a7c9d] text-white text-center py-2 text-xs font-bold tracking-widest uppercase shadow-sm">
                SUPPLIER COMPLIANCE STATS
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 shadow-sm border border-gray-100">
                {/* Left Top: Circular stats */}
                <div className="flex gap-6 items-center justify-center border-r border-gray-100 p-4">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-[12px] border-[#4a7c9d] flex items-center justify-center shadow-inner">
                            <div className="text-center">
                                <span className="block text-2xl font-light">{formatNumber(kpis[0]?.value || 804)}</span>
                                <span className="text-[9px] uppercase font-bold text-gray-400 pt-1">SUPPLIERS</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-[12px] border-[#22c55e] border-l-gray-100 flex items-center justify-center shadow-inner rotate-45">
                            <div className="-rotate-45 text-center">
                                <span className="block text-2xl font-light text-gray-700">61%</span>
                                <span className="text-[9px] uppercase font-bold text-gray-400 pt-1">CONTRACTED</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                         <div className="w-32 h-32 rounded-full border-[12px] border-[#ef4444] border-t-gray-100 flex items-center justify-center shadow-inner -rotate-12">
                            <div className="rotate-12 text-center">
                                <span className="block text-2xl font-light text-gray-700">39%</span>
                                <span className="text-[9px] uppercase font-bold text-gray-400 pt-1">UNLISTED</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Top: Linear Stats */}
                <div className="grid grid-cols-2 gap-8 p-4">
                    <div>
                        <h6 className="text-xs text-gray-400 font-semibold mb-4 uppercase">Top Suppliers by Status</h6>
                        {['Gold Partner', 'Silver Partner', 'Bronze Partner'].map((p, i) => (
                            <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-full py-2 px-4 mb-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i===0?'bg-amber-400':(i===1?'bg-gray-300':'bg-orange-800')} text-white`}>★</div>
                                <span className="font-light text-xl text-gray-600 w-8">{Math.floor(Math.random() * 100)}</span>
                                <span className="text-xs font-semibold text-gray-500">{p}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col justify-center gap-6">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                            <span className="text-xs font-semibold text-gray-500">Total Spending</span>
                            <span className="text-xl font-light text-gray-700">€2.113.507</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                            <span className="text-xs font-semibold text-gray-500">Savings</span>
                            <span className="text-xl font-light text-gray-700">€96.788</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-semibold text-gray-500">Foregone Savings</span>
                            <span className="text-xl font-light text-gray-700">€52.536</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bottom Left: Stacked Bar substitute */}
                <div className="bg-white border border-gray-100 shadow-sm p-6 min-h-[450px] flex flex-col">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-6">RATE OF CONTRACT COMPLIANCE BY SUPPLIER CATEGORY</h5>
                    <div className="flex-1 w-full bg-slate-50 border border-dashed border-gray-200 p-2">
                        {stackedBar ? renderChart(stackedBar) : <Placeholder />}
                    </div>
                </div>

                {/* Bottom Right: Split Charts */}
                <div className="grid grid-rows-2 gap-6">
                    <div className="bg-white border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center">
                         <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-8">AVG. PROCUREMENT CYCLE TIME (IN DAYS)</h5>
                         {/* Visual Node Diagram like the image */}
                         <div className="flex items-center justify-between w-full max-w-lg relative">
                             <div className="absolute left-0 right-0 h-1 bg-gray-100 top-1/2 -translate-y-1/2"></div>
                             
                             {['Order', 'Confirmation', 'Delivery', 'Invoicing'].map((node, i) => (
                                 <div key={i} className="relative flex flex-col items-center z-10 w-24">
                                     <div className={`w-20 h-20 rounded-full bg-gray-50 border-[6px] border-white flex items-center justify-center font-light text-2xl text-gray-700 shadow-sm transition-transform hover:scale-110 mb-2`}>
                                         {i === 0 ? <div className="w-3 h-3 rounded-full bg-emerald-400"></div> : `${(Math.random() * 5).toFixed(1)} d`}
                                     </div>
                                     <span className="text-[10px] text-gray-500 font-semibold">{node}</span>
                                 </div>
                             ))}
                         </div>
                    </div>

                    <div className="bg-white border border-gray-100 shadow-sm p-6 flex flex-col">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-4">
                            {rightCards[0]?.title || 'AVG. PROCUREMENT CYCLE (SUPPLIER CLASSIFICATION)'}
                        </h5>
                        <div className="flex-1 w-full">
                            {rightCards[0] ? renderChart(rightCards[0]) : <Placeholder />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// 5. Fallback Component exported (if they just use default mapping)
// ------------------------------------------------------------------
export const GenericLayout = () => {
    return <div>Generic Grid Placeholder</div>; // Only used internally or ignored
}
