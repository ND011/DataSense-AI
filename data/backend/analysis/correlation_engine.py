import pandas as pd

def detect_correlations(df, column_types):
    correlations = []
    
    num_cols = [col for col, t in column_types.items() if t in ["continuous", "discrete"]]
    
    if len(num_cols) < 2:
        return correlations
        
    try:
        corr_matrix = df[num_cols].corr(method="pearson")
        
        for i in range(len(num_cols)):
            for j in range(i + 1, len(num_cols)):
                col_x = num_cols[i]
                col_y = num_cols[j]
                
                val = corr_matrix.loc[col_x, col_y]
                
                if pd.notna(val) and abs(val) > 0.6:
                    correlations.append({
                        "column_x": col_x,
                        "column_y": col_y,
                        "value": float(val)
                    })
    except Exception as e:
        pass
        
    return correlations
