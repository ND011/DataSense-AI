from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
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
        # STEP 1 — Data Ingestion
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.BytesIO(contents), encoding='latin1')
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(contents), encoding='cp1252')
        
        # Deduplicate column names
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
        schema = detect_column_types(df)
        
        if is_lookup_table(df):
            return JSONResponse(content={
                "summary": {"rows": len(df), "columns": len(df.columns), "original_rows": original_rows, "is_lookup_table": True},
                "schema": schema, "statistics": {}, "charts": [], "insights": [{"type": "lookup_table", "message": "Lookup table detected."}],
                "prediction_results": None, "outliers": {}, "pivot_tables": [],
                "business_advisor": {
                    "domain": {"domain": "Lookup Table"}, "kpis": [], "trend_analysis": [],
                    "recommendations": ["Reference dataset."], "executive_summary": "Lookup table."
                }
            })
        
        cleaned_df, outliers = clean_dataset(df, schema)
        cleaned_df = normalize_categorical_columns(cleaned_df)
        schema = detect_column_types(cleaned_df)
        engineered_df, schema = perform_feature_engineering(cleaned_df, schema)
        stats = compute_statistics(engineered_df, schema)
        
        domain_info = detect_domain(schema)
        semantic_domain = llm.detect_semantic_domain(
            column_names=list(cleaned_df.columns),
            sample_data=cleaned_df.head(5).to_dict(orient="records")
        )
        if semantic_domain:
            domain_info.update(semantic_domain)
            domain_info["confidence"] = "Verified by AI"
            
        analyzer = get_analyzer_for_domain(domain_info["domain"])
        recommendations = recommend_charts(schema, stats, analyzer)
        
        charts = []
        for rec in recommendations:
            res_data = generate_chart_data(engineered_df, rec, stats)
            if res_data:
                rec["data"] = res_data
                charts.append(rec)
                
        pivot_tables = generate_pivot_tables(engineered_df, schema)
        insights = generate_insights(schema, stats, outliers)
        kpis = analyzer.get_kpis(schema, stats)
        trend_analysis = analyzer.interpret_specific_trends(schema, stats)
        business_recs = generate_recommendations(domain_info, insights)
        executive_summary = generate_executive_summary(domain_info, {"rows": len(cleaned_df), "columns": len(cleaned_df.columns)}, insights)
        
        prediction_results = train_predictive_model(engineered_df, schema)
        
        smart_summary = llm.generate_insight(
            context_data={
                "rows": len(cleaned_df), "insights": insights, "kpis": kpis,
                "predictions": prediction_results, "sample": cleaned_df.head(5).to_dict(orient="records")
            },
            domain=domain_info["domain"]
        )
         # [PHASE 18] Dynamic AI Synthesis Extraction
        final_summary = executive_summary
        final_recs = business_recs
        
        if "[EXECUTIVE SUMMARY]" in smart_summary and "[STRATEGIC ACTION PLAN]" in smart_summary:
            try:
                parts = smart_summary.split("[STRATEGIC ACTION PLAN]")
                sum_part = parts[0].replace("[EXECUTIVE SUMMARY]", "").strip()
                rec_part = parts[1].strip()
                
                if sum_part: final_summary = sum_part
                
                # Extract bullets like "- Move"
                ai_recs = [line.strip("- ").strip() for line in rec_part.split("\n") if line.strip().startswith("-")]
                if ai_recs: final_recs = ai_recs
            except Exception as parse_err:
                print(f"AI Parse Error: {parse_err}")

        def make_df_json_safe(df_input):
            df_temp = df_input.copy()
            for col in df_temp.columns:
                if pd.api.types.is_datetime64_any_dtype(df_temp[col]):
                    df_temp[col] = df_temp[col].dt.strftime('%Y-%m-%d %H:%M:%S')
            return df_temp.replace({np.nan: None}).to_dict(orient="records")

        return JSONResponse(content={
            "summary": {
                "rows": len(cleaned_df), "columns": len(cleaned_df.columns), "original_rows": original_rows,
                "sample": make_df_json_safe(cleaned_df.head(10)), "full_sample": make_df_json_safe(cleaned_df)
            },
            "schema": schema, "statistics": stats, "charts": charts, "insights": insights,
            "prediction_results": prediction_results, "outliers": {k: v["count"] for k, v in outliers.items()},
            "pivot_tables": pivot_tables,
            "business_advisor": {
                "domain": domain_info,
                "kpis": kpis,
                "trend_analysis": trend_analysis,
                "recommendations": final_recs,
                "executive_summary": final_summary,
                "smart_summary": smart_summary # Raw for full report modal
            }
        })
        
    except Exception as e:
        print(traceback.format_exc())
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/ask")
async def ask_llm(request: dict):
    query = request.get('query')
    ctx = request.get('context')
    if not query:
        return JSONResponse(content={"error": "No query provided"}, status_code=400)
    answer = llm.ask(query, ctx)
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
