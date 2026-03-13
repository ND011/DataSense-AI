def generate_insights(schema, stats, outliers):
    """
    Perform Stage 9: Insight Generation
    """
    insights = []
    
    # 1. Strong Correlations
    correlations = stats.get("correlations", {})
    for col1, targets in correlations.items():
        for col2, val in targets.items():
            if col1 != col2 and val is not None and abs(val) > 0.7:
                strength = "positive" if val > 0 else "negative"
                insights.append({
                    "type": "correlation",
                    "columns": [col1, col2],
                    "message": f"Strong {strength} correlation ({val:.2f}) detected between {col1} and {col2}."
                })
                
    # 2. Outliers
    for col, data in outliers.items():
        insights.append({
            "type": "outlier",
            "column": col,
            "message": f"Detected {data['count']} extreme outliers in {col}. This may skew analysis."
        })
        
    # 3. Distributions (Skewness)
    for col, s in stats.get("numeric_stats", {}).items():
        # Heuristic for skewness if we had computed it, otherwise use median vs mean
        mean = s["mean"]
        median = s["median"]
        diff = (mean - median) / (s["std"] + 1e-6)
        if abs(diff) > 0.5:
            direction = "right" if diff > 0 else "left"
            insights.append({
                "type": "skewness",
                "column": col,
                "message": f"{col} is significantly {direction}-skewed (mean: {mean:.2f}, median: {median:.2f})."
            })
            
    # 4. Significant Category Comparisons
    for col, s in stats.get("categorical_stats", {}).items():
        counts = s.get("category_counts", {})
        if counts:
            top_cat = max(counts, key=counts.get)
            total = sum(counts.values())
            pct = (counts[top_cat] / total) * 100
            if pct > 50:
                insights.append({
                    "type": "dominance",
                    "column": col,
                    "message": f"Category '{top_cat}' dominates {col}, accounting for {pct:.1f}% of data."
                })
                
    return insights
