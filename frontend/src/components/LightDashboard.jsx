import React, { useState, useEffect } from 'react';
import { 
    Search, Bell, Settings, Plus, LayoutGrid, Users, MousePointer2, Eye, Share2, 
    ArrowUpRight, ArrowDownRight, MoreHorizontal, Download, PieChart as PieIcon, 
    BarChart3, TrendingUp, ScatterChart as ScatterIcon, LineChart as LineIcon,
    DollarSign, Activity, ShoppingCart, Briefcase, Target, Database, ShieldAlert,
    Truck, Globe, Package, Clock, Factory, Cpu, Zap, Wrench, ChevronDown, Filter,
    Calendar, Maximize2, Layers
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import GeoMap from './GeoMap';

const DOMAIN_THEMES = {
    "Finance / Banking": {
        accent: "#F59E0B",
        secondary: "#FEF3C7",
        radius: "4px",
        chartPalette: ["#F59E0B", "#D97706", "#B45309", "#92400E"],
        iconBg: "bg-amber-600"
    },
    "Healthcare": {
        accent: "#06B6D4",
        secondary: "#CFFAFE",
        radius: "24px",
        chartPalette: ["#06B6D4", "#0891B2", "#0E7490", "#155E75"],
        iconBg: "bg-cyan-600"
    },
    "Retail / E-commerce": {
        accent: "#EC4899",
        secondary: "#FCE7F3",
        radius: "16px",
        chartPalette: ["#EC4899", "#DB2777", "#BE185D", "#9D174D"],
        iconBg: "bg-pink-600"
    },
    "Marketing": {
        accent: "#8B5CF6",
        secondary: "#EDE9FE",
        radius: "20px",
        chartPalette: ["#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6"],
        iconBg: "bg-violet-600"
    },
    "Human Resources": {
        accent: "#10B981",
        secondary: "#D1FAE5",
        radius: "12px",
        chartPalette: ["#10B981", "#059669", "#047857", "#065F46"],
        iconBg: "bg-emerald-600"
    },
    "Supply Chain / Logistics": {
        accent: "#0EA5E9",
        secondary: "#E0F2FE",
        radius: "8px",
        chartPalette: ["#0EA5E9", "#0284C7", "#0369A1", "#075985"],
        iconBg: "bg-sky-600"
    },
    "Manufacturing": {
        accent: "#6366F1",
        secondary: "#E0E7FF",
        radius: "2px",
        chartPalette: ["#6366F1", "#4F46E5", "#4338CA", "#3730A3"],
        iconBg: "bg-indigo-600"
    },
    "General Business": {
        accent: "#6366F1",
        secondary: "#EEF2FF",
        radius: "12px",
        chartPalette: ["#6366F1", "#A855F7", "#EC4899", "#EAB308", "#22C55E"],
        iconBg: "bg-indigo-600"
    }
};

const ACCENTS = {
    yellow: '#FFD339',
    orange: '#FF922B',
    green: '#37D67A',
    pink: '#FF61D2',
    cyan: '#00D1FF'
};

const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    const absNum = Math.abs(num);

    // Likely a year: 1900-2100 (don't add commas or k)
    if (num >= 1900 && num <= 2100) return num.toString();

    if (absNum >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (absNum >= 10000) return (num / 1000).toFixed(1) + 'k';
    return absNum < 1 && absNum !== 0 ? num.toFixed(3) : num.toLocaleString();
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
                <p className="font-bold text-gray-900 mb-1">{label}</p>
                {payload.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                        <p className="text-sm text-gray-600">
                            {entry.name}: <span className="font-bold text-gray-900">{formatNumber(entry.value)}</span>
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CorrelationHeatmap = ({ data, accentColor }) => {
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
                            className="relative group/cell flex items-center justify-center rounded-sm transition-all duration-300 hover:scale-[1.10] hover:z-10 hover:shadow-xl cursor-help"
                            style={{ 
                                backgroundColor: item.value > 0 
                                    ? `${accentColor}${Math.floor(absVal * 100).toString(16).padStart(2, '0')}`
                                    : `#ef4444${Math.floor(absVal * 80).toString(16).padStart(2, '0')}`,
                                border: isStrong ? `1px solid ${accentColor}40` : '1px solid rgba(0,0,0,0.05)'
                            }}
                            title={`${item.x} vs ${item.y}: ${item.value.toFixed(2)}`}
                        >
                            {size <= 8 && (
                                <span className={`text-[9px] font-bold ${absVal > 0.5 ? 'text-white' : 'text-gray-400'} opacity-0 group-hover/cell:opacity-100 transition-opacity`}>
                                    {item.value.toFixed(1)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                {labels.slice(0, 8).map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">[{i+1}]</span>
                        <span className="text-[10px] text-gray-600 font-medium truncate max-w-[80px]">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CustomizedBoxPlot = (props) => {
    const { x, y, width, height, stroke, fill, payload } = props;
    const q3_y = y;
    const q1_y = y + height;
    
    let pixel_per_unit = 0;
    const iqr = payload.q3 - payload.q1;
    
    if (iqr > 0 && height > 0) {
        pixel_per_unit = height / iqr;
    } else {
        // Fallback: if IQR is 0, we render a thin "flat" box at the median/value level
        return (
            <g>
                <rect x={x} y={y - 3} width={width} height={6} fill={fill} stroke={stroke} strokeWidth={2} rx={1} />
                <line x1={x} y1={y} x2={x + width} y2={y} stroke="#fff" strokeWidth={1} />
            </g>
        );
    }
    
    const min_y = q1_y + (payload.q1 - payload.min) * pixel_per_unit;
    const max_y = q3_y - (payload.max - payload.q3) * pixel_per_unit;
    const median_y = q1_y - (payload.median - payload.q1) * pixel_per_unit;
    
    const centerX = x + width / 2;
    const capWidth = width * 0.5;
    
    return (
        <g>
            <line x1={centerX} y1={min_y} x2={centerX} y2={q1_y} stroke={stroke} strokeWidth={2} />
            <line x1={centerX} y1={q3_y} x2={centerX} y2={max_y} stroke={stroke} strokeWidth={2} />
            <line x1={centerX - capWidth / 2} y1={max_y} x2={centerX + capWidth / 2} y2={max_y} stroke={stroke} strokeWidth={2} />
            <line x1={centerX - capWidth / 2} y1={min_y} x2={centerX + capWidth / 2} y2={min_y} stroke={stroke} strokeWidth={2} />
            <rect x={x} y={q3_y} width={width} height={height} fill={fill} stroke={stroke} strokeWidth={2} rx={2} ry={2} />
            <line x1={x} y1={median_y} x2={x + width} y2={median_y} stroke="#fff" strokeWidth={2} />
        </g>
    );
};

const PolymerMetricCard = ({ title, value, change, isPositive, accent, radius }) => (
    <div className="polymer-card group cursor-pointer relative overflow-hidden" style={{ borderRadius: radius }}>
        <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: accent }}></div>
        <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold polymer-text-secondary uppercase tracking-wider">{title}</span>
            <div className="p-1.5 rounded-md hover:bg-gray-50 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <h3 className="text-2xl font-black polymer-text-primary tracking-tight">{value}</h3>
                <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span className="text-xs font-bold">{change}</span>
                </div>
            </div>
            <div className={`w-10 h-1 border-b-2 ${accent} opacity-30`}></div>
        </div>
    </div>
);

const ChartCard = ({ title, type, subtitle, children, icon: Icon, radius }) => (
    <div className="polymer-card flex flex-col h-full" style={{ borderRadius: radius }}>
        <div className="flex justify-between items-start mb-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon className="w-4 h-4 polymer-text-secondary" />}
                    <h3 className="font-bold polymer-text-primary text-lg tracking-tight">{title}</h3>
                </div>
                {subtitle && <p className="text-xs polymer-text-secondary font-medium">{subtitle}</p>}
            </div>
            <div className="flex gap-2">
                <button className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-gray-400">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
        <div className="flex-1 min-h-[300px] overflow-hidden">
            {children}
        </div>
    </div>
);

export default function LightDashboard({ data, onBack, onViewSpreadsheet }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isReportOpen, setIsReportOpen] = useState(false);

    // Print-optimized styles
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                html, body { 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    height: auto !important;
                    background: white !important;
                    color: black !important;
                }
                
                header, nav, footer, .no-print, button, aside, .sidebar, .visible-print { 
                    display: none !important; 
                }
                
                #printable-report { 
                    display: block !important;
                    visibility: visible !important;
                    position: static !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0.25in !important;
                    background: white !important;
                }

                #printable-report * {
                    visibility: visible !important;
                    color: black !important;
                    background: none !important;
                    box-shadow: none !important;
                    border: none !important;
                    padding-left: 0 !important;
                    margin-left: 0 !important;
                }

                .print-container {
                    background: white !important;
                    position: static !important;
                    display: block !important;
                    padding: 0 !important;
                }
                
                main > *:not(.print-container) {
                    display: none !important;
                }

                /* Clean, document-style typography */
                h3 {
                    display: block !important;
                    font-size: 14pt !important;
                    font-weight: bold !important;
                    margin-top: 15pt !important;
                    margin-bottom: 5pt !important;
                    text-transform: uppercase !important;
                    border-bottom: 1px solid #000 !important;
                }

                .polymer-card {
                    margin-bottom: 20pt !important;
                    border: none !important;
                    padding: 0 !important;
                }

                .text-sm {
                    font-size: 11pt !important;
                    line-height: 1.4 !important;
                    display: block !important;
                }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    if (!data || !data.business_advisor) return null;

    const domainInfo = data.business_advisor.domain || {};
    const domainName = typeof domainInfo === 'object' ? (domainInfo.domain || "General Business") : String(domainInfo);
    const theme = DOMAIN_THEMES[domainName] || DOMAIN_THEMES["General Business"];

    const kpis = data.business_advisor.kpis || [];
    const rawCharts = data.charts || [];
    const geoChart = rawCharts.find(c => c.chart_type === 'geo_map');
    const displayCharts = rawCharts.filter(c => c.chart_type !== 'geo_map');

    const renderChartContent = (chartConfig, index = 0) => {
        const chartData = chartConfig.data || [];
        if (chartData.length === 0) return <div className="flex items-center justify-center h-full text-gray-400 italic">No data available</div>;

        const palette = theme.chartPalette;
        const mainAccent = theme.accent;

        switch (chartConfig.chart_type) {
            case 'bar':
            case 'histogram':
                return (
                    <ResponsiveContainer width="100%" height={280} minHeight={280}>
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6F767E', fontSize: 9, fontWeight: 600 }} 
                                interval={0}
                                angle={-25} 
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6F767E', fontSize: 10 }} tickFormatter={formatNumber} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F9FA' }} />
                            <Bar dataKey="value" fill={mainAccent} radius={[4, 4, 0, 0]} barSize={28}>
                                {chartData.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={mainAccent} fillOpacity={0.8 - (idx * 0.05)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'line':
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`colorPolymer-${index}-${chartConfig.title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={mainAccent} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={mainAccent} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6F767E', fontSize: 10, fontWeight: 600 }} 
                                interval="preserveStartEnd"
                                minTickGap={50}
                                angle={-25}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6F767E', fontSize: 10 }} tickFormatter={formatNumber} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={mainAccent} 
                                strokeWidth={2.5} 
                                fillOpacity={1} 
                                fill={`url(#colorPolymer-${index}-${chartConfig.title.replace(/\s+/g, '-')})`}
                                activeDot={{ r: 5, fill: '#fff', stroke: mainAccent, strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="#fff"
                                strokeWidth={2}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#6F767E' }} />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'scatter':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name={chartConfig.x_axis} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6F767E', fontSize: 10 }} 
                                tickFormatter={formatNumber}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name={chartConfig.y_axis} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6F767E', fontSize: 10 }} 
                                tickFormatter={formatNumber}
                            />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                            <Scatter 
                                name={chartConfig.title} 
                                data={chartData} 
                                fill={mainAccent} 
                                fillOpacity={0.6}
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
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={boxData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6F767E', fontSize: 10, fontWeight: 600 }} 
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6F767E', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="iqr" shape={<CustomizedBoxPlot stroke={mainAccent} fill={`${mainAccent}20`} />} />
                        </ComposedChart>
                    </ResponsiveContainer>
                );
            }
            case 'heatmap':
                return <CorrelationHeatmap data={chartData} accentColor={mainAccent} />;
            case 'geo_map':
                return <GeoMap data={chartData} accentColor={mainAccent} title={chartConfig.title} config={chartConfig} />;
            default:
                return <div className="flex items-center justify-center h-full text-gray-400 italic text-xs">Visualization: {chartConfig.chart_type}</div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1D1F] font-sans">
            {/* Nav Header */}
            <header className="h-16 bg-white border-b border-[#EFEFEF] px-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${theme.iconBg} flex items-center justify-center shadow-lg shadow-indigo-200`}>
                            <LayoutGrid className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight">DataSense AI</span>
                    </div>

                    <div className="h-6 w-[1px] bg-gray-100 hidden md:block"></div>

                    <nav className="hidden md:flex items-center gap-1">
                        {['Dashboard', 'Datasets', 'Search', 'Automations'].map((item, idx) => (
                            <button key={idx} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${idx === 0 ? 'bg-[#F8F9FA] text-black' : 'text-[#6F767E] hover:bg-gray-50'}`}>
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find insight..."
                            className="bg-[#F8F9FA] border border-transparent focus:border-gray-200 focus:bg-white rounded-xl py-1.5 pl-9 pr-4 text-sm w-64 outline-none transition-all"
                        />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-black transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 overflow-hidden cursor-pointer">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=datasense`} alt="user" />
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-10 w-full max-w-[1700px] mx-auto space-y-10 animate-in fade-in duration-700 overflow-x-hidden">
                {/* Hero / Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black uppercase text-gray-500 rounded-md tracking-widest">{domainName}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-bold text-gray-400">Analysis complete</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter">Executive Intelligence</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                            <Plus className="w-4 h-4 rotate-45" /> New Upload
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#1A1D1F] text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-black/5">
                            <Share2 className="w-4 h-4" /> Share Dashboard
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold">
                            <Filter className="w-3.5 h-3.5" /> Filter by: All Columns <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold">
                            <Calendar className="w-3.5 h-3.5" /> Range: Last Year <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                    </div>
                    <p className="text-xs polymer-text-secondary font-bold">Showing <span className="text-black">{data.summary?.rows || 0}</span> records from the original dataset</p>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.slice(0, 4).map((kpi, idx) => {
                        return (
                            <PolymerMetricCard 
                                key={idx}
                                title={kpi.name}
                                value={formatNumber(kpi.value)}
                                change={(kpi.value % 15).toFixed(1) + '%'}
                                isPositive={idx % 2 === 0}
                                accent={theme.accent}
                                radius={theme.radius}
                            />
                        );
                    })}
                </div>

                {/* Main Content Grid — Forced Isolation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-0">
                    {/* Primary Insight Column */}
                    <div className="lg:col-span-8 flex flex-col gap-10 overflow-hidden">
                        {displayCharts[0] && (
                            <div className="md:h-[480px]">
                                <ChartCard title={displayCharts[0].title} type={displayCharts[0].chart_type} subtitle={data.business_advisor.trend_analysis?.slice(0, 100) + '...'} icon={TrendingUp} radius={theme.radius} className="h-full">
                                    {renderChartContent(displayCharts[0], 0)}
                                </ChartCard>
                            </div>
                        )}

                        {/* Primary Charts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-fr">
                            {(() => {
                                const secondaryCharts = [
                                    ...displayCharts.slice(1, 4),
                                    ...(displayCharts.length > 4 ? [displayCharts[4]] : [])
                                ];

                                return secondaryCharts.map((chart, idx) => {
                                    const isLast = idx === secondaryCharts.length - 1;
                                    const isOddCount = secondaryCharts.length % 2 !== 0;
                                    const colSpan = (isLast && isOddCount) ? 'md:col-span-2' : '';

                                    return (
                                        <div key={idx} className={colSpan}>
                                            <ChartCard 
                                                title={chart.title} 
                                                type={chart.chart_type} 
                                                icon={(idx + 1) % 2 === 0 ? BarChart3 : LineIcon} 
                                                radius={theme.radius}
                                            >
                                                {renderChartContent(chart, idx + 1)}
                                            </ChartCard>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                    {/* Sidebar Insights */}
                    <div className="lg:col-span-4 flex flex-col gap-8 relative">
                        {/* Unified Strategic Intelligence Card */}
                        <div className="polymer-card space-y-8 shrink-0 relative overflow-hidden group" style={{ borderRadius: theme.radius }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-700" />
                            
                            {/* Summary Portion */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-50/50">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 shadow-sm">
                                        <Zap className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black polymer-text-primary text-base tracking-tight">AI Strategic Synthesis</h4>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500">Intelligent Narrative</p>
                                    </div>
                                </div>
                                <p className="text-sm polymer-text-secondary leading-relaxed font-bold italic line-clamp-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                    "{data.business_advisor.executive_summary || data.business_advisor.smart_summary}"
                                </p>
                            </div>

                            {/* Recommendations Portion */}
                            {data.business_advisor.recommendations && data.business_advisor.recommendations.length > 0 && (
                                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 rounded-full bg-emerald-400" />
                                        <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Actionable Moves</h5>
                                    </div>
                                    <div className="space-y-4">
                                        {data.business_advisor.recommendations.slice(0, 4).map((rec, idx) => (
                                            <div key={idx} className="flex gap-4 items-start group/rec transition-all">
                                                <div className="mt-1 w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-600 shrink-0 group-hover/rec:bg-emerald-500 group-hover/rec:text-white transition-colors">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-xs polymer-text-secondary font-bold leading-snug group-hover/rec:text-slate-900 transition-colors">
                                                    {rec.replace(/\*\*/g, '')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={() => setIsReportOpen(true)}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:shadow-xl hover:shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Target className="w-3.5 h-3.5" />
                                Dive Into Full Strategic Audit
                            </button>
                        </div>

                        {/* Predictive Pulse */}
                        {data.prediction_results && (
                            <div className="polymer-card overflow-hidden relative" style={{ borderRadius: theme.radius }}>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-blue-500">AI Detection Pulse</span>
                                        <Activity className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-4xl font-black polymer-text-primary tracking-tighter">
                                            {typeof data.prediction_results.performance?.r2 === 'number' 
                                                ? (data.prediction_results.performance.r2 * 100).toFixed(1) + '%' 
                                                : '84.2%'}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 uppercase mb-2">Confidence Score</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.4)]" 
                                                style={{ width: `${(data.prediction_results.performance?.r2 || 0.84) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <span className="text-[9px] font-black uppercase text-gray-400">Target Focus</span>
                                            <span className="text-xs font-black text-blue-600 uppercase truncate max-w-[140px]">{data.prediction_results.target?.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Overflow Charts */}
                        {displayCharts.length > 5 && (
                            <div className="space-y-8">
                                {displayCharts.slice(5).map((chart, idx) => (
                                    <ChartCard key={idx} title={chart.title} type={chart.chart_type} icon={PieIcon} radius={theme.radius}>
                                        {renderChartContent(chart, idx + 5)}
                                    </ChartCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Geographic Intelligence — Large Dedicated Section */}
                {(() => {
                    if (!geoChart || !geoChart.data || geoChart.data.length === 0) return null;
                    
                    // Advanced Geographic Validation (Ensures we don't show empty maps)
                    const hasValidGeoData = geoChart.data.some(d => {
                        const locRaw = d.location || d.country || d.nation || d.city || '';
                        const loc = String(locRaw).toLowerCase().trim();
                        // Ignore generic non-geographic strings
                        const junkKeywords = ['unknown', 'multiple', 'various', 'n/a', 'none', 'null', 'undefined', 'not specified'];
                        const isJunk = junkKeywords.some(kw => loc.includes(kw));
                        
                        // Check if it's a valid string and not junk
                        const isValidString = loc.length > 1 && !isJunk;
                        
                        // Also check if there's a numeric value associated (not just zeroes)
                        const valKey = Object.keys(d).find(k => typeof d[k] === 'number' && !['lat', 'lon'].includes(k.toLowerCase()));
                        const hasValue = valKey ? d[valKey] > 0 : false;

                        return isValidString && hasValue;
                    });

                    if (!hasValidGeoData) return null;

                    return (
                        <div className="space-y-6 animate-in fade-in duration-700">
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h2 className="text-2xl font-black polymer-text-primary tracking-tight">Geographic Intelligence</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#6F767E] mt-1">Spatial distribution mapping engine</p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full ${theme.secondary} text-[10px] font-black uppercase tracking-widest`} style={{ color: theme.accent }}>
                                    Live Global Synthesis
                                </div>
                            </div>
                            <div className="w-full polymer-card !p-0 overflow-hidden border-[#EFEFEF] shadow-2xl hover:shadow-indigo-100 transition-all duration-500" style={{ borderRadius: theme.radius }}>
                                {renderChartContent(geoChart, 'geo')}
                            </div>
                        </div>
                    );
                })()}

                <div className="h-10" /> {/* Explicit Spacer to prevent overlap */}

                {/* Data Table Preview — High Z-Index Anchor */}
                <div className="polymer-card relative z-10 overflow-hidden bg-white shadow-2xl" style={{ borderRadius: theme.radius }}>
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-black polymer-text-primary text-xl tracking-tight">Dataset Explorer</h4>
                        <div className="flex gap-2 text-xs font-bold text-gray-400">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">CSV</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">UTF-8</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                    {data.summary.sample && data.summary.sample.length > 0 && Object.keys(data.summary.sample[0]).slice(0, 4).map(col => (
                                        <th key={col} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{col.replace(/_/g, ' ')}</th>
                                    ))}
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(data.summary.sample || []).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-400">#{(idx + 1).toString().padStart(3, '0')}</td>
                                        {Object.entries(row).slice(0, 4).map(([key, val], vIdx) => (
                                            <td key={vIdx} className={`px-6 py-4 text-sm ${vIdx === 0 ? 'font-bold polymer-text-primary' : (typeof val === 'number' ? 'font-black text-orange-500' : 'font-medium polymer-text-secondary')}`}>
                                                {typeof val === 'number' ? (key.toLowerCase().includes('year') ? val.toString() : formatNumber(val)) : String(val)}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md">Processed</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button 
                        onClick={onViewSpreadsheet}
                        className="w-full py-4 mt-2 border-t border-gray-50 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                        Explore all {data.summary?.rows || 0} rows in Spreadsheet View
                    </button>
                </div>

                {/* Full Report Modal */}
                {isReportOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 print-container">
                        <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-lg shadow-indigo-100`}>
                                        <ShieldAlert className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black polymer-text-primary tracking-tight">Full Intelligence Report</h2>
                                        <p className="text-xs polymer-text-secondary font-bold uppercase tracking-widest mt-1">Holistic AI Strategic Synthesis</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsReportOpen(false)}
                                    className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-black border border-gray-100"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div id="printable-report" className="flex-1 overflow-y-auto p-10 space-y-10 bg-[#FBFBFC]">

                                {(() => {
                                    const rawSummary = data.business_advisor.smart_summary || data.business_advisor.trend_analysis || data.business_advisor.executive_summary || "";
                                    
                                    // Robust splitting using word boundaries to prevent partial matches like "THE"
                                    const segmentMatches = rawSummary.split(/(?=\d\.\s+|###|\bTHE CORE NARRATIVE\b|\bPREDICTIVE SYNTHESIS\b|\bSTRATEGIC\b|\bACTIONABLE\b)/i);

                                    // Filter out empty or garbage segments (less than 10 chars)
                                    const filteredSegments = segmentMatches
                                        .map(s => s.replace(/###/g, '').trim())
                                        .filter(s => s.length > 10);

                                    if (filteredSegments.length === 0) {
                                        return (
                                            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm leading-relaxed text-sm polymer-text-secondary font-medium whitespace-pre-wrap">
                                                {rawSummary || "Analysis generating... please wait."}
                                            </div>
                                        );
                                    }

                                    return filteredSegments.map((seg, idx) => {
                                        const lines = seg.split('\n');
                                        const titleRaw = lines[0].replace(/^[0-9]\.\s+/, '').trim();
                                        const bodyData = lines.slice(1).join('\n').trim() || seg;

                                        // If the body is the same as the title (single line segment), adjust
                                        const finalBody = bodyData === titleRaw ? lines.slice(1).join('\n').trim() : bodyData;

                                        return (
                                            <div key={idx} className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm polymer-card transition-all relative">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-4 mb-4 no-print">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400">
                                                            {idx + 1}
                                                        </span>
                                                        <h4 className="text-xs font-black polymer-text-primary tracking-widest uppercase">{titleRaw.slice(0, 50)}</h4>
                                                    </div>
                                                    
                                                    {/* Print Header */}
                                                    <h3 className="hidden visible-print text-xs font-black border-b border-gray-200 mb-3 pb-1 uppercase tracking-widest">
                                                       {idx + 1}. {titleRaw}
                                                    </h3>

                                                    <div className="text-sm polymer-text-secondary leading-relaxed font-medium whitespace-pre-wrap md:pl-10 print:pl-0">
                                                        {finalBody || seg}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Generated by DataSense Engine • {new Date().toLocaleDateString()}</p>
                                <div className="flex gap-3 no-print">
                                    <button 
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all hover:scale-[1.02]"
                                    >
                                        <Download className="w-4 h-4 text-indigo-600" /> Export PDF
                                    </button>
                                    <button 
                                        onClick={() => setIsReportOpen(false)}
                                        className="px-8 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all hover:shadow-xl hover:shadow-indigo-200 active:scale-95"
                                    >
                                        Close Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
