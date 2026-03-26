import pandas as pd
import numpy as np

def clean_dataset(df, schema):
    """
    STEP 2 — Data Cleaning (13-Step ML Engine Spec)
    
    1. Replace all common placeholders with NaN: ?, NA, null, "", N/A, None
    2. Attempt automatic type conversion (numeric, datetime)
    3. Convert probability values (0–1 range) to percentages
    4. Remove duplicates
    5. Handle missing values (median for numeric, mode for categorical)
    6. IQR outlier detection
    """
    cleaned_df = df.copy()
    
    # ── 1. Replace ALL common placeholders with NaN ──
    placeholders = ['?', 'NA', 'N/A', 'na', 'n/a', 'null', 'NULL', 'None', 'none', '', ' ']
    for p in placeholders:
        cleaned_df = cleaned_df.replace(p, np.nan)
    # Also catch padded question marks like " ? " via regex
    cleaned_df = cleaned_df.replace(r'^\s*\?\s*$', np.nan, regex=True)
    # Catch whitespace-only cells
    cleaned_df = cleaned_df.replace(r'^\s*$', np.nan, regex=True)
    
    # ── 2. Automatic Type Conversion ──
    # Try to convert object columns to numeric first, then datetime
    for col in cleaned_df.columns:
        if cleaned_df[col].dtype == 'object':
            # Try numeric conversion
            converted_num = pd.to_numeric(cleaned_df[col], errors='coerce')
            # Accept if more than 50% of non-null values successfully converted
            non_null_count = cleaned_df[col].notna().sum()
            if non_null_count > 0 and converted_num.notna().sum() > non_null_count * 0.5:
                cleaned_df[col] = converted_num
                continue
            
            # Try datetime conversion (only on a sample to avoid performance hit)
            sample = cleaned_df[col].dropna().head(100)
            if not sample.empty:
                try:
                    parsed = pd.to_datetime(sample, errors='coerce')
                    if parsed.notna().sum() > len(sample) * 0.8:
                        cleaned_df[col] = pd.to_datetime(cleaned_df[col], errors='coerce')
                except:
                    pass
    
    # ── 3. Convert Probability Values to Percentage ──
    if "numeric_columns" in schema:
        for col in schema["numeric_columns"]:
            if col in cleaned_df.columns and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                col_data = cleaned_df[col].dropna()
                if len(col_data) > 0 and col_data.max() <= 1.0 and col_data.min() >= 0.0:
                    # Only apply if not binary (0 and 1 only)
                    if cleaned_df[col].nunique() > 2:
                        cleaned_df[col] = cleaned_df[col] * 100
    
    # ── 4. Remove duplicates ──
    cleaned_df = cleaned_df.drop_duplicates()
    
    # ── 5. Handle missing values ──
    # Re-detect numeric columns after auto type conversion
    numeric_cols = schema.get("numeric_columns", [])
    for col in numeric_cols:
        if col in cleaned_df.columns and cleaned_df[col].isnull().any():
            if pd.api.types.is_numeric_dtype(cleaned_df[col]):
                median_val = cleaned_df[col].median()
                cleaned_df[col] = cleaned_df[col].fillna(median_val)
            
    for col in schema.get("categorical_columns", []):
        if col in cleaned_df.columns and cleaned_df[col].isnull().any():
            mode_series = cleaned_df[col].mode()
            if not mode_series.empty:
                cleaned_df[col] = cleaned_df[col].fillna(mode_series[0])
                
    # ── 6. IQR Outlier Detection ──
    outliers = {}
    for col in numeric_cols:
        if col in cleaned_df.columns and pd.api.types.is_numeric_dtype(cleaned_df[col]):
            Q1 = cleaned_df[col].quantile(0.25)
            Q3 = cleaned_df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            is_outlier = (cleaned_df[col] < lower_bound) | (cleaned_df[col] > upper_bound)
            if is_outlier.any():
                outliers[col] = {
                    "count": int(is_outlier.sum()),
                    "indices": cleaned_df.index[is_outlier].tolist()[:50]
                }
            
    return cleaned_df, outliers
