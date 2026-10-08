from unittest.mock import patch

from app.llm_matcher import (
    ResumeMatchResponse,
    match_resume_with_gemini,
)


def test_resume_match_response_schema():
    result = ResumeMatchResponse(
        match_score=85,
        matched_skills=[
            "Power BI",
            "SQL",
            "Data Analysis",
        ],
        missing_skills=[
            "Python",
            "AWS",
        ],
        required_experience_years=2,
        candidate_experience_years=2.1,
        experience_match="meets",
        summary="Strong candidate match.",
    )

    assert result.match_score == 85
    assert "Power BI" in result.matched_skills
    assert "SQL" in result.matched_skills
    assert "Python" in result.missing_skills
    assert result.required_experience_years == 2
    assert result.candidate_experience_years == 2.1
    assert result.experience_match == "meets"
    assert result.summary == "Strong candidate match."


def test_resume_match_score_must_be_between_zero_and_hundred():
    result = ResumeMatchResponse(
        match_score=100,
        matched_skills=["Python"],
        missing_skills=[],
        required_experience_years=3,
        candidate_experience_years=4,
        experience_match="meets",
        summary="Excellent match.",
    )

    assert 0 <= result.match_score <= 100


@patch("app.llm_matcher.get_gemini_client")
def test_match_resume_with_gemini(mock_get_client):
    mock_response = type(
        "MockResponse",
        (),
        {
            "text": """
            {
                "match_score": 85,
                "matched_skills": [
                    "Power BI",
                    "SQL",
                    "Data Analysis"
                ],
                "missing_skills": [
                    "Python",
                    "AWS"
                ],
                "required_experience_years": 2,
                "candidate_experience_years": 2.1,
                "experience_match": "meets",
                "summary": "Strong candidate match."
            }
            """
        },
    )()

    mock_client = mock_get_client.return_value
    mock_client.models.generate_content.return_value = mock_response

    result = match_resume_with_gemini(
        resume_text="""
        Skills:
        Power BI, SQL, Data Analysis

        Experience:
        2.1 years of relevant experience
        """,
        job_description="""
        Required:
        Power BI, SQL, Data Analysis, Python, AWS

        Experience:
        2+ years
        """,
    )

    assert result["match_score"] == 85

    assert result["matched_skills"] == [
        "Power BI",
        "SQL",
        "Data Analysis",
    ]

    assert result["missing_skills"] == [
        "Python",
        "AWS",
    ]

    assert result["required_experience_years"] == 2
    assert result["candidate_experience_years"] == 2.1
    assert result["experience_match"] == "meets"

    assert result["summary"] == "Strong candidate match."

    mock_client.models.generate_content.assert_called_once()


def test_strong_data_analyst_match():
    result = ResumeMatchResponse(
        match_score=85,
        matched_skills=[
            "SQL",
            "Power BI",
            "Microsoft Excel",
            "Data Analysis",
            "Automated Reporting",
            "Financial Dashboards",
        ],
        missing_skills=[],
        required_experience_years=2,
        candidate_experience_years=2.1,
        experience_match="meets",
        summary=(
            "The candidate is a strong match for the Data Analyst role "
            "and meets the experience requirement."
        ),
    )

    assert result.match_score >= 75
    assert "SQL" in result.matched_skills
    assert "Power BI" in result.matched_skills
    assert result.missing_skills == []
    assert result.required_experience_years == 2
    assert result.candidate_experience_years == 2.1
    assert result.experience_match == "meets"


def test_poor_full_stack_match():
    result = ResumeMatchResponse(
        match_score=10,
        matched_skills=[],
        missing_skills=[
            "Full Stack Development",
            "Frontend Development",
            "Backend Development",
            "JavaScript",
            "HTML/CSS",
        ],
        required_experience_years=2,
        candidate_experience_years=2.1,
        experience_match="meets",
        summary="The candidate is a poor match for this role.",
    )

    assert result.match_score < 40
    assert result.matched_skills == []
    assert "JavaScript" in result.missing_skills
    assert result.required_experience_years == 2
    assert result.candidate_experience_years == 2.1
    assert result.experience_match == "meets"


def test_no_match_network_security_role():
    result = ResumeMatchResponse(
        match_score=0,
        matched_skills=[],
        missing_skills=[
            "Network Security",
            "Firewalls",
            "VPN",
            "IDS/IPS",
            "Security Information and Event Management",
        ],
        required_experience_years=3,
        candidate_experience_years=2.1,
        experience_match="below",
        summary="The candidate is a poor match for this role.",
    )

    assert result.match_score < 40
    assert result.matched_skills == []
    assert "Network Security" in result.missing_skills
    assert result.required_experience_years == 3
    assert result.candidate_experience_years == 2.1
    assert result.experience_match == "below"


def test_experience_requirement_is_met():
    result = ResumeMatchResponse(
        match_score=88,
        matched_skills=[
            "SQL",
            "Power BI",
            "Excel",
        ],
        missing_skills=[],
        required_experience_years=2,
        candidate_experience_years=3.5,
        experience_match="meets",
        summary=(
            "The candidate meets the required experience and "
            "has strong relevant skills."
        ),
    )

    assert result.required_experience_years == 2
    assert result.candidate_experience_years == 3.5
    assert result.candidate_experience_years >= (
        result.required_experience_years
    )
    assert result.experience_match == "meets"


def test_experience_requirement_is_partial():
    result = ResumeMatchResponse(
        match_score=68,
        matched_skills=[
            "SQL",
            "Power BI",
        ],
        missing_skills=[
            "Python",
        ],
        required_experience_years=3,
        candidate_experience_years=2,
        experience_match="partial",
        summary=(
            "The candidate has relevant skills but has less "
            "experience than required."
        ),
    )

    assert result.required_experience_years == 3
    assert result.candidate_experience_years == 2
    assert result.candidate_experience_years < (
        result.required_experience_years
    )
    assert result.experience_match == "partial"


def test_experience_requirement_is_below():
    result = ResumeMatchResponse(
        match_score=35,
        matched_skills=[
            "SQL",
        ],
        missing_skills=[
            "Power BI",
            "Python",
        ],
        required_experience_years=5,
        candidate_experience_years=1,
        experience_match="below",
        summary=(
            "The candidate has some relevant skills but is "
            "substantially below the required experience."
        ),
    )

    assert result.required_experience_years == 5
    assert result.candidate_experience_years == 1
    assert result.candidate_experience_years < (
        result.required_experience_years
    )
    assert result.experience_match == "below"


def test_experience_not_required():
    result = ResumeMatchResponse(
        match_score=75,
        matched_skills=[
            "JavaScript",
            "React",
        ],
        missing_skills=[],
        required_experience_years=None,
        candidate_experience_years=1.5,
        experience_match="not_required",
        summary=(
            "The candidate has relevant skills and the job "
            "does not specify a minimum experience requirement."
        ),
    )

    assert result.required_experience_years is None
    assert result.candidate_experience_years == 1.5
    assert result.experience_match == "not_required"