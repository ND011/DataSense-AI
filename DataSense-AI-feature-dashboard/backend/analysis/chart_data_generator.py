import numpy as np
import pandas as pd

def generate_chart_data(df, chart, stats):
    """
    STEP 6b — Data Aggregation Logic for Visualizations
    
    Generates frontend-ready data arrays for each chart type.
    Supports: bar, pie, line, scatter, box, histogram, heatmap
    
    New in 13-Step Spec: event_rate aggregation for binary time-series.
    """
    chart_data = []
    try:
        chart_type = chart["chart_type"]
        
        if chart_type == "bar":
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            agg_func = chart.get("aggregation", "count")
            
            if x_col not in df.columns:
                return chart_data

            if y_col and y_col in df.columns:
                # Force y_col to be numeric, handle duplicate columns
                target_y = df[y_col]
                if isinstance(target_y, pd.DataFrame):
                    target_y = target_y.iloc[:, 0]
                
                temp_df = pd.DataFrame({x_col: df[x_col], y_col: pd.to_numeric(target_y, errors='coerce')})
                temp_df = temp_df.dropna(subset=[y_col])

                try:
                    if agg_func == "count":
                        agg = temp_df.groupby(x_col)[y_col].count().reset_index()
                    else:
                        # Only allow numeric aggregations if we have numeric data
                        if agg_func in ['mean', 'sum', 'median', 'std', 'var'] and temp_df[y_col].empty:
                            agg = temp_df.groupby(x_col)[y_col].count().reset_index()
                        else:
                            agg = temp_df.groupby(x_col)[y_col].agg(agg_func).reset_index()
                    
                    is_categorical = "_Group" in x_col or "_Level" in x_col
                    if is_categorical:
                        agg = agg.sort_values(x_col)
                    else:
                        agg = agg.sort_values(y_col, ascending=False).head(15)
                    
                    for _, row in agg.iterrows():
                        val = row[y_col]
                        if isinstance(val, (pd.Series, np.ndarray)): val = val[0]
                        if pd.notna(val):
                            chart_data.append({"name": str(row[x_col]), "value": float(val)})
                except Exception as agg_err:
                    print(f"Aggregation error for {chart.get('title')}: {agg_err}")
            else:
                # Just counts of x_col
                counts = df[x_col].value_counts()
                is_categorical = "_Group" in x_col or "_Level" in x_col
                if is_categorical:
                    counts = counts.sort_index()
                else:
                    counts = counts.head(15)
                    
                for name, val in counts.items():
                    chart_data.append({"name": str(name), "value": int(val)})

        elif chart_type == "pie":
            col = chart.get("x_axis")
            if col not in df.columns:
                return chart_data
            counts = df[col].value_counts().head(10)
            for name, val in counts.items():
                chart_data.append({"name": str(name), "value": int(val)})

        elif chart_type == "line":
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            agg_type = chart.get("aggregation", "mean")
            
            if x_col not in df.columns or y_col not in df.columns:
                return chart_data
            
            # Ensure y_col is numeric
            df[y_col] = pd.to_numeric(df[y_col], errors='coerce')
            
            temp_df = df.copy()
            
            # Smart Date Detection: Only coerce to datetime if the column looks like a date/time
            is_date_like = "date" in x_col.lower() or "time" in x_col.lower() or "year" in x_col.lower() or "month" in x_col.lower()
            if not is_date_like:
                # Check sample of values for date-like strings
                sample = temp_df[x_col].dropna().head(10).astype(str)
                if any(any(c in s for c in ['-', '/', ':']) for s in sample):
                    is_date_like = True

            if is_date_like:
                temp_df[x_col] = pd.to_datetime(temp_df[x_col], errors='coerce')
                temp_df = temp_df.dropna(subset=[x_col, y_col])
                
                if agg_type == "event_rate":
                    temp_df = temp_df.set_index(x_col)
                    monthly = temp_df[y_col].resample('ME').mean().reset_index()
                    monthly.columns = [x_col, y_col]
                    for _, row in monthly.iterrows():
                        chart_data.append({
                            "name": str(row[x_col].strftime('%Y-%m')),
                            "value": round(float(row[y_col]) * 100, 2)
                        })
                else:
                    try:
                        agg = temp_df.groupby(x_col)[y_col].mean().reset_index()
                        agg = agg.sort_values(x_col)
                        
                        # Sample if too many points
                        if len(agg) > 100:
                            agg = agg.iloc[::len(agg)//100]
                        
                        # Determine label format based on range
                        min_date = agg[x_col].min()
                        max_date = agg[x_col].max()
                        time_delta = max_date - min_date
                        
                        has_time_variation = agg[x_col].dt.hour.nunique() > 1 or agg[x_col].dt.minute.nunique() > 1
                        
                        for _, row in agg.iterrows():
                            val = row[y_col]
                            if pd.notna(val):
                                # Dynamic formatting: Use time only if there is actual intra-day variation
                                if time_delta.days > 365:
                                    date_str = row[x_col].strftime('%Y-%m')
                                elif time_delta.days >= 1:
                                    date_str = row[x_col].strftime('%Y-%m-%d')
                                elif has_time_variation:
                                    date_str = row[x_col].strftime('%H:%M')
                                else:
                                    # Single day or no time variation -> Show full date
                                    date_str = row[x_col].strftime('%Y-%m-%d')
                                    
                                chart_data.append({"name": date_str, "value": float(val)})
                    except Exception as line_err:
                        print(f"Line chart aggregation error: {line_err}")
            else:
                # Not a date column, use as categoric/numeric sequence
                try:
                    agg = temp_df.groupby(x_col)[y_col].mean().reset_index()
                    # If it looks numeric, sort it as numeric
                    try:
                        agg[x_col] = pd.to_numeric(agg[x_col])
                        agg = agg.sort_values(x_col)
                    except:
                        agg = agg.sort_values(y_col, ascending=False).head(50)
                    
                    for _, row in agg.iterrows():
                        val = row[y_col]
                        if pd.notna(val):
                            chart_data.append({"name": str(row[x_col]), "value": float(val)})
                except Exception as line_err:
                    print(f"Generic line chart error: {line_err}")

        elif chart_type == "scatter":
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            if x_col not in df.columns or y_col not in df.columns:
                return chart_data
            
            # Ensure columns are numeric
            temp_df = df[[x_col, y_col]].copy()
            temp_df[x_col] = pd.to_numeric(temp_df[x_col], errors='coerce')
            temp_df[y_col] = pd.to_numeric(temp_df[y_col], errors='coerce')
            temp_df = temp_df.dropna().head(500)
            
            for _, row in temp_df.iterrows():
                try:
                    chart_data.append({"x": float(row[x_col]), "y": float(row[y_col])})
                except (ValueError, TypeError):
                    continue

        elif chart_type == "box":
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            if x_col not in df.columns or y_col not in df.columns:
                return chart_data
            
            # Ensure y_col is numeric
            df[y_col] = pd.to_numeric(df[y_col], errors='coerce')
            groups = df.dropna(subset=[y_col]).groupby(x_col)[y_col]
            
            for name, group in list(groups)[:10]:
                s = group
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
            if col not in df.columns:
                return chart_data
            
            # Ensure col is numeric
            data = pd.to_numeric(df[col], errors='coerce').dropna()
            if len(data) > 0:
                counts, bins = np.histogram(data, bins=10)
                # Check if int casting would cause duplicates
                use_integers = True
                for b in bins:
                    if b != int(b):
                        use_integers = False
                        break
                
                # If the range is small (e.g. max - min < 10), ints will definitely repeat
                if (bins[-1] - bins[0]) < 10:
                    use_integers = False

                for i in range(len(counts)):
                    if use_integers:
                        label = f"{int(bins[i])} - {int(bins[i+1])}"
                    else:
                        label = f"{bins[i]:.1f} - {bins[i+1]:.1f}"
                    chart_data.append({"name": label, "value": int(counts[i])})

        elif chart_type == "heatmap":
            cols = chart.get("columns", [])
            # Filter to existing columns
            cols = [c for c in cols if c in df.columns]
            corrs = stats.get("correlations", {})
            for col1 in cols:
                for col2 in cols:
                    val = corrs.get(col1, {}).get(col2, 0)
                    chart_data.append({
                        "x": col1, "y": col2, 
                        "value": float(val) if val is not None else 0
                    })

        elif chart_type == "geo_map":
            map_type = chart.get("map_type")
            color_col = chart.get("color_axis")
            
            if map_type == "choropleth":
                loc_col = chart.get("location")
                if loc_col in df.columns and color_col in df.columns:
                    # Handle duplicate columns
                    target_color = df[color_col]
                    if isinstance(target_color, pd.DataFrame):
                        target_color = target_color.iloc[:, 0]
                    
                    temp_df = pd.DataFrame({loc_col: df[loc_col], color_col: pd.to_numeric(target_color, errors='coerce')})
                    temp_df = temp_df.dropna(subset=[color_col])
                    
                    # Aggregate by location (sum or mean)
                    agg = temp_df.groupby(loc_col)[color_col].sum().reset_index()
                    for _, row in agg.iterrows():
                        val = row[color_col]
                        if isinstance(val, (pd.Series, np.ndarray)): val = val[0]
                        if pd.notna(val):
                            chart_data.append({
                                "location": str(row[loc_col]),
                                "value": float(val)
                            })
            elif map_type == "point":
                lat_col = chart.get("latitude")
                lon_col = chart.get("longitude")
                if all(c in df.columns for c in [lat_col, lon_col, color_col]):
                    # Ensure columns are numeric
                    temp_df = df[[lat_col, lon_col, color_col]].copy()
                    temp_df[lat_col] = pd.to_numeric(temp_df[lat_col], errors='coerce')
                    temp_df[lon_col] = pd.to_numeric(temp_df[lon_col], errors='coerce')
                    temp_df[color_col] = pd.to_numeric(temp_df[color_col], errors='coerce')
                    temp_df = temp_df.dropna()
                    for _, row in temp_df.iterrows():
                        chart_data.append({
                            "lat": float(row[lat_col]),
                            "lon": float(row[lon_col]),
                            "value": float(row[color_col])
                        })
            elif map_type == "marker":
                lat_col = chart.get("latitude")
                lon_col = chart.get("longitude")
                cat_col = chart.get("category")
                if all(c in df.columns for c in [lat_col, lon_col, cat_col]):
                    temp_df = df[[lat_col, lon_col, cat_col]].copy()
                    temp_df[lat_col] = pd.to_numeric(temp_df[lat_col], errors='coerce')
                    temp_df[lon_col] = pd.to_numeric(temp_df[lon_col], errors='coerce')
                    temp_df = temp_df.dropna()
                    for _, row in temp_df.iterrows():
                        chart_data.append({
                            "lat": float(row[lat_col]),
                            "lon": float(row[lon_col]),
                            "category": str(row[cat_col])
                        })

    except Exception as e:
        print(f"Error generating chart data for {chart.get('title', 'unknown')}: {e}")
        
    return chart_data
