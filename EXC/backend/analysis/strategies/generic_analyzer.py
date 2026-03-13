from .base_analyzer import BaseAnalyzer
from typing import List, Dict, Any
import numpy as np
from ..llm_service import OllamaService

class GenericAnalyzer(BaseAnalyzer):
    """
    Fallback generic analyzer when no specific domain is detected.
    Provides robust, agnostic statistical KPIs.
    """
    
    def get_kpis(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        kpis = []
        num_cols = schema.get("numeric_columns", [])
        
        if num_cols:
            kpis.append({
                "name": "Total Numeric Drivers", 
                "value": f"{len(num_cols)}"
            })
            
            # Find the numeric column with the highest variance/std
            highest_var_col = None
            highest_cv = -1 # Coefficient of variation
            
            for col in num_cols:
                col_stats = stats.get("numeric_stats", {}).get(col, {})
                mean = col_stats.get("mean", 1)
                std = col_stats.get("std", 0)
                
                if mean != 0:
                    cv = abs(std / mean)
                    if cv > highest_cv:
                        highest_cv = cv
                        highest_var_col = col
            
            if highest_var_col:
                kpis.append({
                    "name": f"Most Volatile Metric",
                    "value": str(highest_var_col)
                })
                
        cat_cols = schema.get("categorical_columns", [])
        if cat_cols:
            kpis.append({"name": "Category Diversity", "value": f"{len(cat_cols)} segments"})
            
        return kpis[:4]

    def get_target_variable(self, schema: Dict[str, Any]) -> str:
        num_cols = schema.get("numeric_columns", [])
        return num_cols[-1] if num_cols else "Unknown"

    def interpret_specific_trends(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> str:
        num_cols = len(schema.get("numeric_columns", []))
        
        prompt = (
            f"I have profiled a dataset with {num_cols} numerical columns. "
            f"Write a 3 sentence business analyst summary explaining how outlier detection across these "
            f"numerical metrics can signal operational shifts or data quality issues."
        )
        
        llm = OllamaService("llama3.2")
        return llm.generate_insight(prompt, system_persona="Act as a Strategic Data Consultant.")

    def recommend_domain_charts(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [] # Generic uses standard statistical recommender
