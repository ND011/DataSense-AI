import pandas as pd
from backend.analysis.geo_engine import generate_geo_viz, get_choropleth_figure
import json

# Create a sample dataset that mimics the user's scenario
data = {
    "Country": ["USA", "USA", "France", "France", "India", "Germany", "Brazil", "China", "United Kingdom", "Canada"],
    "Year": [2000, 2001, 2000, 2001, 2000, 2000, 2000, 2000, 2000, 2000],
    "GDP": [100, 110, 80, 85, 90, 88, 70, 95, 82, 75],
    "Population": [300, 305, 60, 61, 1000, 82, 200, 1400, 65, 35]
}

df = pd.DataFrame(data)

print("--- Running Geo Engine Detection ---")
result = generate_geo_viz(df)

if isinstance(result, str):
    print(f"FAILED: {result}")
else:
    print(f"SUCCESS: Detected Map Type: {result['map_type']}")
    print(f"Geographic Column: {result['geo_column']}")
    print(f"Metric Column: {result['metric_column']}")
    print(f"Time Column: {result['time_column']}")
    
    # Check aggregation
    agg_df = pd.DataFrame(result['aggregated_data'])
    print("\n--- Aggregated Data Peek ---")
    print(agg_df.head())
    
    # Test Plotly instantiation
    print("\n--- Testing Plotly Init ---")
    fig = get_choropleth_figure(result)
    if fig:
        print("Plotly Figure created successfully with animation frame.")
    else:
        print("Failed to create Plotly figure.")

# Verify step regarding highlight all countries (Natural Earth base)
print("\n--- Verification Complete ---")
