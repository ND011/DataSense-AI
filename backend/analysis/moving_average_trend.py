import pandas as pd
import numpy as np

def detect_trends(df, column_types):
    trends = {}
    
    date_cols = [col for col, t in column_types.items() if t == "datetime"]
    num_cols = [col for col, t in column_types.items() if t in ["continuous", "discrete"]]
    
    if not date_cols or not num_cols:
        return trends
        
    date_col = date_cols[0]
    
    try:
        df_sorted = df.copy()
        df_sorted[date_col] = pd.to_datetime(df_sorted[date_col], errors='coerce')
        df_sorted = df_sorted.dropna(subset=[date_col]).sort_values(by=date_col)
        
        for num_col in num_cols:
            if len(df_sorted[num_col].dropna()) < 2:
                continue
                
            rolling_mean = df_sorted[num_col].rolling(window=7, min_periods=1).mean().dropna().values
            
            if len(rolling_mean) < 2:
                continue
                
            x = np.arange(len(rolling_mean))
            slope, _ = np.polyfit(x, rolling_mean, 1)
            
            y_range = np.max(rolling_mean) - np.min(rolling_mean)
            
            if y_range == 0:
                direction = "stable"
            else:
                norm_slope = (slope * len(rolling_mean)) / y_range
                if norm_slope > 0.1:
                    direction = "increasing"
                elif norm_slope < -0.1:
                    direction = "decreasing"
                else:
                    direction = "stable"
                    
            trends[num_col] = direction
            
    except Exception as e:
        pass
        
    return trends
