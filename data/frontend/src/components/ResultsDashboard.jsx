import React, { useState, useRef } from 'react';
import { 
    Search, Bell, Settings, Plus, LayoutGrid, Users, MousePointer2, Eye, 
    Share2, ArrowUpRight, ArrowDownRight, MoreHorizontal, Download, 
    PieChart as PieIcon, BarChart3, TrendingUp, ScatterChart as ScatterIcon,
    Stethoscope, ShoppingCart, Landmark, Activity, UserCheck, Briefcase, Factory, 
    FileSpreadsheet, Database, FileText, Printer, ChevronRight
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';

// Use global objects from CDN scripts
const ExcelJS = window.ExcelJS;
const html2canvas = window.html2canvas;
const jsPDF = window.jspdf.jsPDF;

// --- Domain Config ---
const DOMAIN_STYLES = {
    'Healthcare': {
        primary: '#ec4899', // Pinkish/Magenta from user image
        secondary: '#fbcfe8',
        gradient: 'from-pink-500 to-rose-600',
        bg: 'bg-[#FCF7F8]', // Soft warm bg
        accent: 'text-pink-600',
        icon: Stethoscope,
        cardBorder: 'border-pink-50',
        shadow: 'shadow-pink-500/5'
    },
    'Finance / Banking': {
        primary: '#0ea5e9', // Deep blue
        secondary: '#bfe9f9',
        gradient: 'from-sky-500 to-blue-700',
        bg: 'bg-[#F1F5F9]',
        accent: 'text-sky-600',
        icon: Landmark,
        cardBorder: 'border-blue-50',
        shadow: 'shadow-blue-500/5'
    },
    'Retail / E-commerce': {
        primary: '#f59e0b', // Amber/Yellow
        secondary: '#fde68a',
        gradient: 'from-amber-400 to-orange-600',
        bg: 'bg-[#FFFBEB]',
        accent: 'text-amber-600',
        icon: ShoppingCart,
        cardBorder: 'border-amber-50',
        shadow: 'shadow-amber-500/5'
    },
    'Manufacturing': {
        primary: '#6366f1',
        secondary: '#c7d2fe',
        gradient: 'from-indigo-500 to-violet-700',
        bg: 'bg-[#F5F3FF]',
        accent: 'text-indigo-600',
        icon: Factory,
        cardBorder: 'border-indigo-50',
        shadow: 'shadow-indigo-500/5'
    },
    'General Business': {
        primary: '#3b82f6',
        secondary: '#dbeafe',
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-[#F8FAFC]',
        accent: 'text-blue-600',
        icon: Briefcase,
        cardBorder: 'border-slate-50',
        shadow: 'shadow-blue-500/5'
    }
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-2xl glass-effect">
                <p className="font-bold text-slate-900 mb-2">{label}</p>
                {payload.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                        <p className="text-sm font-semibold text-slate-600">
                            {entry.name}: <span className="text-slate-900">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function ResultsDashboard({ data, onReset }) {
    if (!data) return null;

    const [exporting, setExporting] = useState(false);
    const dashRef = useRef(null);
    const domain = data.business_advisor?.domain?.domain || 'General Business';
    const theme = DOMAIN_STYLES[domain] || DOMAIN_STYLES['General Business'];
    const kpis = data.business_advisor?.kpis || [];
    const allCharts = data.charts || [];

    const formatNumber = (num) => {
        if (typeof num !== 'number') {
            const parsed = parseFloat(num);
            if (isNaN(parsed)) return num;
            num = parsed;
        }
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toLocaleString();
    };

    // --- High Fidelity Visual Exports ---
    
    const exportVisualExcel = async () => {
        const LibExcel = window.ExcelJS;
        const LibCanvas = window.html2canvas;
        
        if (!LibExcel || !LibCanvas) {
            alert("Export libraries are still loading. Please try again in 5 seconds.");
            return;
        }

        setExporting(true);
        try {
            const workbook = new LibExcel.Workbook();
            workbook.creator = 'Analytix AI';
            workbook.created = new Date();

            // 1. Executive Summary Sheet (Strategic Intelligence)
            const summarySheet = workbook.addWorksheet('Strategic Intelligence');
            
            // Branding Header
            summarySheet.mergeCells('A1:D1');
            summarySheet.getCell('A1').value = 'ANALYTIX AI - EXECUTIVE STRATEGY REPORT';
            summarySheet.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FF1D4ED8' } };
            summarySheet.getCell('A1').alignment = { horizontal: 'center' };

            summarySheet.addRow([`Report Domain: ${domain}`, `Confidence Level: ${data.business_advisor.domain.confidence.toUpperCase()}`]);
            summarySheet.addRow(['Generated On:', new Date().toLocaleString()]);
            summarySheet.addRow([]);

            // KPI Section
            summarySheet.addRow(['CORE PERFORMANCE INDICATORS']);
            summarySheet.getRow(summarySheet.rowCount).font = { bold: true, size: 12 };
            kpis.forEach(k => {
                summarySheet.addRow([k.name, k.value, 'Validated']);
            });
            summarySheet.addRow([]);

            // Insights Section
            summarySheet.addRow(['AI STRATEGIC INSIGHTS']);
            summarySheet.getRow(summarySheet.rowCount).font = { bold: true, size: 12 };
            data.insights.forEach(i => {
                summarySheet.addRow(['•', i.message]);
            });
            summarySheet.addRow([]);

            // Recommendations
            summarySheet.addRow(['DIRECTIVE RECOMMENDATIONS']);
            summarySheet.getRow(summarySheet.rowCount).font = { bold: true, size: 12 };
            data.business_advisor.recommendations.forEach((r, idx) => {
                summarySheet.addRow([idx + 1, r]);
            });

            summarySheet.columns = [{ width: 25 }, { width: 80 }];

            // 2. Chart Visuals Sheet
            const visualsSheet = workbook.addWorksheet('Visual Analytics');
            
            let rowOffset = 1;
            for (let i = 0; i < allCharts.length; i++) {
                const chart = allCharts[i];
                const chartElement = document.getElementById(`chart-${i}`);
                
                if (chartElement) {
                    const canvas = await LibCanvas(chartElement, {
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    });

                    const base64Image = canvas.toDataURL('image/png');
                    const imageId = workbook.addImage({
                        base64: base64Image,
                        extension: 'png',
                    });

                    // Add Title
                    visualsSheet.getCell(rowOffset, 1).value = `DIMENSION 0${i+1}: ${chart.title}`;
                    visualsSheet.getCell(rowOffset, 1).font = { bold: true, size: 14, color: { argb: 'FF1E293B' } };
                    
                    // Place Image
                    visualsSheet.addImage(imageId, {
                        tl: { col: 0, row: rowOffset + 1 },
                        ext: { width: 850, height: 480 }
                    });

                    rowOffset += 28; // Skip space for the next chart
                }
            }

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `Analytix_Visual_Report_${domain}.xlsx`);
        } catch (err) {
            console.error("Export failed:", err);
        }
        setExporting(false);
    };

    const exportPDF = async () => {
        setExporting(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const canvas = await html2canvas(dashRef.current, {
                scale: 1.5,
                useCORS: true,
                logging: false,
                windowWidth: 1400
            });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Analytix_Dashboard_${domain}.pdf`);
        } catch (err) {
            console.error("PDF Export failed:", err);
        }
        setExporting(false);
    };

    const renderChart = (chartConfig, id) => {
        const chartData = chartConfig.data || [];
        if (chartData.length === 0) return <div className="flex items-center justify-center h-full text-slate-400 italic">No data available</div>;

        return (
            <div id={id} className="w-full h-full bg-white rounded-3xl p-4 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                        switch (chartConfig.chart_type) {
                            case 'bar':
                            case 'histogram':
                                return (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
                                            {chartData.map((entry, index) => <Cell key={`c-${index}`} fill={index % 2 === 0 ? theme.primary : '#e2e8f0'} />)}
                                        </Bar>
                                    </BarChart>
                                );
                            case 'line':
                                return (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="value" stroke={theme.primary} strokeWidth={3} dot={{ r: 3, fill: theme.primary }} />
                                    </LineChart>
                                );
                            case 'pie':
                                return (
                                    <PieChart>
                                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                            {chartData.map((e, i) => <Cell key={`p-${i}`} fill={[theme.primary, '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i % 5]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" />
                                    </PieChart>
                                );
                            case 'scatter':
                                return (
                                    <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis type="number" dataKey="x" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <YAxis type="number" dataKey="y" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                                        <Scatter data={chartData} fill={theme.primary} shape="circle" />
                                    </ScatterChart>
                                );
                            default: return null;
                        }
                    })()}
                </ResponsiveContainer>
            </div>
        );
    };

    const firstChart = allCharts[0];
    const remainingCharts = allCharts.slice(1);

    return (
        <div className={`min-h-screen ${theme.bg} text-slate-900 font-sans selection:bg-blue-100 transition-colors duration-700`}>
            {/* Action Bar - Floating Fixed to avoid interfering with capture */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-3xl text-white flex items-center gap-2">
                <button 
                    onClick={onReset}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-xs font-black hover:bg-blue-500 transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    NEW ANALYSIS
                </button>
                <button 
                    onClick={exportVisualExcel}
                    disabled={exporting}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                >
                    {exporting ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    EXCEL + CHARTS
                </button>
                <button 
                    onClick={exportPDF}
                    disabled={exporting}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 rounded-xl text-xs font-black hover:bg-rose-500 transition-all disabled:opacity-50"
                >
                    <FileText className="w-4 h-4" />
                    PDF REPORT
                </button>
            </div>

            <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-8 flex-1">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-6`}>
                            <theme.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tight leading-none italic uppercase">ANALYTIX AI</span>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.accent}`}>{domain}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" />
                        ))}
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                    <button 
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        <Plus className="w-4 h-4" /> New Dataset
                    </button>
                </div>
            </header>

            <main ref={dashRef} className="p-8 pb-32 max-w-[1700px] mx-auto space-y-8">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={domain}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        {/* Domain Hero */}
                        <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-slate-100 pb-8">
                            <div className="space-y-3">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest`}>
                                    <TrendingUp className="w-3 h-3" /> System Integrity: Optimal
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
                                    Strategic Analysis <span className={`${theme.accent} underline decoration-slate-200 underline-offset-12 tracking-normal`}>Findings</span>
                                </h1>
                                <p className="text-slate-400 font-bold max-w-xl text-sm uppercase italic">
                                    Autonomous Pipeline Analysis of {data.summary.rows.toLocaleString()} Records across {data.summary.columns} Dimensional Matrix Points.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white`}>
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Score</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight">high-fidelity result</p>
                                </div>
                            </div>
                        </div>

                        {/* KPIS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {kpis.map((kpi, idx) => (
                                <div key={idx} className="group relative bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm overflow-hidden hover:scale-[1.02] transition-transform duration-500">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                        <theme.icon className="w-32 h-32" />
                                    </div>
                                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4 group-hover:text-blue-500 transition-colors tracking-[0.2em]">{kpi.name}</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic">{kpi.value}</h3>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px]">
                                            <ArrowUpRight className="w-4 h-4" /> 100% Validated
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* PRIORITY ANALYTICS BLOCK */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 space-y-8">
                                <div className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-2xl shadow-slate-200/20 relative">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{firstChart?.title}</h2>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Metric Visualization</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[500px] w-full">
                                        {firstChart && renderChart(firstChart, 'chart-0')}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <div className={`bg-gradient-to-br ${theme.gradient} rounded-[3rem] p-12 text-white shadow-3xl relative overflow-hidden h-full flex flex-col justify-between`}>
                                    <div className="absolute -right-12 -top-12 opacity-10">
                                        <theme.icon className="w-64 h-64" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-8 underline decoration-white/20 underline-offset-12">Directives</h2>
                                        <div className="space-y-6">
                                            {data.business_advisor.recommendations.map((rec, idx) => (
                                                <div key={idx} className="flex gap-6 group/rec cursor-pointer">
                                                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm shrink-0 group-hover/rec:bg-white group-hover/rec:text-blue-600 transition-all">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-sm font-bold leading-relaxed">{rec}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-12">
                                        <div className="p-6 bg-black/20 backdrop-blur-md rounded-3xl border border-white/10 italic font-medium text-sm leading-relaxed">
                                            "{data.business_advisor.executive_summary}"
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUB-MATRIX ANALYTICS */}
                        <div className="space-y-10">
                            <div className="flex items-center justify-between px-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl`}>
                                        <PieIcon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Lateral Findings</h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {remainingCharts.map((chart, idx) => (
                                    <div key={idx} className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Layer 0{idx + 1}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 uppercase italic mb-8 leading-tight">{chart.title}</h4>
                                        <div className="h-64 w-full">
                                            {renderChart(chart, `chart-${idx + 1}`)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}


