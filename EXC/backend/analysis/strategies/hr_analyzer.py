from .base_analyzer import BaseAnalyzer
from typing import List, Dict, Any
from ..llm_service import OllamaService

class HRAnalyzer(BaseAnalyzer):
    """
    Domain-Specific Analyzer for Human Resources and Workforce datasets.
    Focuses on employee attrition, performance, and compensation.
    """

    def get_kpis(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        kpis = []
        num_stats = stats.get("numeric_stats", {})
        
        # 1. Salary analysis
        salary_cols = [c for c in num_stats.keys() if 'salary' in c.lower() or 'pay' in c.lower() or 'wage' in c.lower()]
        if salary_cols:
            kpis.append({
                "name": "Avg Workforce Pay",
                "value": f"${num_stats[salary_cols[0]].get('mean', 0):,.0f}"
            })
            
        # 2. Tenure
        tenure_cols = [c for c in num_stats.keys() if 'tenure' in c.lower() or 'year' in c.lower() or 'time' in c.lower()]
        if tenure_cols:
            kpis.append({
                "name": "Avg Tenure",
                "value": f"{num_stats[tenure_cols[0]].get('mean', 0):.1f} yrs"
            })
            
        kpis.append({
            "name": "Total Employees",
            "value": f"{len(num_stats.keys())} attributes"
        })
        
        return kpis[:4]

    def get_target_variable(self, schema: Dict[str, Any]) -> str:
        all_num = schema.get("numeric_columns", [])
        attrition_indices = [c for c in all_num if any(k in c.lower() for k in ['attrit', 'perform', 'satis'])]
        return attrition_indices[0] if attrition_indices else (all_num[0] if all_num else "Unknown")

    def interpret_specific_trends(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> str:
        prompt = (
            "I have profiled a Human Resources and Employee Attrition dataset. "
            "Write a 3 sentence professional HR director summary explaining how identifying correlations "
            "between department salary levels and tenure stability can flag high-risk turnover zones."
        )
        
        llm = OllamaService("llama3.2")
        return llm.generate_insight(prompt, system_persona="Act as a Talent Strategy Consultant.")

    def recommend_domain_charts(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        charts = []
        cat_cols = schema.get("categorical_columns", [])
        num_cols = schema.get("numeric_columns", [])
        
        # Golden Path: Departmental Performance/Spread
        dept_cols = [c for c in cat_cols if 'dept' in c.lower() or 'job' in c.lower()]
        if dept_cols and num_cols:
            charts.append({
                "chart_type": "bar",
                "x_axis": dept_cols[0],
                "y_axis": num_cols[0],
                "aggregation": "mean",
                "title": f"Avg {num_cols[0]} by Sector"
            })
            
        # Retention Profile
        if cat_cols:
            charts.append({
                "chart_type": "pie",
                "x_axis": cat_cols[0],
                "title": "Workforce Segmentation"
            })
            
        return charts
