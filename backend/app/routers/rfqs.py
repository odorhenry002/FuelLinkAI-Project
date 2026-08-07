from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models import get_db
from app.models.quote import Quote
from app.models.rfq import RFQ
from app.models.user import User
from app.schemas.rfq import QuoteCreate, QuoteRead, RFQCreate, RFQRead
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Procurement"])


@router.get("/rfqs", response_model=list[RFQRead])
def list_rfqs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(RFQ).filter(RFQ.company_id == current_user.company_id).all()


@router.post("/rfqs", response_model=RFQRead, status_code=status.HTTP_201_CREATED)
def create_rfq(
    payload: RFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a company before creating an RFQ.",
        )

    rfq = RFQ(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        quantity=payload.quantity,
        unit=payload.unit,
        delivery_location=payload.delivery_location,
        currency=payload.currency,
        buyer_id=current_user.id,
        company_id=current_user.company_id,
    )
    db.add(rfq)
    db.commit()
    db.refresh(rfq)
    return rfq


@router.post("/rfqs/{rfq_id}/quotes", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
def create_quote(
    rfq_id: int,
    payload: QuoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a company before submitting a quote.",
        )

    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found.")

    quote = Quote(
        rfq_id=rfq.id,
        supplier_id=current_user.id,
        company_id=current_user.company_id,
        price_per_unit=payload.price_per_unit,
        total_amount=payload.total_amount,
        currency=payload.currency,
        notes=payload.notes,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote
