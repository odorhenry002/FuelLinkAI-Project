from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models import get_db
from app.models.order import Order
from app.models.quote import Quote
from app.models.rfq import RFQ
from app.models.user import User
from app.schemas.order import OrderCreate, OrderRead
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Orders"])


@router.get("/orders", response_model=list[OrderRead])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "supplier":
        return db.query(Order).filter(Order.supplier_id == current_user.id).all()
    return db.query(Order).filter(Order.company_id == current_user.company_id).all()


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a company before creating an order.",
        )

    rfq = db.query(RFQ).filter(RFQ.id == payload.rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found.")

    if rfq.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create orders for your company's RFQs.",
        )

    quote = db.query(Quote).filter(Quote.id == payload.quote_id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found.")

    if quote.rfq_id != rfq.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The selected quote does not match the RFQ.",
        )

    order = Order(
        rfq_id=rfq.id,
        quote_id=quote.id,
        buyer_id=current_user.id,
        supplier_id=quote.supplier_id,
        company_id=current_user.company_id,
        delivery_location=payload.delivery_location,
        total_amount=quote.total_amount,
        currency=quote.currency,
        notes=payload.notes,
    )
    db.add(order)

    rfq.status = "awarded"
    quote.status = "accepted"
    db.commit()
    db.refresh(order)
    return order
