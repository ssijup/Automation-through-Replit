import os
import sys
import django

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Set the Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "warehouse_admin.settings")
django.setup()

# Now we can import Django models
from api.models import User, Warehouse, Announcement

def create_superuser():
    if not User.objects.filter(username="admin").exists():
        user = User.objects.create(
            username="admin",
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            role=User.Role.PLATFORM_ADMIN,
            is_staff=True,
            is_superuser=True
        )
        user.set_password("admin123")
        user.save()
        print("Superuser 'admin' created")
    else:
        print("Superuser 'admin' already exists")

def create_test_users():
    # Create a support staff user
    if not User.objects.filter(username="support").exists():
        user = User.objects.create(
            username="support",
            email="support@example.com",
            first_name="Support",
            last_name="Staff",
            role=User.Role.SUPPORT_STAFF
        )
        user.set_password("support123")
        user.save()
        print("Support user 'support' created")
    else:
        print("Support user 'support' already exists")
        
    # Create a warehouse admin user
    if not User.objects.filter(username="warehouse").exists():
        user = User.objects.create(
            username="warehouse",
            email="warehouse@example.com",
            first_name="Warehouse",
            last_name="Admin",
            role=User.Role.WAREHOUSE_ADMIN
        )
        user.set_password("warehouse123")
        user.save()
        print("Warehouse user 'warehouse' created")
    else:
        print("Warehouse user 'warehouse' already exists")

def create_sample_warehouses():
    # Create some warehouses if none exist
    if Warehouse.objects.count() == 0:
        admin_user = User.objects.get(username="admin")
        
        Warehouse.objects.create(
            city="New York",
            latitude=40.7128,
            longitude=-74.0060,
            created_by=admin_user
        )
        
        Warehouse.objects.create(
            city="Los Angeles",
            latitude=34.0522,
            longitude=-118.2437,
            created_by=admin_user
        )
        
        Warehouse.objects.create(
            city="Chicago",
            latitude=41.8781,
            longitude=-87.6298,
            created_by=admin_user
        )
        
        print("Sample warehouses created")
    else:
        print("Warehouses already exist, skipping creation")

def create_sample_announcements():
    # Create some announcements if none exist
    if Announcement.objects.count() == 0:
        admin_user = User.objects.get(username="admin")
        
        Announcement.objects.create(
            title="Welcome to the Warehouse Admin System",
            content="This is the new warehouse management system. We hope you find it useful!",
            created_by=admin_user,
            is_active=True
        )
        
        Announcement.objects.create(
            title="System Maintenance",
            content="The system will be undergoing maintenance this weekend. Please save your work.",
            created_by=admin_user,
            is_active=True
        )
        
        print("Sample announcements created")
    else:
        print("Announcements already exist, skipping creation")

if __name__ == "__main__":
    print("Initializing database with sample data...")
    create_superuser()
    create_test_users()
    create_sample_warehouses()
    create_sample_announcements()
    print("Database initialization complete!")