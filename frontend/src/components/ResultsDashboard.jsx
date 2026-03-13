import React, { useState } from 'react';
import { 
    Search, Bell, Settings, Plus, LayoutGrid, Users, MousePointer2, Eye, Share2, 
    ArrowUpRight, ArrowDownRight, MoreHorizontal, Download, PieChart as PieIcon, 
    BarChart3, TrendingUp, ScatterChart as ScatterIcon, LineChart as LineIcon,
    DollarSign, Activity, ShoppingCart, Briefcase, Target, Database, ShieldAlert,
    Truck, Globe, Package, Clock, Factory, Cpu, Zap, Wrench
} from 'lucide-react';
import { Tabs, Checkbox, Button, MetricCard } from '../ui';
import { FinanceLayout, MarketingLayout, CustomerServiceLayout, SupplyChainLayout, HealthcareLayout } from './layouts/DomainLayouts';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
    ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import GeoMap from './GeoMap';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    const absNum = Math.abs(num);
    if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
    return absNum < 1 && absNum !== 0 ? num.toFixed(3) : num.toLocaleString();
};

const DOMAIN_CONFIG = {
    "Finance / Banking": {
        accent: "#f59e0b", // Gold
        accentGradient: "from-amber-500 to-orange-600",
        icons: [DollarSign, TrendingUp, ShieldAlert, Database],
        colors: ['text-amber-400 bg-amber-400/10 border-amber-400/20', 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', 'text-red-400 bg-red-400/10 border-red-400/20', 'text-blue-400 bg-blue-400/10 border-blue-400/20'],
        heroLabel: "Market Risk Index"
    },
    "Healthcare": {
        accent: "#06b6d4", // Cyan/Teal
        accentGradient: "from-cyan-400 to-blue-500",
        icons: [Activity, Users, Target, ShieldAlert],
        colors: ['text-cyan-400 bg-cyan-400/10 border-cyan-400/20', 'text-blue-400 bg-blue-400/10 border-blue-400/20', 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'],
        heroLabel: "Clinical Confidence"
    },
    "Retail / E-commerce": {
        accent: "#ec4899", // Pink/Purple
        accentGradient: "from-pink-500 to-rose-600",
        icons: [ShoppingCart, Target, TrendingUp, Users],
        colors: ['text-pink-400 bg-pink-400/10 border-pink-400/20', 'text-app-accent2 bg-app-accent2/10 border-app-accent2/20', 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', 'text-amber-400 bg-amber-400/10 border-amber-400/20'],
        heroLabel: "Sales Conversion"
    },
    "Marketing": {
        accent: "#8b5cf6", // Violet
        accentGradient: "from-violet-500 to-indigo-600",
        icons: [Target, MousePointer2, Eye, TrendingUp],
        colors: ['text-violet-400 bg-violet-400/10 border-violet-400/20', 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', 'text-pink-400 bg-pink-400/10 border-pink-400/20'],
        heroLabel: "Campaign Reach"
    },
    "Human Resources": {
        accent: "#10b981", // Emerald
        accentGradient: "from-emerald-500 to-teal-600",
        icons: [Users, Briefcase, Target, TrendingUp],
        colors: ['text-emerald-400 bg-emerald-400/10 border-emerald-400/20', 'text-teal-400 bg-teal-400/10 border-teal-400/20', 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', 'text-app-accent3 bg-app-accent3/10 border-app-accent3/20'],
        heroLabel: "Workforce Stability"
    },
    "Supply Chain / Logistics": {
        accent: "#0ea5e9", // Sky Blue
        accentGradient: "from-sky-500 to-blue-600",
        icons: [Truck, Globe, Package, Clock],
        colors: ['text-sky-400 bg-sky-400/10 border-sky-400/20', 'text-blue-400 bg-blue-400/10 border-blue-400/20', 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'],
        heroLabel: "Delivery Efficiency"
    },
    "Manufacturing": {
        accent: "#6366f1", // Indigo
        accentGradient: "from-indigo-500 to-violet-600",
        icons: [Factory, Cpu, Zap, Wrench],
        colors: ['text-indigo-400 bg-indigo-400/10 border-indigo-400/20', 'text-stone-400 bg-stone-400/10 border-stone-400/20', 'text-amber-400 bg-amber-400/10 border-amber-400/20', 'text-red-400 bg-red-400/10 border-red-400/20'],
        heroLabel: "OEE Performance"
    },
    "General Business": {
        accent: "#3b82f6", // Blue
        accentGradient: "from-app-accent3 to-app-accent2",
        icons: [LayoutGrid, Database, Activity, Target],
        colors: ['text-app-accent3 bg-app-accent3/10 border-app-accent3/20', 'text-app-accent2 bg-app-accent2/10 border-app-accent2/20', 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', 'text-app-accent bg-app-accent/10 border-app-accent/20'],
        heroLabel: "Operational Health"
    }
};


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass p-4 border border-app-border/50 shadow-2xl backdrop-blur-xl">
                <p className="font-bold text-white mb-2 pb-2 border-b border-app-border/50">{label || data.x || data.name}</p>
                
                {data.median !== undefined ? (
                    <div className="flex flex-col gap-1 text-sm font-medium">
                        <p style={{ color: '#94a3b8' }}>Max: <span className="text-white ml-2">{formatNumber(data.max)}</span></p>
                        <p style={{ color: payload[0].color || payload[0].fill }}>Q3: <span className="text-white ml-2">{formatNumber(data.q3)}</span></p>
                        <p style={{ color: '#fff' }}>Median: <span className="text-white ml-2">{formatNumber(data.median)}</span></p>
                        <p style={{ color: payload[0].color || payload[0].fill }}>Q1: <span className="text-white ml-2">{formatNumber(data.q1)}</span></p>
                        <p style={{ color: '#94a3b8' }}>Min: <span className="text-white ml-2">{formatNumber(data.min)}</span></p>
                    </div>
                ) : (
                    payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-3 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                            <p style={{ color: entry.color || entry.fill }} className="text-sm font-medium">
                                {entry.name && entry.name !== 'iqr' ? entry.name : (entry.payload?.y !== undefined ? `${entry.payload.y}` : 'Value')}: <span className="text-white font-bold ml-1">{typeof entry.value === 'number' ? formatNumber(entry.value) : (Array.isArray(entry.value) ? `${formatNumber(entry.value[0])} - ${formatNumber(entry.value[1])}` : entry.value)}</span>
                            </p>
                        </div>
                    ))
                )}
            </div>
        );
    }
    return null;
};

const CorrelationHeatmap = ({ data, accentColor }) => {
    // Get unique labels for x and y axes
    const labels = [...new Set(data.map(d => d.x))];
    const size = labels.length;

    return (
        <div className="w-full h-full flex flex-col">
            <div 
                className="grid gap-1 flex-1" 
                style={{ 
                    gridTemplateColumns: `repeat(${size}, 1fr)`,
                    gridTemplateRows: `repeat(${size}, 1fr)` 
                }}
            >
                {data.map((item, idx) => {
                    const absVal = Math.abs(item.value);
                    const isStrong = absVal > 0.7;
                    return (
                        <div 
                            key={idx}
                            className="relative group/cell flex items-center justify-center rounded-sm transition-all duration-300 hover:scale-[1.15] hover:z-10 hover:shadow-xl cursor-help"
                            style={{ 
                                backgroundColor: item.value > 0 
                                    ? `${accentColor}${Math.floor(absVal * 100).toString(16).padStart(2, '0')}`
                                    : `#ef4444${Math.floor(absVal * 80).toString(16).padStart(2, '0')}`,
                                border: isStrong ? `1px solid ${accentColor}40` : '1px solid rgba(255,255,255,0.05)'
                            }}
                            title={`${item.x} vs ${item.y}: ${item.value.toFixed(2)}`}
                        >
                            {size <= 6 && (
                                <span className={`text-[10px] font-bold ${absVal > 0.5 ? 'text-white' : 'text-app-textMuted'} opacity-0 group-hover/cell:opacity-100 transition-opacity`}>
                                    {item.value.toFixed(1)}
                                </span>
                            )}
                            {/* Simple tooltip placeholder since we're using native title for now, 
                                but the grid layout makes it feel interactive */}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {labels.map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-app-textMuted uppercase tracking-tighter">[{i+1}]</span>
                        <span className="text-[10px] text-white/70 font-medium truncate max-w-[80px]">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CustomizedBoxPlot = (props) => {
    const { x, y, width, height, stroke, fill, payload } = props;
    
    // Y coordinates: SVG Y increases downwards.
    // So payload.q3 (higher value) has a smaller Y than payload.q1 (lower value).
    // The top of the Bar rect is `y` (which corresponds to q3).
    const q3_y = y;
    const q1_y = y + height;
    
    let pixel_per_unit = 0;
    const iqr = payload.q3 - payload.q1;
    
    if (iqr > 0 && height > 0) {
        pixel_per_unit = height / iqr;
    } else {
        // Fallback: if IQR is 0, we can't reliably infer scale from height.
        // We will just draw a flat line.
        return <line x1={x} y1={y} x2={x + width} y2={y} stroke={stroke} strokeWidth={2} />;
    }
    
    const min_y = q1_y + (payload.q1 - payload.min) * pixel_per_unit;
    const max_y = q3_y - (payload.max - payload.q3) * pixel_per_unit;
    const median_y = q1_y - (payload.median - payload.q1) * pixel_per_unit;
    
    const centerX = x + width / 2;
    const capWidth = width * 0.5;
    
    return (
        <g>
            {/* Whiskers (vertical line) */}
            <line x1={centerX} y1={min_y} x2={centerX} y2={q1_y} stroke={stroke} strokeWidth={2} />
            <line x1={centerX} y1={q3_y} x2={centerX} y2={max_y} stroke={stroke} strokeWidth={2} />
            
            {/* Top whisker cap */}
            <line x1={centerX - capWidth/2} y1={max_y} x2={centerX + capWidth/2} y2={max_y} stroke={stroke} strokeWidth={2} />
            
            {/* Bottom whisker cap */}
            <line x1={centerX - capWidth/2} y1={min_y} x2={centerX + capWidth/2} y2={min_y} stroke={stroke} strokeWidth={2} />
            
            {/* Box */}
            <rect x={x} y={q3_y} width={width} height={height} fill={fill} stroke={stroke} strokeWidth={2} rx={2} ry={2} />
            
            {/* Median line */}
            <line x1={x} y1={median_y} x2={x + width} y2={median_y} stroke="#111221" strokeWidth={3} />
            <line x1={x} y1={median_y} x2={x + width} y2={median_y} stroke={stroke} strokeWidth={1} />
        </g>
    );
};

const PivotTableViewer = ({ title, xAxis, yAxis, data, accentColor }) => {
    // data is { col1: { row1: val, row2: val }, col2: { row1: val, row2: val } }
    const columns = Object.keys(data);
    const rows = [...new Set(columns.flatMap(col => Object.keys(data[col])))].sort();

    return (
        <div className="glass p-8 flex flex-col relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-${accentColor}/5 rounded-full blur-3xl group-hover:bg-${accentColor}/10 transition-all duration-700 pointer-events-none`}></div>
            <div className="mb-8 relative z-10 flex items-start justify-between">
                <div>
                    <h4 className="font-bold text-white text-lg leading-tight mb-2 tracking-tight">{title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                         <span className={`w-1.5 h-1.5 rounded-full bg-${accentColor}`}></span>
                         <span className="text-[10px] font-bold text-app-textMuted uppercase tracking-widest">
                             CROSS-TABULATION
                         </span>
                    </div>
                    <p className="text-xs text-app-textMuted font-medium max-w-sm">
                        Analyzes the distribution of records across combinations of <span className="text-white">{xAxis}</span> and <span className="text-white">{yAxis}</span>.
                    </p>
                </div>
            </div>
            <div className="overflow-x-auto relative z-10 rounded-xl border border-app-border/50 bg-app-bg/30">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-app-border/50 text-app-textMuted font-black text-[10px] uppercase tracking-widest bg-white/5 whitespace-nowrap">
                                <span className="opacity-50">{xAxis} \ {yAxis}</span>
                            </th>
                            {columns.map(col => (
                                <th key={col} className="p-4 border-b border-l border-app-border/50 text-white font-bold text-sm bg-white/5 text-center px-6">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row} className="hover:bg-white/5 transition-colors group/row">
                                <td className="p-4 border-b border-app-border/30 text-white font-bold text-sm border-r border-app-border/50 bg-white/5 group-hover/row:bg-transparent transition-colors whitespace-nowrap">
                                    {row}
                                </td>
                                {columns.map(col => (
                                    <td key={col} className="p-4 border-b border-app-border/30 text-app-text font-medium text-center border-l border-app-border/10">
                                        <span className={`px-4 py-1.5 rounded-lg text-white font-bold inline-block min-w-[3rem] transition-colors border group-hover/row:border-${accentColor}/30 ${data[col]?.[row] > 0 ? 'bg-white/10 border-white/10 shadow-inner' : 'bg-transparent border-transparent text-app-textMuted'}`}>
                                           {data[col]?.[row] || 0}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function ResultsDashboard({ data, onBack }) {
    const [activeView, setActiveView] = useState('insights');
    const [showForecast, setShowForecast] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    if (!data) return null;

    const domainName = data.business_advisor.domain.domain;
    const domainConfig = DOMAIN_CONFIG[domainName] || DOMAIN_CONFIG["General Business"];

    const kpis = data.business_advisor.kpis || [];
    const rawCharts = data.charts || [];
    
    // Deduplicate Geo Maps - Keep only the first one
    let geoSeen = false;
    const allCharts = rawCharts.filter(chart => {
        if (chart.chart_type === 'geo_map') {
            if (geoSeen) return false;
            geoSeen = true;
            return true;
        }
        return true;
    });

    const renderChart = (chartConfig) => {
        const chartData = chartConfig.data || [];
        if (chartData.length === 0) return <div className="flex items-center justify-center h-full text-slate-400 italic">No data available</div>;

        switch (chartConfig.chart_type) {
            case 'bar':
            case 'histogram':
                return (
                    <ResponsiveContainer width="100%" height="100%" padding={{ bottom: 20 }}>
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                                height={80} 
                                interval={0}
                                angle={-35} 
                                textAnchor="end"
                                dy={10}
                                dx={-5}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatNumber} width={45} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="value" fill={domainConfig.accent} radius={[6, 6, 0, 0]} barSize={45}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? domainConfig.accent : `${domainConfig.accent}80`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'line':
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height="100%" padding={{ bottom: 20 }}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={domainConfig.accent} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={domainConfig.accent} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                                height={80} 
                                interval={0}
                                angle={-35} 
                                textAnchor="end"
                                dy={10}
                                dx={-5}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatNumber} width={45} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" stroke={domainConfig.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, fill: domainConfig.accent, strokeWidth: 2, stroke: '#1e213a' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={2}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? domainConfig.accent : `${domainConfig.accent}${Math.max(20, 90 - index * 20)}`} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'scatter':
                return (
                    <ResponsiveContainer width="100%" height="100%" padding={{ bottom: 20 }}>
                        <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name={chartConfig.x_axis} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 11 }} 
                                tickFormatter={formatNumber}
                                padding={{ left: 20, right: 20 }}
                                height={60}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name={chartConfig.y_axis} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 11 }} 
                                tickFormatter={formatNumber}
                                width={60}
                            />
                            <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} content={<CustomTooltip />} />
                            <Scatter 
                                data={chartData} 
                                fill={domainConfig.accent} 
                                fillOpacity={0.6}
                                stroke={domainConfig.accent}
                                strokeWidth={1}
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                );
            case 'box': {
                const boxData = chartData.map(d => ({
                    ...d,
                    iqr: [d.q1, d.q3]
                }));
                return (
                    <ResponsiveContainer width="100%" height="100%" padding={{ bottom: 20 }}>
                        <ComposedChart data={boxData} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                                height={80} 
                                interval={0}
                                angle={-35} 
                                textAnchor="end"
                                dy={10}
                                dx={-5}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="iqr" shape={<CustomizedBoxPlot stroke={domainConfig.accent} fill={`${domainConfig.accent}40`} />} />
                        </ComposedChart>
                    </ResponsiveContainer>
                );
            }
            case 'heatmap':
                return <CorrelationHeatmap data={chartData} accentColor={domainConfig.accent} />;
            case 'geo_map':
                return <GeoMap data={chartData} accentColor={domainConfig.accent} title={chartConfig.title} config={chartConfig} />;
            default:
                return <div className="flex items-center justify-center h-full text-slate-400 italic">Chart type {chartConfig.chart_type} not supported</div>;
        }
    };

    const geoChart = allCharts.find(c => c.chart_type === 'geo_map');
    const displayCharts = allCharts.filter(c => c.chart_type !== 'geo_map');
    const firstChart = displayCharts[0];
    const remainingCharts = displayCharts.slice(1);

    return (
        <div 
            className="min-h-screen text-app-text font-sans selection:bg-white/30 text-sm transition-all duration-1000"
            style={{
                backgroundColor: '#111221', // Darker base to let colors pop
                backgroundImage: `
                    radial-gradient(circle at 100% 0%, ${domainConfig.accent}2A, transparent 50%),
                    radial-gradient(circle at 0% 100%, ${domainConfig.accent}15, transparent 50%),
                    radial-gradient(circle at 50% 50%, ${domainConfig.accent}0A, transparent 70%)
                `,
                '--domain-accent': domainConfig.accent
            }}
        >
            {/* Top Navigation */}
            <header 
                className="h-20 backdrop-blur-xl border-b border-app-border px-8 flex items-center justify-between sticky top-0 z-50 transition-colors duration-1000"
                style={{ backgroundColor: `${domainConfig.accent}05` }}
            >
                <div className="flex items-center gap-8 flex-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-tr ${domainConfig.accentGradient}`}>
                            <LayoutGrid className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white line-clamp-1">DataSense-AI</span>
                    </div>

                    <Button 
                        variant="ghost" 
                        onClick={onBack}
                        className="flex items-center gap-2 text-app-textMuted hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-app-border/50 group/back"
                    >
                        <div className="p-1 rounded-md bg-white/5 group-hover/back:bg-white/10 transition-colors">
                            <Plus className="w-3.5 h-3.5 rotate-45" /> 
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest">Back to Upload</span>
                    </Button>

                    <div className="max-w-md w-full relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-textMuted group-focus-within:text-app-accent3 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search DataSense..."
                            className="w-full pl-10 pr-4 py-2 bg-app-card border border-app-border focus:bg-app-cardHover focus:border-app-accent3 rounded-xl text-sm transition-all outline-none text-white placeholder:text-app-textMuted"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="!p-2 relative rounded-full" icon={Bell}>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-app-bg"></span>
                    </Button>
                    <Button variant="ghost" className="!p-2 rounded-full" icon={Settings} />
                    
                    <div className="h-8 w-[1px] bg-app-border mx-2"></div>
                    <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${domainConfig.accentGradient} p-[2px]`}>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.summary.rows}`}
                                alt="User"
                                className="w-full h-full rounded-full bg-app-card"
                            />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-bold leading-none text-white">Alex Rivera</p>
                            <p className="text-[11px] text-app-textMuted mt-1 uppercase font-semibold tracking-wider">Premium Plan</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Analytics Overview Header with Tabs */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">DataSense Overview</h1>
                        <p className="text-app-textMuted mt-1 text-sm font-medium italic">Domain: {data.business_advisor.domain.domain}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Tabs 
                            activeTab={activeView} 
                            onChange={setActiveView} 
                            options={[
                                { id: 'insights', label: 'Executive Insights', icon: PieIcon },
                                { id: 'charts', label: 'Detailed Charts', icon: LineIcon }
                            ]}
                        />
                        <div className="h-8 w-[1px] bg-app-border hidden md:block"></div>
                        <Button variant="outline" className="hidden md:flex">
                            Last 30 days <ArrowDownRight className="w-4 h-4 opacity-70" />
                        </Button>
                    </div>
                </div>

                {/* Dynamic Content Based on Tabs */}
                {activeView === 'insights' ? (
                    <>
                        {(() => {
                            const commonProps = { data, kpis, allCharts, domainConfig, renderChart, formatNumber, MetricCard };
                            
                            if (domainName.includes('Finance') || domainName.includes('Banking')) return <FinanceLayout {...commonProps} />;
                            if (domainName.includes('Marketing') || domainName.includes('Retail') || domainName.includes('E-commerce')) return <MarketingLayout {...commonProps} />;
                            if (domainName.includes('Supply Chain') || domainName.includes('Manufacturing') || domainName.includes('Logistics')) return <SupplyChainLayout {...commonProps} />;
                            if (domainName.includes('Healthcare')) return <HealthcareLayout {...commonProps} />;
                            if (domainName.includes('Human Resources')) return <CustomerServiceLayout {...commonProps} />;

                            return (
                                <>
                                    {/* Default Legacy KPI Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        {kpis.slice(0, 4).map((kpi, idx) => {
                                            const Icon = domainConfig.icons[idx % domainConfig.icons.length];
                                            const changeVal = (kpi.value && typeof kpi.value === 'number') ? (kpi.value % 15).toFixed(1) + '%' : '12.5%';
                                            
                                            return (
                                                <MetricCard 
                                                    key={idx}
                                                    title={kpi.name}
                                                    value={formatNumber(kpi.value)}
                                                    change={changeVal}
                                                    isPositive={idx % 2 === 0}
                                                    Icon={Icon}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Gauge Chart Section */}
                    <div className="lg:col-span-4 glass p-8 flex flex-col relative overflow-hidden group">
                        <div className="absolute -right-16 -top-16 w-48 h-48 opacity-10 pointer-events-none transition-all duration-700 group-hover:opacity-20"
                             style={{ background: `radial-gradient(circle, ${domainConfig.accent}, transparent 70%)` }}
                        />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="font-bold text-white text-xl tracking-tight">Executive Insight</h3>
                            <button className="p-2 text-app-textMuted hover:text-white transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="relative w-64 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { value: (data.prediction_results?.performance?.r2 || 0.77) * 100 },
                                                { value: 100 - (data.prediction_results?.performance?.r2 || 0.77) * 100 }
                                            ]}
                                            cx="50%"
                                            cy="100%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            <Cell fill={domainConfig.accent} />
                                            <Cell fill="rgba(255,255,255,0.05)" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
                                    <p className={`text-4xl font-black bg-gradient-to-r ${domainConfig.accentGradient} bg-clip-text text-transparent`}>
                                        {((data.prediction_results?.performance?.r2 || 0.77) * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-[10px] font-bold text-app-textMuted uppercase tracking-widest mt-1 text-center">{domainConfig.heroLabel}</p>
                                </div>
                            </div>

                            <div className="mt-8 w-full relative z-10">
                                <div className="p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden group/narrative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                    <p className="text-[10px] text-app-textMuted font-bold uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                                        <TrendingUp className="w-3.5 h-3.5" style={{ color: domainConfig.accent }} /> 
                                        {data.business_advisor.smart_summary ? (
                                            <span className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                                <Zap className="w-3 h-3 animate-pulse" /> AI Synthesis Engine
                                            </span>
                                        ) : "Analysis Narrative"}
                                    </p>
                                    <p className="text-sm text-app-text leading-relaxed italic font-medium relative z-10 line-clamp-4">
                                        "{data.business_advisor.smart_summary || data.business_advisor.trend_analysis || data.business_advisor.executive_summary}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Priority Chart */}
                    <div className="lg:col-span-8 glass p-8 flex flex-col relative overflow-hidden group">
                        <div className="absolute -right-24 -top-24 w-64 h-64 opacity-20 pointer-events-none transition-all duration-700 group-hover:opacity-40"
                             style={{ background: `radial-gradient(circle, ${domainConfig.accent}, transparent 70%)` }}
                        />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="font-bold text-white text-xl tracking-tight leading-none mb-2">
                                    {firstChart?.title || "Primary Distribution"}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: domainConfig.accent }}></span>
                                    <span className="text-[10px] font-bold text-app-textMuted uppercase tracking-widest">
                                        {firstChart?.chart_type} optimization
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox 
                                    id="forecast-toggle" 
                                    label="Show Trends" 
                                    checked={showForecast} 
                                    onChange={setShowForecast} 
                                />
                                <Button variant="ghost" className="!p-2 rounded-lg ml-2" icon={Download} />
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-[350px] relative z-10">
                            {firstChart ? renderChart(firstChart) : (
                                <div className="flex items-center justify-center h-full border border-dashed border-white/10 rounded-3xl">
                                    <p className="text-white/20 font-bold uppercase text-xs tracking-widest">No primary chart generated</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* All Other Charts Grid */}
                {remainingCharts.length > 0 && (
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Supporting Visualizations</h2>
                                <p className="text-app-textMuted text-[10px] font-black uppercase tracking-widest mt-1">Cross-referencing {remainingCharts.length} data pillars</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {remainingCharts.map((chart, idx) => (
                                <div key={idx} className={`glass p-8 flex flex-col min-h-[400px] hover:-translate-y-1 transition-all duration-500 overflow-hidden group relative ${chart.chart_type === 'geo_map' ? 'lg:col-span-3' : ''}`}>
                                    <div className="absolute -right-16 -top-16 w-32 h-32 opacity-10 pointer-events-none transition-all duration-700 group-hover:opacity-20"
                                         style={{ background: `radial-gradient(circle, ${domainConfig.accent}, transparent 70%)` }}
                                    />
                                    <div className="mb-8 relative z-10">
                                        <h4 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-white transition-colors capitalize">{chart.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: domainConfig.accent }} />
                                            <span className="text-[10px] font-bold text-app-textMuted uppercase tracking-widest">
                                                {chart.chart_type} Engine
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full relative z-10">
                                        {renderChart(chart)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                                </>
                            );
                        })()}

                {/* Multidimensional Analysis (Pivot Tables) generated via Feature Engineering */}
                {data.pivot_tables && data.pivot_tables.length > 0 && (
                    <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Structured Groupings</h2>
                            <p className="text-app-textMuted text-sm font-bold uppercase tracking-widest">{data.pivot_tables.length} pivot aggregations</p>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {data.pivot_tables.map((pivot, idx) => (
                                <PivotTableViewer 
                                    key={idx} 
                                    title={pivot.name} 
                                    xAxis={pivot.x_axis} 
                                    yAxis={pivot.y_axis} 
                                    data={pivot.data} 
                                    accentColor={domainConfig.accent} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Insights Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gradient-to-br from-app-accent3 to-app-accent2 rounded-[2.5rem] p-8 text-white shadow-xl shadow-app-accent3/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <LayoutGrid className="w-48 h-48" />
                        </div>
                        <h4 className="text-xl font-black mb-4 tracking-tight">Predictive Intelligence</h4>
                        <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">
                            {(() => {
                                const summary = data.business_advisor.smart_summary || "";
                                const predictiveMatch = summary.match(/PREDICTIVE SYNTHESIS:(.*?)(?=3\.|\n\n|$)/s);
                                
                                // Robust Humanizer for target names
                                const rawTarget = data.prediction_results?.target || 'target metrics';
                                const cleanTarget = rawTarget
                                    .replace(/_/g, ' ')
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/\s+/g, ' ')
                                    .trim()
                                    .split(' ')
                                    .map(w => w.length > 1 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toUpperCase())
                                    .join(' ')
                                    .replace(/^Attnr$/i, 'Attrition')
                                    .replace(/^Def$/i, 'Default')
                                    .replace(/^Self D$/i, 'Self Direction');

                                return predictiveMatch 
                                    ? predictiveMatch[1].trim() 
                                    : `The intelligence engine identifies ${cleanTarget} as the primary optimization focus based on current momentum.`;
                            })()}
                        </p>
                        <div className="flex items-center gap-4">
                            <div className={`bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 ${((data.prediction_results?.performance?.r2 || 0) >= 0.999) ? 'border border-red-400/50' : ''}`}>
                                <p className="text-[10px] font-black uppercase text-blue-200">
                                    {((data.prediction_results?.performance?.r2 || 0) >= 0.999) ? '⚠️ Potential Bias' : 'System Accuracy'}
                                </p>
                                {((data.prediction_results?.performance?.r2 || 0) < 0.999) ? (
                                    <p className="text-lg font-black">{((data.prediction_results?.performance?.r2 || 0.85) * 100).toFixed(1)}%</p>
                                ) : (
                                    <p className="text-[10px] text-red-200 mt-1 font-medium leading-tight max-w-[120px]">
                                        Model might be influenced by data leakage or constant drivers.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 glass p-8">
                        <h4 className="text-xl font-bold text-white mb-6 tracking-tight">Strategic Recommendations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.business_advisor.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex gap-4 items-start p-4 rounded-2xl border border-app-border bg-app-bg/50 hover:bg-app-cardHover transition-colors">
                                    <div className="w-8 h-8 rounded-xl bg-app-card border border-app-border shadow-sm flex items-center justify-center text-app-accent3 font-bold shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm text-app-textMuted leading-snug font-medium">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between glass p-6 mb-10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative w-full lg:w-[450px] z-10">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-textMuted group-focus-within/input:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search DataSense Visuals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm focus:bg-white/[0.08] focus:border-white/20 focus:ring-4 focus:ring-white/5 outline-none text-white transition-all placeholder:text-app-textMuted/50 font-medium"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide z-10 w-full lg:w-auto">
                        <div className="flex items-center gap-2 mr-2">
                            <Plus className="w-3.5 h-3.5 text-app-textMuted" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-app-textMuted shrink-0">Filter Engine</span>
                        </div>
                        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                            {['all', 'bar', 'area', 'scatter', 'pie', 'geo_map'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                        filterType === type 
                                            ? `bg-white text-[#111221] shadow-lg shadow-white/10 scale-105`
                                            : 'text-app-textMuted hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {allCharts
                        .filter(chart => 
                            (filterType === 'all' || chart.chart_type === filterType || (filterType === 'area' && chart.chart_type === 'line')) &&
                            (chart.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
                            chart.chart_type !== 'geo_map'
                        )
                        .map((chart, idx) => (
                            <div key={idx} className={`glass p-8 flex flex-col min-h-[450px] group hover:-translate-y-1 transition-all duration-500 overflow-hidden relative ${chart.chart_type === 'geo_map' ? 'lg:col-span-3' : ''}`}>
                                <div className="absolute -right-20 -top-20 w-40 h-40 opacity-10 pointer-events-none transition-all duration-700 group-hover:opacity-20"
                                     style={{ background: `radial-gradient(circle, ${domainConfig.accent}, transparent 70%)` }}
                                />
                                <div className="mb-8 flex items-start justify-between relative z-10">
                                    <div>
                                        <h4 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-white transition-colors">{chart.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: domainConfig.accent }} />
                                            <span className="text-[10px] font-black text-app-textMuted uppercase tracking-widest">
                                                {chart.chart_type} optimization
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="!p-2 opacity-30 group-hover:opacity-100 transition-opacity" icon={MoreHorizontal} />
                                </div>
                                <div className="flex-1 w-full relative z-10">
                                    {renderChart(chart)}
                                </div>
                            </div>
                        ))}
                </div>
                
                {allCharts.filter(chart => 
                    (filterType === 'all' || chart.chart_type === filterType) &&
                    (chart.title.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 glass border-dashed">
                        <Search className="w-12 h-12 text-app-textMuted mb-4 opacity-50" />
                        <p className="text-xl font-bold text-white mb-2">No matching visualizations</p>
                        <p className="text-app-textMuted text-sm">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        )}

                {/* AI Synthesis Engine (Full Strategic Analysis) - Selective Global Placement */}
                {activeView === 'insights' && (data.business_advisor.smart_summary || data.business_advisor.trend_analysis) && (
                    <div className="mt-16 bg-gradient-to-br from-app-bg to-[#1a1b2e] rounded-[3rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden group/synthesis animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        {/* High-End Background Effects */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full -mr-48 -mt-48 transition-all duration-1000 group-hover/synthesis:bg-indigo-500/10" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full -ml-32 -mb-32 transition-all duration-1000 group-hover/synthesis:bg-purple-500/10" />
                        
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                                            <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
                                        </div>
                                        <span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border border-indigo-500/20 backdrop-blur-md">
                                            AI Synthesis Engine
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white tracking-tight">Full Strategic Analysis</h2>
                                    <p className="text-app-textMuted mt-2 font-medium max-w-xl">Deep structural synthesis derived from dataset variance, distribution laws, and predictive foresight.</p>
                                </div>
                                <div className="hidden md:flex items-center gap-4 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <div className="px-4 py-2 border-r border-white/10 text-center">
                                        <p className="text-[10px] font-black text-app-textMuted uppercase tracking-wider mb-1">Logic Depth</p>
                                        <p className="text-sm font-bold text-white">Elite</p>
                                    </div>
                                    <div className="px-4 py-2 text-center">
                                        <p className="text-[10px] font-black text-app-textMuted uppercase tracking-wider mb-1">Intelligence</p>
                                        <p className="text-sm font-bold text-white">Zero-Shot</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {(() => {
                                    const rawSummary = data.business_advisor.smart_summary || data.business_advisor.trend_analysis || "";
                                    
                                    // Parse segments based on common headers
                                    const segments = [
                                        { title: "Core Narrative", key: /1\.\s+THE\s+CORE\s+NARRATIVE|###\s+THE\s+CORE\s+NARRATIVE/i },
                                        { title: "Predictive Synthesis", key: /2\.\s+PREDICTIVE\s+SYNTHESIS|###\s+PREDICTIVE\s+SYNTHESIS/i },
                                        { title: "Strategic 'So What?'", key: /3\.\s+THE\s+STRATEGIC\s+'SO\s+WHAT\?'|###\s+THE\s+STRATEGIC\s+'SO\s+WHAT\?'/i },
                                        { title: "Actionable Foresight", key: /4\.\s+ACTIONABLE\s+FORESIGHT|###\s+ACTIONABLE\s+FORESIGHT/i }
                                    ];

                                    return segments.map((seg, idx) => {
                                        // Simple regex-based extraction
                                        let text = "Analyzing data patterns...";
                                        const part = rawSummary.split(seg.key);
                                        if (part.length > 1) {
                                            // Take content after the header and stop at the next segment or end
                                            text = part[1].split(/###?\s+|[0-9]\.\s+/)[0].trim();
                                        } else if (idx === 0 && !rawSummary.includes("###")) {
                                            // Fallback for non-segmented summaries
                                            text = rawSummary;
                                        }

                                        if (idx === 0 && text === "Analyzing data patterns..." && !rawSummary.includes("###")) return null;

                                        return (
                                            <div key={idx} className="group/segment p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl -mr-16 -mt-16 group-hover/segment:bg-white/[0.05] transition-all" />
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-lg group-hover/segment:scale-110 transition-transform">
                                                        {idx + 1}
                                                    </div>
                                                    <h4 className="text-xl font-black text-white tracking-tight">{seg.title}</h4>
                                                </div>
                                                <div className="relative z-10">
                                                    <p className="text-app-textMuted text-base leading-relaxed font-normal whitespace-pre-wrap">
                                                        {text}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Geographic Intelligence Section (Universal Bottom Placement) */}
                {geoChart && (filterType === 'all' || filterType === 'geo_map') && (
                    <div className="glass p-8 flex flex-col relative overflow-hidden group/geo mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="absolute -right-24 -top-24 w-96 h-96 opacity-10 pointer-events-none transition-all duration-1000 group-hover/geo:opacity-20"
                             style={{ background: `radial-gradient(circle, ${domainConfig.accent}, transparent 70%)` }}
                        />
                        <div className="mb-8 relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-bold text-white text-xl tracking-tight">Geographic Intelligence</h4>
                            </div>
                            <p className="text-sm text-app-textMuted font-medium max-w-2xl leading-relaxed">
                                Global mapping intelligence synchronized with detected coordinates. Visualizing <span className="text-white font-bold">{geoChart.title}</span> patterns.
                            </p>
                        </div>
                        <div className="flex-1 w-full min-h-[500px] relative z-10">
                            {renderChart(geoChart)}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
