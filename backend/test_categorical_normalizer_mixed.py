import pandas as pd
import sys
import os
import numpy as np

# Add parent directory to path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.analysis.categorical_normalizer import normalize_categorical_columns

def test_mixed_types():
    data = {
        'Mixed': ["Low Fat", np.nan, 123.45, "LF", "low fat", None],
        'NumericAsObject': [1.0, 2.0, 3.0, 1.0, 5.0, 6.0] 
    }
    
    df = pd.DataFrame(data)
    df['NumericAsObject'] = df['NumericAsObject'].astype('object')
    
    print("Original Mixed DataFrame:")
    print(df)
    
    try:
        cleaned_df = normalize_categorical_columns(df)
        print("\nCleaned Mixed DataFrame:")
        print(cleaned_df)
        print("\nFix verified! No AttributeError.")
    except Exception as e:
        print(f"\nTest failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_mixed_types()
