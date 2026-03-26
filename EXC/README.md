# 📊 Dataset Context & Insights Platform

A comprehensive end-to-end solution for automated dataset analysis, column type detection, and interactive data visualization. This platform enables data scientists and analysts to instantly understand the structure, patterns, and correlations within their CSV and Excel datasets.

---

## 🏗️ Architecture

The project is divided into three main layers:

1.  **Frontend (`/frontend`)**: A modern React 19 dashboard built with Vite and Tailwind CSS. It features interactive Recharts visualizations and a glassmorphic UI for data exploration.
2.  **Backend (`/backend`)**: A robust FastAPI engine that handles heavy data processing, statistical profiling, and domain detection.
3.  **Analytical Scripts (`/`)**: Core Python scripts (`annotation.py`, `charts.py`) used for offline batch processing and automated chart recommendations.

---

## 🚀 Key Features

- **Automated Type Detection**: Intelligent classification of columns into `categorical`, `continuous`, `discrete`, `datetime`, and `id` types using heuristic-based analysis.
- **Statistical Profiling**: Full descriptive statistics (mean, std, min, max) and uniqueness/missingness metrics for every column.
- **Contextual Domain Discovery**: Identifying business domains (e.g., Finance, Healthcare) based on column naming and data patterns.
- **Correlation Heatmapping**: Automated Pearson correlation analysis to find relationships between numeric variables.
- **Visual Recommendations**: Logic to suggest the most effective charts (Histograms, Scatter Plots, Sankey Diagrams, etc.) based on the detected data topology.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: FastAPI, Pandas, Uvicorn, Openpyxl.
- **Processing**: Python 3.9+, NumPy.

---

## 📂 Project Structure

```text
.
├── backend/            # FastAPI Analytical Engine
├── frontend/           # React Dashboard (Vite + Tailwind)
├── dataset/            # Input folder for CSV/Excel datasets
├── annotation.py       # Standalone type detection logic
├── charts.py           # Chart recommendation generator
└── README.md           # Project Documentation
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python 3.9+

### 2. Setup Backend
```bash
cd backend
pip install fastapi uvicorn pandas openpyxl
python main.py
```
*API will be available at http://localhost:8000*

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Dashboard will be available at http://localhost:5173*

---

## 📝 License
This project is licensed under the MIT License.
