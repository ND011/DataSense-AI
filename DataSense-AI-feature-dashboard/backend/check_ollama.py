import requests
try:
    response = requests.get("http://localhost:11434/api/tags", timeout=2)
    print(f"Ollama Status: {response.status_code}")
    print(f"Models: {response.json().get('models', [])}")
except Exception as e:
    print(f"Ollama NOT running: {str(e)}")
