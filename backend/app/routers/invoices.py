from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models import get_db
from app.models.invoice import Invoice
from app.models.order import Order
from app.models.user import User
from app.schemas.invoice import InvoiceCreate, InvoiceRead
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Invoices"])


@router.get("/invoices", response_model=list[InvoiceRead])
def list_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "supplier":
        return db.query(Invoice).filter(Invoice.supplier_id == current_user.id).all()
    return db.query(Invoice).filter(Invoice.company_id == current_user.company_id).all()


@router.post("/invoices", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a company before issuing invoices.",
        )

    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    if order.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only invoice orders for your own company.",
        )

    invoice = Invoice(
        order_id=order.id,
        buyer_id=order.buyer_id,
        supplier_id=order.supplier_id,
        company_id=current_user.company_id,
        amount=order.total_amount,
        currency=order.currency,
        due_date=payload.due_date,
        notes=payload.notes,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice
