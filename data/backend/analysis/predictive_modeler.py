from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, f1_score
from sklearn.preprocessing import LabelEncoder
import pandas as pd
import numpy as np

def train_predictive_model(df, schema):
    """
    Perform Stage 10: Predictive Modeling
    """
    if not schema["numeric_columns"]:
        return None
        
    # Pick a target: usually the last numeric column for regression, or last categorical for classification
    target_col = schema["numeric_columns"][-1]
    is_regression = True
    
    # If the last categorical column has few values, maybe it's better?
    # For now, let's stick to simple logic.
    
    # Prepare features: all other numeric columns
    features = [c for c in schema["numeric_columns"] if c != target_col]
    if not features:
        return None
        
    X = df[features].fillna(0)
    y = df[target_col].fillna(0)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    results = {
        "target": target_col,
        "features": features,
        "type": "regression"
    }
    
    try:
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        
        results["performance"] = {
            "mse": float(mean_squared_error(y_test, preds)),
            "r2": float(r2_score(y_test, preds))
        }
        
        # Feature Importance
        importances = model.feature_importances_
        results["feature_importance"] = {f: float(i) for f, i in zip(features, importances)}
        
    except Exception as e:
        results["error"] = str(e)
        
    return results
