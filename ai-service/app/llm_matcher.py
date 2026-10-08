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

    matched_skills: list[str] = Field(
        default_factory=list
    )

    missing_skills: list[str] = Field(
        default_factory=list
    )

    required_experience_years: float | None = Field(
        default=None,
        ge=0,
    )

    candidate_experience_years: float | None = Field(
        default=None,
        ge=0,
    )

    experience_match: str = Field(
        default="unknown"
    )

    summary: str


RESUME_MATCH_PROMPT = """
You are the IntelliHire AI candidate-job matching engine.

Your task is to compare a candidate's resume with a job description and
produce a fair, consistent, evidence-based evaluation.

Evaluate the candidate using these factors:

1. Required skills and technologies
2. Candidate skills explicitly supported by the resume
3. Relevant professional/domain skills
4. Relevant experience and responsibilities
5. Required years of experience
6. Candidate's demonstrated years of experience
7. Overall alignment with the job requirements


IMPORTANT MATCHING RULES:


1. Evidence-based evaluation

- Only consider a candidate skill matched when the resume explicitly
  supports that skill.
- Do not invent, assume, or infer unsupported candidate skills.
- Do not consider a skill matched merely because it is related to another
  skill.
- Do not treat a job requirement as evidence that the candidate has that
  skill.


2. Matched skills

- Include important skills from the job description that are explicitly
  supported by the resume.
- Remove duplicate skills.
- Preserve recognizable technology, framework, database, platform, tool,
  domain, and professional skill names.
- Do not include job titles, company names, education degrees, or generic
  resume section headings as skills.


3. Missing skills

- Include important skills explicitly required or strongly preferred by
  the job description that are not supported by the resume.
- Do not list every minor or optional keyword as missing.
- Do not list a skill as missing when the resume clearly demonstrates the
  same skill using an equivalent common name.
- Keep the list focused on meaningful gaps.


4. Required versus optional skills

- Give greater importance to skills explicitly marked as required,
  mandatory, essential, or core.
- Nice-to-have, optional, bonus, or preferred skills should have less
  influence on the overall score.
- A candidate should not receive a very low score solely because of
  missing optional skills.


5. Equivalent skills

- Recognize common equivalent names and abbreviations when their meaning
  is clear.
- For example, "JavaScript" and "JS" can represent the same skill.
- Do not merge unrelated technologies merely because they belong to the
  same category.


6. Experience requirement extraction

Identify the minimum or primary years of experience explicitly stated in
the job description.

Examples:

- "2+ years of experience" -> 2
- "At least 3 years of experience" -> 3
- "Minimum 5 years experience" -> 5
- "3-5 years of experience" -> 3
- "Experience: 2 years" -> 2

If the job description does not clearly specify a required number of years,
return null for required_experience_years.


7. Candidate experience evaluation

Determine the candidate's experience from explicit evidence in the resume.

Use:
- Explicit total years of experience when clearly stated.
- Employment date ranges when available.
- Relevant professional experience supported by the resume.

Do not invent employment dates or experience.

If the resume does not provide enough evidence to determine years of
experience, return null for candidate_experience_years.


8. Experience match

Return exactly one of these values:

- "meets" -> candidate experience meets or exceeds the required experience
- "partial" -> candidate has some relevant experience but is below the
  stated requirement
- "below" -> candidate clearly has substantially less experience than
  required
- "not_required" -> job does not specify an experience requirement
- "unknown" -> experience cannot be reliably determined


9. Match score

- Return an integer from 0 to 100.
- The score should reflect overall job suitability, not simply the number
  of keywords matched.
- Required/core skills should have more influence than optional skills.
- Relevant experience and demonstrated responsibilities should improve
  the score when they directly support the job requirements.
- Required years of experience should affect the score when explicitly
  stated in the job description.
- A candidate who meets the required experience should not be penalized
  for experience.
- A candidate slightly below the required experience should receive a
  moderate reduction rather than an automatic rejection.
- A candidate substantially below a critical experience requirement should
  receive a stronger reduction.
- Missing optional requirements should have only a limited effect.
- Do not give an extremely high score when important required skills or
  experience requirements are missing.
- Do not give an extremely low score when the candidate satisfies most
  important requirements.

Use this general interpretation:

    90-100 = Excellent match
    75-89  = Strong match
    60-74  = Moderate match
    40-59  = Weak match
    0-39   = Poor match


10. Summary

- Write a concise explanation of the candidate's overall suitability.
- Mention major skill strengths.
- Mention important skill gaps when relevant.
- Mention experience alignment when an experience requirement exists.
- Do not claim experience or skills that are not supported by the resume.
- Do not make decisions based on name, gender, age, photo, nationality,
  religion, address, or other personal characteristics.


11. Output

Return only the required structured JSON output.

The final response must contain:

- match_score
- matched_skills
- missing_skills
- required_experience_years
- candidate_experience_years
- experience_match
- summary
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
            "required_experience_years": float | None,
            "candidate_experience_years": float | None,
            "experience_match": "...",
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