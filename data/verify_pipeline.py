import os
import sys

print("Python script starting...")

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from backend.analysis.column_detector import detect_column_types
from backend.analysis.data_cleaner import clean_dataset
from backend.analysis.dataset_profiler import compute_statistics
from backend.analysis.chart_recommender import recommend_charts
from backend.analysis.chart_data_generator import generate_chart_data
from backend.analysis.insight_generator import generate_insights
from backend.analysis.predictive_modeler import train_predictive_model
from backend.analysis.business_advisor import detect_domain, generate_kpis, interpret_trends, generate_recommendations, generate_executive_summary

# 1. Create Sample Data
data = {
    'TransactionDate': pd.date_range(start='2024-01-01', periods=100),
    'ProductCategory': ['Electronics', 'Furniture', 'Clothing', 'Electronics'] * 25,
    'Price': np.random.uniform(50, 500, 100).tolist(),
    'Quantity': np.random.randint(1, 10, 100).tolist(),
    'Revenue': None # To be calculated
}
df = pd.DataFrame(data)
df['Revenue'] = df['Price'] * df['Quantity']

# Add noise/missing
df.loc[5, 'Price'] = np.nan
df.loc[10, 'Price'] = 5000 # Outlier

print("--- EXECUTING FULL 11-STAGE PIPELINE TEST ---")

# STAGE 1: Ingestion & Schema
schema = detect_column_types(df)
print(f"Stage 1 OK: Domain identified as {schema}")

# STAGE 2: Cleaning
cleaned_df, outliers = clean_dataset(df, schema)
print(f"Stage 2 OK: {len(outliers)} outlier columns detected")

# STAGE 3: Profiling
stats = compute_statistics(cleaned_df, schema)
print("Stage 3 OK")

# STAGE 4 & 5: Chart Recommendations
recs = recommend_charts(schema, stats)
print(f"Stage 4/5 OK: {len(recs)} charts selected")

# STAGE 6: Aggregation
charts = []
for rec in recs:
    data_pts = generate_chart_data(cleaned_df, rec, stats)
    rec["data"] = data_pts
    charts.append(rec)
print("Stage 6 OK")

# STAGE 9: Insights
insights = generate_insights(schema, stats, outliers)
print(f"Stage 9 OK: {len(insights)} insights")

# ADVISOR STAGES
domain_info = detect_domain(schema)
kpis = generate_kpis(domain_info, schema, stats)
trends = interpret_trends(schema, stats)
business_recs = generate_recommendations(domain_info, insights)
summary = generate_executive_summary(domain_info, {"rows": len(cleaned_df), "columns": len(cleaned_df.columns)}, insights)
print("Advisor Stages OK")

# STAGE 10: Predictive
prediction = train_predictive_model(cleaned_df, schema)
print("Stage 10 OK")

# STAGE 11: Final Dashboard Payload
final_payload = {
    "summary": {"rows": len(cleaned_df), "columns": len(cleaned_df.columns)},
    "schema": schema,
    "statistics": stats,
    "charts": charts,
    "insights": insights,
    "prediction_results": prediction,
    "business_advisor": {
        "domain": domain_info,
        "kpis": kpis,
        "trend_analysis": trends,
        "recommendations": business_recs,
        "executive_summary": summary
    }
}

with open('full_pipeline_test.json', 'w') as f:
    json.dump(final_payload, f, indent=2)

print("\n--- TEST SUCCESSFUL ---")
print(f"Executive Summary Sample: {summary[:100]}...")
