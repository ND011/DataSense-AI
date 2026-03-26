"""Quick E2E test #2: Classification dataset (Bank Churn)."""
import requests

url = "http://localhost:8000/analyze"
test_file = "data/dataset/Bank Churn Modelling.csv"

print(f"Testing with: {test_file}")
with open(test_file, "rb") as f:
    r = requests.post(url, files={"file": f})

if r.status_code != 200:
    print(f"ERROR: Status {r.status_code}")
    print(r.text[:500])
    exit(1)

d = r.json()
print(f"STATUS: {r.status_code} OK")
s = d["schema"]
print(f"Rows: {d['summary']['rows']}, Cols: {d['summary']['columns']}")
print(f"Identifiers: {s.get('identifier_columns', [])}")
print(f"Binary:      {s.get('binary_columns', [])}")
print(f"Categorical: {s.get('categorical_columns', [])}")
print(f"Charts: {len(d['charts'])}")
for c in d['charts']:
    print(f"  {c['chart_type']}: {c['title']}")
    
pr = d.get("prediction_results")
if pr:
    print(f"\nML Type: {pr['type']}")
    print(f"Target: {pr['target']}")
    print(f"Best Model: {pr.get('best_model')}")
    print(f"Models: {len(pr.get('models_compared', []))}")
    for m in pr.get('models_compared', []):
        print(f"  {m.get('model')}: acc={m.get('accuracy','N/A')}, f1={m.get('f1_score','N/A')}")

print(f"\nInsights: {len(d['insights'])}")
for i in d['insights'][:5]:
    print(f"  [{i['type']}] {i['message'][:100]}")
print(f"\nDomain: {d['business_advisor']['domain']['domain']}")
print(f"Pivots: {len(d['pivot_tables'])}")
print("\nCLASSIFICATION TEST PASSED!" if pr and pr['type'] == 'classification' else "\nWARNING: Expected classification")
