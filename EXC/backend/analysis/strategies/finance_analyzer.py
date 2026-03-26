from .base_analyzer import BaseAnalyzer
from typing import List, Dict, Any
from ..llm_service import OllamaService

class FinanceAnalyzer(BaseAnalyzer):
    """
    Domain-Specific Analyzer for Finance and Banking datasets.
    Focuses on currency, volatility, revenue, and expenses.
    """
    
    def _find_money_column(self, schema: Dict[str, Any]) -> str:
        keywords = ["price", "amount", "revenue", "profit", "cost", "balance", "total"]
        all_cols = schema.get("numeric_columns", [])
        
        for col in all_cols:
            if any(k in col.lower() for k in keywords):
                return col
        return all_cols[0] if all_cols else ""

    def get_kpis(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        kpis = []
        num_stats = stats.get("numeric_stats", {})
        
        money_col = self._find_money_column(schema)
        
        if money_col and money_col in num_stats:
            col_data = num_stats[money_col]
            
            # 1. Average Trxn Value
            kpis.append({
                "name": "Avg Transaction Value",
                "value": f"${col_data.get('mean', 0):,.2f}"
            })
            
            # 2. Max Spike
            kpis.append({
                "name": "Max Value Spike",
                "value": f"${col_data.get('max', 0):,.2f}"
            })
            
            # 3. Volatility
            kpis.append({
                "name": f"Volatility ({money_col})",
                "value": f"±${col_data.get('std', 0):,.2f}"
            })
            
        # 4. Risk / Missing entries check
        total_missing = sum([d.get('missing_values', 0) for d in num_stats.values()])
        kpis.append({
            "name": "Data Quality Risk",
            "value": f"{total_missing} missing cells"
        })
            
        return kpis[:4]

    def get_target_variable(self, schema: Dict[str, Any]) -> str:
        return self._find_money_column(schema)

    def interpret_specific_trends(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> str:
        # Check if we have 'balance' or 'amount'
        num_cols = schema.get("numeric_columns", [])
        target = self.get_target_variable(schema)
        
        prompt = (
            f"I have profiled a financial dataset. The primary growth metric is {target}. "
            f"Write a 3 sentence professional financial analyst summary explaining the importance of "
            f"tracking {target} volatility and identifying period-over-period outliers for risk management."
        )
        
        llm = OllamaService("llama3.2")
        return llm.generate_insight(prompt, system_persona="Act as a Senior Investment Banker.")

    def recommend_domain_charts(self, schema: Dict[str, Any], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        charts = []
        num_cols = schema.get("numeric_columns", [])
        date_cols = schema.get("datetime_columns", [])
        
        target = self.get_target_variable(schema)
        
        # Golden Path: Profit/Balance Trend
        if date_cols and target != "Unknown":
            charts.append({
                "chart_type": "area",
                "x_axis": date_cols[0],
                "y_axis": target,
                "title": f"{target} Growth & Volatility Trend"
            })
            
        # Golden Path: Risk Heatmap
        if len(num_cols) >= 3:
            charts.append({
                "chart_type": "heatmap",
                "columns": num_cols[:5],
                "title": "Risk Correlation Matrix"
            })
            
        return charts
