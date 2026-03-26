import pandas as pd
import numpy as np

def detect_column_types(df):
    """
    STEP 3 — Column Type Detection (13-Step ML Engine Spec)
    
    Classify columns into:
        identifier, binary, numeric_continuous, numeric_discrete,
        categorical, datetime
    
    Rules:
        Identifier: column name contains id/code/uuid/key/number OR unique_ratio > 0.95
        Binary: unique values ≤ 2
        Numeric continuous: unique values > 20
        Numeric discrete: unique values ≤ 20
        Categorical: string with unique values ≤ 15
        Datetime: dtype datetime OR name contains date/year/time
    
    Identifiers are EXCLUDED from all analytics downstream.
    """
    schema = {
        "identifier_columns": [],
        "binary_columns": [],
        "numeric_continuous_columns": [], 
        "numeric_discrete_columns": [],
        "numeric_columns": [],       # Legacy union of continuous + discrete (excludes identifiers)
        "categorical_columns": [],   # Threshold: ≤ 15 unique values
        "datetime_columns": [],
        "geographic_columns": [],
        "text_columns": []
    }
    
    id_keywords = ['_id', 'uuid', 'guid', 'code', 'key', 'number', 'serial', 'index']
    
    for col in df.columns:
        col_lower = str(col).lower().strip()
        n_rows = len(df)
        n_unique = df[col].nunique(dropna=True)
        unique_ratio = n_unique / n_rows if n_rows > 0 else 0

        # ── 0. Geographic Check (Rule 1 — Universal tag) ──
        geo_keywords = [
            'country', 'state', 'province', 'region', 'city', 'district', 
            'location', 'zip', 'postal_code', 'latitude', 'longitude', 
            'lat', 'lon'
        ]
        
        # Robust check for keywords within column names
        is_geo = False
        for kw in geo_keywords:
            # Check exact, with underscores, or camelCase/PascalCase boundaries
            if kw == col_lower or f"{kw}_" in col_lower or f"_{kw}" in col_lower:
                is_geo = True
                break
            # Special cases for joined words
            if kw in ['zip', 'lat', 'lon', 'postal', 'province', 'region', 'district'] and kw in col_lower:
                 is_geo = True
                 break
            if kw == 'country' and ('country' in col_lower or 'nation' in col_lower):
                 is_geo = True
                 break

        if is_geo:
            schema["geographic_columns"].append(col)
        
        # ── 1. Datetime Check (highest priority after identifier) ──
        is_datetime = False
        if "date" in col_lower or "time" in col_lower or col_lower == "year":
            is_datetime = True
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            is_datetime = True
        else:
            # Try parsing a sample
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
        
        # ── 2. Identifier Check ──
        is_identifier = False
        # Check by name pattern
        if any(kw in col_lower for kw in id_keywords):
            # Must also have high uniqueness to avoid false positives
            if unique_ratio > 0.5:
                is_identifier = True
        
        # Check by extreme uniqueness (primarily for integers/strings)
        # We avoid auto-labeling floats as IDs as they are often just high-precision markers
        if unique_ratio > 0.98 and not pd.api.types.is_float_dtype(df[col]):
            # If it's a small dataset, don't label as ID unless name helps
            if n_rows > 10: 
                is_identifier = True
            
        if is_identifier:
            schema["identifier_columns"].append(col)
            continue
            
        # ── 3. Numeric Check ──
        if pd.api.types.is_numeric_dtype(df[col]):
            # Binary check: ≤ 2 unique values
            if n_unique <= 2:
                schema["binary_columns"].append(col)
                # Also add to numeric_columns for backward compatibility
                schema["numeric_columns"].append(col)
                continue
            
            # Continuous vs Discrete
            schema["numeric_columns"].append(col)
            if n_unique > 20:
                schema["numeric_continuous_columns"].append(col)
            else:
                schema["numeric_discrete_columns"].append(col)
            continue
            
        # ── 6. Categorical Check (string with ≤ 15 unique values) ──
        if n_unique <= 15 or unique_ratio < 0.05:
            # Binary string check (e.g. "Yes"/"No", "Male"/"Female")
            if n_unique <= 2:
                schema["binary_columns"].append(col)
            else:
                schema["categorical_columns"].append(col)
            continue
            
        # ── 7. Otherwise Text ──
        schema["text_columns"].append(col)
        
    return schema


def is_lookup_table(df):
    """
    STEP 10 — Lookup Table Detection
    
    If dataset is strictly a 2-column reference mapping (e.g. ID -> Name),
    treat as a lookup table. 
    
    Analytical datasets (Age, BMI, Amount, etc.) should NEVER be flagged
    even if they are small or unique.
    """
    if len(df.columns) > 2:
        return False
        
    analysis_keywords = ['age', 'bmi', 'weight', 'amount', 'balance', 'price', 'score', 'rate', 'heart', 'glucose', 'bp']
    cols_lower = [str(c).lower() for c in df.columns]
    
    # If any column looks like an analytical variable, it's not a lookup table
    if any(any(kw in c for kw in analysis_keywords) for c in cols_lower):
        return False
        
    # Strictly 2 columns where both are highly unique (ID -> Value mapping)
    if len(df.columns) == 2:
        high_unique_count = sum(
            1 for col in df.columns 
            if df[col].nunique(dropna=True) >= len(df) * 0.90
        )
        if high_unique_count == 2:
            return True
            
    return False
