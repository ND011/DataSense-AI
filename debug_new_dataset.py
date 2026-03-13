import requests
import json

url = "http://localhost:8000/analyze"
file_path = "data/dataset/EmployeeAttrition.csv"

def debug_dataset():
    print(f"\n--- DEBUG: {file_path} ---")
    try:
        with open(file_path, "rb") as f:
            response = requests.post(url, files={"file": f})
            
        if response.status_code == 200:
            data = response.json()
            with open("debug_result.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
            
            print("DOMAIN:", data.get('business_advisor', {}).get('domain', {}).get('domain'))
            smart_summary = data.get('business_advisor', {}).get('smart_summary', '')
            print(f"WORD COUNT: {len(smart_summary.split())}")
            print("Result saved to debug_result.json")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    debug_dataset()
