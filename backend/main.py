from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import traceback
import warnings

# Suppress annoying pandas warnings about datetime parsing and aggregation
warnings.filterwarnings("ignore", category=UserWarning)

from analysis.column_detector import detect_column_types, is_lookup_table
from analysis.data_cleaner import clean_dataset
from analysis.feature_engineering import perform_feature_engineering, generate_pivot_tables
from analysis.dataset_profiler import compute_statistics
from analysis.chart_recommender import recommend_charts
from analysis.chart_data_generator import generate_chart_data
from analysis.insight_generator import generate_insights
from analysis.categorical_normalizer import normalize_categorical_columns
from analysis.predictive_modeler import train_predictive_model
from analysis.business_advisor import detect_domain, generate_kpis, interpret_trends, generate_recommendations, generate_executive_summary, get_analyzer_for_domain
from analysis.llm_service import OllamaService

app = FastAPI(title="DataSense-AI Analytical Engine")
llm = OllamaService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    
    try:
        # ═══════════════════════════════════════════════════════
        # STEP 1 — Data Ingestion
        # ═══════════════════════════════════════════════════════
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.BytesIO(contents), encoding='latin1')
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(contents), encoding='cp1252')
        
        # Deduplicate column names to prevent "Series to float" errors downstream
        if not df.columns.is_unique:
            new_cols = []
            counts = {}
            for col in df.columns:
                if col in counts:
                    counts[col] += 1
                    new_cols.append(f"{col}_{counts[col]}")
                else:
                    counts[col] = 0
                    new_cols.append(col)
            df.columns = new_cols

        original_rows = len(df)
        
        # ═══════════════════════════════════════════════════════
        # STEP 3 — Initial Column Type Detection (pre-clean)
        # ═══════════════════════════════════════════════════════
        schema = detect_column_types(df)
        
        # ═══════════════════════════════════════════════════════
        # STEP 10 — Lookup Table Detection (early gate)
        # ═══════════════════════════════════════════════════════
        if is_lookup_table(df):
            # Return table-only response, no charts or ML
            return JSONResponse(content={
                "summary": {
                    "rows": len(df),
                    "columns": len(df.columns),
                    "original_rows": original_rows,
                    "is_lookup_table": True
                },
                "schema": schema,
                "statistics": {},
                "charts": [],
                "insights": [{
                    "type": "lookup_table",
                    "message": f"This dataset appears to be a lookup/reference table with {len(df)} entries. Chart generation was skipped."
                }],
                "prediction_results": None,
                "outliers": {},
                "pivot_tables": [],
                "business_advisor": {
                    "domain": {"domain": "Lookup Table", "confidence": "high", "reasoning": "Dataset detected as reference/lookup table."},
                    "kpis": [],
                    "trend_analysis": [],
                    "recommendations": ["This is a reference dataset. Use it to join with transactional data for enriched analysis."],
                    "executive_summary": "This dataset is a lookup table and does not require analytical processing."
                }
            })
        
        # ═══════════════════════════════════════════════════════
        # STEP 2 — Data Cleaning
        # ═══════════════════════════════════════════════════════
        cleaned_df, outliers = clean_dataset(df, schema)
        
        # ═══════════════════════════════════════════════════════
        # STEP 2b — Categorical Normalization (Phase 16)
        # ═══════════════════════════════════════════════════════
        cleaned_df = normalize_categorical_columns(cleaned_df)
        
        # ═══════════════════════════════════════════════════════
        # Re-detect schema AFTER cleaning & normalisation (Final types)
        # ═══════════════════════════════════════════════════════
        schema = detect_column_types(cleaned_df)
        
        # ═══════════════════════════════════════════════════════
        # STEP 4 — Feature Engineering Simulation
        # ═══════════════════════════════════════════════════════
        engineered_df, schema = perform_feature_engineering(cleaned_df, schema)
        
        # ═══════════════════════════════════════════════════════
        # STEP 5 — Exploratory Data Simulation (Statistical Profiling)
        # ═══════════════════════════════════════════════════════
        stats = compute_statistics(engineered_df, schema)
        
        # ═══════════════════════════════════════════════════════
        # Domain Detection & Analyzer Instantiation
        # ═══════════════════════════════════════════════════════
        # Start with rule-based fallback
        domain_info = detect_domain(schema)
        
        # Override with AI Semantic Detection if available
        semantic_domain = llm.detect_semantic_domain(
            column_names=list(cleaned_df.columns),
            sample_data=cleaned_df.head(5).to_dict(orient="records")
        )
        
        if semantic_domain:
            domain_info["domain"] = semantic_domain["domain"]
            domain_info["source"] = semantic_domain["source"]
            domain_info["confidence"] = "Verified by AI"
            
        analyzer = get_analyzer_for_domain(domain_info["domain"])
        
        # ═══════════════════════════════════════════════════════
        # STEP 6 — Visualization Recommendation Engine
        # ═══════════════════════════════════════════════════════
        recommendations = recommend_charts(schema, stats, analyzer)
        
        # ═══════════════════════════════════════════════════════
        # Data Aggregation (generate frontend-ready chart data)
        # ═══════════════════════════════════════════════════════
        charts = []
        for rec in recommendations:
            data = generate_chart_data(engineered_df, rec, stats)
            if data:
                rec["data"] = data
                charts.append(rec)
                
        # ═══════════════════════════════════════════════════════
        # STEP 7 — Pivot Table Generation
        # ═══════════════════════════════════════════════════════
        pivot_tables = generate_pivot_tables(engineered_df, schema)
        
        # ═══════════════════════════════════════════════════════
        # STEP 12 — Insight Generation
        # ═══════════════════════════════════════════════════════
        insights = generate_insights(schema, stats, outliers)
        
        # ═══════════════════════════════════════════════════════
        # Business Advisor Stages
        # ═══════════════════════════════════════════════════════
        kpis = analyzer.get_kpis(schema, stats)
        trend_analysis = analyzer.interpret_specific_trends(schema, stats)
        business_recs = generate_recommendations(domain_info, insights)
        executive_summary = generate_executive_summary(
            domain_info, 
            {"rows": len(cleaned_df), "columns": len(cleaned_df.columns)}, 
            insights
        )
        
        # ═══════════════════════════════════════════════════════
        # STEP 11 — ML Simulation Layer (Moved up for LLM Synthesis)
        # ═══════════════════════════════════════════════════════
        prediction_results = train_predictive_model(engineered_df, schema)
        
        # 🔗 Phase 17: Smart LLM Insight (Synthesize Stats + Predictions)
        smart_summary = llm.generate_insight(
            context_data={
                "rows": len(cleaned_df),
                "insights": insights,
                "kpis": kpis,
                "predictions": prediction_results,
                "sample": cleaned_df.head(5).to_dict(orient="records")
            },
            domain=domain_info["domain"]
        )
        
        # ═══════════════════════════════════════════════════════
        # STEP 13 — Final Structured Output
        # ═══════════════════════════════════════════════════════
        return JSONResponse(content={
            "summary": {
                "rows": len(cleaned_df),
                "columns": len(cleaned_df.columns),
                "original_rows": original_rows,
                "is_lookup_table": False
            },
            "schema": schema,
            "statistics": stats,
            "charts": charts,
            "insights": insights,
            "prediction_results": prediction_results,
            "outliers": {k: v["count"] for k, v in outliers.items()},
            "pivot_tables": pivot_tables,
            "business_advisor": {
                "domain": domain_info,
                "kpis": kpis,
                "trend_analysis": trend_analysis,
                "recommendations": business_recs,
                "executive_summary": executive_summary,
                "smart_summary": smart_summary
            }
        })
        
    except Exception as e:
        print(traceback.format_exc())
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    # Reload trigger: 2026-03-12T15:40
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
