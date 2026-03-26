import pandas as pd
import numpy as np

def clean_dataset(df, schema):
    """
    Perform Stage 2: Data Cleaning
    - Handle missing values (median for numeric, mode for categorical)
    - Remove duplicates
    - IQR outlier detection
    """
    cleaned_df = df.copy()
    
    # 1. Remove duplicates
    cleaned_df = cleaned_df.drop_duplicates()
    
    # 2. Handle missing values
    for col in schema["numeric_columns"]:
        if cleaned_df[col].isnull().any():
            median_val = cleaned_df[col].median()
            cleaned_df[col] = cleaned_df[col].fillna(median_val)
            
    for col in schema["categorical_columns"]:
        if cleaned_df[col].isnull().any():
            mode_series = cleaned_df[col].mode()
            if not mode_series.empty:
                cleaned_df[col] = cleaned_df[col].fillna(mode_series[0])
                
    # 3. IQR Outlier Detection
    outliers = {}
    for col in schema["numeric_columns"]:
        Q1 = cleaned_df[col].quantile(0.25)
        Q3 = cleaned_df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        # Flag extreme outliers
        is_outlier = (cleaned_df[col] < lower_bound) | (cleaned_df[col] > upper_bound)
        if is_outlier.any():
            outliers[col] = {
                "count": int(is_outlier.sum()),
                "indices": cleaned_df.index[is_outlier].tolist()[:50] # Store first 50
            }
            
    return cleaned_df, outliers
