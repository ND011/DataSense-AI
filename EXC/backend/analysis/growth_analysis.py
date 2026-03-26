import pandas as pd

def analyze_growth(df, column_types):
    growth = {}
    
    date_cols = [col for col, t in column_types.items() if t == "datetime"]
    num_cols = [col for col, t in column_types.items() if t in ["continuous", "discrete"]]
    
    if not date_cols or not num_cols:
        return growth
        
    date_col = date_cols[0]
    
    try:
        df_sorted = df.copy()
        df_sorted[date_col] = pd.to_datetime(df_sorted[date_col], errors='coerce')
        df_sorted = df_sorted.dropna(subset=[date_col]).sort_values(by=date_col)
        
        for col in num_cols:
            s_val = df_sorted[col].dropna()
            if len(s_val) < 2:
                continue
                
            first_val = s_val.iloc[0]
            last_val = s_val.iloc[-1]
            
            if first_val == 0:
                continue
                
            growth_rate = (last_val - first_val) / abs(first_val)
            
            if growth_rate > 0.05:
                direction = "positive growth"
            elif growth_rate < -0.05:
                direction = "negative growth"
            else:
                direction = "stable growth"
                
            growth[col] = direction
            
    except Exception as e:
        pass
        
    return growth
