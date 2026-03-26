from itertools import combinations

def recommend_charts(schema, stats, analyzer=None):
    """
    STEP 6 — Visualization Recommendation Engine (13-Step ML Engine Spec)
    
    Rules:
        numeric_continuous vs numeric_continuous → scatter plot
        numeric vs categorical → box plot
        categorical vs categorical → stacked bar
        datetime vs numeric → line chart
        single numeric column → histogram
        multiple numeric columns → correlation heatmap
        binary vs categorical → stacked bar
        binary vs numeric → box plot
        datetime vs binary → event rate line chart
    
    Identifiers are EXCLUDED from all chart axes.
    """
    charts = []
    
    # Collect all column lists
    num_cols = schema.get("numeric_columns", [])
    num_cont = schema.get("numeric_continuous_columns", [])
    num_disc = schema.get("numeric_discrete_columns", [])
    cat_cols = schema.get("categorical_columns", [])
    date_cols = schema.get("datetime_columns", [])
    binary_cols = schema.get("binary_columns", [])
    id_cols = set(schema.get("identifier_columns", []))
    
    # Helper to exclude identifiers from any column list
    def safe(cols):
        return [c for c in cols if c not in id_cols]
    
    num_cols = safe(num_cols)
    num_cont = safe(num_cont)
    num_disc = safe(num_disc)
    cat_cols = safe(cat_cols)
    date_cols = safe(date_cols)
    binary_cols = safe(binary_cols)
    geo_cols = schema.get("geographic_columns", [])
    
    # ── NEW: Filter out geographic columns from standard categorical/numeric charts ──
    # This prevents nonsensical charts like "Distribution of Latitude"
    def non_geo(cols):
        return [c for c in cols if c not in geo_cols]
    
    num_cols = non_geo(num_cols)
    num_cont = non_geo(num_cont)
    num_disc = non_geo(num_disc)
    
    # ── 1. Domain-Specific "Golden Path" charts (highest priority) ──
    if analyzer:
        domain_charts = analyzer.recommend_domain_charts(schema, stats)
        charts.extend(domain_charts)

    # ── 1b. Geographic Visualizations (Rule 5 — High priority) ──
    geo_cols = schema.get("geographic_columns", [])
    if geo_cols:
        lats = [c for c in geo_cols if any(k in c.lower() for k in ['lat', 'latitude'])]
        lons = [c for c in geo_cols if any(k in c.lower() for k in ['lon', 'longitude'])]
        regions = [c for c in geo_cols if not any(k in c.lower() for k in ['lat', 'lon', 'latitude', 'longitude'])]
        
        # Prioritize numeric targets for bubbles, then categorical for colors
        target_num = num_cols[0] if num_cols else None
        
        if lats and lons:
            # Rule 3: Lat/Lon + Numeric → Point/Bubble Map
            charts.insert(0, {
                "chart_type": "geo_map",
                "map_type": "point",
                "latitude": lats[0],
                "longitude": lons[0],
                "color_axis": target_num,
                "show_bubbles": True if target_num else False,
                "title": f"Geographic Distribution of {target_num}" if target_num else "Geographic Distribution"
            })
        elif regions:
            # Rule 3: Region (Country/State/etc.)
            # We promote this to the top since user explicitly requested "each and every domain"
            charts.insert(0, {
                "chart_type": "geo_map",
                "map_type": "choropleth",
                "location": regions[0],
                "color_axis": target_num if target_num else None,
                "aggregation": "sum" if target_num else "count",
                "show_bubbles": True if target_num else False,
                "title": f"{target_num} Distribution by {regions[0]}" if target_num else f"Coverage by {regions[0]}"
            })

    # ── 2. Statistical Defaults based on the 13-Step Spec ──
    
    # continuous vs continuous → scatter plot
    # Fallback to any numeric pairs if no "continuous" (uniqueness > 20) matches found
    scat_cols = num_cont if len(num_cont) >= 2 else num_cols
    if len(scat_cols) >= 2 and not any(c["chart_type"] == "scatter" for c in charts):
        charts.append({
            "chart_type": "scatter",
            "x_axis": scat_cols[0],
            "y_axis": scat_cols[1],
            "title": f"{scat_cols[0]} vs {scat_cols[1]}"
        })
        
    # discrete vs continuous → scatter plot
    if num_disc and num_cont and not any(c["chart_type"] == "scatter" and c.get("x_axis") == num_disc[0] for c in charts):
        charts.append({
            "chart_type": "scatter",
            "x_axis": num_disc[0],
            "y_axis": num_cont[0],
            "title": f"{num_disc[0]} vs {num_cont[0]}"
        })
        
    # categorical vs categorical → stacked bar
    if len(cat_cols) >= 2 and not any(c.get("aggregation") == "count" and c["chart_type"] == "bar" for c in charts):
        charts.append({
            "chart_type": "bar",
            "x_axis": cat_cols[0],
            "y_axis": cat_cols[1],
            "aggregation": "count",
            "title": f"{cat_cols[0]} by {cat_cols[1]}"
        })
        
    # numeric vs categorical → bar plot (mean aggregation)
    if num_cols and cat_cols and not any(c["chart_type"] == "bar" and c.get("aggregation") == "mean" for c in charts):
        charts.append({
            "chart_type": "bar",
            "x_axis": cat_cols[0],
            "y_axis": num_cols[0],
            "aggregation": "mean",
            "title": f"Average {num_cols[0]} per {cat_cols[0]}"
        })
    
    # numeric vs categorical → box plot
    if cat_cols and num_cols and not any(c["chart_type"] == "box" for c in charts):
        charts.append({
            "chart_type": "box",
            "x_axis": cat_cols[0],
            "y_axis": num_cols[0],
            "title": f"Distribution of {num_cols[0]} across {cat_cols[0]}"
        })
    
    # binary vs categorical → stacked bar
    if binary_cols and cat_cols:
        bc = binary_cols[0]
        cc = cat_cols[0]
        if not any(c.get("x_axis") == cc and c.get("y_axis") == bc for c in charts):
            charts.append({
                "chart_type": "bar",
                "x_axis": cc,
                "y_axis": bc,
                "aggregation": "mean",
                "title": f"{bc} Rate by {cc}"
            })
    
    # binary vs numeric → box plot
    if binary_cols and num_cols:
        bc = binary_cols[0]
        nc = num_cols[0] if num_cols[0] != bc else (num_cols[1] if len(num_cols) > 1 else None)
        if nc and not any(c["chart_type"] == "box" and c.get("x_axis") == bc for c in charts):
            charts.append({
                "chart_type": "box",
                "x_axis": bc,
                "y_axis": nc,
                "title": f"Distribution of {nc} by {bc}"
            })
        
    # date vs numeric → line chart
    if date_cols and num_cols and not any(c["chart_type"] == "line" for c in charts):
        charts.append({
            "chart_type": "line",
            "x_axis": date_cols[0],
            "y_axis": num_cols[0],
            "title": f"{num_cols[0]} over Time"
        })
    
    # datetime vs binary → event rate line chart
    if date_cols and binary_cols:
        if not any(c.get("aggregation") == "event_rate" for c in charts):
            charts.append({
                "chart_type": "line",
                "x_axis": date_cols[0],
                "y_axis": binary_cols[0],
                "aggregation": "event_rate",
                "title": f"{binary_cols[0]} Event Rate Over Time"
            })
    
    # single numeric → histogram
    # Fallback to any numeric if no continuous ones found
    hist_cols = num_cont if num_cont else num_cols
    if hist_cols and not any(c["chart_type"] == "histogram" for c in charts):
        charts.append({
            "chart_type": "histogram",
            "x_axis": hist_cols[0],
            "title": f"Distribution of {hist_cols[0]}"
        })
        
    # categorical parts-of-whole → pie chart
    for col in cat_cols:
        col_stats = stats.get("categorical_stats", {}).get(col, {})
        n_unique = col_stats.get("unique_count", 0)
        # Rule: small number of categories representing parts of a whole
        if 2 <= n_unique <= 6:
            if not any(c["chart_type"] == "pie" and c["x_axis"] == col for c in charts):
                charts.append({
                    "chart_type": "pie",
                    "x_axis": col,
                    "title": f"{col} Breakdown"
                })
                # Break to avoid too many pie charts
                break
        
    # multiple numeric → correlation heatmap
    if len(num_cols) >= 3 and not any(c["chart_type"] == "heatmap" for c in charts):
        heatmap_cols = [c for c in num_cont if c not in id_cols][:10]
        if len(heatmap_cols) >= 2:
            charts.append({
                "chart_type": "heatmap",
                "columns": heatmap_cols,
                "title": "Correlation Heatmap"
            })
            
    # Limit to most informative 8 visualizations
    return charts[:8]
