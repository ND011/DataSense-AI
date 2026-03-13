from analysis.column_detector import detect_column_types
from analysis.data_cleaner import clean_dataset
from analysis.dataset_profiler import compute_statistics
from analysis.chart_recommender import recommend_charts
from analysis.chart_data_generator import generate_chart_data
from analysis.insight_generator import generate_insights
from analysis.predictive_modeler import train_predictive_model
import pandas as pd
import numpy as np
import json

# Create a sample dataset for testing
data = {
    'Date': pd.date_range(start='2023-01-01', periods=100),
    'Category': ['A', 'B', 'C', 'A'] * 25,
    'Sales': np.random.normal(100, 20, 100).tolist(),
    'Profit': np.random.normal(20, 5, 100).tolist(),
}
# Add some missing values and outliers
data['Sales'][5] = None
data['Sales'][10] = 1000 # Outlier

df = pd.DataFrame(data)

print("Starting Pipeline Test...")

# STAGE 1
schema = detect_column_types(df)
print(f"Schema detected: {schema}")

# STAGE 2
cleaned_df, outliers = clean_dataset(df, schema)
print(f"Cleaning complete. Outliers: {outliers}")

# STAGE 3
stats = compute_statistics(cleaned_df, schema)
print("Stats computed.")

# STAGE 4 & 5
recs = recommend_charts(schema, stats)
print(f"Recommended {len(recs)} charts.")

# STAGE 6
charts = []
for rec in recs:
    data_pts = generate_chart_data(cleaned_df, rec, stats)
    rec["data"] = data_pts
    charts.append(rec)

# STAGE 9
insights = generate_insights(schema, stats, outliers)
print(f"Generated {len(insights)} insights.")

# STAGE 10
prediction = train_predictive_model(cleaned_df, schema)
print(f"Prediction model trained.")

# STAGE 11
result = {
    "summary": {"rows": len(cleaned_df), "columns": len(cleaned_df.columns)},
    "schema": schema,
    "statistics": stats,
    "charts": charts,
    "insights": insights,
    "prediction_results": prediction
}

with open('pipeline_result_test.json', 'w') as f:
    json.dump(result, f, indent=2)

print("SUCCESS! Result saved to pipeline_result_test.json")
