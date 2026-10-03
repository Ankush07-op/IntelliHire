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