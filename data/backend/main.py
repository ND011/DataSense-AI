from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import traceback

from analysis.column_detector import detect_column_types
from analysis.data_cleaner import clean_dataset
from analysis.dataset_profiler import compute_statistics
from analysis.chart_recommender import recommend_charts
from analysis.chart_data_generator import generate_chart_data
from analysis.insight_generator import generate_insights
from analysis.predictive_modeler import train_predictive_model
from analysis.business_advisor import detect_domain, generate_kpis, interpret_trends, generate_recommendations, generate_executive_summary

app = FastAPI(title="Autonomous AI Data Analyst")

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
        # STAGE 1 & 2: Load and Clean
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(contents), encoding='latin1')
            
        # Initial Schema
        schema = detect_column_types(df)
        
        # STAGE 2: Cleaning
        cleaned_df, outliers = clean_dataset(df, schema)
        
        # STAGE 3: Statistical Profiling
        stats = compute_statistics(cleaned_df, schema)
        
        # STAGE 4 & 5: Chart Recommendations
        recommendations = recommend_charts(schema, stats)
        
        # STAGE 6: Data Aggregation
        charts = []
        for rec in recommendations:
            data = generate_chart_data(cleaned_df, rec, stats)
            if data:
                rec["data"] = data
                charts.append(rec)
        
        # STAGE 9: Insight Generation
        insights = generate_insights(schema, stats, outliers)
        
        # --- NEW BUSINESS ADVISOR STAGES ---
        # Step 1: Domain
        domain_info = detect_domain(schema)
        # Step 2: KPIs
        kpis = generate_kpis(domain_info, schema, stats)
        # Step 4: Trend Interpretation
        trend_analysis = interpret_trends(schema, stats)
        # Step 5: Recommendations
        business_recs = generate_recommendations(domain_info, insights)
        # Step 6: Executive Summary
        executive_summary = generate_executive_summary(domain_info, {"rows": len(cleaned_df), "columns": len(cleaned_df.columns)}, insights)
        
        # STAGE 10: Predictive Modeling
        prediction_results = train_predictive_model(cleaned_df, schema)
        
        # STAGE 11: Final Output
        return JSONResponse(content={
            "summary": {
                "rows": len(cleaned_df),
                "columns": len(cleaned_df.columns),
                "original_rows": len(df)
            },
            "schema": schema,
            "statistics": stats,
            "charts": charts,
            "insights": insights,
            "prediction_results": prediction_results,
            "outliers": {k: v["count"] for k, v in outliers.items()},
            "business_advisor": {
                "domain": domain_info,
                "kpis": kpis,
                "trend_analysis": trend_analysis,
                "recommendations": business_recs,
                "executive_summary": executive_summary
            }
        })
        
    except Exception as e:
        print(traceback.format_exc())
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
