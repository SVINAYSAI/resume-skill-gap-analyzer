"""
Pydantic models for API request/response schemas.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field


# ─── Enums ───────────────────────────────────────────────────────────

class VerdictLabel(str, Enum):
    QUALIFIED = "Qualified"
    ALMOST_THERE = "Almost There"
    NOT_YET = "Not Yet"


# ─── Skill Gap (Assignment 1) ───────────────────────────────────────

class SkillGapResult(BaseModel):
    """Response payload for the skill-gap endpoint."""

    resume_skills: list[str] = Field(description="All skills extracted from the resume")
    jd_skills: list[str] = Field(description="All skills extracted from the job description")
    matched_skills: list[str] = Field(description="Skills present in both resume and JD")
    missing_skills: list[str] = Field(description="JD skills absent from the resume")
    match_percentage: float = Field(description="Percentage of JD skills matched", ge=0, le=100)


# ─── Fit Verdict (Assignment 2) ─────────────────────────────────────

class FitVerdictResult(BaseModel):
    """Response payload for the fit-verdict endpoint."""

    verdict: VerdictLabel
    reasons: list[str] = Field(min_length=3, max_length=3, description="Exactly three supporting reasons")
    match_percentage: float = Field(description="Percentage of JD skills matched", ge=0, le=100)
    matched_skills: list[str] = Field(description="Skills present in both resume and JD")
    missing_skills: list[str] = Field(description="JD skills absent from the resume")


# ─── Generic API Envelope ───────────────────────────────────────────

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper used by all endpoints."""

    success: bool = True
    message: str = "Request completed successfully"
    data: T | None = None
    errors: list[str] = Field(default_factory=list)

    @classmethod
    def ok(cls, data: T, message: str = "Request completed successfully") -> "APIResponse[T]":
        return cls(success=True, message=message, data=data)

    @classmethod
    def fail(cls, message: str, errors: list[str] | None = None) -> "APIResponse[Any]":
        return cls(success=False, message=message, data=None, errors=errors or [message])
