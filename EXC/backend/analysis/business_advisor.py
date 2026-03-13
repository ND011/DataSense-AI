import pandas as pd
import numpy as np
from .strategies import FinanceAnalyzer, EcommerceAnalyzer, GenericAnalyzer, HealthcareAnalyzer, HRAnalyzer, MarketingAnalyzer, SupplyChainAnalyzer, ManufacturingAnalyzer

def get_analyzer_for_domain(domain_name: str):
    """Factory to instantiate the correct Strategy based on domain name."""
    if "Finance" in domain_name:
        return FinanceAnalyzer()
    elif "Retail" in domain_name or "E-commerce" in domain_name:
        return EcommerceAnalyzer()
    elif "Marketing" in domain_name:
        return MarketingAnalyzer()
    elif "Healthcare" in domain_name:
        return HealthcareAnalyzer()
    elif "Human Resources" in domain_name:
        return HRAnalyzer()
    elif "Supply Chain" in domain_name or "Logistics" in domain_name:
        return SupplyChainAnalyzer()
    elif "Manufacturing" in domain_name:
        return ManufacturingAnalyzer()
    else:
        return GenericAnalyzer()

def detect_domain(schema):
    """
    Step 1: Dataset Domain Detection
    """
    all_cols = [c.lower() for c in schema["numeric_columns"] + schema["categorical_columns"] + schema["text_columns"]]
    
    domains = {
        "Retail / E-commerce": ["sku", "transaction", "membership", "discount", "coupon", "cart", "store", "purchase", "shopping"],
        "Finance / Banking": ["amount", "balance", "credit", "debit", "loan", "interest", "finance", "revenue", "expense", "profit"],
        "Healthcare": ["patient", "diagnosis", "doctor", "heart", "blood", "medical", "treatment", "age", "bmi", "glucose"],
        "Human Resources": ["employee", "salary", "bonus", "department", "tenure", "hiring", "performance", "vacation"],
        "Marketing": ["lead", "conversion", "click", "impression", "campaign", "roi", "engagement", "spend", "ad"],
        "Supply Chain / Logistics": ["delivery", "shipping", "shipment", "latitude", "longitude", "late", "warehouse", "freight", "transport", "logistics", "order country", "order city", "shipping mode"],
        "Manufacturing": ["unit", "production", "machine", "fault", "downtime", "batch", "material", "inventory"],
        "General Business": ["id", "name", "value", "type", "status", "category", "order", "sales", "customer", "price", "quantity"]
    }
    
    domain_scores = {}
    for domain, keywords in domains.items():
        score = sum(1 for k in keywords if any(k in col for col in all_cols))
        domain_scores[domain] = score
        
    top_domain = max(domain_scores, key=domain_scores.get)
    confidence = "high" if domain_scores[top_domain] > 2 else "medium" if domain_scores[top_domain] > 0 else "low"
    
    return {
        "domain": top_domain,
        "confidence": confidence,
        "reasoning": f"Detected keywords related to {top_domain} in the column names {all_cols}."
    }

def generate_kpis(domain, schema, stats):
    """
    Step 2: KPI Generation (Now uses dynamic Strategy Pattern)
    """
    analyzer = get_analyzer_for_domain(domain["domain"])
    return analyzer.get_kpis(schema, stats)

def interpret_trends(domain, schema, stats):
    """
    Step 4: Trend Interpretation (Now uses dynamic Strategy Pattern)
    """
    analyzer = get_analyzer_for_domain(domain["domain"])
    return analyzer.interpret_specific_trends(schema, stats)

def generate_recommendations(domain, insights):
    """
    Step 5: Business Recommendations
    """
    recommendations = []
    
    # Add based on insights
    for insight in insights:
        if insight["type"] == "correlation":
            recommendations.append(f"Optimize {insight['columns'][0]} to drive performance in {insight['columns'][1]}.")
        elif insight["type"] == "outlier":
            recommendations.append(f"Investigate extreme cases in {insight['column']} to prevent resource leakage.")
            
    # Add based on domain
    domain_recs = {
        "Retail / E-commerce": ["Increase inventory for high-demand products", "Focus marketing on top-performing categories"],
        "Marketing": ["Increase budget for high ROI campaigns", "Optimize underperforming channels"],
        "Finance / Banking": ["Strengthen risk assessment for outlier transactions", "Diversify portfolio based on uncorrelated metrics"]
    }
    
    recommendations.extend(domain_recs.get(domain["domain"], ["Standardize data entry to reduce variance", "Explore segment-specific strategies"]))
    
    return recommendations[:5]

def generate_executive_summary(domain, summary, insights):
    """
    Step 6: Executive Summary
    """
    dom = domain["domain"]
    rows = summary["rows"]
    cols = summary["columns"]
    
    text = f"This report provides an automated analysis of a {dom} dataset containing {rows} records across {cols} dimensions. "
    if insights:
        text += f"Key discoveries include {len(insights)} significant patterns, specifically addressing {insights[0]['type']} relationships. "
    text += f"The data indicates high volatility in some segments but overall structural integrity. "
    text += f"Business strategy should focus on the recommended optimizations to maximize operational efficiency."
    
    return text
