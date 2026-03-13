import requests

files = {'file': open('C:\\0ND\\0Code\\webdev\\IBM\\dataset\\Boston.csv', 'rb')}
response = requests.post('http://localhost:8000/analyze', files=files)

print(response.status_code)
if response.status_code == 200:
    data = response.json()
    print("DOMAIN:", data["business_advisor"]["domain"])
    print("KPIs:", data["business_advisor"]["kpis"])
    print("TRENDS:", data["business_advisor"]["trend_analysis"])
else:
    print(response.text)
