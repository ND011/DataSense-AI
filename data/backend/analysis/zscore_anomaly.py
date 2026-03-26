import pandas as pd
import numpy as np

def detect_anomalies(df, column_types):
    anomalies = {}
    
    num_cols = [col for col, t in column_types.items() if t in ["continuous", "discrete"]]
    
    for col in num_cols:
        s = df[col].dropna()
        if len(s) < 3:
            continue
            
        mean = s.mean()
        std = s.std()
        
        if std == 0 or pd.isna(std):
            continue
            
        z_scores = (s - mean) / std
        anomaly_count = int((np.abs(z_scores) > 3).sum())
        
        if anomaly_count > 0:
            anomalies[col] = anomaly_count
            
    return anomalies
