import asyncio
from prisma import Prisma

async def seed_data():
    """Seed initial data for the jewelry ERP system"""
    db = Prisma()
    await db.connect()
    
    try:
        print("Seeding master data...")
        
        # Seed Karigars
        karigars_data = [
            {"code": "K001", "name": "Ramesh Kumar", "contact": "9876543210"},
            {"code": "K002", "name": "Suresh Patel", "contact": "9876543211"},
            {"code": "K003", "name": "Mahesh Shah", "contact": "9876543212"},
            {"code": "K004", "name": "Dinesh Verma", "contact": "9876543213"},
            {"code": "K005", "name": "Rajesh Gupta", "contact": "9876543214"},
        ]
        
        for karigar_data in karigars_data:
            existing = await db.karigar.find_unique(where={"code": karigar_data["code"]})
            if not existing:
                await db.karigar.create(data=karigar_data)
                print(f"Created karigar: {karigar_data['name']}")
        
        # Seed Processes
        processes_data = [
            {"name": "Casting", "description": "Metal casting and molding process"},
            {"name": "Filing", "description": "Filing and shaping process"},
            {"name": "Polishing", "description": "Surface polishing and finishing"},
            {"name": "Stone Setting", "description": "Setting precious stones and diamonds"},
            {"name": "Wax Model", "description": "Creating wax models for casting"},
            {"name": "Chain Making", "description": "Manufacturing chains and links"},
            {"name": "Engraving", "description": "Engraving and detailed work"},
        ]
        
        for process_data in processes_data:
            existing = await db.process.find_unique(where={"name": process_data["name"]})
            if not existing:
                await db.process.create(data=process_data)
                print(f"Created process: {process_data['name']}")
        
        # Seed Designs
        designs_data = [
            {"code": "D001", "name": "Traditional Ring", "category": "Ring"},
            {"code": "D002", "name": "Modern Pendant", "category": "Pendant"},
            {"code": "D003", "name": "Classic Earrings", "category": "Earrings"},
            {"code": "D004", "name": "Designer Bracelet", "category": "Bracelet"},
            {"code": "D005", "name": "Custom Necklace", "category": "Necklace"},
            {"code": "D006", "name": "Engagement Ring", "category": "Ring"},
            {"code": "D007", "name": "Wedding Band", "category": "Ring"},
            {"code": "D008", "name": "Tennis Bracelet", "category": "Bracelet"},
            {"code": "D009", "name": "Statement Earrings", "category": "Earrings"},
            {"code": "D010", "name": "Charm Bracelet", "category": "Bracelet"},
        ]
        
        for design_data in designs_data:
            existing = await db.design.find_unique(where={"code": design_data["code"]})
            if not existing:
                await db.design.create(data=design_data)
                print(f"Created design: {design_data['name']}")
        
        print("Seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_data())