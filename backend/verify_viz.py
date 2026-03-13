import sys
import os
import pandas as pd

# Add current directory to path
sys.path.append(os.getcwd())

from backend.analysis.column_detector import detect_column_types
from backend.analysis.dataset_profiler import compute_statistics
from backend.analysis.business_advisor import detect_domain, get_analyzer_for_domain
from backend.analysis.chart_recommender import recommend_charts

def verify_golden_path_viz():
    # Test 1: Finance
    finance_schema = {
        "numeric_columns": ["balance", "amount", "interest_rate"],
        "categorical_columns": ["transaction_type"],
        "datetime_columns": ["transaction_date"],
        "text_columns": []
    }
    
    print("--- Verifying Finance Golden Path ---")
    analyzer = get_analyzer_for_domain("Finance / Banking")
    charts = recommend_charts(finance_schema, {}, analyzer)
    
    for c in charts:
        print(f" - [{c['chart_type'].upper()}] {c['title']}")
        
    has_area = any(c['chart_type'] == 'area' for c in charts)
    has_heatmap = any(c['chart_type'] == 'heatmap' for c in charts)
    
    if has_area and has_heatmap:
        print("✅ SUCCESS: Finance Golden Path (Area + Heatmap) recommended!")
    else:
        print("❌ FAILURE: Missing Finance Golden Path charts.")

    # Test 2: Healthcare
    print("\n--- Verifying Healthcare Golden Path ---")
    hc_schema = {
        "numeric_columns": ["blood_pressure", "cholesterol", "age"],
        "categorical_columns": ["patient_group"],
        "datetime_columns": [],
        "text_columns": []
    }
    hc_analyzer = get_analyzer_for_domain("Healthcare")
    hc_charts = recommend_charts(hc_schema, {}, hc_analyzer)
    
    for c in hc_charts:
        print(f" - [{c['chart_type'].upper()}] {c['title']}")
        
    has_scatter = any(c['chart_type'] == 'scatter' for c in hc_charts)
    if has_scatter:
        print("✅ SUCCESS: Healthcare Golden Path (Clinical Scatter) recommended!")
    else:
        print("❌ FAILURE: Missing Healthcare scatter plot.")

if __name__ == "__main__":
    verify_golden_path_viz()
