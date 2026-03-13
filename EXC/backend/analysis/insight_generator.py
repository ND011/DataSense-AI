def generate_insights(schema, stats, outliers):
    """
    STEP 12 — Insight Generation (13-Step ML Engine Spec)
    
    Automatically generate human-readable insights using rule-based logic.
    
    Categories:
        - Correlations: "Income strongly correlates with spending."
        - Outliers: "Detected extreme cases in salary."
        - Skewness/Distribution: "Age is right-skewed."
        - Category Dominance: "Travel_Rarely dominates BusinessTravel at 71%."
        - Missing Data: "Column X has 45% missing values."
        - Group Comparisons: "Age group 26-35 has highest purchase rate."
        - Time-based: "Sales increased over time." (if datetime detected)
    """
    insights = []
    
    # ── 1. Strong Correlations ──
    correlations = stats.get("correlations", {})
    seen_pairs = set()
    for col1, targets in correlations.items():
        for col2, val in targets.items():
            if col1 != col2 and val is not None:
                pair = tuple(sorted([col1, col2]))
                if pair not in seen_pairs and abs(val) > 0.7:
                    seen_pairs.add(pair)
                    strength = "positive" if val > 0 else "negative"
                    # Human-readable narrative
                    if abs(val) > 0.9:
                        qualifier = "very strongly"
                    elif abs(val) > 0.8:
                        qualifier = "strongly"
                    else:
                        qualifier = "moderately"
                    insights.append({
                        "type": "correlation",
                        "columns": [col1, col2],
                        "message": f"{col1} {qualifier} correlates with {col2} ({strength}, r={val:.2f})."
                    })
                
    # ── 2. Outliers ──
    for col, data in outliers.items():
        insights.append({
            "type": "outlier",
            "column": col,
            "message": f"Detected {data['count']} extreme outliers in {col}. This may skew analysis and should be investigated."
        })
        
    # ── 3. Skewness & Distribution ──
    for col, s in stats.get("numeric_stats", {}).items():
        skewness = s.get("skewness", 0)
        distribution = s.get("distribution", "unknown")
        
        if abs(skewness) > 1.0:
            direction = "right" if skewness > 0 else "left"
            insights.append({
                "type": "skewness",
                "column": col,
                "message": f"{col} is significantly {direction}-skewed (skewness: {skewness:.2f}). Consider log transformation for modeling."
            })
    
    # ── 4. Missing Data Warnings ──
    for col, s in stats.get("numeric_stats", {}).items():
        missing_pct = s.get("missing_pct", 0)
        if missing_pct > 5:
            insights.append({
                "type": "missing_data",
                "column": col,
                "message": f"{col} has {missing_pct:.1f}% missing values. Imputation was applied using median."
            })
    
    for col, s in stats.get("categorical_stats", {}).items():
        missing_pct = s.get("missing_pct", 0)
        if missing_pct and missing_pct > 5:
            insights.append({
                "type": "missing_data",
                "column": col,
                "message": f"{col} has {missing_pct:.1f}% missing values. Mode imputation was applied."
            })
            
    # ── 5. Category Dominance ──
    for col, s in stats.get("categorical_stats", {}).items():
        counts = s.get("category_counts", {})
        if counts:
            top_cat = max(counts, key=counts.get)
            total = sum(counts.values())
            if total > 0:
                pct = (counts[top_cat] / total) * 100
                if pct > 50:
                    insights.append({
                        "type": "dominance",
                        "column": col,
                        "message": f"'{top_cat}' dominates {col}, accounting for {pct:.1f}% of records. This category imbalance may affect model performance."
                    })
    
    # ── 6. Group Comparisons ──
    # Find engineered group columns (e.g., Age_Group) and check distributions
    cat_stats = stats.get("categorical_stats", {})
    for col, s in cat_stats.items():
        if "_Group" in col or "_Level" in col:
            counts = s.get("category_counts", {})
            if counts:
                top = max(counts, key=counts.get)
                total = sum(counts.values())
                pct = (counts[top] / total * 100) if total > 0 else 0
                base_col = col.replace("_Group", "").replace("_Level", "")
                insights.append({
                    "type": "group_insight",
                    "column": col,
                    "message": f"{top} is the largest segment in {base_col}, representing {pct:.1f}% of the population."
                })
    
    # ── 7. Time-based Insights ──
    datetime_cols = schema.get("datetime_columns", [])
    if datetime_cols:
        insights.append({
            "type": "time_series",
            "column": datetime_cols[0],
            "message": f"Temporal data detected in {datetime_cols[0]}. Time-series analysis and trend detection have been applied."
        })
    
    # ── 8. Identifier Warning ──
    id_cols = schema.get("identifier_columns", [])
    if id_cols:
        insights.append({
            "type": "identifier",
            "column": ", ".join(id_cols),
            "message": f"Columns [{', '.join(id_cols)}] were detected as identifiers and excluded from statistical analysis and modeling."
        })
                
    return insights
