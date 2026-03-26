import requests
import json

url = "http://localhost:8000/analyze"
file_path = "data/dataset/test_categorical.csv"

try:
    with open(file_path, "rb") as f:
        response = requests.post(url, files={"file": f})
        
    if response.status_code == 200:
        data = response.json()
        print(f"Domain: {data['business_advisor']['domain']['domain']}")
        
        # Check charts for normalized categories
        # A bar chart of Category should show consolidated counts
        cat_charts = [c for c in data['charts'] if c.get('x_axis') == 'Category']
        
        if cat_charts:
            chart = cat_charts[0]
            print(f"Chart: {chart['title']}")
            labels = [p['name'] for p in chart['data']]
            print(f"Labels found: {labels}")
            
            expected = ['Low Fat', 'Regular', 'Female', 'Male']
            for e in expected:
                if e in labels:
                    print(f"✅ Found normalized label: {e}")
                else:
                    print(f"❌ Missing expected label: {e}")
            
            # Check for non-normalized ones
            messy = ['low fat', 'LF', 'LF ', 'reg', 'f', 'm', 'F']
            for m in messy:
                if m.title() in labels and m.title() != m:
                    continue # This is fine as it's normalized
                if m in labels:
                    print(f"❌ Found un-normalized label: '{m}'")
        else:
            print("❌ No chart found for 'Category' column.")
            print("Available charts:", [c['title'] for c in data['charts']])
            print("Schema:", data['schema']['categorical_columns'])
            
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
