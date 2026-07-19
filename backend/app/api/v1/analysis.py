"""
Analysis API endpoints — separate routes for skill-gap and fit-verdict.
"""

import time
import logging
from typing import Optional

from fastapi import APIRouter, Form, UploadFile, File

from app.schemas.analysis import (
    APIResponse,
    SkillGapResult,
    FitVerdictResult,
)
from app.core.exceptions import ValidationError
from app.services.ai_service import get_ai_service
from app.services.parser_service import extract_text_from_upload, validate_text_input
from app.services.comparison_service import compare_skills
from app.services.verdict_service import get_verdict

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["analysis"])


# ─── Helpers ─────────────────────────────────────────────────────────

async def _resolve_input(
    text: Optional[str],
    file: Optional[UploadFile],
    field_name: str,
) -> str:
    """
    Resolve the text content from either a text field or uploaded file.
    At least one must be provided.
    """
    if file and file.size and file.size > 0:
        file_bytes = await file.read()
        return extract_text_from_upload(
            file_bytes=file_bytes,
            content_type=file.content_type or "application/octet-stream",
            filename=file.filename or "uploaded_file",
        )
    elif text and text.strip():
        return validate_text_input(text, field_name)
    else:
        raise ValidationError(
            f"Please provide either {field_name} text or upload a {field_name} file."
        )


# ─── POST /api/v1/skill-gap ─────────────────────────────────────────

@router.post(
    "/skill-gap",
    response_model=APIResponse[SkillGapResult],
    summary="Skill Gap Analysis",
    description="Compare resume skills against job description requirements.",
)
async def skill_gap_analysis(
    resume_text: Optional[str] = Form(None),
    jd_text: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    jd_file: Optional[UploadFile] = File(None),
) -> APIResponse[SkillGapResult]:
    """
    Assignment 1: Extract skills from resume and JD, compute matched/missing/percentage.
    """
    start = time.time()

    # 1. Resolve inputs
    resume_content = await _resolve_input(resume_text, resume_file, "resume")
    jd_content = await _resolve_input(jd_text, jd_file, "job description")

    # 2. Extract skills via AI
    ai = get_ai_service()
    resume_skills = ai.extract_skills(resume_content, doc_type="resume")
    jd_skills = ai.extract_skills(jd_content, doc_type="job description")

    # 3. Compare
    result = compare_skills(resume_skills, jd_skills)

    elapsed = round((time.time() - start) * 1000)
    logger.info(f"Skill gap analysis completed in {elapsed}ms")

    return APIResponse.ok(
        data=result,
        message=f"Skill gap analysis completed in {elapsed}ms",
    )


# ─── POST /api/v1/fit-verdict ───────────────────────────────────────

@router.post(
    "/fit-verdict",
    response_model=APIResponse[FitVerdictResult],
    summary="Fit Verdict",
    description="Generate a qualification verdict with supporting reasons.",
)
async def fit_verdict(
    resume_text: Optional[str] = Form(None),
    jd_text: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    jd_file: Optional[UploadFile] = File(None),
) -> APIResponse[FitVerdictResult]:
    """
    Assignment 2: Extract skills, compute match, generate verdict + 3 reasons.
    """
    start = time.time()

    # 1. Resolve inputs
    resume_content = await _resolve_input(resume_text, resume_file, "resume")
    jd_content = await _resolve_input(jd_text, jd_file, "job description")

    # 2. Extract skills via AI
    ai = get_ai_service()
    resume_skills = ai.extract_skills(resume_content, doc_type="resume")
    jd_skills = ai.extract_skills(jd_content, doc_type="job description")

    # 3. Compare (reuse comparison service)
    comparison = compare_skills(resume_skills, jd_skills)

    # 4. Generate verdict
    result = get_verdict(
        matched_skills=comparison.matched_skills,
        missing_skills=comparison.missing_skills,
        match_percentage=comparison.match_percentage,
        total_resume_skills=len(resume_skills),
        ai_service=ai,
    )

    elapsed = round((time.time() - start) * 1000)
    logger.info(f"Fit verdict completed in {elapsed}ms")

    return APIResponse.ok(
        data=result,
        message=f"Fit verdict analysis completed in {elapsed}ms",
    )
