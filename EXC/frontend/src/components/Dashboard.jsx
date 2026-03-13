import { useState } from 'react';
import UploadView from './UploadView';
import ResultsDashboard from './ResultsDashboard';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [view, setView] = useState('upload'); // 'upload' or 'results'

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
        return <ResultsDashboard data={data} onBack={() => { setView('upload'); setData(null); }} />;
    }

    return (
        <UploadView 
            onUpload={handleFileUpload} 
            loading={loading} 
            error={error} 
        />
    );
}
