"""
Verdict service — combines deterministic thresholds with AI-generated reasons.
"""

import logging

from app.schemas.analysis import FitVerdictResult, VerdictLabel
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)


def get_deterministic_verdict(percentage: float) -> VerdictLabel:
    """
    Compute a deterministic verdict based on match percentage thresholds.

    Thresholds:
    - ≥ 75% → Qualified
    - 40-74% → Almost There
    - < 40% → Not Yet
    """
    if percentage >= 75:
        return VerdictLabel.QUALIFIED
    elif percentage >= 40:
        return VerdictLabel.ALMOST_THERE
    else:
        return VerdictLabel.NOT_YET


def _generate_fallback_reasons(
    verdict: VerdictLabel,
    matched_skills: list[str],
    missing_skills: list[str],
    percentage: float,
) -> list[str]:
    """Generate deterministic fallback reasons if AI fails."""
    reasons: list[str] = []

    if matched_skills:
        reasons.append(
            f"Demonstrated experience with {', '.join(matched_skills[:4])}"
            + (f" and {len(matched_skills) - 4} more." if len(matched_skills) > 4 else ".")
        )
    else:
        reasons.append("No matching skills were found between the resume and the job requirements.")

    reasons.append(f"Overall skill match is {percentage:.0f}% against the job requirements.")

    if missing_skills:
        reasons.append(
            f"Missing required skills: {', '.join(missing_skills[:4])}"
            + (f" and {len(missing_skills) - 4} more." if len(missing_skills) > 4 else ".")
        )
    else:
        reasons.append("All required skills from the job description are covered.")

    return reasons[:3]


def get_verdict(
    matched_skills: list[str],
    missing_skills: list[str],
    match_percentage: float,
    total_resume_skills: int,
    ai_service: AIService,
) -> FitVerdictResult:
    """
    Generate a verdict using AI with deterministic fallback.

    The AI generates the verdict label and three reasons. If the AI verdict
    contradicts the deterministic band by more than one tier, we log a
    warning and fall back to the deterministic verdict with fallback reasons.
    """
    total_jd_skills = len(matched_skills) + len(missing_skills)
    deterministic = get_deterministic_verdict(match_percentage)

    try:
        ai_result = ai_service.generate_verdict(
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            match_percentage=match_percentage,
            total_jd_skills=total_jd_skills,
            total_resume_skills=total_resume_skills,
        )

        ai_verdict_str = ai_result.get("verdict")
        ai_reasons = ai_result.get("reasons")

        # Validate AI output
        if ai_verdict_str and ai_reasons and len(ai_reasons) == 3:
            try:
                ai_verdict = VerdictLabel(ai_verdict_str)
            except ValueError:
                logger.warning(f"AI returned unknown verdict '{ai_verdict_str}', using deterministic")
                ai_verdict = deterministic
                ai_reasons = _generate_fallback_reasons(
                    deterministic, matched_skills, missing_skills, match_percentage
                )

            # Sanity check: does AI verdict badly contradict deterministic?
            verdict_order = {VerdictLabel.NOT_YET: 0, VerdictLabel.ALMOST_THERE: 1, VerdictLabel.QUALIFIED: 2}
            diff = abs(verdict_order[ai_verdict] - verdict_order[deterministic])
            if diff > 1:
                logger.warning(
                    f"AI verdict '{ai_verdict.value}' contradicts deterministic "
                    f"'{deterministic.value}' (diff={diff}). Falling back to deterministic."
                )
                ai_verdict = deterministic

            return FitVerdictResult(
                verdict=ai_verdict,
                reasons=ai_reasons,
                match_percentage=match_percentage,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
            )
        else:
            logger.warning("AI returned incomplete verdict data, using fallback")
            raise ValueError("Incomplete AI response")

    except Exception as e:
        logger.error(f"Verdict AI call failed: {e}. Using deterministic fallback.")
        fallback_reasons = _generate_fallback_reasons(
            deterministic, matched_skills, missing_skills, match_percentage
        )
        return FitVerdictResult(
            verdict=deterministic,
            reasons=fallback_reasons,
            match_percentage=match_percentage,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
        )
