import json
import os

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field, ValidationError


load_dotenv()


class SkillExtractionResponse(BaseModel):
    skills: list[str] = Field(default_factory=list)


SKILL_EXTRACTION_PROMPT = """
You are an AI resume skill extraction system for IntelliHire.

Extract only genuine technical, professional, domain, and tool-related
skills explicitly supported by the resume text.

Rules:
- Do not invent skills.
- Do not infer skills that are not supported by the resume.
- Remove duplicate skills.
- Keep recognizable technology and tool names.
- Do not return resume section headings such as "Technical Skills".
- Do not return job titles as skills unless they are clearly a skill.
- Return only the required structured JSON output.
"""


def get_gemini_client():
    """Create the Gemini client from environment configuration."""
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    return genai.Client(api_key=api_key)


def extract_skills_with_gemini(
    resume_text: str,
) -> dict:
    """
    Extract resume skills using Gemini structured output.

    Returns:
        {
            "skills": [...]
        }
    """
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is required.")

    client = get_gemini_client()

    model = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.5-flash-lite",
    )

    response = client.models.generate_content(
        model=model,
        contents=[
            SKILL_EXTRACTION_PROMPT,
            "\n\nResume text:\n",
            resume_text,
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": SkillExtractionResponse,
        },
    )

    raw_output = response.text

    if not raw_output:
        raise ValueError(
            "Gemini returned an empty response."
        )

    try:
        parsed_output = json.loads(raw_output)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Gemini returned invalid JSON."
        ) from exc

    try:
        validated = SkillExtractionResponse.model_validate(
            parsed_output
        )
    except ValidationError as exc:
        raise ValueError(
            f"AI response failed schema validation: {exc}"
        ) from exc

    return validated.model_dump()

class ResumeMatchResponse(BaseModel):
    match_score: int = Field(ge=0, le=100)
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    summary: str


RESUME_MATCH_PROMPT = """
You are an AI candidate-job matching system for IntelliHire.

Compare the candidate resume against the provided job description.

Evaluate:
1. Required technical and professional skills.
2. Candidate skills explicitly supported by the resume.
3. Skills required by the job description but not supported by the resume.
4. Overall suitability of the candidate for the job.

Rules:
- Return only skills that are explicitly supported by the resume.
- Do not invent candidate skills.
- Do not treat a job requirement as a candidate skill unless the resume supports it.
- Remove duplicate skills.
- Keep recognizable technology and tool names.
- match_score must be an integer from 0 to 100.
- matched_skills must contain skills required by the job that are supported by the resume.
- missing_skills must contain important job skills that are not supported by the resume.
- summary must briefly explain the overall match.
- Return only the required structured JSON output.
"""


def match_resume_with_gemini(
    resume_text: str,
    job_description: str,
) -> dict:
    """
    Compare a resume against a job description using Gemini.

    Returns:
        {
            "match_score": 0-100,
            "matched_skills": [...],
            "missing_skills": [...],
            "summary": "..."
        }
    """
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is required.")

    if not job_description or not job_description.strip():
        raise ValueError("Job description is required.")

    client = get_gemini_client()

    model = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.5-flash-lite",
    )

    response = client.models.generate_content(
        model=model,
        contents=[
            RESUME_MATCH_PROMPT,
            "\n\nCandidate resume:\n",
            resume_text,
            "\n\nJob description:\n",
            job_description,
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": ResumeMatchResponse,
        },
    )

    raw_output = response.text

    if not raw_output:
        raise ValueError(
            "Gemini returned an empty response."
        )

    try:
        parsed_output = json.loads(raw_output)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Gemini returned invalid JSON."
        ) from exc

    try:
        validated = ResumeMatchResponse.model_validate(
            parsed_output
        )
    except ValidationError as exc:
        raise ValueError(
            f"AI match response failed schema validation: {exc}"
        ) from exc

    return validated.model_dump()