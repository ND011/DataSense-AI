import pandas as pd
import numpy as np

def compute_statistics(df, column_types):
    stats = {}
    
    for col in df.columns:
        ctype = column_types.get(col)
        
        # Exclude ID columns from statistical profiling.
        if ctype in ["id", "datetime", "categorical", "unknown"]:
            continue
            
        if ctype in ["continuous", "discrete"]:
            s = df[col].dropna()
            if len(s) == 0:
                continue
                
            stats[col] = {
                "mean": float(s.mean()),
                "median": float(s.median()),
                "standard_deviation": float(s.std()) if len(s) > 1 else 0.0,
                "min": float(s.min()),
                "max": float(s.max()),
                "variance": float(s.var()) if len(s) > 1 else 0.0,
                "skewness": float(s.skew()) if len(s) > 2 else 0.0,
                "missing_values": int(df[col].isnull().sum()),
                "unique_counts": int(df[col].nunique(dropna=True))
            }
            
            # Replace NaNs with None for JSON serialization
            for k, v in stats[col].items():
                if pd.isna(v):
                    stats[col][k] = None
                    
    return stats
