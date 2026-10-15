
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from app.llm_matcher import (
    extract_skills_with_gemini,
    match_resume_with_gemini,
)
from app.parser import parse_resume


import urllib.request
import urllib.error
import uuid
from typing import Optional
from pydantic import BaseModel
from llm_matcher import analyze_match

app = FastAPI(
    title="IntelliHire AI Service",
    description="AI service for resume processing and candidate matching",
    version="1.0.0",
)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def validate_resume_filename(filename: str | None) -> None:
    """Validate that a resume has a supported file extension."""
    if not filename:
        raise HTTPException(
            status_code=400,
            detail="Resume file is required.",
        )

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX resume files are supported.",
        )


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "intellihire-ai-service",
    }


@app.post("/api/resume/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    validate_resume_filename(file.filename)

    temp_file = None

    try:
        suffix = Path(file.filename).suffix.lower()

        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=suffix,
            prefix="intellihire_resume_",
            delete=False,
        ) as output_file:
            temp_file = output_file.name
            content = await file.read()
            output_file.write(content)

        result = parse_resume(temp_file)

        return {
            "success": True,
            "filename": file.filename,
            "resume": result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Resume processing failed: {str(exc)}",
        ) from exc

    finally:
        await file.close()

        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)


@app.post("/api/resume/ai-extract")
async def ai_extract_resume_skills(file: UploadFile = File(...)):
    validate_resume_filename(file.filename)

    temp_file = None

    try:
        suffix = Path(file.filename).suffix.lower()

        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=suffix,
            prefix="intellihire_resume_",
            delete=False,
        ) as output_file:
            temp_file = output_file.name
            content = await file.read()
            output_file.write(content)

        parsed_resume = parse_resume(temp_file)

        ai_result = extract_skills_with_gemini(
            parsed_resume["raw_text"]
        )

        return {
            "success": True,
            "filename": file.filename,
            "ai": ai_result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI resume processing failed: {str(exc)}",
        ) from exc

    finally:
        await file.close()

        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)


@app.post("/api/resume/match")
async def match_resume_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    validate_resume_filename(file.filename)

    if not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description is required.",
        )

    temp_file = None

    try:
        suffix = Path(file.filename).suffix.lower()

        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=suffix,
            prefix="intellihire_resume_",
            delete=False,
        ) as output_file:
            temp_file = output_file.name
            content = await file.read()
            output_file.write(content)

        parsed_resume = parse_resume(temp_file)

        match_result = match_resume_with_gemini(
            parsed_resume["raw_text"],
            job_description,
        )

        return {
            "success": True,
            "filename": file.filename,
            "match": match_result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Resume matching failed: {str(exc)}",
        ) from exc

    finally:
        await file.close()

        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)

class AnalyzeRequest(BaseModel):
    application_id: Optional[str] = None
    resume_url: str
    job_description: str
    required_skills: list[str] = []

@app.post("/api/analyze")
async def analyze_endpoint(request: AnalyzeRequest):
    """
    Main endpoint called by backend async AI worker.
    Downloads resume from signed Cloudinary URL, parses content,
    and runs semantic LLM / heuristic match against job requisition.
    """
    if not request.resume_url:
        raise HTTPException(status_code=400, detail="resume_url is required")

    # Determine file extension from URL or Content-Type
    clean_url = request.resume_url.split("?")[0].lower()
    ext = ".docx" if clean_url.endswith(".docx") else ".pdf"

    unique_id = uuid.uuid4().hex
    temp_file = os.path.join(tempfile.gettempdir(), f"analyze_{unique_id}{ext}")

    try:
        req = urllib.request.Request(
            request.resume_url,
            headers={"User-Agent": "IntelliHire-AIService/1.0"},
        )
        with urllib.request.urlopen(req, timeout=30) as response, open(temp_file, "wb") as out_file:
            out_file.write(response.read())

        # Parse text and structured sections
        parsed_resume = parse_resume(temp_file)

        # Run semantic / LLM evaluation
        evaluation = analyze_match(
            parsed_resume=parsed_resume,
            job_description=request.job_description,
            required_skills=request.required_skills,
        )

        return {
            "applicationId": request.application_id,
            "score": evaluation["score"],
            "matchedSkills": evaluation["matchedSkills"],
            "missingSkills": evaluation["missingSkills"],
            "experienceYears": evaluation["experienceYears"],
            "summary": evaluation["summary"],
        }

    except urllib.error.URLError as url_err:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download resume from provided URL: {str(url_err)}",
        ) from url_err

    except ValueError as val_err:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse resume: {str(val_err)}",
        ) from val_err

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Candidate analysis failed: {str(exc)}",
        ) from exc

    finally:
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except OSError:
                pass

