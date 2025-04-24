import os
from datetime import datetime
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import logging

logging.basicConfig(level=logging.DEBUG)

class Base:
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    """
    Custom User model with role-based access control.
    Roles: PLATFORM_ADMIN, SUPPORT_STAFF, WAREHOUSE_ADMIN
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='WAREHOUSE_ADMIN')
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    
    warehouses = db.relationship('Warehouse', backref='created_by', lazy=True)
    announcements = db.relationship('Announcement', backref='created_by', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_platform_admin(self):
        return self.role == 'PLATFORM_ADMIN'
    
    def is_support_staff(self):
        return self.role == 'SUPPORT_STAFF'
    
    def is_warehouse_admin(self):
        return self.role == 'WAREHOUSE_ADMIN'

class Warehouse(db.Model):
    """
    Warehouse model with location information.
    """
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    def __repr__(self):
        return f'<Warehouse {self.city}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'city': self.city,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by_id': self.created_by_id,
            'created_by_username': self.created_by.username if self.created_by else None
        }

class Announcement(db.Model):
    """
    Announcement model for system-wide notifications.
    """
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Announcement {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by_id': self.created_by_id,
            'created_by_username': self.created_by.username if self.created_by else None,
            'is_active': self.is_active
        }

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Custom decorators for permission checks
def platform_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_platform_admin():
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not (current_user.is_platform_admin() or 
                current_user.is_support_staff() or 
                current_user.is_warehouse_admin()):
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

# Create database tables
with app.app_context():
    db.create_all()
    
    # Create default admin user if no users exist
    if User.query.count() == 0:
        admin = User(
            username='admin',
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            role='PLATFORM_ADMIN',
            is_active=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Add a support staff user
        support = User(
            username='support',
            email='support@example.com',
            first_name='Support',
            last_name='Staff',
            role='SUPPORT_STAFF',
            is_active=True
        )
        support.set_password('support123')
        db.session.add(support)
        
        # Add a warehouse admin user
        warehouse = User(
            username='warehouse',
            email='warehouse@example.com',
            first_name='Warehouse',
            last_name='Admin',
            role='WAREHOUSE_ADMIN',
            is_active=True
        )
        warehouse.set_password('warehouse123')
        db.session.add(warehouse)
        
        db.session.commit()
        logging.info("Created default users")

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password) and user.is_active:
            login_user(user)
            user.last_login = datetime.now()
            db.session.commit()
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
        flash('Invalid username or password', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    warehouses_count = Warehouse.query.count()
    users_count = User.query.count()
    announcements_count = Announcement.query.count()
    
    recent_announcements = Announcement.query.filter_by(is_active=True).order_by(Announcement.created_at.desc()).limit(5).all()
    
    return render_template('dashboard.html', 
                          warehouses_count=warehouses_count,
                          users_count=users_count,
                          announcements_count=announcements_count,
                          recent_announcements=recent_announcements)

# User management routes
@app.route('/users')
@login_required
@platform_admin_required
def users():
    users_list = User.query.all()
    return render_template('users.html', users=users_list)

@app.route('/users/create', methods=['POST'])
@login_required
@platform_admin_required
def create_user():
    username = request.form.get('username')
    email = request.form.get('email')
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    role = request.form.get('role')
    password = request.form.get('password')
    password2 = request.form.get('password2')
    is_active = 'is_active' in request.form
    
    # Validation
    if User.query.filter_by(username=username).first():
        flash('Username already exists', 'danger')
        return redirect(url_for('users'))
    
    if User.query.filter_by(email=email).first():
        flash('Email already exists', 'danger')
        return redirect(url_for('users'))
        
    if password != password2:
        flash('Passwords do not match', 'danger')
        return redirect(url_for('users'))
    
    # Create user
    user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_active=is_active
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    flash('User created successfully', 'success')
    return redirect(url_for('users'))

@app.route('/users/<int:user_id>/update', methods=['POST'])
@login_required
@platform_admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    
    username = request.form.get('username')
    email = request.form.get('email')
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    role = request.form.get('role')
    password = request.form.get('password')
    is_active = 'is_active' in request.form
    
    # Check if username already exists for a different user
    existing_user = User.query.filter_by(username=username).first()
    if existing_user and existing_user.id != user.id:
        flash('Username already exists', 'danger')
        return redirect(url_for('users'))
    
    # Check if email already exists for a different user
    existing_user = User.query.filter_by(email=email).first()
    if existing_user and existing_user.id != user.id:
        flash('Email already exists', 'danger')
        return redirect(url_for('users'))
    
    # Update user
    user.username = username
    user.email = email
    user.first_name = first_name
    user.last_name = last_name
    user.role = role
    user.is_active = is_active
    
    if password:
        user.set_password(password)
    
    db.session.commit()
    
    flash('User updated successfully', 'success')
    return redirect(url_for('users'))

@app.route('/users/<int:user_id>/delete', methods=['POST'])
@login_required
@platform_admin_required
def delete_user(user_id):
    if user_id == current_user.id:
        flash('You cannot delete your own account', 'danger')
        return redirect(url_for('users'))
    
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    
    flash('User deleted successfully', 'success')
    return redirect(url_for('users'))

# Warehouse management routes
@app.route('/warehouses')
@login_required
@admin_required
def warehouses():
    warehouses_list = Warehouse.query.all()
    return render_template('warehouses.html', warehouses=warehouses_list)

@app.route('/warehouses/create', methods=['POST'])
@login_required
@admin_required
def create_warehouse():
    city = request.form.get('city')
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    
    warehouse = Warehouse(
        city=city,
        latitude=latitude,
        longitude=longitude,
        created_by_id=current_user.id
    )
    db.session.add(warehouse)
    db.session.commit()
    
    flash('Warehouse created successfully', 'success')
    return redirect(url_for('warehouses'))

@app.route('/warehouses/<int:warehouse_id>/update', methods=['POST'])
@login_required
@admin_required
def update_warehouse(warehouse_id):
    warehouse = Warehouse.query.get_or_404(warehouse_id)
    
    warehouse.city = request.form.get('city')
    warehouse.latitude = request.form.get('latitude')
    warehouse.longitude = request.form.get('longitude')
    warehouse.updated_at = datetime.now()
    
    db.session.commit()
    
    flash('Warehouse updated successfully', 'success')
    return redirect(url_for('warehouses'))

@app.route('/warehouses/<int:warehouse_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_warehouse(warehouse_id):
    warehouse = Warehouse.query.get_or_404(warehouse_id)
    db.session.delete(warehouse)
    db.session.commit()
    
    flash('Warehouse deleted successfully', 'success')
    return redirect(url_for('warehouses'))

# Announcement management routes
@app.route('/announcements')
@login_required
@admin_required
def announcements():
    announcements_list = Announcement.query.all()
    return render_template('announcements.html', announcements=announcements_list)

@app.route('/announcements/create', methods=['POST'])
@login_required
@admin_required
def create_announcement():
    title = request.form.get('title')
    content = request.form.get('content')
    is_active = 'is_active' in request.form
    
    announcement = Announcement(
        title=title,
        content=content,
        created_by_id=current_user.id,
        is_active=is_active
    )
    db.session.add(announcement)
    db.session.commit()
    
    flash('Announcement created successfully', 'success')
    return redirect(url_for('announcements'))

@app.route('/announcements/<int:announcement_id>/update', methods=['POST'])
@login_required
@admin_required
def update_announcement(announcement_id):
    announcement = Announcement.query.get_or_404(announcement_id)
    
    announcement.title = request.form.get('title')
    announcement.content = request.form.get('content')
    announcement.is_active = 'is_active' in request.form
    announcement.updated_at = datetime.now()
    
    db.session.commit()
    
    flash('Announcement updated successfully', 'success')
    return redirect(url_for('announcements'))

@app.route('/announcements/<int:announcement_id>/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_announcement(announcement_id):
    announcement = Announcement.query.get_or_404(announcement_id)
    announcement.is_active = not announcement.is_active
    db.session.commit()
    
    status = 'activated' if announcement.is_active else 'deactivated'
    flash(f'Announcement {status} successfully', 'success')
    return redirect(url_for('announcements'))

@app.route('/announcements/<int:announcement_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_announcement(announcement_id):
    announcement = Announcement.query.get_or_404(announcement_id)
    db.session.delete(announcement)
    db.session.commit()
    
    flash('Announcement deleted successfully', 'success')
    return redirect(url_for('announcements'))

# API routes
@app.route('/api/users', methods=['GET'])
@login_required
def get_users():
    if not current_user.is_platform_admin():
        return jsonify({'error': 'Unauthorized'}), 403
    
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'is_active': user.is_active
    } for user in users])

@app.route('/api/warehouses', methods=['GET'])
@login_required
def get_warehouses():
    warehouses = Warehouse.query.all()
    return jsonify([warehouse.to_dict() for warehouse in warehouses])

@app.route('/api/announcements', methods=['GET'])
@login_required
def get_announcements():
    announcements = Announcement.query.all()
    return jsonify([announcement.to_dict() for announcement in announcements])

@app.errorhandler(403)
def forbidden(e):
    return render_template('403.html'), 403

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

# Start the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)