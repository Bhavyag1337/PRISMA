import requests
import json
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:8000"

def seed_data():
    # 1. Prepare sample transactions
    transactions = []
    customers = ["CUST-001", "CUST-002", "CUST-003"]
    products = [
        {"id": "PROD-001", "name": "Organic Coffee", "price": 15.50},
        {"id": "PROD-002", "name": "Artisan Bread", "price": 4.25},
        {"id": "PROD-003", "name": "Almond Milk", "price": 5.99},
        {"id": "PROD-004", "name": "Gourmet Cheese", "price": 12.00},
    ]

    for i in range(20):
        cust = random.choice(customers)
        prod = random.choice(products)
        qty = random.randint(1, 5)
        
        tx = {
            "invoice_id": f"INV-{1000 + i}",
            "product_id": prod["id"],
            "customer_id": cust,
            "timestamp": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
            "product_name": prod["name"],
            "product_quantity": qty,
            "product_unit_price": prod["price"]
        }
        transactions.append(tx)

    # 2. POST to ingest
    print(f"Sending {len(transactions)} transactions to {BASE_URL}/ingest-data...")
    try:
        response = requests.post(f"{BASE_URL}/ingest-data", json=transactions)
        print("Status Code:", response.status_code)
        print("Response:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Error connecting to server. Make sure it is running!")
        print(e)

if __name__ == "__main__":
    seed_data()
