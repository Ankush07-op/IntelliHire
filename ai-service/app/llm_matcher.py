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
