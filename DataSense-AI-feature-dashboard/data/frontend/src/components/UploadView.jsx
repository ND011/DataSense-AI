import { Upload, Activity, Loader2, Info } from 'lucide-react';

export default function UploadView({ onUpload, loading, error }) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-950 text-white">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Activity className="w-4 h-4" /> Powering Business Intelligence
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
                        Analyze Your <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">Dataset</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Upload your CSV files and let our autonomous AI pipeline perform deep statistical analysis, 
                        predictive modeling, and strategic business advising in seconds.
                    </p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-4 md:p-12 overflow-hidden">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            disabled={loading}
                        />
                        
                        <div className={`border-2 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center transition-all duration-500
                            ${loading ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 group-hover:border-blue-500/50 group-hover:bg-slate-950'}`}>
                            {loading ? (
                                <div className="text-center space-y-6">
                                    <div className="relative">
                                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
                                        <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black text-white">Synthesizing Analytics...</p>
                                        <p className="text-slate-500 font-medium italic">Stage 4: Statistical Profiling and Aggregation</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-6">
                                    <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                                        <Upload className="w-10 h-10 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black text-white">Click or drag to upload</p>
                                        <p className="text-slate-500 font-medium">Supports .CSV format (Max 50MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <Info className="w-5 h-5 shrink-0" />
                        <p className="font-bold text-sm tracking-wide uppercase">{error}</p>
                    </div>
                )}

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Statistical Engine", desc: "Automated cleaning and outliers detection" },
                        { title: "Predictive Models", desc: "Machine learning for future forecasting" },
                        { title: "Strategic Advisory", desc: "Business recommendations from data" }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
                            <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                            <p className="text-slate-500 text-sm font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
