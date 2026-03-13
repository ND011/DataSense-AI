import pandas as pd
import numpy as np
import plotly.express as px
try:
    import pycountry
except ImportError:
    pycountry = None

def detect_geo_columns(df):
    """Step 1: Detect Geographic Columns"""
    geo_keywords = ['country', 'nation', 'region', 'state', 'province', 'city', 'location', 'continent']
    geo_cols = []
    for col in df.columns:
        if any(kw in str(col).lower() for kw in geo_keywords):
            geo_cols.append(col)
    return geo_cols

def convert_country_to_iso(country_name):
    """Step 2: Standardize Country Names to ISO3"""
    if not pycountry or pd.isna(country_name):
        return None
    try:
        # Try direct match
        result = pycountry.countries.get(name=str(country_name))
        if result:
            return result.alpha_3
        
        # Try fuzzy match/search
        results = pycountry.countries.search_fuzzy(str(country_name))
        if results:
            return results[0].alpha_3
    except:
        return None
    return None

def detect_time_column(df):
    """Step 3: Detect Time Columns"""
    time_keywords = ['year', 'date', 'time', 'season', 'timestamp']
    time_cols = []
    
    # Check by dtype
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            time_cols.append(col)
            continue
        
        # Check by name
        if any(kw in str(col).lower() for kw in time_keywords):
            # Try to convert
            try:
                # If it's a simple year number, we might want to keep it numeric for animation
                if df[col].dtype in ['int64', 'float64'] and "year" in str(col).lower():
                    time_cols.append(col)
                else:
                    pd.to_datetime(df[col], errors='raise')
                    time_cols.append(col)
            except:
                pass
    return time_cols[0] if time_cols else None

def detect_metric_columns(df, geo_cols):
    """Step 4: Detect Metric Columns"""
    numeric_df = df.select_dtypes(include=["int64", "float64"])
    metrics = []
    for col in numeric_df.columns:
        # Exclude geographic columns
        if col in geo_cols:
            continue
        
        # Exclude binary (0/1 or only 2 unique values)
        if df[col].nunique() <= 2:
            continue
            
        # Exclude identifiers (id in name)
        if 'id' in str(col).lower():
            continue
            
        metrics.append(col)
    return metrics

def aggregate_geo_data(df, country_iso_col, metric, time_col=None):
    """Step 5: Aggregate Data for Map"""
    if time_col:
        df_geo = df.groupby([country_iso_col, time_col], observed=False)[metric].sum().reset_index()
    else:
        df_geo = df.groupby([country_iso_col], observed=False)[metric].sum().reset_index()
    return df_geo

def detect_coordinates(df):
    """Step 6: Detect Latitude/Longitude Columns"""
    lat_keywords = ['lat', 'latitude']
    lon_keywords = ['lon', 'longitude', 'lng']
    
    lat_col = next((c for c in df.columns if any(kw == c.lower() for kw in lat_keywords)), None)
    lon_col = next((c for c in df.columns if any(kw == c.lower() for kw in lon_keywords)), None)
    
    return lat_col, lon_col

def generate_geo_viz(df):
    """
    Main Orchestrator for Steps 7-11
    """
    # 1. Detection
    geo_cols = detect_geo_columns(df)
    lat_col, lon_col = detect_coordinates(df)
    time_col = detect_time_column(df)
    
    # Check for geographic validity (Step 9)
    if not geo_cols and not (lat_col and lon_col):
        return "Geo visualization not available for this dataset."

    # 2. Metric detection
    metrics = detect_metric_columns(df, geo_cols)
    if not metrics:
        return "Geo visualization not available for this dataset."
    
    primary_metric = metrics[0]
    
    # 3. Standardization (Step 2 & 10)
    # Prefer country-like columns for ISO conversion
    country_col = next((c for c in geo_cols if 'country' in c.lower() or 'nation' in c.lower()), geo_cols[0] if geo_cols else None)
    
    working_df = df.copy()
    if country_col:
        working_df['country_iso'] = working_df[country_col].apply(convert_country_to_iso)
        # Step 10: Clean
        working_df = working_df[working_df['country_iso'].notna()]
    
    if len(working_df) == 0 and not (lat_col and lon_col):
        return "Geo visualization not available for this dataset."

    # 4. Map Type Selection (Step 7)
    map_type = "choropleth"
    if lat_col and lon_col:
        map_type = "scatter_geo"
    
    # 5. Aggregation (Step 5)
    if map_type == "choropleth" and 'country_iso' in working_df.columns:
        aggregated_df = aggregate_geo_data(working_df, 'country_iso', primary_metric, time_col)
    else:
        # For coordinates, we might not aggregate or we aggregate by unique lat/lon
        aggregated_df = working_df
        
    # 6. Return Map Configuration (Step 11)
    return {
        "map_type": map_type,
        "geo_column": country_col or (lat_col, lon_col),
        "metric_column": primary_metric,
        "time_column": time_col,
        "aggregated_data": aggregated_df.to_dict(orient='records'),
        "plotly_config": {
            "locations": "country_iso" if map_type == "choropleth" else None,
            "lat": lat_col if map_type == "scatter_geo" else None,
            "lon": lon_col if map_type == "scatter_geo" else None,
            "color": primary_metric,
            "animation_frame": time_col if time_col else None,
            "hover_name": country_col if country_col else None
        }
    }

def get_choropleth_figure(config):
    """Step 8: Generate Choropleth Map using Plotly"""
    if isinstance(config, str):
        return None
    
    df = pd.DataFrame(config["aggregated_data"])
    plotly_config = config["plotly_config"]
    
    if config["map_type"] == "choropleth":
        fig = px.choropleth(
            df,
            locations=plotly_config["locations"],
            color=plotly_config["color"],
            hover_name=plotly_config["hover_name"],
            animation_frame=plotly_config["animation_frame"],
            color_continuous_scale=px.colors.sequential.Plasma,
            projection="natural earth",
            title=f"{plotly_config['color']} by {plotly_config['hover_name']}"
        )
        return fig
    elif config["map_type"] == "scatter_geo":
        fig = px.scatter_geo(
            df,
            lat=plotly_config["lat"],
            lon=plotly_config["lon"],
            color=plotly_config["color"],
            animation_frame=plotly_config["animation_frame"],
            title=f"{plotly_config['color']} Distribution"
        )
        return fig
    return None
