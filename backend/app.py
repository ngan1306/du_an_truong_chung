from flask import Flask, jsonify
from flask_cors import CORS
from config import config
from models import (
    db,
    User,
    Department,
    Role,
    Permission,
    Device,
    Task,
    Employee
)
from datetime import datetime
import os


def create_app(config_name=None):
    app = Flask(__name__)

    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app.config.from_object(config[config_name])

    db.init_app(app)
    CORS(app)

    with app.app_context():
        db.create_all()
        init_database()

    # ================= IMPORT BLUEPRINT =================
    from routes import (
        auth_bp,
        users_bp,
        employees_bp,
        devices_bp,
        tasks_bp,
        departments_bp,
        storage_bp,
        roles_bp,
        notifications_bp,
        logs_bp,
        reports_bp,
    )

    # ================= REGISTER =================
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(employees_bp, url_prefix="/api/employees")
    app.register_blueprint(devices_bp, url_prefix="/api/devices")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(departments_bp, url_prefix="/api/departments")
    app.register_blueprint(storage_bp, url_prefix="/api/storage")
    app.register_blueprint(roles_bp, url_prefix="/api/roles")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(logs_bp, url_prefix="/api/logs")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        })

    @app.route("/api/dashboard")
    def dashboard():
        return jsonify({
            "total_users": User.query.count(),
            "total_employees": Employee.query.count(),
            "total_devices": Device.query.count(),
            "total_tasks": Task.query.count(),
            "total_departments": Department.query.count(),
        })

    return app


def init_database():
    """Initialize database with sample data"""

    if User.query.first():
        return

    # ================= ROLE =================
    admin_role = Role(
        role_name="Admin",
        description="Administrator"
    )

    manager_role = Role(
        role_name="Manager",
        description="Manager"
    )

    user_role = Role(
        role_name="User",
        description="Regular User"
    )

    db.session.add_all([
        admin_role,
        manager_role,
        user_role
    ])
    db.session.commit()

    # ================= PERMISSION =================

    permissions = [
        ("view_users", "View Users", "Users"),
        ("create_user", "Create User", "Users"),
        ("edit_user", "Edit User", "Users"),
        ("delete_user", "Delete User", "Users"),
        ("view_devices", "View Devices", "Devices"),
        ("manage_devices", "Manage Devices", "Devices"),
        ("view_tasks", "View Tasks", "Tasks"),
        ("create_task", "Create Task", "Tasks"),
        ("manage_permissions", "Manage Permissions", "Permissions"),
    ]

    for name, desc, module in permissions:
        db.session.add(
            Permission(
                permission_name=name,
                description=desc,
                module=module
            )
        )

    db.session.commit()

    # ================= DEPARTMENT =================

    departments = [
        Department(
            department_name="IT",
            department_code="IT",
            description="Information Technology"
        ),
        Department(
            department_name="HR",
            department_code="HR",
            description="Human Resources"
        ),
        Department(
            department_name="Sales",
            department_code="SALES",
            description="Sales"
        ),
        Department(
            department_name="Operations",
            department_code="OPS",
            description="Operations"
        ),
    ]

    db.session.add_all(departments)
    db.session.commit()

    # ================= ADMIN =================

    admin = User(
        username="admin",
        email="admin@example.com",
        full_name="Administrator",
        role_id=admin_role.id,
        department_id=departments[0].id
    )

    admin.set_password("admin123")

    db.session.add(admin)
    db.session.commit()

    # ================= SAMPLE USER =================

    sample_users = [
        (
            "john_doe",
            "john@example.com",
            "John Doe",
            manager_role.id,
            departments[1].id
        ),
        (
            "jane_smith",
            "jane@example.com",
            "Jane Smith",
            user_role.id,
            departments[2].id
        ),
        (
            "bob_wilson",
            "bob@example.com",
            "Bob Wilson",
            user_role.id,
            departments[0].id
        )
    ]

    for username, email, fullname, role, dept in sample_users:

        user = User(
            username=username,
            email=email,
            full_name=fullname,
            role_id=role,
            department_id=dept
        )

        user.set_password("123456")

        db.session.add(user)

    db.session.commit()


# Export app cho gunicorn (production)
app = create_app()

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )