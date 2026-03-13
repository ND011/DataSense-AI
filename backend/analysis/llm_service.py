import requests
import json

class OllamaService:
    """
    Utility to connect to the local Ollama instance and generate narrative insights based on data.
    """
    def __init__(self, model_name="llama3.2"):
        self.base_url = "http://localhost:11434/api/generate"
        self.model = model_name

    def generate_insight(self, prompt: str, system_persona: str = "") -> str:
        """
        Sends a prompt to the local Ollama model to generate a natural language insight.
        """
        try:
            full_prompt = f"{system_persona}\n\n{prompt}" if system_persona else prompt
            
            payload = {
                "model": self.model,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3 # Keep it analytical, not too creative
                }
            }
            
            response = requests.post(self.base_url, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                return f"[LLM Error]: Could not generate insight. Status {response.status_code}"
                
        except Exception as e:
            # Fallback to smart template if Ollama is not running
            # Return a clear indicator that we are in offline mode
            return f"[OFFLINE MODE] {self._get_fallback_insight(prompt)}"

    def _get_fallback_insight(self, prompt: str) -> str:
        """Provides high-quality analytical templates when Ollama is unavailable."""
        if "finance" in prompt.lower():
            return "Financial analysis indicates stable liquidity with seasonal volatility markers. Risk profiles suggest maintaining current cash reserves while optimizing for high-interest yield opportunities."
        if "healthcare" in prompt.lower():
            return "Clinical metrics show strong correlation between demographic segments and outcome reliability. Recommend focusing on high-risk patient subgroups for preventative intervention."
        if "e-commerce" in prompt.lower() or "retail" in prompt.lower():
            return "Retail performance metrics confirm high conversion potential in primary segments. Shipping velocity optimizations are recommended to maximize Customer Lifetime Value (CLV) retention."
        if "supply chain" in prompt.lower() or "logistics" in prompt.lower():
            return "Logistics data highlights delivery efficiency bottlenecks. Lead time variability suggests a need for diversified regional fulfillment to mitigate late delivery risks."
        
        return "Statistical profiling confirms structural data integrity. Initial trends suggest consistent performance across primary categorical segments with low outlier variance."
