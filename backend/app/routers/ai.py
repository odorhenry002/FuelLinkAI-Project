from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.ai import AIInsightResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.get("/insights", response_model=AIInsightResponse)
def get_ai_insights(current_user: User = Depends(get_current_user)):
    return AIInsightResponse(
        summary=(
            f"{current_user.first_name}, your operations are trending steadily. "
            "The strongest opportunity is to reduce pricing volatility, speed up quote turnaround, "
            "and protect delivery performance with more consistent allocation planning."
        ),
        recommendations=[
            "Review supplier price variance across the last 30 days.",
            "Prioritize high-volume RFQs with the most reliable logistics partners.",
            "Flag orders at risk of late delivery for buyer follow-up before expiry.",
            "Use a rolling forecast to rebalance inventory and procurement timing.",
        ],
        risk_level="medium",
    )
