import re
from datetime import date
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


MONTHS = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
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
    """Detect known resume section headings."""
    normalized = normalize_heading(line)

    for section, aliases in SECTION_ALIASES.items():

        if normalized in aliases:
            return section

        # Handle PDF headings where letters are extracted with spaces.
        # Example:
        # S K I L L S
        # W O R K E X P E R I E N C E
        compact_normalized = re.sub(r"\s+", "", normalized)

        for alias in aliases:
            compact_alias = re.sub(r"\s+", "", alias)

            if compact_normalized == compact_alias:
                return section

    return None


def extract_skills(skills_text: str) -> list[str]:
    """Extract actual skills while ignoring common skill-category headings."""
    if not skills_text:
        return []

    category_headings = {
        "reporting & bi",
        "data & querying",
        "accounting",
        "compliance",
        "professional",
        "technical skills",
        "core skills",
        "key skills",
        "skills & technologies",
        "technical expertise",
    }

    normalized = re.sub(r"[|;/•]", ",", skills_text)

    raw_skills = re.split(r",|\n", normalized)

    skills = []

    for skill in raw_skills:
        skill = skill.strip()

        if not skill:
            continue

        skill = re.sub(
            r"^[\-\*\u2022]+",
            "",
            skill,
        ).strip()

        if skill.lower() in category_headings:
            continue

        # Remove unnecessary trailing punctuation.
        skill = skill.rstrip(".,;:")

        if not skill:
            continue

        if skill.lower() not in {
            existing.lower()
            for existing in skills
        }:
            skills.append(skill)

    return skills


def _month_to_number(month: str) -> int | None:
    """Convert a month name or abbreviation into its month number."""
    return MONTHS.get(month.lower())


def _calculate_month_difference(
    start_month: int,
    start_year: int,
    end_month: int,
    end_year: int,
) -> int:
    """Calculate the number of months between two month/year values."""
    return (
        (end_year - start_year) * 12
        + (end_month - start_month)
    )


def extract_date_based_experience_years(
    experience_text: str,
) -> float:
    """
    Extract experience from employment date ranges.

    Supports examples such as:
    - Aug 2024 – Jul 2025
    - August 2024 - July 2025
    - Aug 2025 – Present
    - Jan 2020 to Dec 2022
    """
    if not experience_text:
        return 0.0

    current_date = date.today()

    date_pattern = re.compile(
        r"\b("
        r"Jan(?:uary)?|"
        r"Feb(?:ruary)?|"
        r"Mar(?:ch)?|"
        r"Apr(?:il)?|"
        r"May|"
        r"Jun(?:e)?|"
        r"Jul(?:y)?|"
        r"Aug(?:ust)?|"
        r"Sep(?:t(?:ember)?)?|"
        r"Oct(?:ober)?|"
        r"Nov(?:ember)?|"
        r"Dec(?:ember)?"
        r")\s+"
        r"(\d{4})"
        r"\s*(?:-|–|—|to)\s*"
        r"("
        r"Jan(?:uary)?|"
        r"Feb(?:ruary)?|"
        r"Mar(?:ch)?|"
        r"Apr(?:il)?|"
        r"May|"
        r"Jun(?:e)?|"
        r"Jul(?:y)?|"
        r"Aug(?:ust)?|"
        r"Sep(?:t(?:ember)?)?|"
        r"Oct(?:ober)?|"
        r"Nov(?:ember)?|"
        r"Dec(?:ember)?|"
        r"Present|"
        r"Current"
        r")"
        r"(?:\s+(\d{4}))?",
        re.IGNORECASE,
    )

    total_months = 0

    for match in date_pattern.finditer(experience_text):

        (
            start_month_name,
            start_year,
            end_month_name,
            end_year,
        ) = match.groups()

        start_month = _month_to_number(start_month_name)

        if end_month_name.lower() in {"present", "current"}:
            end_month = current_date.month
            end_year_number = current_date.year
        else:
            end_month = _month_to_number(end_month_name)

            if end_year is None:
                continue

            end_year_number = int(end_year)

        if start_month is None or end_month is None:
            continue

        months = _calculate_month_difference(
            start_month,
            int(start_year),
            end_month,
            end_year_number,
        )

        if months > 0:
            total_months += months

    return round(total_months / 12, 1)


def extract_experience_years(experience_text: str) -> float:
    """
    Extract experience years from explicit experience statements
    and employment date ranges.

    Examples:
    - 2 years -> 2.0
    - 5+ years -> 5.0
    - Aug 2024 – Jul 2025 -> approximately 0.9
    - Aug 2025 – Present -> calculated from the current date
    """
    if not experience_text:
        return 0.0

    # Handle explicit statements such as:
    # "2 years"
    # "3 yrs"
    # "5+ years"
    matches = re.findall(
        r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)",
        experience_text.lower(),
    )

    explicit_years = 0.0

    if matches:
        explicit_years = max(
            float(value)
            for value in matches
        )

    # Handle employment date ranges.
    date_based_years = extract_date_based_experience_years(
        experience_text
    )

    # Return whichever method provides the larger value.
    return max(
        explicit_years,
        date_based_years,
    )


def build_structured_resume(
    sections: dict[str, str],
) -> dict:
    """Convert detected sections into structured resume data."""
    return {
        "skills": extract_skills(
            sections.get("skills", "")
        ),
        "education": sections.get(
            "education",
            "",
        ),
        "experience": sections.get(
            "experience",
            "",
        ),
        "experience_years": extract_experience_years(
            sections.get(
                "experience",
                "",
            )
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
    """Parse a resume into raw, sectioned, and structured data."""
    text = extract_resume_text(file_path)

    sections = detect_sections(text)

    structured = build_structured_resume(sections)

    return {
        "raw_text": text,
        "sections": sections,
        "structured": structured,
    }