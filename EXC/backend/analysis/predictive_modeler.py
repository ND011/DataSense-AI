from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    mean_squared_error, r2_score, 
    accuracy_score, precision_score, recall_score, f1_score
)
from sklearn.preprocessing import LabelEncoder
import pandas as pd
import numpy as np
import math

def train_predictive_model(df, schema):
    """
    STEP 11 — ML Simulation Layer (13-Step ML Engine Spec)
    
    Automatically detect potential target columns:
        - binary columns → classification target
        - numeric columns → regression target
    
    Train models:
        - Classification: LogisticRegression + RandomForestClassifier
        - Regression: RandomForestRegressor
    
    Evaluate and return best model with full metrics.
    """
    binary_cols = schema.get("binary_columns", [])
    numeric_cols = schema.get("numeric_columns", [])
    id_cols = set(schema.get("identifier_columns", []))
    
    # Filter out identifiers
    numeric_cols = [c for c in numeric_cols if c not in id_cols and c in df.columns]
    binary_cols = [c for c in binary_cols if c not in id_cols and c in df.columns]
    
    if not numeric_cols and not binary_cols:
        return None
    
    # ── Auto-detect target and task type ──
    target_col = None
    is_classification = False
    
    # Priority 1: Binary column → classification
    if binary_cols:
        target_col = binary_cols[-1]  # last binary column as target
        is_classification = True
    else:
        # Priority 2: Last numeric column → regression
        target_col = numeric_cols[-1]
    
    # Prepare features: all other numeric columns (excluding target)
    feature_cols = [c for c in numeric_cols if c != target_col]
    if not feature_cols:
        return None
    
    # Build X and y, dropping rows with NaN
    work_df = df[feature_cols + [target_col]].dropna()
    if len(work_df) < 20:
        return None
        
    X = work_df[feature_cols]
    y = work_df[target_col]
    
    # Encode if needed
    if y.dtype == 'object':
        le = LabelEncoder()
        y = pd.Series(le.fit_transform(y), index=y.index)
        is_classification = True
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    results = {
        "target": target_col,
        "features": feature_cols,
        "type": "classification" if is_classification else "regression",
        "models_compared": []
    }
    
    try:
        if is_classification:
            # ── Classification Path ──
            models = {
                "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
                "RandomForestClassifier": RandomForestClassifier(n_estimators=50, random_state=42)
            }
            
            best_score = -1
            best_name = None
            
            for name, model in models.items():
                try:
                    model.fit(X_train, y_train)
                    preds = model.predict(X_test)
                    
                    acc = float(accuracy_score(y_test, preds))
                    prec = float(precision_score(y_test, preds, average='weighted', zero_division=0))
                    rec = float(recall_score(y_test, preds, average='weighted', zero_division=0))
                    f1 = float(f1_score(y_test, preds, average='weighted', zero_division=0))
                    
                    model_result = {
                        "model": name,
                        "accuracy": round(acc, 4),
                        "precision": round(prec, 4),
                        "recall": round(rec, 4),
                        "f1_score": round(f1, 4)
                    }
                    results["models_compared"].append(model_result)
                    
                    if acc > best_score:
                        best_score = acc
                        best_name = name
                        results["performance"] = model_result
                        
                        # Feature importance (only for RF)
                        if hasattr(model, 'feature_importances_'):
                            results["feature_importance"] = {
                                f: round(float(i), 4) 
                                for f, i in zip(feature_cols, model.feature_importances_)
                            }
                except Exception as e:
                    results["models_compared"].append({"model": name, "error": str(e)})
            
            results["best_model"] = best_name
            # Store r2 as accuracy for backward compatibility with frontend
            if results.get("performance"):
                results["performance"]["r2"] = results["performance"]["accuracy"]
                
        else:
            # ── Regression Path ──
            model = RandomForestRegressor(n_estimators=50, random_state=42)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            
            mse = float(mean_squared_error(y_test, preds))
            rmse = float(math.sqrt(mse))
            r2 = float(r2_score(y_test, preds))
            
            results["performance"] = {
                "mse": round(mse, 4),
                "rmse": round(rmse, 4),
                "r2": round(r2, 4)
            }
            results["best_model"] = "RandomForestRegressor"
            results["models_compared"].append({
                "model": "RandomForestRegressor",
                "mse": round(mse, 4),
                "rmse": round(rmse, 4),
                "r2": round(r2, 4)
            })
            
            # Feature Importance
            results["feature_importance"] = {
                f: round(float(i), 4) 
                for f, i in zip(feature_cols, model.feature_importances_)
            }
            
    except Exception as e:
        results["error"] = str(e)
        
    return results
