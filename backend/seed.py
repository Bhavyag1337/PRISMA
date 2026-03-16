from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from datetime import datetime, timedelta, date
import random

def create_seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    # Create Products
    products = [
        models.Product(name="Smartphone X", category="Electronics", price=899.99, stock=50),
        models.Product(name="Wireless Earbuds", category="Electronics", price=129.99, stock=100),
        models.Product(name="Organic Coffee Beans", category="Groceries", price=15.99, stock=5, expiry_date=date.today() + timedelta(days=90)),
        models.Product(name="Artisan Bread", category="Groceries", price=4.99, stock=15, expiry_date=date.today() + timedelta(days=3)),
        models.Product(name="Organic Butter", category="Groceries", price=3.99, stock=8, expiry_date=date.today() + timedelta(days=14)),
        models.Product(name="Denim Jacket", category="Clothing", price=59.99, stock=0),
        models.Product(name="Running Shoes", category="Clothing", price=89.99, stock=20),
        models.Product(name="Smart Watch", category="Electronics", price=199.99, stock=30),
        models.Product(name="Umbrella", category="Accessories", price=19.99, stock=40),
        models.Product(name="Raincoat", category="Clothing", price=49.99, stock=25),
    ]
    
    db.add_all(products)
    db.commit()

    db_products = db.query(models.Product).all()

    # Create Customers
    customers = [
        models.Customer(name="Alice Smith", age=28),
        models.Customer(name="Bob Johnson", age=35),
        models.Customer(name="Charlie Davis", age=42),
        models.Customer(name="Diana Prince", age=30),
    ]

    db.add_all(customers)
    db.commit()

    db_customers = db.query(models.Customer).all()

    # Create Orders and Order Items (simulate last 6 months)
    for _ in range(50): # 50 random orders
        customer = random.choice(db_customers)
        # Random date in last 180 days
        days_ago = random.randint(0, 180)
        order_date = datetime.now() - timedelta(days=days_ago)
        
        order = models.Order(customer_id=customer.customer_id, date=order_date)
        db.add(order)
        db.commit()
        db.refresh(order)

        # 1 to 4 items per order
        num_items = random.randint(1, 4)
        selected_products = random.sample(db_products, num_items)
        
        # Collaborative filtering mock test:
        # Heavily correlate Umbrella and Raincoat
        if random.random() > 0.7:
            umbrella = next((p for p in db_products if p.name == "Umbrella"), None)
            raincoat = next((p for p in db_products if p.name == "Raincoat"), None)
            if umbrella and raincoat and umbrella not in selected_products:
                selected_products.append(umbrella)
                selected_products.append(raincoat)
                
        # Correlate Bread and Butter
        if random.random() > 0.7:
             bread = next((p for p in db_products if p.name == "Artisan Bread"), None)
             butter = next((p for p in db_products if p.name == "Organic Butter"), None)
             if bread and butter and bread not in selected_products:
                selected_products.append(bread)
                selected_products.append(butter)

        # deduplicate
        selected_products = list(set(selected_products))

        for product in selected_products:
            quantity = random.randint(1, 3)
            order_item = models.OrderItem(order_id=order.order_id, product_id=product.product_id, quantity=quantity)
            db.add(order_item)
            
    db.commit()
    print("Database seeded completely!")

if __name__ == "__main__":
    create_seed_data()
