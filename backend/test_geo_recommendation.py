import pandas as pd
from analysis.column_detector import detect_column_types
from analysis.chart_recommender import recommend_charts

def test_universal_geo_recommendation():
    # Test 1: CountryName + no numbers (should still recommend map)
    data1 = {
        'CountryName': ['India', 'USA', 'India', 'UK', 'USA'],
        'Category': ['A', 'B', 'A', 'C', 'B']
    }
    df1 = pd.DataFrame(data1)
    schema1 = detect_column_types(df1)
    print(f"Detected (T1): {schema1['geographic_columns']}")
    assert 'CountryName' in schema1['geographic_columns']
    
    charts1 = recommend_charts(schema1, {})
    geo1 = [c for c in charts1 if c['chart_type'] == 'geo_map']
    print(f"Recommended Geo (T1): {len(geo1)}")
    assert len(geo1) > 0
    assert geo1[0]['aggregation'] == 'count'

    # Test 2: zipcode
    data2 = {
        'zipcode': ['400001', '90210'],
        'Value': [10, 20]
    }
    df2 = pd.DataFrame(data2)
    schema2 = detect_column_types(df2)
    print(f"Detected (T2): {schema2['geographic_columns']}")
    assert 'zipcode' in schema2['geographic_columns']

    print("Universal geo test passed!")

if __name__ == "__main__":
    test_universal_geo_recommendation()
