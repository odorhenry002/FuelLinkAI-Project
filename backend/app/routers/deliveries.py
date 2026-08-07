from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models import get_db
from app.models.delivery import Delivery
from app.models.order import Order
from app.models.user import User
from app.schemas.delivery import DeliveryCreate, DeliveryRead
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Deliveries"])


@router.get("/deliveries", response_model=list[DeliveryRead])
def list_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "transporter":
        return db.query(Delivery).filter(Delivery.transporter_id == current_user.id).all()
    return db.query(Delivery).filter(Delivery.company_id == current_user.company_id).all()


@router.post("/deliveries", response_model=DeliveryRead, status_code=status.HTTP_201_CREATED)
def create_delivery(
    payload: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "transporter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only transporters can create deliveries.",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a transporter company before assigning delivery.",
        )

    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    delivery = Delivery(
        order_id=order.id,
        transporter_id=current_user.id,
        company_id=current_user.company_id,
        vehicle_number=payload.vehicle_number,
        route=payload.route,
        eta=payload.eta,
        notes=payload.notes,
    )
    db.add(delivery)
    order.status = "in_transit"
    db.commit()
    db.refresh(delivery)
    return delivery
