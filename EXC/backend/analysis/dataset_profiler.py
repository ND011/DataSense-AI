import pandas as pd
import numpy as np

def compute_statistics(df, schema):
    """
    STEP 5 — Exploratory Data Simulation (13-Step ML Engine Spec)
    
    Automatically compute:
        - Summary statistics (mean, median, std, min, max, Q1, Q3)
        - Distribution detection (normal, skewed_left, skewed_right, uniform)
        - Outlier detection (count)
        - Missing value percentage
        - Skewness
        - Correlations (only numeric_continuous, excluding identifiers and binary)
    """
    stats = {
        "numeric_stats": {},
        "categorical_stats": {},
        "correlations": {}
    }
    
    # ── Numeric Profiling ──
    for col in schema.get("numeric_columns", []):
        if col not in df.columns:
            continue
        s = df[col].dropna()
        if s.empty:
            continue
            
        # Compute skewness
        skewness_val = float(s.skew()) if len(s) > 2 else 0.0
        
        # Detect distribution shape
        if abs(skewness_val) < 0.5:
            distribution = "normal"
        elif skewness_val > 1.0:
            distribution = "skewed_right"
        elif skewness_val < -1.0:
            distribution = "skewed_left"
        elif abs(skewness_val) < 1.0:
            distribution = "slightly_skewed"
        else:
            distribution = "uniform"
        
        # Missing value percentage
        total_rows = len(df)
        missing_count = int(df[col].isnull().sum())
        missing_pct = float(missing_count / total_rows * 100) if total_rows > 0 else 0.0
        
        stats["numeric_stats"][col] = {
            "mean": float(s.mean()),
            "median": float(s.median()),
            "std": float(s.std()) if len(s) > 1 else 0.0,
            "min": float(s.min()),
            "max": float(s.max()),
            "Q1": float(s.quantile(0.25)),
            "Q3": float(s.quantile(0.75)),
            "skewness": skewness_val,
            "distribution": distribution,
            "missing_count": missing_count,
            "missing_pct": round(missing_pct, 2)
        }
    
    # ── Binary Column Stats ──
    for col in schema.get("binary_columns", []):
        if col not in df.columns:
            continue
        s = df[col].dropna()
        counts = s.value_counts().to_dict()
        total = len(s)
        stats["categorical_stats"][col] = {
            "category_counts": {str(k): int(v) for k, v in counts.items()},
            "frequency_distribution": {str(k): round(float(v / total), 4) for k, v in counts.items()},
            "is_binary": True
        }
        
    # ── Categorical Profiling ──
    for col in schema.get("categorical_columns", []):
        if col not in df.columns:
            continue
        s = df[col].astype(str)
        counts = s.value_counts().head(20).to_dict()
        total = len(s)
        freq = s.value_counts(normalize=True).head(20).to_dict()
        
        missing_count = int(df[col].isnull().sum())
        missing_pct = float(missing_count / len(df) * 100) if len(df) > 0 else 0.0
        
        stats["categorical_stats"][col] = {
            "category_counts": {k: int(v) for k, v in counts.items()},
            "frequency_distribution": {k: float(v) for k, v in freq.items()},
            "missing_count": missing_count,
            "missing_pct": round(missing_pct, 2)
        }
        
    # ── Correlation Matrix (only numeric_continuous, excluding identifiers and binary) ──
    corr_cols = schema.get("numeric_continuous_columns", [])
    # Exclude identifiers
    identifiers = set(schema.get("identifier_columns", []))
    binary = set(schema.get("binary_columns", []))
    corr_cols = [c for c in corr_cols if c not in identifiers and c not in binary and c in df.columns]
    
    if len(corr_cols) > 1:
        corr_matrix = df[corr_cols].corr(method='pearson').replace({np.nan: None}).to_dict()
        stats["correlations"] = corr_matrix
        
    return stats
