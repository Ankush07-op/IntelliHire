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
        summary="Strong candidate match.",
    )

    assert result.match_score == 85
    assert "Power BI" in result.matched_skills
    assert "SQL" in result.matched_skills
    assert "Python" in result.missing_skills
    assert result.summary == "Strong candidate match."


def test_resume_match_score_must_be_between_zero_and_hundred():
    result = ResumeMatchResponse(
        match_score=100,
        matched_skills=["Python"],
        missing_skills=[],
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
        """,
        job_description="""
        Required:
        Power BI, SQL, Data Analysis, Python, AWS
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
        summary="The candidate is a strong match for the Data Analyst role.",
    )

    assert result.match_score >= 75
    assert "SQL" in result.matched_skills
    assert "Power BI" in result.matched_skills
    assert result.missing_skills == []


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
        summary="The candidate is a poor match for this role.",
    )

    assert result.match_score < 40
    assert result.matched_skills == []
    assert "JavaScript" in result.missing_skills


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
        summary="The candidate is a poor match for this role.",
    )

    assert result.match_score < 40
    assert result.matched_skills == []
    assert "Network Security" in result.missing_skills