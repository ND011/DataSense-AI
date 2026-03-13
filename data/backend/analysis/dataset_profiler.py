import pandas as pd
import numpy as np

def compute_statistics(df, schema):
    """
    Perform Stage 3: Statistical Profiling
    """
    stats = {
        "numeric_stats": {},
        "categorical_stats": {},
        "correlations": {}
    }
    
    # Numeric Profiling
    for col in schema["numeric_columns"]:
        s = df[col]
        stats["numeric_stats"][col] = {
            "mean": float(s.mean()),
            "median": float(s.median()),
            "std": float(s.std()) if len(s) > 1 else 0.0,
            "min": float(s.min()),
            "max": float(s.max()),
            "Q1": float(s.quantile(0.25)),
            "Q3": float(s.quantile(0.75)),
            "missing_values": int(df[col].isnull().sum())
        }
        
    # Categorical Profiling
    target_cats = schema["categorical_columns"]
    for col in target_cats:
        s = df[col].astype(str)
        counts = s.value_counts().head(20).to_dict()
        freq = s.value_counts(normalize=True).head(20).to_dict()
        stats["categorical_stats"][col] = {
            "category_counts": {k: int(v) for k, v in counts.items()},
            "frequency_distribution": {k: float(v) for k, v in freq.items()}
        }
        
    # Correlation Matrix
    if len(schema["numeric_columns"]) > 1:
        corr_matrix = df[schema["numeric_columns"]].corr(method='pearson').replace({np.nan: None}).to_dict()
        stats["correlations"] = corr_matrix
        
    return stats
