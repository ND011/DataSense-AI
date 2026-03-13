import numpy as np
import pandas as pd

def generate_chart_data(df, chart, stats):
    """
    Perform Stage 6: Data Aggregation Logic
    """
    chart_data = []
    try:
        chart_type = chart["chart_type"]
        
        if chart_type == "bar":
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            agg_func = chart.get("aggregation", "count")
            
            if y_col:
                # Aggregate numeric by category
                agg = df.groupby(x_col)[y_col].agg(agg_func).reset_index()
                agg = agg.sort_values(y_col, ascending=False).head(15)
                for _, row in agg.iterrows():
                    chart_data.append({"name": str(row[x_col]), "value": float(row[y_col])})
            else:
                # Just counts
                counts = df[x_col].value_counts().head(15)
                for name, val in counts.items():
                    chart_data.append({"name": str(name), "value": int(val)})

        elif chart_type == "pie":
            col = chart.get("x_axis")
            counts = df[col].value_counts().head(10)
            for name, val in counts.items():
                chart_data.append({"name": str(name), "value": int(val)})

        elif chart_type == "line":
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            # Ensure x is datetime and sorted
            temp_df = df.copy()
            temp_df[x_col] = pd.to_datetime(temp_df[x_col], errors='coerce')
            temp_df = temp_df.dropna(subset=[x_col])
            agg = temp_df.groupby(x_col)[y_col].mean().reset_index()
            agg = agg.sort_values(x_col)
            # Sample for performance if too many points
            if len(agg) > 100:
                agg = agg.iloc[::len(agg)//100]
            for _, row in agg.iterrows():
                chart_data.append({"name": str(row[x_col].date()), "value": float(row[y_col])})

        elif chart_type == "scatter":
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            temp_df = df[[x_col, y_col]].dropna().head(500)
            for _, row in temp_df.iterrows():
                chart_data.append({"x": float(row[x_col]), "y": float(row[y_col])})

        elif chart_type == "box":
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            # For boxplots, we usually need the raw values per category or quartiles
            # Recharts doesn't have a native BoxPlot, so we might send quartiles
            groups = df.groupby(x_col)[y_col]
            for name, group in list(groups)[:10]: # Limit categories
                s = group.dropna()
                if not s.empty:
                    chart_data.append({
                        "name": str(name),
                        "min": float(s.min()),
                        "q1": float(s.quantile(0.25)),
                        "median": float(s.median()),
                        "q3": float(s.quantile(0.75)),
                        "max": float(s.max())
                    })

        elif chart_type == "histogram":
            col = chart.get("x_axis")
            counts, bins = np.histogram(df[col].dropna(), bins=10)
            for i in range(len(counts)):
                label = f"{bins[i]:.1f}"
                chart_data.append({"name": label, "value": int(counts[i])})

        elif chart_type == "heatmap":
            cols = chart.get("columns", [])
            corrs = stats.get("correlations", {})
            for i, col1 in enumerate(cols):
                for j, col2 in enumerate(cols):
                    val = corrs.get(col1, {}).get(col2, 0)
                    chart_data.append({"x": col1, "y": col2, "value": float(val) if val is not None else 0})

    except Exception as e:
        print(f"Error generating chart data: {e}")
        
    return chart_data
