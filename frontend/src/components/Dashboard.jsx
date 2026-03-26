import { useState } from 'react';
import UploadView from './UploadView';
import ResultsDashboard from './ResultsDashboard';
import LightDashboard from './LightDashboard';
import SpreadsheetView from './SpreadsheetView';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [view, setView] = useState('upload'); // 'upload', 'results', or 'spreadsheet'
    const [dashboardStyle, setDashboardStyle] = useState('light'); // 'legacy' or 'light'

    const handleFileUpload = async (file) => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Server returned ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            setView('results'); // Redirect to the results "page"
        } catch (err) {
            setError(err.message || "An error occurred while analyzing the dataset.");
        } finally {
            setLoading(false);
        }
    };

    if (view === 'results' && data) {
        return dashboardStyle === 'light' ? (
            <div className="relative">
                <LightDashboard 
                    data={data} 
                    onBack={() => { setView('upload'); setData(null); }} 
                    onViewSpreadsheet={() => setView('spreadsheet')}
                />
                <button 
                    onClick={() => setDashboardStyle('legacy')}
                    className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-white text-gray-500 hover:text-black transition-all z-[100]"
                >
                    Switch to Legacy Dark View
                </button>
            </div>
        ) : (
            <div className="relative">
                <ResultsDashboard data={data} onBack={() => { setView('upload'); setData(null); }} />
                <button 
                    onClick={() => setDashboardStyle('light')}
                    className="fixed bottom-4 right-4 bg-gray-900 border border-white/20 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-black text-white transition-all z-[100] ring-4 ring-black/5"
                >
                    Switch to Light View
                </button>
            </div>
        );
    }

    if (view === 'spreadsheet' && data) {
        return <SpreadsheetView data={data} onBack={() => setView('results')} />;
    }


    return (
        <UploadView 
            onUpload={handleFileUpload} 
            loading={loading} 
            error={error} 
        />
    );
}
