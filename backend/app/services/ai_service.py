"""
AI service — Azure OpenAI integration for skill extraction and verdict generation.
"""

import json
import logging
from typing import Any

from openai import AzureOpenAI

from app.core.config import get_settings
from app.core.exceptions import AIServiceError

logger = logging.getLogger(__name__)

# ─── Prompts ─────────────────────────────────────────────────────────

SKILL_EXTRACTION_PROMPT = """You are an information extraction engine. Extract only concrete technical or professional skills, tools, frameworks, languages, platforms, methodologies, and certifications explicitly stated in the text below.

Rules:
- Only extract skills that are explicitly mentioned, do not infer or assume skills.
- Include programming languages, frameworks, libraries, tools, platforms, cloud services, databases, methodologies, and soft skills if explicitly stated.
- Normalize common abbreviations (e.g., "JS" → "JavaScript", "ML" → "Machine Learning").
- Return each skill as a concise, properly capitalized string.
- Return strictly valid JSON only, no prose, no markdown fences.

Return this exact JSON schema:
{"skills": ["skill1", "skill2", ...]}

Text:
"""

VERDICT_PROMPT = """You are a candidate evaluation assistant. Given the comparison data below, classify this candidate's fit for the role as exactly one of: "Qualified", "Almost There", or "Not Yet".

Guidelines:
- "Qualified" (match ≥ 75%): Strong overall alignment with the job requirements.
- "Almost There" (match 40-74%): Good foundation but missing some key requirements.
- "Not Yet" (match < 40%): Significant gaps in required skills.

Provide exactly three short, specific, and constructive reasons referencing the actual skills. Each reason should be one concise sentence.

Return strictly valid JSON only, no prose, no markdown fences:
{"verdict": "Qualified" | "Almost There" | "Not Yet", "reasons": ["reason1", "reason2", "reason3"]}

Comparison data:
- Match percentage: {percentage}%
- Matched skills: {matched}
- Missing skills: {missing}
- Total JD skills required: {total_jd}
- Total resume skills found: {total_resume}
"""


# ─── Service Class ───────────────────────────────────────────────────

class AIService:
    """Wrapper around Azure OpenAI for skill extraction and verdict generation."""

    def __init__(self):
        settings = get_settings()
        self.client = AzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
        )
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT

    def _call_openai(self, prompt: str, max_retries: int = 2) -> dict[str, Any]:
        """
        Make a chat completion call to Azure OpenAI with JSON mode.
        Retries on JSON parse failure with a stricter instruction.
        """
        last_error: Exception | None = None

        for attempt in range(max_retries):
            try:
                messages = [{"role": "user", "content": prompt}]

                # On retry, add a system message emphasizing JSON
                if attempt > 0:
                    messages.insert(0, {
                        "role": "system",
                        "content": "You MUST respond with valid JSON only. No markdown, no code fences, no explanation."
                    })

                response = self.client.chat.completions.create(
                    model=self.deployment,
                    messages=messages,
                    temperature=0,
                    max_tokens=1024,
                    response_format={"type": "json_object"},
                )

                content = response.choices[0].message.content
                if not content:
                    raise AIServiceError("AI returned an empty response.")

                # Strip any accidental markdown fencing
                content = content.strip()
                if content.startswith("```"):
                    content = content.split("\n", 1)[-1]
                if content.endswith("```"):
                    content = content.rsplit("```", 1)[0]
                content = content.strip()

                parsed = json.loads(content)
                return parsed

            except json.JSONDecodeError as e:
                last_error = e
                logger.warning(f"JSON parse failed on attempt {attempt + 1}: {e}")
                continue
            except AIServiceError:
                raise
            except Exception as e:
                last_error = e
                logger.error(f"OpenAI API call failed on attempt {attempt + 1}: {e}")
                continue

        raise AIServiceError(
            f"AI service failed after {max_retries} attempts. Last error: {str(last_error)}"
        )

    def extract_skills(self, text: str, doc_type: str = "document") -> list[str]:
        """
        Extract skills from a document using Azure OpenAI.

        Args:
            text: The document text to extract skills from.
            doc_type: Either 'resume' or 'job description' (for logging).

        Returns:
            A list of skill strings.
        """
        prompt = SKILL_EXTRACTION_PROMPT + text
        logger.info(f"Extracting skills from {doc_type} ({len(text)} chars)")

        result = self._call_openai(prompt)

        skills = result.get("skills", [])
        if not isinstance(skills, list):
            raise AIServiceError(f"AI returned invalid skills format for {doc_type}.")

        # Ensure all items are strings and non-empty
        skills = [str(s).strip() for s in skills if s and str(s).strip()]
        logger.info(f"Extracted {len(skills)} skills from {doc_type}")
        return skills

    def generate_verdict(
        self,
        matched_skills: list[str],
        missing_skills: list[str],
        match_percentage: float,
        total_jd_skills: int,
        total_resume_skills: int,
    ) -> dict[str, Any]:
        """
        Generate a fit verdict with three supporting reasons.

        Returns:
            Dict with 'verdict' and 'reasons' keys.
        """
        prompt = VERDICT_PROMPT.format(
            percentage=round(match_percentage, 1),
            matched=", ".join(matched_skills) if matched_skills else "None",
            missing=", ".join(missing_skills) if missing_skills else "None",
            total_jd=total_jd_skills,
            total_resume=total_resume_skills,
        )

        logger.info(f"Generating verdict for {match_percentage:.1f}% match")
        result = self._call_openai(prompt)

        # Validate response structure
        verdict = result.get("verdict")
        reasons = result.get("reasons", [])

        valid_verdicts = {"Qualified", "Almost There", "Not Yet"}
        if verdict not in valid_verdicts:
            logger.warning(f"AI returned invalid verdict '{verdict}', falling back to deterministic")
            verdict = None  # Will be handled by verdict_service

        if not isinstance(reasons, list) or len(reasons) != 3:
            logger.warning(f"AI returned {len(reasons) if isinstance(reasons, list) else 'invalid'} reasons")
            reasons = None  # Will be handled by verdict_service

        return {"verdict": verdict, "reasons": reasons}


# ─── Singleton ───────────────────────────────────────────────────────

_ai_service: AIService | None = None


def get_ai_service() -> AIService:
    """Get or create the singleton AI service instance."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
