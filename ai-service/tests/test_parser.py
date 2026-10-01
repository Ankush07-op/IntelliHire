import unittest

from app.parser import (
    clean_text,
    detect_sections,
    extract_experience_years,
    extract_skills,
    build_structured_resume,
)


class TestResumeParser(unittest.TestCase):

    def test_clean_text(self):
        text = "Python    Java\r\n\r\n\r\nReact"

        result = clean_text(text)

        self.assertEqual(result, "Python Java\n\nReact")

    def test_detect_sections(self):
        resume = """
        Skills
        Python, Java, React

        Education
        MCA - AIMS Institute

        Experience
        Software Developer - 2 years
        """

        sections = detect_sections(resume)

        self.assertEqual(
            sections["skills"],
            "Python, Java, React",
        )

        self.assertEqual(
            sections["education"],
            "MCA - AIMS Institute",
        )

        self.assertEqual(
            sections["experience"],
            "Software Developer - 2 years",
        )

    def test_extract_skills(self):
        skills_text = "Python, Java, React, SQL"

        skills = extract_skills(skills_text)

        self.assertEqual(
            skills,
            ["Python", "Java", "React", "SQL"],
        )

    def test_extract_experience_years(self):
        experience = """
        Software Developer
        2 years of experience
        """

        years = extract_experience_years(experience)

        self.assertEqual(years, 2.0)

    def test_multiple_experience_values(self):
        experience = """
        Software Developer - 2 years
        Senior Developer - 4 years
        """

        years = extract_experience_years(experience)

        self.assertEqual(years, 4.0)

    def test_build_structured_resume(self):
        sections = {
            "skills": "Python, Java, React, SQL",
            "education": "MCA - AIMS Institute",
            "experience": "Software Developer - 2 years",
        }

        result = build_structured_resume(sections)

        self.assertEqual(
            result["skills"],
            ["Python", "Java", "React", "SQL"],
        )

        self.assertEqual(
            result["education"],
            "MCA - AIMS Institute",
        )

        self.assertEqual(
            result["experience_years"],
            2.0,
        )


if __name__ == "__main__":
    unittest.main()