import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Download, Filter, ChevronDown, 
  ChevronRight, ChevronLeft, Table, FileSpreadsheet, 
  Settings, Maximize2, MoreHorizontal
} from 'lucide-react';

const formatValue = (num) => {
    if (typeof num !== 'number') return String(num);
    const absNum = Math.abs(num);
    
    // Handle years (1900-2100) specifically
    if (num >= 1900 && num <= 2100) return num.toString();
    
    if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (absNum >= 10000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
};

export default function SpreadsheetView({ data, onBack }) {
    const fullSample = data?.summary?.full_sample || [];
    const columns = useMemo(() => fullSample.length > 0 ? Object.keys(fullSample[0]) : [], [fullSample]);
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // Filter Logic
    const filteredRows = useMemo(() => {
        if (!searchQuery) return fullSample;
        const lowQuery = searchQuery.toLowerCase();
        return fullSample.filter(row => 
            Object.values(row).some(val => 
                String(val).toLowerCase().includes(lowQuery)
            )
        );
    }, [fullSample, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleDownload = () => {
        const csvContent = [
            columns.join(','),
            ...fullSample.map(row => columns.map(col => `"${String(row[col]).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'datasense_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1D1F] font-sans flex flex-col">
            {/* Nav Header */}
            <header className="h-16 bg-white border-b border-[#EFEFEF] px-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 group"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-black" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <Table className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-xl tracking-tight leading-none">Universal Spreadsheet</h1>
                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mt-1">Live Dataset Explorer</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            placeholder="Search in all rows..."
                            className="bg-[#F8F9FA] border border-transparent focus:border-blue-200 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-sm w-96 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black hover:bg-gray-50 transition-all shadow-sm group"
                    >
                        <Download className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" /> Export Data
                    </button>
                    <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=datasense" alt="user" />
                    </div>
                </div>
            </header>

            {/* Main Spreadsheet Content */}
            <main className="flex-1 p-8">
                {/* Statistics Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-xs font-black polymer-text-secondary uppercase">
                                Showing {filteredRows.length.toLocaleString()} of {data.summary.rows.toLocaleString()} entries
                            </span>
                        </div>
                        <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-bold polymer-text-secondary uppercase">{columns.length} Active Columns</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                            <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/40">
                    <div className="overflow-x-auto min-h-[600px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">ID</th>
                                    {columns.map(col => (
                                        <th key={col} className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest sticky top-0 group cursor-pointer hover:text-black transition-colors">
                                            <div className="flex items-center gap-2">
                                                {col.replace(/_/g, ' ')}
                                                <ChevronDown className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0">Context</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-6 py-4 text-xs font-black text-gray-400 group-hover:text-blue-500">
                                            #{( (currentPage - 1) * rowsPerPage + idx + 1).toString().padStart(4, '0')}
                                        </td>
                                        {columns.map((col, cIdx) => (
                                            <td key={cIdx} className="px-6 py-4 relative">
                                                <span className={`text-sm tracking-tight ${
                                                    typeof row[col] === 'number' 
                                                        ? 'font-black text-blue-600' 
                                                        : 'font-medium text-[#6F767E]'
                                                }`}>
                                                    {typeof row[col] === 'number' ? (col.toLowerCase().includes('year') ? row[col].toString() : formatValue(row[col])) : String(row[col])}
                                                </span>
                                            </td>
                                        ))}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-blue-100 transition-all">
                                                    <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
                                                </button>
                                                <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-blue-100 transition-all">
                                                    <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedRows.length === 0 && (
                                    <tr>
                                        <td colSpan={columns.length + 2} className="py-20 text-center">
                                            <p className="text-gray-400 font-bold">No results matching "{searchQuery}"</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                        <div className="text-xs font-black uppercase text-gray-400 tracking-widest">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-xl border border-gray-100 flex items-center gap-2 transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:bg-gray-50 shadow-sm'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pNode = i + 1;
                                return (
                                    <button 
                                        key={i}
                                        onClick={() => setCurrentPage(pNode)}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${currentPage === pNode ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-gray-100 text-gray-500 hover:border-blue-200'}`}
                                    >
                                        {pNode}
                                    </button>
                                );
                            })}
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-xl border border-gray-100 flex items-center gap-2 transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:bg-gray-50 shadow-sm'}`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
