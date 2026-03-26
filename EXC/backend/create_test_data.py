import pandas as pd
import numpy as np

# Create test data
dates = pd.date_range('2024-01-01', periods=100)
sales = np.linspace(100, 500, 100) + np.random.normal(0, 10, 100)
profit = sales * 0.4 + np.random.normal(0, 5, 100)

# Add anomalies to sales
sales[20] = 1000
sales[80] = -200

df = pd.DataFrame({
    'transaction_id': [f'TRX_{i}' for i in range(100)],
    'date': dates,
    'sales': sales,
    'profit': profit,
    'quantity': np.random.randint(1, 10, 100),
    'region': np.random.choice(['North', 'South', 'East', 'West'], 100),
    'category': np.random.choice(['A', 'B', 'C'], 100)
})

df.to_csv('test_data.csv', index=False)
