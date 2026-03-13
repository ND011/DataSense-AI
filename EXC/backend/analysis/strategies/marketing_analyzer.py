from .base_analyzer import BaseAnalyzer
from typing import List, Dict, Any
from ..llm_service import OllamaService

class MarketingAnalyzer(BaseAnalyzer):
    """
    Domain-Specific Analyzer for Marketing and Advertising datasets.
    Focuses on campaign performance, conversion rates, and ROI.
    """

    def get_kpis(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        kpis = []
        num_stats = stats.get("numeric_stats", {})
        
        # 1. Ad Spend
        spend_cols = [c for c in num_stats.keys() if 'spend' in c.lower() or 'cost' in c.lower() or 'budget' in c.lower()]
        if spend_cols:
            kpis.append({
                "name": "Total Ad Spend",
                "value": f"${num_stats[spend_cols[0]].get('mean', 0) * 100:,.0f}" # Placeholder total
            })
            
        # 2. Engagement (Clicks/Impressions)
        engagement_cols = [c for c in num_stats.keys() if any(k in c.lower() for k in ['click', 'impres', 'view', 'visit'])]
        if engagement_cols:
            kpis.append({
                "name": "Avg Engagement",
                "value": f"{num_stats[engagement_cols[0]].get('mean', 0):,.0f} units"
            })
            
        kpis.append({
            "name": "Campaign Attribution",
            "value": f"{len(num_stats.keys())} metrics"
        })
        
        return kpis[:4]

    def get_target_variable(self, schema: Dict[str, Any]) -> str:
        all_num = schema.get("numeric_columns", [])
        conversion_indices = [c for c in all_num if any(k in c.lower() for k in ['convert', 'roi', 'sale', 'lead'])]
        return conversion_indices[0] if conversion_indices else (all_num[0] if all_num else "Unknown")

    def interpret_specific_trends(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> str:
        prompt = (
            "I have profiled a Marketing Campaign and Lead Generation dataset. "
            "Write a 3 sentence professional marketing director summary explaining how tracking lead "
            "conversion rates across different campaign channels can optimize marketing spend and ROI."
        )
        
        llm = OllamaService("llama3.2")
        return llm.generate_insight(prompt, system_persona="Act as a Growth Marketing Analyst.")

    def recommend_domain_charts(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        charts = []
        num_cols = schema.get("numeric_columns", [])
        cat_cols = schema.get("categorical_columns", [])
        
        # Golden Path: Reach vs Outcome Correlation
        if len(num_cols) >= 2:
            charts.append({
                "chart_type": "scatter",
                "x_axis": num_cols[0],
                "y_axis": num_cols[1],
                "title": f"Campaign Efficiency: {num_cols[0]} vs {num_cols[1]}"
            })
            
        # Channel Yield
        if cat_cols and num_cols:
            charts.append({
                "chart_type": "bar",
                "x_axis": cat_cols[0],
                "y_axis": num_cols[0],
                "aggregation": "sum",
                "title": "Conversion Yield by Channel"
            })
            
        return charts
