import requests
import json

url = "http://localhost:8000/analyze"
file_path = "data/dataset/global_sales_geography.csv"

def debug_dataset():
    print(f"\n--- DEBUG: {file_path} ---")
    try:
        with open(file_path, "rb") as f:
            response = requests.post(url, files={"file": f})
            
        if response.status_code == 200:
            data = response.json()
            print("DOMAIN:", data.get('business_advisor', {}).get('domain', {}).get('domain'))
            print("SCHEMA GEOGRAPHIC:", data.get('schema', {}).get('geographic_columns'))
            print("CHARTS RECOMMENDED:", [c['chart_type'] for c in data['charts']])
            for i, c in enumerate(data['charts']):
                print(f"Chart {i+1}: {c['chart_type']} | Title: {c['title']}")
                if c['chart_type'] == 'geo_map':
                    print(f"   Details: {json.dumps({k:v for k,v in c.items() if k != 'data'}, indent=2)}")
                    print(f"   Data Count: {len(c.get('data', []))}")
                    if len(c.get('data', [])) > 0:
                        print(f"   Data Sample: {c['data'][0]}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    debug_dataset()
