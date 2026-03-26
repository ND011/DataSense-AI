import pandas as pd
import sys
import os

# Add parent directory to path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.analysis.categorical_normalizer import normalize_categorical_columns

def test_normalization():
    data = {
        'Protein_ID': ['ID1', 'ID2', 'ID3', 'ID4', 'ID5'], # Should be skipped
        'Diet': ["Low Fat", "low fat", "LF", "Low Fat ", "lf"],
        'Type': ["Regular", "REGULAR", "reg", "Reg", "Regular "],
        'Active': ["Y", "n", "yes", "NO", "y"],
        'Gender': ["M", "F", "male", "Female", "m"],
        'Support': ["customer service", "CS", "Customer Service", "cs", "cust serv"] # cust serv won't match cs initials exactly but CS will
    }
    
    df = pd.DataFrame(data)
    print("Original DataFrame:")
    print(df)
    print("\n" + "="*50 + "\n")
    
    cleaned_df = normalize_categorical_columns(df)
    
    print("Cleaned DataFrame:")
    print(cleaned_df)
    
    # Assertions for Diet
    assert cleaned_df['Diet'].unique().tolist() == ['Low Fat']
    # Assertions for Type
    assert cleaned_df['Type'].unique().tolist() == ['Regular']
    # Assertions for Active
    assert sorted(cleaned_df['Active'].unique().tolist()) == ['No', 'Yes']
    # Assertions for Gender
    assert sorted(cleaned_df['Gender'].unique().tolist()) == ['Female', 'Male']
    # Assertions for Support
    # "cust serv" won't match initials "cs", so it will be "Cust Serv"
    assert "Customer Service" in cleaned_df['Support'].values
    
    print("\nAll tests passed!")

if __name__ == "__main__":
    test_normalization()
