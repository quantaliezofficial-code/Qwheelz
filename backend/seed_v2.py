import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.models.core import VehicleListing, User
from app.modules.auth.security import hash_password
from app.config import settings
import uuid
import datetime

async def seed():
    engine = create_async_engine(settings.database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)
    
    async with SessionLocal() as db:
        # Create proper users
        users_data = [
            ("Admin", "admin@quantaliez.com", "+919000000001", "adminpassword123", "admin"),
            ("Test Seller", "seller@quantaliez.com", "+919000000002", "sellerpassword123", "seller"),
            ("Test Buyer", "buyer@quantaliez.com", "+919000000003", "buyerpassword123", "buyer"),
        ]
        
        created_users = {}
        for name, email, phone, pw, role in users_data:
            # Check if user exists
            result = await db.execute(text(f"SELECT id FROM users WHERE email = '{email}'"))
            existing = result.scalar()
            if not existing:
                u_id = uuid.uuid4()
                u = User(id=u_id, name=name, email=email, phone=phone, password_hash=hash_password(pw), role=role, is_verified=True, rating_count=0)
                db.add(u)
                created_users[role] = u_id
            else:
                created_users[role] = existing
                # Update password to be sure it's correct
                await db.execute(text(f"UPDATE users SET password_hash = '{hash_password(pw)}' WHERE id = '{existing}'"))
        
        await db.commit()
        seller_id = created_users["seller"]
        # Clear old listings
        await db.execute(text("DELETE FROM vehicle_images"))
        await db.execute(text("DELETE FROM vehicle_listings"))
        await db.commit()

        CAR_IMAGES = {
            "Tiago": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/2022_Tata_Tiago_XZA%2B_front_20230512.jpg/960px-2022_Tata_Tiago_XZA%2B_front_20230512.jpg",
            "Nexon": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Tata_Nexon_Blue_Dual_Tone.jpg/960px-Tata_Nexon_Blue_Dual_Tone.jpg",
            "Harrier": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Tata_Buzzard_Sport%2C_GIMS_2019%2C_Le_Grand-Saconnex_%28GIMS0651%29.jpg/960px-Tata_Buzzard_Sport%2C_GIMS_2019%2C_Le_Grand-Saconnex_%28GIMS0651%29.jpg",
            "Safari": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Tata_Safari_II_front_-_PSM_2009.jpg/960px-Tata_Safari_II_front_-_PSM_2009.jpg",
            "Baleno": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/2017_Suzuki_Baleno_SZ3_Dualjet_1.2_Front.jpg/960px-2017_Suzuki_Baleno_SZ3_Dualjet_1.2_Front.jpg",
            "WagonR": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/1996_Suzuki_Wagon_R_RX_in_Radiant_Red_Mica%2C_front_left.jpg/960px-1996_Suzuki_Wagon_R_RX_in_Radiant_Red_Mica%2C_front_left.jpg",
            "Swift": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Suzuki_Swift_%282024%29_hybrid_DSC_6076.jpg/960px-Suzuki_Swift_%282024%29_hybrid_DSC_6076.jpg",
            "Brezza": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/2016_Maruti_Suzuki_Vitara_Brezza_ZDi%2B.jpg/960px-2016_Maruti_Suzuki_Vitara_Brezza_ZDi%2B.jpg",
            "Innova Crysta": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Toyota_Innova_Zenix_2.0_V_%28III%29_%E2%80%93_f_22032025.jpg/960px-Toyota_Innova_Zenix_2.0_V_%28III%29_%E2%80%93_f_22032025.jpg",
            "Fortuner": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/2015_Toyota_Fortuner_%28New_Zealand%29.jpg/960px-2015_Toyota_Fortuner_%28New_Zealand%29.jpg",
            "i20": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Hyundai_i20_%28III%2C_Facelift%29_%E2%80%93_f_11102025.jpg/960px-Hyundai_i20_%28III%2C_Facelift%29_%E2%80%93_f_11102025.jpg",
            "Creta": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png/960px-2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png",
            "Kushaq": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/2021_%C5%A0koda_Kushaq_%28India%29_front_view.png/960px-2021_%C5%A0koda_Kushaq_%28India%29_front_view.png",
            "Kwid": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/2023_Renault_Kwid_Iconic_%28Colombia%29_front_view_01.png/960px-2023_Renault_Kwid_Iconic_%28Colombia%29_front_view_01.png",
            "Splendor": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Hero_Honda_Splendor.jpg/960px-Hero_Honda_Splendor.jpg",
            "Scorpio": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Mahindra_Scorpio_GLX_2.6_m-Hawk_2011_%2836756517492%29.jpg/960px-Mahindra_Scorpio_GLX_2.6_m-Hawk_2011_%2836756517492%29.jpg",
            "Bolero": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Mahindra_Bolero_ZLX.jpg/960px-Mahindra_Bolero_ZLX.jpg",
            "Thar": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg/960px-Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg",
        }

        # 15-20 Cars and Bikes Dummy Data
        vehicles = [
            {"brand": "Tata Motors", "model": "Tiago", "body_type": "hatchback", "fuel_type": "petrol", "transmission": "manual", "price": 400000, "km_driven": 25000, "year": 2020, "city": "Lucknow"},
            {"brand": "Tata Motors", "model": "Nexon", "body_type": "suv", "fuel_type": "diesel", "transmission": "automatic", "price": 950000, "km_driven": 18000, "year": 2022, "city": "Kanpur"},
            {"brand": "Tata Motors", "model": "Harrier", "body_type": "suv", "fuel_type": "diesel", "transmission": "manual", "price": 1400000, "km_driven": 32000, "year": 2021, "city": "Delhi"},
            {"brand": "Tata Motors", "model": "Safari", "body_type": "suv", "fuel_type": "diesel", "transmission": "automatic", "price": 1800000, "km_driven": 12000, "year": 2023, "city": "Delhi"},
            
            {"brand": "Maruti Suzuki", "model": "Baleno", "body_type": "hatchback", "fuel_type": "petrol", "transmission": "automatic", "price": 750000, "km_driven": 12000, "year": 2022, "city": "Lucknow"},
            {"brand": "Maruti Suzuki", "model": "WagonR", "body_type": "hatchback", "fuel_type": "cng", "transmission": "manual", "price": 500000, "km_driven": 35000, "year": 2021, "city": "Kanpur"},
            {"brand": "Maruti Suzuki", "model": "Swift", "body_type": "hatchback", "fuel_type": "petrol", "transmission": "manual", "price": 600000, "km_driven": 22000, "year": 2020, "city": "Delhi"},
            {"brand": "Maruti Suzuki", "model": "Brezza", "body_type": "suv", "fuel_type": "petrol", "transmission": "automatic", "price": 1050000, "km_driven": 15000, "year": 2023, "city": "Lucknow"},
            
            {"brand": "Mahindra", "model": "Scorpio", "body_type": "suv", "fuel_type": "diesel", "transmission": "manual", "price": 1200000, "km_driven": 45000, "year": 2019, "city": "Kanpur"},
            {"brand": "Mahindra", "model": "Thar", "body_type": "suv", "fuel_type": "diesel", "transmission": "manual", "price": 1400000, "km_driven": 15000, "year": 2022, "city": "Lucknow"},
            {"brand": "Mahindra", "model": "Bolero", "body_type": "suv", "fuel_type": "diesel", "transmission": "manual", "price": 850000, "km_driven": 55000, "year": 2020, "city": "Kanpur"},
            
            {"brand": "Toyota", "model": "Innova Crysta", "body_type": "muv_mpv", "fuel_type": "diesel", "transmission": "manual", "price": 2100000, "km_driven": 60000, "year": 2019, "city": "Lucknow"},
            {"brand": "Toyota", "model": "Fortuner", "body_type": "suv", "fuel_type": "diesel", "transmission": "automatic", "price": 3200000, "km_driven": 40000, "year": 2021, "city": "Lucknow"},
            
            {"brand": "Hyundai", "model": "i20", "body_type": "hatchback", "fuel_type": "petrol", "transmission": "manual", "price": 700000, "km_driven": 28000, "year": 2021, "city": "Kanpur"},
            {"brand": "Hyundai", "model": "Creta", "body_type": "suv", "fuel_type": "petrol", "transmission": "automatic", "price": 1500000, "km_driven": 35000, "year": 2020, "city": "Lucknow"},
            
            {"brand": "Skoda", "model": "Kushaq", "body_type": "suv", "fuel_type": "petrol", "transmission": "automatic", "price": 1450000, "km_driven": 14000, "year": 2023, "city": "Lucknow"},
            
            {"brand": "Renault", "model": "Kwid", "body_type": "hatchback", "fuel_type": "petrol", "transmission": "manual", "price": 350000, "km_driven": 12000, "year": 2022, "city": "Kanpur"},
            
            {"brand": "Hero", "model": "Splendor", "body_type": "bike", "fuel_type": "petrol", "transmission": "manual", "price": 60000, "km_driven": 15000, "year": 2020, "city": "Lucknow"},
            {"brand": "TVS", "model": "Apache", "body_type": "bike", "fuel_type": "petrol", "transmission": "manual", "price": 110000, "km_driven": 8000, "year": 2022, "city": "Delhi"},
            {"brand": "Yamaha", "model": "R15", "body_type": "bike", "fuel_type": "petrol", "transmission": "manual", "price": 160000, "km_driven": 5000, "year": 2023, "city": "Lucknow"},
        ]
        
        for i, c in enumerate(vehicles):
            slug_base = f"{c['brand'].lower().replace(' ', '-')}-{c['model'].lower().replace(' ', '-')}"
            slug = f"{slug_base}-{i}-{uuid.uuid4().hex[:6]}"
            
            img_url = CAR_IMAGES.get(c["model"], "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600")

            specs = {
                "engine": "1197 cc" if c["fuel_type"] == "petrol" else "1493 cc",
                "power": "82 bhp" if c["body_type"] == "hatchback" else "113 bhp",
                "torque": "114 Nm" if c["body_type"] == "hatchback" else "250 Nm",
                "mileage": "22 kmpl" if c["fuel_type"] == "petrol" else "18 kmpl",
                "drivetrain": "FWD" if c["body_type"] in ["hatchback", "sedan"] else "RWD",
                "ground_clearance": "170 mm" if c["body_type"] == "hatchback" else "200 mm"
            }

            listing = VehicleListing(
                id=uuid.uuid4(),
                seller_id=seller_id,
                title=f"{c['year']} {c['brand']} {c['model']}",
                slug=slug,
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
                status="active",
                specifications=specs
            )
            db.add(listing)
            
            await db.flush() # get listing.id
            await db.execute(text(f"""
                INSERT INTO vehicle_images (id, listing_id, url, is_cover, sort_order)
                VALUES ('{uuid.uuid4()}', '{listing.id}', '{img_url}', TRUE, 1)
            """))
            
        await db.commit()
        print("Seeded successfully!")

asyncio.run(seed())
