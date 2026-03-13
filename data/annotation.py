import pandas as pd
import os

folder = "dataset"
results = []

def detect_date_format(series):
    if pd.api.types.is_numeric_dtype(series):
        return None
    
    # Sample some values to check for date-like characteristics
    # Drop duplicates in sample to avoid skewing results with same invalid string
    sample = series.dropna().astype(str).unique()[:100]
    if len(sample) == 0:
        return None
    
    # Heuristic: Must have at least one common date separator
    if not any(any(sep in val for sep in ['/', '-', ':']) for val in sample):
        return None

    formats_to_test = [
        '%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d',
        '%d-%m-%Y', '%Y-%m-%d %H:%M:%S', '%m/%d/%Y %H:%M:%S',
        '%d/%m/%Y %H:%M:%S', '%Y/%m/%d %H:%M:%S'
    ]
    
    for fmt in formats_to_test:
        try:
            # First check purely on sample
            sample_converted = pd.to_datetime(sample, format=fmt, errors='coerce')
            if sample_converted.notna().sum() > len(sample) * 0.8:
                # Confirm on a slightly larger subset or the whole thing if it's small
                return fmt
        except:
            continue
            
    # ONLY try mixed if sample has date-like patterns but no fixed format worked
    try:
        sample_converted = pd.to_datetime(sample, errors='coerce', format='mixed')
        if sample_converted.notna().sum() > len(sample) * 0.8:
            return "mixed"
    except:
        pass
        
    return None

def is_datetime_column(series):
    return detect_date_format(series) is not None

def detect_type(series):
    # Safety check for empty series
    if len(series) == 0:
        return "text"

    name = str(series.name).lower() if series.name else ""
    unique_ratio = series.nunique() / len(series)

    # --- datetime detection ---
    if is_datetime_column(series):
        return "datetime"

    # --- numeric detection ---
    if pd.api.types.is_numeric_dtype(series):

        numeric_series = series.dropna()
        if len(numeric_series) == 0:
            return "text"

        # detect year columns
        if numeric_series.between(1800, 2100).mean() > 0.8:
            return "datetime"

        # continuous values (decimals)
        if (numeric_series % 1 != 0).any():
            return "continuous"

        # categorical numeric (small set)
        if numeric_series.nunique() <= 10:
            return "categorical"

        # id detection using column name
        id_keywords = ["id", "serial", "number", "code"]

        if unique_ratio > 0.95 and any(k in name for k in id_keywords):
            return "id"

        # otherwise integer numeric values
        return "discrete"

    # --- text detection ---
    else:
        if series.nunique() < 50:
            return "categorical"

        return "text"

def detect_dataset_type(df, column_types):
    columns = [c.lower() for c in df.columns]
    has_datetime = any(t == "datetime" for t in column_types.values())
    id_columns = [c for c, t in column_types.items() if t == "id"]

    # transaction keywords
    transaction_keywords = [
        "order","transaction","invoice","purchase","txn","receipt"
    ]
    product_keywords = [
        "product","item","sku"
    ]
    # panel keywords
    entity_keywords = [
        "company","user","customer","store","employee","firm"
    ]

    # ---- Transaction detection ----
    joined_columns = " ".join(columns)
    if any(k in joined_columns for k in transaction_keywords):
        return "transaction"
    if any(k in joined_columns for k in product_keywords):
        return "transaction"

    # ---- Panel dataset ----
    if has_datetime and len(id_columns) > 0:
        for col in id_columns:
            if df[col].duplicated().any():
                return "panel"

    # ---- Time series ----
    if has_datetime:
        return "time_series"

    # ---- Default ----
    return "tabular"

# Process datasets
for file in os.listdir(folder):
    if file.endswith(".csv"):
        print(f"Processing: {file}")
        file_path = os.path.join(folder, file)
        
        # Performance safety: don't load more than 100k rows for metadata detection
        # This is usually enough to detect types and dataset patterns
        read_args = {"nrows": 100000}
        
        try:
            df = pd.read_csv(file_path, **read_args)
        except UnicodeDecodeError:
            print(f"  Encoding error triggered for {file}, trying latin-1...")
            df = pd.read_csv(file_path, encoding='latin-1', **read_args)
        except Exception as e:
            print(f"  Error reading {file}: {e}")
            continue

        current_column_types = {}
        column_results = []
        
        for col in df.columns:
            col_type = detect_type(df[col])
            col_format = detect_date_format(df[col]) if col_type == "datetime" else None
            
            current_column_types[col] = col_type
            
            column_results.append({
                "Dataset": file,
                "Column": col,
                "Detected_Type": col_type,
                "Date_Format": col_format,
                "Unique_Values": df[col].nunique()
            })

        dataset_type = detect_dataset_type(df, current_column_types)
        
        for res in column_results:
            res["Dataset_Type"] = dataset_type
            results.append(res)

metadata = pd.DataFrame(results)

try:
    metadata.to_csv("dataset_column_annotations.csv", index=False)
    print("Metadata saved to dataset_column_annotations.csv")
except PermissionError:
    print("\n[!] Error: Could not save to 'dataset_column_annotations.csv'. Is it open in Excel?")
    alternative_name = "dataset_column_annotations_new.csv"
    metadata.to_csv(alternative_name, index=False)
    print(f"Results have been saved to '{alternative_name}' instead.")