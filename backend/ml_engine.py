import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import random

def predict_demand(product_id: int, orders_data: list):
    # Mocking simple linear regression for demand prediction based on historical order data
    if not orders_data:
        return {"predicted_demand_next_month": random.randint(10, 50)}

    # Process data into pandas dataframe
    # Expected orders_data: [{"date": date_obj, "quantity": int}]
    df = pd.DataFrame(orders_data)
    df["date"] = pd.to_datetime(df["date"])
    
    # Aggregate by month
    df['month'] = df['date'].dt.to_period('M')
    monthly_sales = df.groupby('month')['quantity'].sum().reset_index()
    monthly_sales['month_num'] = range(len(monthly_sales))

    if len(monthly_sales) < 3:
        # Not enough data for a real model, use simple average or random fallback
        avg = int(monthly_sales['quantity'].mean()) if len(monthly_sales) > 0 else random.randint(10, 50)
        return {"predicted_demand_next_month": avg, "confidence": "low (insufficient data)"}
    
    X = monthly_sales[['month_num']].values
    y = monthly_sales['quantity'].values

    model = LinearRegression()
    model.fit(X, y)

    # Predict for next month
    next_month = np.array([[len(monthly_sales)]])
    prediction = model.predict(next_month)
    
    return {
        "predicted_demand_next_month": max(0, int(prediction[0])),
        "confidence": "high"
    }

def get_recommendations(product_id: int, all_order_items: list):
    """
    Very basic collaborative filtering (item-to-item based on co-occurrence in orders)
    all_order_items: mapping of order_id to list of product_ids in that order.
    """
    co_occurrences = {}
    
    for order_id, item_list in all_order_items.items():
        if product_id in item_list:
            for item in item_list:
                if item != product_id:
                    co_occurrences[item] = co_occurrences.get(item, 0) + 1
                    
    if not co_occurrences:
        # Fallback recommendations
        return {"recommended_product_ids": []}

    # Sort by highest co-occurrence
    sorted_recs = sorted(co_occurrences.items(), key=lambda x: x[1], reverse=True)
    top_recs = [item_id for item_id, count in sorted_recs[:3]]
    
    return {"recommended_product_ids": top_recs}
