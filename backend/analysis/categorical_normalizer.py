import pandas as pd
import re

def normalize_categorical_columns(df):
    """
    Data Preprocessing Engine for Categorical Columns
    
    Applies 8 normalization rules to all categorical/text columns.
    """
    normalized_df = df.copy()
    id_keywords = ['_id', 'uuid', 'guid', 'code', 'key', 'number', 'serial', 'index']
    
    # Rule 3: Map Common Abbreviations
    base_abbrev_map = {
        'lf': 'low fat',
        'reg': 'regular',
        'y': 'yes',
        'n': 'no',
        'm': 'male',
        'f': 'female',
        'hp': 'high protein',
        'cs': 'customer service'
    }

    def pre_normalize(val):
        """Rule 1 & 2: Lowercase, Strip, and Collapse spaces"""
        if pd.isna(val) or not isinstance(val, str):
            return val
        v = val.lower().strip()
        v = re.sub(r'\s+', ' ', v)
        return v

    for col in normalized_df.columns:
        col_lower_name = str(col).lower()
        if normalized_df[col].dtype == 'object':
            # Skip obvious machine-generated IDs
            if any(kw in col_lower_name for kw in id_keywords):
                continue
            
            # 1. Pre-normalize all values in the column
            raw_values = normalized_df[col].unique()
            normalized_to_raw = {}
            for rv in raw_values:
                nv = pre_normalize(rv)
                if nv not in normalized_to_raw:
                    normalized_to_raw[nv] = []
                normalized_to_raw[nv].append(rv)
            
            # 2. Rule 5: Initial Letter Matching for Multi-Word Categories
            # Identify multi-word categories
            multi_word_map = {} # initials -> canonical_normalized_form
            for nv in normalized_to_raw:
                if not isinstance(nv, str):
                    continue
                words = nv.split()
                if len(words) >= 2:
                    initials = "".join([w[0] for w in words])
                    if initials not in multi_word_map or len(nv) > len(multi_word_map[initials]):
                        multi_word_map[initials] = nv
            
            # 3. Rule 6 & 8: Build final mapping to Canonical Labels
            final_mapping = {}
            
            # First, resolve each unique normalized value to a canonical form
            for nv in normalized_to_raw:
                if not isinstance(nv, str):
                    continue
                canonical = nv
                
                # Check base_abbrev_map first
                if nv in base_abbrev_map:
                    canonical = base_abbrev_map[nv]
                # Check dynamic Rule 5 initials (if not already handled by abbrev_map)
                elif nv in multi_word_map:
                    canonical = multi_word_map[nv]
                
                # Rule 7: Capitalize Final Categories (Title Case)
                final_mapping[nv] = canonical.title()

            # 4. Apply transformation
            def transform_value(val):
                nv = pre_normalize(val)
                if nv in final_mapping:
                    return final_mapping[nv]
                return val
            
            normalized_df[col] = normalized_df[col].apply(transform_value)
            
    return normalized_df
