from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyRead
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/companies", tags=["Companies"])


@router.get("", response_model=list[CompanyRead])
def list_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Company).all()


@router.post("", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def create_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Company).filter(Company.name == payload.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A company with this name already exists.",
        )

    company = Company(**payload.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)

    if current_user.company_id is None:
        current_user.company_id = company.id
        db.add(current_user)
        db.commit()
        db.refresh(current_user)

    return company
