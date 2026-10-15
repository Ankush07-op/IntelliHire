import json
import os
import re
from typing import Any


def _normalize_skill(skill: str) -> str:
    """Normalize skill name for robust comparison."""
    cleaned = skill.lower().strip()
    cleaned = re.sub(r"[\.\-_/\s]", "", cleaned)
    return cleaned


def _skill_matches_text(skill: str, text: str) -> bool:
    """Check if a skill appears in text using word boundaries or normalized alias matching."""
    norm_skill = _normalize_skill(skill)
    if not norm_skill:
        return False

    # Direct word boundary match
    pattern = rf"(?i)\b{re.escape(skill.strip())}\b"
    if re.search(pattern, text):
        return True

    # Common aliases
    aliases: dict[str, list[str]] = {
        "nodejs": ["node", "node.js", "node js"],
        "node": ["nodejs", "node.js", "node js"],
        "react": ["reactjs", "react.js", "react js"],
        "reactjs": ["react", "react.js", "react js"],
        "vue": ["vuejs", "vue.js", "vue js"],
        "angular": ["angularjs", "angular.js"],
        "express": ["expressjs", "express.js", "express js"],
        "mongodb": ["mongo", "mongo db"],
        "postgres": ["postgresql", "psql"],
        "postgresql": ["postgres", "psql"],
        "aws": ["amazon web services"],
        "gcp": ["google cloud", "google cloud platform"],
        "k8s": ["kubernetes"],
        "kubernetes": ["k8s"],
        "docker": ["containerization", "containers"],
        "ts": ["typescript"],
        "typescript": ["ts"],
        "js": ["javascript"],
        "javascript": ["js"],
        "py": ["python"],
        "golang": ["go"],
        "cpp": ["c++"],
        "csharp": ["c#"],
    }

    check_variants = aliases.get(norm_skill, [])
    for variant in check_variants:
        if re.search(rf"(?i)\b{re.escape(variant)}\b", text):
            return True

    # Normalized text search
    norm_text = re.sub(r"[\.\-_/\s]", "", text.lower())
    if norm_skill in norm_text:
        return True

    return False


def evaluate_skills(candidate_skills: list[str], candidate_text: str, required_skills: list[str]) -> tuple[list[str], list[str]]:
    """Determine matched and missing skills between candidate and required skills."""
    if not required_skills:
        return candidate_skills, []

    full_candidate_context = f"{' '.join(candidate_skills)}\n{candidate_text}"
    matched: list[str] = []
    missing: list[str] = []

    for req in required_skills:
        req_clean = req.strip()
        if not req_clean:
            continue

        if _skill_matches_text(req_clean, full_candidate_context):
            matched.append(req_clean)
        else:
            missing.append(req_clean)

    return matched, missing


def heuristic_evaluate_match(
    resume_text: str,
    structured_resume: dict[str, Any],
    job_description: str,
    required_skills: list[str],
) -> dict[str, Any]:
    """Deterministic heuristic evaluation when OpenAI API key is unavailable."""
    candidate_skills = structured_resume.get("skills", [])
    experience_years = float(structured_resume.get("experience_years", 0.0))

    matched_skills, missing_skills = evaluate_skills(candidate_skills, resume_text, required_skills)

    # 1. Skill Match Score (up to 60 points)
    if required_skills:
        skill_ratio = len(matched_skills) / max(len(required_skills), 1)
        skill_score = skill_ratio * 60.0
    else:
        skill_score = 45.0

    # 2. Text / Keyword Overlap (up to 25 points)
    desc_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", job_description.lower()))
    resume_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", resume_text.lower()))

    # Ignore common stop words
    stopwords = {"and", "the", "for", "with", "that", "this", "from", "have", "will", "our", "team", "work", "role"}
    desc_keywords = desc_words - stopwords

    if desc_keywords:
        common_words = desc_keywords.intersection(resume_words)
        overlap_ratio = min(len(common_words) / max(len(desc_keywords) * 0.3, 1), 1.0)
        keyword_score = overlap_ratio * 25.0
    else:
        keyword_score = 15.0

    # 3. Experience Score (up to 15 points)
    # Give up to 15 points for relevant industry experience
    experience_score = min(experience_years * 3.0, 15.0)

    total_score = int(round(min(max(skill_score + keyword_score + experience_score, 0), 100)))

    # Construct concise candidate evaluation summary
    skills_summary = (
        f"Matches {len(matched_skills)} of {len(required_skills)} required skills ({', '.join(matched_skills[:4])}{'...' if len(matched_skills) > 4 else ''})."
        if required_skills
        else f"Demonstrates skills in {', '.join(candidate_skills[:4])}."
    )

    if missing_skills:
        missing_text = f" Missing requirements: {', '.join(missing_skills[:3])}."
    else:
        missing_text = " Covers all listed mandatory skill prerequisites."

    exp_text = f" Has ~{experience_years:.1f} years of relevant experience." if experience_years > 0 else ""

    summary = f"Candidate profile evaluated. {skills_summary}{missing_text}{exp_text}".strip()

    return {
        "score": total_score,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "experienceYears": round(experience_years, 1),
        "summary": summary,
    }


def analyze_match(
    parsed_resume: dict[str, Any],
    job_description: str,
    required_skills: list[str],
) -> dict[str, Any]:
    """
    Evaluate candidate resume against job description using OpenAI if configured,
    or smart heuristic evaluation as a reliable zero-downtime fallback.
    """
    resume_text = parsed_resume.get("raw_text", "")
    structured_resume = parsed_resume.get("structured", {})
    candidate_skills = structured_resume.get("skills", [])
    extracted_experience = float(structured_resume.get("experience_years", 0.0))

    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    # If OpenAI API key is configured, perform LLM semantic analysis
    if api_key:
        try:
            from openai import OpenAI

            client = OpenAI(api_key=api_key)

            system_prompt = (
                "You are an expert ATS (Applicant Tracking System) recruiter. "
                "Analyze the candidate's resume against the target job requirements. "
                "Respond ONLY with a valid JSON object with the following keys:\n"
                "- score: integer from 0 to 100 representing overall suitability and semantic match\n"
                "- matchedSkills: list of strings from required skills that the candidate has\n"
                "- missingSkills: list of strings from required skills that the candidate lacks\n"
                "- experienceYears: number representing years of relevant professional experience\n"
                "- summary: 2 to 3 sentences summarizing the candidate's strengths, gaps, and recommendation."
            )

            user_prompt = (
                f"JOB DESCRIPTION:\n{job_description[:3000]}\n\n"
                f"REQUIRED SKILLS:\n{json.dumps(required_skills)}\n\n"
                f"CANDIDATE DETECTED SKILLS:\n{json.dumps(candidate_skills)}\n\n"
                f"CANDIDATE DETECTED EXPERIENCE YEARS:\n{extracted_experience}\n\n"
                f"RESUME TEXT:\n{resume_text[:4000]}"
            )

            response = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )

            raw_content = response.choices[0].message.content or "{}"
            parsed_json = json.loads(raw_content)

            score = int(parsed_json.get("score", 0))
            matched_skills = list(parsed_json.get("matchedSkills", []))
            missing_skills = list(parsed_json.get("missingSkills", []))
            exp_years = float(parsed_json.get("experienceYears", extracted_experience))
            summary = str(parsed_json.get("summary", "")).strip()

            return {
                "score": max(0, min(100, score)),
                "matchedSkills": matched_skills,
                "missingSkills": missing_skills,
                "experienceYears": round(exp_years, 1),
                "summary": summary,
            }
        except Exception as exc:
            # Fall back to heuristic matching gracefully if LLM call fails
            print(f"[LLM Matcher Warning] OpenAI evaluation failed ({exc}), using heuristic fallback.")

    return heuristic_evaluate_match(
        resume_text=resume_text,
        structured_resume=structured_resume,
        job_description=job_description,
        required_skills=required_skills,
    )

import json
import os
import re

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
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    return genai.Client(api_key=api_key)


def extract_skills_with_gemini(resume_text: str) -> dict:
    """
    Extract resume skills using Gemini structured output.

    Returns:
        {"skills": [...]}
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
        raise ValueError("Gemini returned an empty response.")

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


# Normalize common aliases without merging unrelated technologies.
SKILL_ALIASES = {
    "js": "javascript",
    "javascript": "javascript",
    "react": "react.js",
    "react.js": "react.js",
    "node": "node.js",
    "node.js": "node.js",
    "express": "express.js",
    "express.js": "express.js",
    "mongo db": "mongodb",
    "mongodb": "mongodb",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "html5": "html",
    "html": "html",
    "css3": "css",
    "css": "css",
    "excel": "microsoft excel",
    "microsoft excel": "microsoft excel",
}



def normalize_skill(skill: str) -> str:
    """Normalize aliases while preserving original display capitalization."""
    cleaned = re.sub(r"\s+", " ", skill.strip())
    lookup_key = cleaned.lower()

    return SKILL_ALIASES.get(lookup_key, cleaned)



def normalize_skill_list(skills: list[str]) -> list[str]:
    """Normalize skill names and remove duplicates while preserving order."""
    normalized = []
    seen = set()

    for skill in skills:
        if not isinstance(skill, str):
            continue

        value = normalize_skill(skill)

        if value and value not in seen:
            normalized.append(value)
            seen.add(value)

    return normalized


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

    Returns a validated matching result with normalized skill names.
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
        raise ValueError("Gemini returned an empty response.")

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

    result = validated.model_dump()

    result["matched_skills"] = normalize_skill_list(
        result["matched_skills"]
    )
    result["missing_skills"] = normalize_skill_list(
        result["missing_skills"]
    )

    matched = set(result["matched_skills"])

    result["missing_skills"] = [
        skill
        for skill in result["missing_skills"]
        if skill not in matched
    ]

    return result

