import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Set the Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "warehouse_admin.settings")

# Import and create the WSGI application
from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()

# This file is used by gunicorn to run the application
if __name__ == "__main__":
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)