import pandas as pd
import numpy as np

def detect_column_types(df):
    """
    STEP 3 — Column Type Detection (13-Step ML Engine Spec)
    
    Classify columns strictly using the Identifier Detection Rules:
    1. Name Keywords: id, uuid, key, code, number, index
    2. Uniqueness Ratio: > 0.95
    3. Monotonic sequences: 1, 2, 3...
    """
    schema = {
        "identifier_columns": [],
        "binary_columns": [],
        "numeric_continuous_columns": [], 
        "numeric_discrete_columns": [],
        "numeric_columns": [],
        "categorical_columns": [],
        "datetime_columns": [],
        "geographic_columns": [],
        "text_columns": []
    }
    
    id_keywords = ['id', 'uuid', 'key', 'code', 'number', 'index']
    
    for col in df.columns:
        col_lower = str(col).lower().strip()
        n_rows = len(df)
        n_unique = df[col].nunique(dropna=True)
        unique_ratio = n_unique / n_rows if n_rows > 0 else 0

        # ── 0. Geographic Check ──
        geo_keywords = [
            'country', 'state', 'province', 'region', 'city', 'district', 
            'location', 'zip', 'postal_code', 'latitude', 'longitude', 
            'lat', 'lon', 'team', 'home'
        ]
        is_geo = False
        for kw in geo_keywords:
            if kw == col_lower or f"{kw}_" in col_lower or f"_{kw}" in col_lower:
                is_geo = True
                break
            if kw in ['zip', 'lat', 'lon', 'postal', 'province', 'region', 'district'] and kw in col_lower:
                 is_geo = True
                 break
            if kw == 'country' and ('country' in col_lower or 'nation' in col_lower):
                 is_geo = True
                 break

        if is_geo:
            schema["geographic_columns"].append(col)
        
        # ── 1. Identifier Detection (User Rules — Step 1) ──
        is_identifier = False
        
        # Rule 1: Keyword Check
        if any(kw == col_lower or f"_{kw}" in col_lower or f"{kw}_" in col_lower or col_lower.endswith(kw) for kw in id_keywords):
            is_identifier = True
            
        # Rule 2: High Uniqueness Ratio (> 0.95)
        if not is_identifier and unique_ratio > 0.95 and not pd.api.types.is_float_dtype(df[col]):
            if n_rows > 5:
                is_identifier = True
                
        # Rule 3: Monotonically Increasing Integers (1, 2, 3...)
        if not is_identifier and pd.api.types.is_integer_dtype(df[col]) and n_rows > 2:
            s = df[col].dropna()
            if not s.empty and s.is_monotonic_increasing and (s.iloc[-1] - s.iloc[0] == len(s) - 1):
                is_identifier = True
            
        if is_identifier:
            schema["identifier_columns"].append(col)
            continue

        # ── 2. Datetime Check ──
        is_datetime = False
        if "date" in col_lower or "time" in col_lower or col_lower == "year":
            is_datetime = True
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            is_datetime = True
        else:
            sample = df[col].dropna().head(100)
            if not sample.empty and df[col].dtype == 'object':
                try:
                    parsed = pd.to_datetime(sample, errors='coerce')
                    if parsed.notnull().sum() > len(sample) * 0.8:
                        is_datetime = True
                except:
                    pass
        
        if is_datetime:
            schema["datetime_columns"].append(col)
            continue
            
        # ── 3. Numeric Check ──
        if pd.api.types.is_numeric_dtype(df[col]):
            if n_unique <= 2:
                schema["binary_columns"].append(col)
                schema["numeric_columns"].append(col)
                continue
            
            schema["numeric_columns"].append(col)
            if n_unique > 20:
                schema["numeric_continuous_columns"].append(col)
            else:
                schema["numeric_discrete_columns"].append(col)
            continue
            
        # ── 4. Categorical Check ──
        if n_unique <= 15 or unique_ratio < 0.05:
            if n_unique <= 2:
                schema["binary_columns"].append(col)
            else:
                schema["categorical_columns"].append(col)
            continue
            
        # ── 5. Otherwise Text ──
        schema["text_columns"].append(col)
        
    return schema

def is_lookup_table(df):
    if len(df.columns) > 2:
        return False
        
    analysis_keywords = ['age', 'bmi', 'weight', 'amount', 'balance', 'price', 'score', 'rate', 'heart', 'glucose', 'bp']
    cols_lower = [str(c).lower() for c in df.columns]
    
    if any(any(kw in c for kw in analysis_keywords) for c in cols_lower):
        return False
        
    if len(df.columns) == 2:
        high_unique_count = sum(
            1 for col in df.columns 
            if df[col].nunique(dropna=True) >= len(df) * 0.90
        )
        if high_unique_count == 2:
            return True
            
    return False
