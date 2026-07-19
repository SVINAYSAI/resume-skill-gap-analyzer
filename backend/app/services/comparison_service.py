"""
Comparison service — deterministic skill matching with normalization.
"""

import re
import logging

from app.schemas.analysis import SkillGapResult

logger = logging.getLogger(__name__)

# ─── Skill Aliases ───────────────────────────────────────────────────
# Maps common abbreviations/variants to a canonical form.

SKILL_ALIASES: dict[str, str] = {
    "js": "javascript",
    "javascript es6": "javascript",
    "es6": "javascript",
    "ts": "typescript",
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",
    "nextjs": "next.js",
    "next js": "next.js",
    "vuejs": "vue",
    "vue.js": "vue",
    "vue js": "vue",
    "angularjs": "angular",
    "angular.js": "angular",
    "node": "node.js",
    "nodejs": "node.js",
    "node js": "node.js",
    "expressjs": "express",
    "express.js": "express",
    "postgres": "postgresql",
    "mongo": "mongodb",
    "k8s": "kubernetes",
    "tf": "terraform",
    "gcp": "google cloud",
    "google cloud platform": "google cloud",
    "amazon web services": "aws",
    "ci/cd": "ci cd",
    "cicd": "ci cd",
    "ml": "machine learning",
    "dl": "deep learning",
    "ai": "artificial intelligence",
    "graphql api": "graphql",
    "rest api": "rest",
    "restful api": "rest",
    "restful": "rest",
    "css3": "css",
    "html5": "html",
    "py": "python",
    "rb": "ruby",
    "c#": "csharp",
    "c sharp": "csharp",
    ".net core": ".net",
    "dotnet": ".net",
}


def normalize_skill(skill: str) -> str:
    """
    Normalize a skill string for comparison.

    Steps:
    1. Lowercase
    2. Strip extra whitespace and punctuation edges
    3. Look up in alias map
    """
    normalized = skill.lower().strip()
    # Remove leading/trailing punctuation except dots and hashes (for .NET, C#)
    normalized = re.sub(r"^[^\w.#]+|[^\w.#]+$", "", normalized)
    # Collapse internal whitespace
    normalized = re.sub(r"\s+", " ", normalized)
    # Apply alias mapping
    return SKILL_ALIASES.get(normalized, normalized)


def compare_skills(resume_skills: list[str], jd_skills: list[str]) -> SkillGapResult:
    """
    Compare resume skills against JD skills after normalization.

    Returns a SkillGapResult with matched, missing, and percentage.
    """
    # Normalize all skills
    resume_normalized = {normalize_skill(s): s for s in resume_skills}
    jd_normalized = {normalize_skill(s): s for s in jd_skills}

    resume_set = set(resume_normalized.keys())
    jd_set = set(jd_normalized.keys())

    # Set operations
    matched_keys = resume_set & jd_set
    missing_keys = jd_set - resume_set

    # Use the original (un-normalized) names from JD for display
    matched_display = sorted([jd_normalized[k] for k in matched_keys], key=str.lower)
    missing_display = sorted([jd_normalized[k] for k in missing_keys], key=str.lower)

    # Calculate percentage — ratio of JD skills that are matched
    if len(jd_set) == 0:
        percentage = 100.0  # If JD has no skills, trivially 100%
    else:
        percentage = round((len(matched_keys) / len(jd_set)) * 100, 1)

    logger.info(
        f"Comparison: {len(matched_keys)}/{len(jd_set)} matched "
        f"({percentage}%), {len(missing_keys)} missing"
    )

    return SkillGapResult(
        resume_skills=resume_skills,
        jd_skills=jd_skills,
        matched_skills=matched_display,
        missing_skills=missing_display,
        match_percentage=percentage,
    )
