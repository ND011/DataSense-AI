import pandas as pd
from itertools import combinations

def age_group(age):
    if pd.isna(age):
        return "Unknown"
    try:
        val = float(age)
    except (ValueError, TypeError):
        return "Unknown"
    if val <= 25:
        return "18-25"
    elif val <= 35:
        return "26-35"
    elif val <= 45:
        return "36-45"
    elif val <= 55:
        return "46-55"
    else:
        return "56+"

def income_level(salary):
    if pd.isna(salary):
        return "Unknown"
    try:
        val = float(salary)
    except (ValueError, TypeError):
        return "Unknown"
    if val >= 50000:
        return ">=50K"
    else:
        return "<50K"

def perform_feature_engineering(df, schema):
    """
    STEP 4 — Feature Engineering Simulation (13-Step ML Engine Spec)
    
    Automatically simulate feature engineering:
        - Age grouping (if column name contains "age")
        - Income/Salary threshold (if column name contains "salary"/"income")
        - Probability-to-percentage conversion is handled in data_cleaner
    """
    eng_df = df.copy()
    
    # Age Grouping
    age_cols = [c for c in eng_df.columns if "age" in str(c).lower()]
    for col in age_cols:
        new_col = f"{col}_Group"
        eng_df[new_col] = eng_df[col].apply(age_group)
        if new_col not in schema["categorical_columns"]:
            schema["categorical_columns"].append(new_col)
        
    # Salary / Income Threshold
    income_cols = [c for c in eng_df.columns if "salary" in str(c).lower() or "income" in str(c).lower()]
    for col in income_cols:
        new_col = f"{col}_Level"
        eng_df[new_col] = eng_df[col].apply(income_level)
        if new_col not in schema["categorical_columns"]:
            schema["categorical_columns"].append(new_col)
        
    return eng_df, schema


def generate_pivot_tables(df, schema):
    """
    STEP 7 — Pivot Table Generation (13-Step ML Engine Spec)
    
    If two or more categorical columns exist, generate pivot tables
    using pd.crosstab with count aggregation.
    
    Generalized: works with ANY 2 categorical columns, not just age/income.
    """
    pivots = []
    cat_cols = schema.get("categorical_columns", [])
    
    # Filter to columns that actually exist in the dataframe
    cat_cols = [c for c in cat_cols if c in df.columns]
    
    # Limit to first 4 categorical columns to avoid combinatorial explosion
    cat_cols = cat_cols[:4]
    
    if len(cat_cols) >= 2:
        for c1, c2 in combinations(cat_cols, 2):
            try:
                # Use pd.crosstab for count-based pivot
                pivot = pd.crosstab(df[c1], df[c2])
                
                # Skip if pivot is too large (> 15 rows or columns)
                if pivot.shape[0] > 15 or pivot.shape[1] > 15:
                    continue
                
                # Convert to dictionary format for frontend
                pivot_dict = pivot.fillna(0).to_dict()
                # Convert all values to native Python int for JSON serialization
                pivot_dict = {
                    str(col): {str(row): int(val) for row, val in rows.items()} 
                    for col, rows in pivot_dict.items()
                }
                
                pivots.append({
                    "name": f"{c1} × {c2}",
                    "data": pivot_dict,
                    "x_axis": c1,
                    "y_axis": c2
                })
            except Exception as e:
                print(f"Failed to generate pivot table for {c1} x {c2}: {e}")
                
    return pivots
