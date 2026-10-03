import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.models.core import VehicleListing, User, VehicleImage
import uuid

async def seed():
    engine = create_async_engine("postgresql+asyncpg://postgres:postgres@localhost:5432/quantaliez_auto")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)
    
    async with SessionLocal() as db:
        # Clear existing data safely
        await db.execute(text("TRUNCATE TABLE vehicle_images, vehicle_listings, users CASCADE"))
        await db.commit()

        # Create a user
        u_id = uuid.uuid4()
        u = User(id=u_id, name="Admin Showroom", email="admin@luxura.com", phone="9999999999", password_hash="test", role="admin", is_verified=True, rating_count=10, avg_rating=4.8)
        db.add(u)
        await db.commit()
        
        cars = [
            {"brand": "Tata Motors", "model": "Tiago", "body_type": "hatchback", "fuel_type": "petrol", "transmission": "manual", "price": 400000, "km_driven": 25000, "year": 2020, "city": "Mumbai", "img": "/cars/tiago.jpg", "desc": "Well maintained Tata Tiago. Single owner, perfectly working AC."},
            {"brand": "Maruti Suzuki", "model": "Baleno", "body_type": "hatchback", "fuel_type": "petrol", "transmission": "automatic", "price": 750000, "km_driven": 12000, "year": 2022, "city": "Delhi", "img": "/cars/baleno.jpg", "desc": "Top model Baleno with alloy wheels and automatic transmission. Zero dep insurance valid."},
            {"brand": "Maruti Suzuki", "model": "WagonR", "body_type": "hatchback", "fuel_type": "cng", "transmission": "manual", "price": 500000, "km_driven": 35000, "year": 2021, "city": "Bangalore", "img": "/cars/wagonr.jpg", "desc": "Company fitted CNG WagonR. High mileage, very economical."},
            {"brand": "Audi", "model": "A4", "body_type": "sedan", "fuel_type": "petrol", "transmission": "automatic", "price": 3500000, "km_driven": 22000, "year": 2021, "city": "Mumbai", "img": "/cars/audi.png", "desc": "Premium luxury sedan. Impeccable condition. VIP number."},
            {"brand": "Lexus", "model": "RX", "body_type": "suv", "fuel_type": "hybrid", "transmission": "automatic", "price": 6500000, "km_driven": 18000, "year": 2022, "city": "Chennai", "img": "/cars/lexus.png", "desc": "Hybrid SUV. Extremely quiet and comfortable. Fully loaded."},
            {"brand": "Ford", "model": "Mustang", "body_type": "coupe", "fuel_type": "petrol", "transmission": "automatic", "price": 7500000, "km_driven": 15000, "year": 2019, "city": "Delhi", "img": "/cars/mustang.png", "desc": "Iconic muscle car. V8 Engine. Red interior."},
            {"brand": "Porsche", "model": "911", "body_type": "coupe", "fuel_type": "petrol", "transmission": "automatic", "price": 15000000, "km_driven": 8000, "year": 2022, "city": "Hyderabad", "img": "/cars/porsche.png", "desc": "Legendary sports car. Rarely driven, track ready."},
            {"brand": "TVS", "model": "Apache", "body_type": "other", "fuel_type": "petrol", "transmission": "manual", "price": 120000, "km_driven": 15000, "year": 2021, "city": "Pune", "img": "/cars/apache.jpg", "desc": "Performance bike in great condition."},
            {"brand": "Hero", "model": "Splendor", "body_type": "other", "fuel_type": "petrol", "transmission": "manual", "price": 60000, "km_driven": 20000, "year": 2020, "city": "Ahmedabad", "img": "/cars/splendor.jpg", "desc": "Most reliable commuter bike. Great mileage."},
            {"brand": "Yamaha", "model": "R15", "body_type": "other", "fuel_type": "petrol", "transmission": "manual", "price": 150000, "km_driven": 12000, "year": 2021, "city": "Kolkata", "img": "/cars/yamaha.jpg", "desc": "Sports bike with aerodynamic design."}
        ]
        
        for i, c in enumerate(cars):
            l_id = uuid.uuid4()
            listing = VehicleListing(
                id=l_id,
                seller_id=u_id,
                title=f"{c['year']} {c['brand']} {c['model']}",
                slug=f"{c['brand'].lower().replace(' ', '-')}-{c['model'].lower()}-{i}",
                brand=c['brand'],
                model=c['model'],
                variant="Standard",
                year=c['year'],
                km_driven=c['km_driven'],
                fuel_type=c['fuel_type'],
                transmission=c['transmission'],
                body_type=c['body_type'],
                owner_count=1,
                price=c['price'],
                city=c['city'],
                description=c['desc'],
                status="active"
            )
            db.add(listing)
            
            img = VehicleImage(
                id=uuid.uuid4(),
                listing_id=l_id,
                url=c['img'],
                is_cover=True,
                sort_order=0
            )
            db.add(img)
            
        await db.commit()
        print("Seeded successfully with images and descriptions!")

asyncio.run(seed())
