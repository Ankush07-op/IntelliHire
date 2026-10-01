import re
from pathlib import Path

from pypdf import PdfReader
import mammoth


SECTION_ALIASES = {
    "skills": [
        "skills",
        "technical skills",
        "core skills",
        "key skills",
        "skills & technologies",
        "technical expertise",
        "technologies",
    ],
    "education": [
        "education",
        "academic background",
        "academic qualifications",
        "qualifications",
        "educational background",
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "work history",
        "career history",
    ],
}


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF resume."""
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text)

    return "\n".join(pages)


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX resume."""
    with open(file_path, "rb") as docx_file:
        result = mammoth.extract_raw_text(docx_file)

    return result.value


def clean_text(text: str) -> str:
    """Normalize extracted resume text."""
    text = text.replace("\x00", " ")

    text = text.replace("\r\n", "\n").replace("\r", "\n")

    text = re.sub(r"[ \t]+", " ", text)

    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def extract_resume_text(file_path: str) -> str:
    """Extract and clean text from a PDF or DOCX resume."""
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Resume not found: {file_path}")

    extension = path.suffix.lower()

    if extension == ".pdf":
        text = extract_text_from_pdf(file_path)

    elif extension == ".docx":
        text = extract_text_from_docx(file_path)

    else:
        raise ValueError(
            "Unsupported resume format. Only PDF and DOCX are supported."
        )

    cleaned = clean_text(text)

    if not cleaned:
        raise ValueError("No readable text was found in the resume.")

    return cleaned


def normalize_heading(text: str) -> str:
    """Normalize a possible resume section heading."""
    text = text.strip().lower()

    text = re.sub(r"[:\-–—]+$", "", text)

    text = re.sub(r"\s+", " ", text)

    return text


def detect_section_heading(line: str) -> str | None:
    """Return the section name if the line matches a known heading."""
    normalized = normalize_heading(line)

    for section, aliases in SECTION_ALIASES.items():
        if normalized in aliases:
            return section

    return None

def extract_skills(skills_text: str) -> list[str]:
    """Extract and normalize individual skills from the skills section."""
    if not skills_text:
        return []

    # Replace common separators with commas
    normalized = re.sub(r"[|;/•]", ",", skills_text)

    # Split by commas and new lines
    raw_skills = re.split(r",|\n", normalized)

    skills = []

    for skill in raw_skills:
        skill = skill.strip()

        if not skill:
            continue

        # Remove bullet characters
        skill = re.sub(r"^[\-\*\u2022]+", "", skill).strip()

        if skill and skill.lower() not in {s.lower() for s in skills}:
            skills.append(skill)

    return skills


def extract_experience_years(experience_text: str) -> float:
    """Extract the highest explicit years-of-experience value."""
    if not experience_text:
        return 0.0

    matches = re.findall(
        r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)",
        experience_text.lower(),
    )

    if not matches:
        return 0.0

    return max(float(value) for value in matches)


def build_structured_resume(sections: dict[str, str]) -> dict:
    """Convert detected sections into structured resume data."""
    return {
        "skills": extract_skills(sections.get("skills", "")),
        "education": sections.get("education", ""),
        "experience": sections.get("experience", ""),
        "experience_years": extract_experience_years(
            sections.get("experience", "")
        ),
    }


def detect_sections(text: str) -> dict[str, str]:
    """
    Split resume text into common sections.

    Currently detects:
    - skills
    - education
    - experience

    Unknown sections are ignored.
    """
    sections = {
        "skills": "",
        "education": "",
        "experience": "",
    }

    current_section = None

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        detected_section = detect_section_heading(line)

        if detected_section:
            current_section = detected_section
            continue

        if current_section:
            sections[current_section] += line + "\n"

    for section in sections:
        sections[section] = sections[section].strip()

    return sections


def parse_resume(file_path: str) -> dict:
    """Extract, clean and section a resume."""
    text = extract_resume_text(file_path)
    sections = detect_sections(text)

    return {
        "raw_text": text,
        "sections": sections,
    }