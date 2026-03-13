from itertools import combinations

def recommend_charts(schema, stats):
    """
    Perform Stage 4 & 5: Relationship Detection & Chart Selection
    """
    charts = []
    num_cols = schema["numeric_columns"]
    cat_cols = schema["categorical_columns"]
    date_cols = schema["datetime_columns"]
    
    # IF numeric_columns == 1 -> histogram
    if len(num_cols) == 1:
        charts.append({
            "chart_type": "histogram",
            "x_axis": num_cols[0],
            "title": f"Distribution of {num_cols[0]}"
        })
        
    # IF numeric_columns >= 2 -> scatter plot for pairs
    if len(num_cols) >= 2:
        # Just pick the top correlated pair if many
        for col1, col2 in combinations(num_cols[:5], 2): # Limit to first 5 numeric for pairs
            charts.append({
                "chart_type": "scatter",
                "x_axis": col1,
                "y_axis": col2,
                "title": f"{col1} vs {col2} Relationship"
            })
            
    # IF categorical_columns >= 1 AND numeric_columns >= 1 -> boxplot or bar chart
    if len(cat_cols) >= 1 and len(num_cols) >= 1:
        charts.append({
            "chart_type": "box",
            "x_axis": cat_cols[0],
            "y_axis": num_cols[0],
            "title": f"{num_cols[0]} Spread by {cat_cols[0]}"
        })
        charts.append({
            "chart_type": "bar",
            "x_axis": cat_cols[0],
            "y_axis": num_cols[0],
            "aggregation": "mean",
            "title": f"Average {num_cols[0]} per {cat_cols[0]}"
        })
        
    # IF numeric_columns >= 3 -> correlation heatmap
    if len(num_cols) >= 3:
        charts.append({
            "chart_type": "heatmap",
            "columns": num_cols[:10], # Max 10 columns for heatmap
            "title": "Correlation Heatmap"
        })
        
    # IF datetime_columns >= 1 AND numeric_columns >= 1 -> line chart
    if len(date_cols) >= 1 and len(num_cols) >= 1:
        charts.append({
            "chart_type": "line",
            "x_axis": date_cols[0],
            "y_axis": num_cols[0],
            "title": f"{num_cols[0]} Trend over {date_cols[0]}"
        })
        
    # IF categorical_columns >= 1 -> category distribution chart (Pie/Bar)
    if len(cat_cols) >= 1:
        charts.append({
            "chart_type": "pie",
            "x_axis": cat_cols[0],
            "title": f"{cat_cols[0]} Proportions"
        })
        
    # Limit to most informative 4–6 visualizations
    # We'll just return the first 6 for now, or could rank them
    return charts[:6]
