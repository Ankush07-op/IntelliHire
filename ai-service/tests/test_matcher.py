import unittest
from app.llm_matcher import evaluate_skills, heuristic_evaluate_match, analyze_match


class TestLLMMatcher(unittest.TestCase):

    def test_evaluate_skills_direct_match(self):
        candidate_skills = ["React", "Node.js", "Express", "TypeScript"]
        candidate_text = "Experienced in building full stack apps with MongoDB and Docker."
        required = ["React", "Node.js", "MongoDB", "Python"]

        matched, missing = evaluate_skills(candidate_skills, candidate_text, required)

        self.assertIn("React", matched)
        self.assertIn("Node.js", matched)
        self.assertIn("MongoDB", matched)
        self.assertIn("Python", missing)

    def test_evaluate_skills_alias_matching(self):
        candidate_skills = ["NodeJS", "PostgreSQL", "ReactJS"]
        candidate_text = "Backend engineer."
        required = ["Node.js", "Postgres", "React"]

        matched, missing = evaluate_skills(candidate_skills, candidate_text, required)

        self.assertIn("Node.js", matched)
        self.assertIn("Postgres", matched)
        self.assertIn("React", matched)
        self.assertEqual(len(missing), 0)

    def test_heuristic_evaluate_match_scoring(self):
        resume_text = "Senior Frontend Engineer with 4 years of experience specializing in React and TypeScript."
        structured = {
            "skills": ["React", "TypeScript", "HTML", "CSS"],
            "experience_years": 4.0,
        }
        job_description = "We are seeking a Senior React Developer with 3+ years experience in React and TypeScript."
        required = ["React", "TypeScript", "GraphQL"]

        result = heuristic_evaluate_match(
            resume_text=resume_text,
            structured_resume=structured,
            job_description=job_description,
            required_skills=required,
        )

        self.assertGreaterEqual(result["score"], 50)
        self.assertLessEqual(result["score"], 100)
        self.assertIn("React", result["matchedSkills"])
        self.assertIn("TypeScript", result["matchedSkills"])
        self.assertIn("GraphQL", result["missingSkills"])
        self.assertEqual(result["experienceYears"], 4.0)
        self.assertTrue(len(result["summary"]) > 10)

    def test_analyze_match_fallback_when_no_api_key(self):
        parsed_resume = {
            "raw_text": "Python Developer with 3 years of building REST APIs using FastAPI and PostgreSQL.",
            "structured": {
                "skills": ["Python", "FastAPI", "PostgreSQL"],
                "experience_years": 3.0,
            },
        }
        job_desc = "Looking for a Python Backend Developer skilled in FastAPI and PostgreSQL."
        required = ["Python", "FastAPI"]

        result = analyze_match(parsed_resume, job_desc, required)

        self.assertIn("score", result)
        self.assertIn("matchedSkills", result)
        self.assertIn("missingSkills", result)
        self.assertIn("experienceYears", result)
        self.assertIn("summary", result)
        self.assertEqual(result["matchedSkills"], ["Python", "FastAPI"])
        self.assertEqual(len(result["missingSkills"]), 0)


if __name__ == "__main__":
    unittest.main()
