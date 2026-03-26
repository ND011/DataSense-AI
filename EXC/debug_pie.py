import requests
import json

url = "http://localhost:8000/analyze"
file_path = "data/dataset/test_pie.csv"

try:
    with open(file_path, "rb") as f:
        response = requests.post(url, files={"file": f})
        
    if response.status_code == 200:
        data = response.json()
        print("--- SCHEMA ---")
        print(json.dumps(data['schema'], indent=2))
        print("--- CHARTS ---")
        for i, chart in enumerate(data['charts']):
            print(f"{i+1}. {chart['chart_type']} | {chart['title']} | X: {chart.get('x_axis')}")
            if chart['chart_type'] == 'pie':
                 print(f"   Data: {chart['data']}")
            
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
