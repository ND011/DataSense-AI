from .base_analyzer import BaseAnalyzer
from typing import List, Dict, Any
from ..llm_service import OllamaService

class HealthcareAnalyzer(BaseAnalyzer):
    """
    Domain-Specific Analyzer for Healthcare and Clinical datasets.
    Focuses on patient demographics, risk factors, and health metrics.
    """

    def get_kpis(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        kpis = []
        num_stats = stats.get("numeric_stats", {})
        
        # 1. Look for 'age'
        age_cols = [c for c in num_stats.keys() if 'age' in c.lower()]
        if age_cols:
            kpis.append({
                "name": "Avg Subject Age",
                "value": f"{num_stats[age_cols[0]].get('mean', 0):.1f} yrs"
            })
            
        # 2. Look for 'bmi' or 'weight'
        health_metric_cols = [c for c in num_stats.keys() if any(k in c.lower() for k in ['bmi', 'gluco', 'bp', 'blood', 'heart'])]
        if health_metric_cols:
            kpis.append({
                "name": "Primary Health Marker",
                "value": f"{health_metric_cols[0]}"
            })
            
        # 3. Sample Size
        kpis.append({
            "name": "Patient Cohort Size",
            "value": f"{len(num_stats.keys())} variables"
        })
        
        return kpis[:4]

    def get_target_variable(self, schema: Dict[str, Any]) -> str:
        # Default to a health metric or mid-data column
        all_num = schema.get("numeric_columns", [])
        health_indices = [c for c in all_num if any(k in c.lower() for k in ['med', 'bmi', 'risk', 'heart'])]
        return health_indices[0] if health_indices else (all_num[-1] if all_num else "Unknown")

    def interpret_specific_trends(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> str:
        target = self.get_target_variable(schema)
        
        prompt = (
            f"I have profiled a healthcare/clinical dataset where {target} is the focus. "
            f"Write a 3 sentence medical informatics summary explaining how correlating patient vitals "
            f"and clinical markers can lead to better diagnostic outcome predictions."
        )
        
        llm = OllamaService("llama3.2")
        return llm.generate_insight(prompt, system_persona="Act as a Medical Informatics Analyst.")

    def recommend_domain_charts(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        charts = []
        num_cols = schema.get("numeric_columns", [])
        
        # Golden Path: Clinical Correlations
        if len(num_cols) >= 2:
            charts.append({
                "chart_type": "scatter",
                "x_axis": num_cols[0],
                "y_axis": num_cols[1],
                "title": f"Clinical Correlation: {num_cols[0]} vs {num_cols[1]}"
            })
            
        # Distribution of markers
        if len(num_cols) > 0:
            charts.append({
                "chart_type": "bar",
                "x_axis": schema.get("categorical_columns", ["Patient_ID"])[0],
                "y_axis": num_cols[0],
                "aggregation": "mean",
                "title": f"Avg {num_cols[0]} by Segment"
            })
            
        return charts
