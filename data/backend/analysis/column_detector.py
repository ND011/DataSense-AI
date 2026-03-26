import pandas as pd
import numpy as np

def detect_column_types(df):
    """
    Classify columns into: numeric_columns, categorical_columns, datetime_columns, text_columns.
    Rules:
    - If dtype is integer or float -> numeric
    - If dtype is string with limited unique values (<= 20 or < 5% unique) -> categorical
    - If column name contains "date" or convertible to datetime -> datetime
    - Otherwise -> text
    """
    schema = {
        "numeric_columns": [],
        "categorical_columns": [],
        "datetime_columns": [],
        "text_columns": []
    }
    
    for col in df.columns:
        col_lower = str(col).lower()
        
        # 1. Datetime Check
        is_datetime = False
        if "date" in col_lower or "time" in col_lower:
            is_datetime = True
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            is_datetime = True
        else:
            # Try parsing a sample
            sample = df[col].dropna().head(100)
            if not sample.empty and df[col].dtype == 'object':
                try:
                    parsed = pd.to_datetime(sample, errors='coerce', format='mixed')
                    if parsed.notnull().sum() > len(sample) * 0.8:
                        is_datetime = True
                except:
                    pass
        
        if is_datetime:
            schema["datetime_columns"].append(col)
            continue
            
        # 2. Numeric Check
        if pd.api.types.is_numeric_dtype(df[col]):
            schema["numeric_columns"].append(col)
            continue
            
        # 3. Categorical Check
        unique_vals = df[col].nunique(dropna=True)
        unique_ratio = unique_vals / len(df) if len(df) > 0 else 0
        
        if unique_vals <= 20 or unique_ratio < 0.05:
            schema["categorical_columns"].append(col)
            continue
            
        # 4. Otherwise Text
        schema["text_columns"].append(col)
        
    return schema
