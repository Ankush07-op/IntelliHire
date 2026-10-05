import unittest

from app.parser import (
    extract_experience_years,
    extract_skills,
    build_structured_resume,
)


RESUME_DATASET = [
    {
        "name": "resume_01",
        "skills": "Python, Java, React, SQL",
        "education": "MCA",
        "experience": "Software Developer - 2 years",
        "expected_years": 2.0,
    },
    {
        "name": "resume_02",
        "skills": "Python | Django | PostgreSQL | Docker",
        "education": "B.Tech",
        "experience": "Backend Developer - 3 years",
        "expected_years": 3.0,
    },
    {
        "name": "resume_03",
        "skills": "Java; Spring Boot; MySQL; AWS",
        "education": "B.E.",
        "experience": "Java Developer - 4 years",
        "expected_years": 4.0,
    },
    {
        "name": "resume_04",
        "skills": "React, Node.js, MongoDB, Express",
        "education": "MCA",
        "experience": "Full Stack Developer - 5+ years",
        "expected_years": 5.0,
    },
    {
        "name": "resume_05",
        "skills": "C++, Python, Git, Linux",
        "education": "B.Tech",
        "experience": "Software Engineer - 3 yrs",
        "expected_years": 3.0,
    },
    {
        "name": "resume_06",
        "skills": "Angular, TypeScript, JavaScript, HTML, CSS",
        "education": "BCA",
        "experience": "Frontend Developer - 2 years",
        "expected_years": 2.0,
    },
    {
        "name": "resume_07",
        "skills": "Python, Pandas, NumPy, SQL",
        "education": "M.Sc Data Science",
        "experience": "Data Analyst - 3 years",
        "expected_years": 3.0,
    },
    {
        "name": "resume_08",
        "skills": "AWS, Docker, Kubernetes, Jenkins",
        "education": "B.Tech IT",
        "experience": "DevOps Engineer - 6 years",
        "expected_years": 6.0,
    },
    {
        "name": "resume_09",
        "skills": "Flutter, Dart, Firebase, Android",
        "education": "BCA",
        "experience": "Mobile Developer - 2 years",
        "expected_years": 2.0,
    },
    {
        "name": "resume_10",
        "skills": "PHP, Laravel, MySQL, JavaScript",
        "education": "MCA",
        "experience": "PHP Developer - 4 years",
        "expected_years": 4.0,
    },
    {
        "name": "resume_11",
        "skills": "Go, Docker, Kubernetes, PostgreSQL",
        "education": "B.Tech",
        "experience": "Backend Engineer - 5 years",
        "expected_years": 5.0,
    },
    {
        "name": "resume_12",
        "skills": "C#, .NET, ASP.NET, SQL Server",
        "education": "B.E.",
        "experience": "Software Engineer - 3 years",
        "expected_years": 3.0,
    },
    {
        "name": "resume_13",
        "skills": "Java, Python, SQL",
        "education": "MCA",
        "experience": "Fresher",
        "expected_years": 0.0,
    },
    {
        "name": "resume_14",
        "skills": "React, JavaScript, CSS",
        "education": "BCA",
        "experience": "",
        "expected_years": 0.0,
    },
    {
        "name": "resume_15",
        "skills": "Python, FastAPI, PostgreSQL",
        "education": "M.Tech",
        "experience": "Backend Developer - 7 years",
        "expected_years": 7.0,
    },
    {
        "name": "resume_16",
        "skills": "Java, Spring, Hibernate",
        "education": "B.Tech",
        "experience": "Senior Java Engineer - 8 years",
        "expected_years": 8.0,
    },
    {
        "name": "resume_17",
        "skills": "React, Node.js, Express, MongoDB",
        "education": "MCA",
        "experience": "Full Stack Engineer - 4 years",
        "expected_years": 4.0,
    },
    {
        "name": "resume_18",
        "skills": "Python, Django, REST APIs",
        "education": "B.Tech",
        "experience": """
        Software Developer - 2 years
        Senior Developer - 5 years
        """,
        "expected_years": 5.0,
    },
    {
        "name": "resume_19",
        "skills": "Python, JavaScript, SQL",
        "education": "MCA",
        "experience": "Developer - 2 Years",
        "expected_years": 2.0,
    },
    {
        "name": "resume_20",
        "skills": "React, Node.js, PostgreSQL, Redis",
        "education": "B.Tech",
        "experience": "Software Engineer - 3 years",
        "expected_years": 3.0,
    },
    {
        "name": "resume_21",
        "skills": "Python, Flask, SQL, Git",
        "education": "BCA",
        "experience": "Python Developer - 2 years",
        "expected_years": 2.0,
    },
]


class TestResumeDataset(unittest.TestCase):

    def test_dataset_has_20_plus_resumes(self):
        self.assertGreaterEqual(len(RESUME_DATASET), 20)

    def test_skill_extraction(self):
        for resume in RESUME_DATASET:
            with self.subTest(resume=resume["name"]):
                skills = extract_skills(resume["skills"])

                self.assertGreater(
                    len(skills),
                    0,
                )

    def test_experience_extraction(self):
        for resume in RESUME_DATASET:
            with self.subTest(resume=resume["name"]):
                years = extract_experience_years(
                    resume["experience"]
                )

                self.assertEqual(
                    years,
                    resume["expected_years"],
                )

    def test_structured_resume(self):
        for resume in RESUME_DATASET:
            with self.subTest(resume=resume["name"]):
                sections = {
                    "skills": resume["skills"],
                    "education": resume["education"],
                    "experience": resume["experience"],
                }

                result = build_structured_resume(sections)

                self.assertGreater(
                    len(result["skills"]),
                    0,
                )

                self.assertEqual(
                    result["experience_years"],
                    resume["expected_years"],
                )


if __name__ == "__main__":
    unittest.main()