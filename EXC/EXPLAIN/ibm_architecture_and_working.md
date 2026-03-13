# 📊 IBM Dataset Context & Insights Platform - Architecture & Working

This document explains the "IBM" folder, which contains an **Autonomous AI Data Analyst Platform**. The platform provides an end-to-end automated mathematical and statistical analysis of tabular datasets (CSV/Excel).

## 📂 Core Folder Structure

The project is structured into three main layers:

1. **`frontend/`**: The visual dashboard. Built using React 19, Vite, Tailwind CSS, and Recharts. Currently exposing a UI to upload and explore the data.
2. **`backend/`**: A programmatic API engine built on **FastAPI** and **Pandas**. Handle intensive computations, statistics, and modeling.
3. **`dataset/`**: The directory meant for uploaded or offline CSV/Excel files.
4. **Root Scripts**: Standalone Python scripts (`annotation.py` and `charts.py`) for offline, batch dataset evaluation.

---

## ⚙️ How It Works: The Main API Pipeline

The heart of the project inside the `/backend` folder. When a user uploads a dataset to the `/analyze` endpoint (`backend/main.py`), an extensive 11-stage pipeline is executed:

### 1. Data Ingestion & Schema Detection

- The file is loaded via Pandas into a DataFrame.
- `column_detector.py` uses heuristic algorithms to identify the mathematical type of every column (e.g., `categorical`, `continuous`, `discrete`, `datetime`, `id`, `text`).

### 2. Data Cleaning

- `data_cleaner.py` handles missing values and identifies outliers to ensure computation reliability.

### 3. Statistical Profiling

- `dataset_profiler.py` calculates descriptive statistics like mean, standard deviation, min/max combinations, and uniqueness percentages for every identified column.

### 4. Visual Recommendation Engine

- Based on the combination of column types detected (e.g., numeric vs. categorical, numeric vs. datetime), `chart_recommender.py` recommends the most suitable charts (e.g., Histograms, Scatter Plots, Heatmaps).
- `chart_data_generator.py` extracts the subset of data required to actually render those charts on the frontend.

### 5. Automated Data Insights

- `insight_generator.py` finds statistical anomalies, significant correlations, and interesting findings automatically without user input.

### 6. Business Advisory Module

The system acts as an autonomous AI consultant using scripts like `business_advisor.py`:

- **Domain Detection**: Identifies whether the data belongs to Finance, Healthcare, E-commerce, etc., based on column names.
- **KPI Generation**: Creates Key Performance Indicators (KPIs) relevant to the discovered domain.
- **Trend Interpretation & Recommendations**: Translates raw statistical facts into actionable business recommendations and an Executive Summary.

### 7. Predictive Modeling

- `predictive_modeler.py` automatically trains a basic machine learning model to predict targets derived from the dataset constraints.

### 8. Final JSON Output

- All schemas, statistics, plot configurations, business insights, and predictive results are bundled into a massive JSON payload and sent back to the React UI for visual glassmorphic rendering.

---

## 🛠️ Offline Processing Scripts

Additionally, the root directory houses offline tooling for large-scale dataset tracking:

- **`annotation.py`**: Scans the `dataset/` directory, detects formats, and saves column annotations into `dataset_column_annotations.csv`.
- **`charts.py`**: Reads the offline annotations and generates an exhaustive combinations of recommended charts into `chart_recommendations.csv`.

---

## 🚀 Execution & Setup

- **Backend Start**: Run `python main.py` inside `backend/` to start the app on port 8000.
- **Frontend Start**: Run `npm run dev` inside `frontend/` to launch the dashboard at port 5173.
