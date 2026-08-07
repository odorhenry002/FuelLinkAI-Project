from pydantic import BaseModel, ConfigDict, Field


class AIInsightResponse(BaseModel):
    summary: str = Field(..., min_length=1)
    recommendations: list[str] = Field(default_factory=list)
    risk_level: str = "medium"

    model_config = ConfigDict(from_attributes=True)
