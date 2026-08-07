from fastapi import APIRouter, Depends
from app.models.user import User
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
def dashboard_overview(current_user: User = Depends(get_current_user)):
    return {
        "message": f"Welcome to your dashboard, {current_user.first_name}!",
        "role": current_user.role,
        "resources": [
            "quotes",
            "orders",
            "deliveries",
        ],
    }


@router.get("/admin")
def admin_dashboard(current_user: User = Depends(require_roles("admin"))):
    return {
        "message": "Admin dashboard access granted.",
        "admin_actions": [
            "manage_users",
            "view_audit_logs",
            "configure_system",
        ],
    }


@router.get("/supplier")
def supplier_dashboard(current_user: User = Depends(require_roles("supplier", "admin"))):
    return {
        "message": "Supplier dashboard access granted.",
        "supplier_actions": [
            "manage_inventory",
            "submit_quotes",
            "track_orders",
        ],
    }


@router.get("/transporter")
def transporter_dashboard(current_user: User = Depends(require_roles("transporter", "admin"))):
    return {
        "message": "Transporter dashboard access granted.",
        "transporter_actions": [
            "view_assignments",
            "update_delivery_status",
            "coordinate_routes",
        ],
    }


@router.get("/buyer")
def buyer_dashboard(current_user: User = Depends(require_roles("buyer", "admin"))):
    return {
        "message": "Buyer dashboard access granted.",
        "buyer_actions": [
            "compare_supplier_quotes",
            "manage_purchase_orders",
            "track_deliveries",
            "forecast_consumption",
        ],
    }
