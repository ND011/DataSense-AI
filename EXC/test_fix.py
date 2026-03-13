import requests
import json

url = "http://localhost:8000/analyze"
file_path = "data/dataset/test_3col_hc.csv"

try:
    with open(file_path, "rb") as f:
        response = requests.post(url, files={"file": f})
        
    if response.status_code == 200:
        data = response.json()
        print(f"Domain: {data['business_advisor']['domain']['domain']}")
        print(f"Confidence: {data['business_advisor']['domain']['confidence']}")
        print(f"Charts returned: {len(data['charts'])}")
        for i, chart in enumerate(data['charts']):
            print(f"{i+1}. {chart['title']} ({chart['chart_type']}) - X: {chart.get('x_axis')}, Y: {chart.get('y_axis')}")
            if not chart.get('data'):
                print("   WARNING: Chart has NO data!")
        
        if not data['charts']:
            print("FAILURE: No charts were returned for this dataset.")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
