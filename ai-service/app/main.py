from fastapi import FastAPI, File, HTTPException, UploadFile

from app.parser import parse_resume


app = FastAPI(
    title="IntelliHire AI Service",
    description="AI service for resume processing and candidate matching",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "intellihire-ai-service",
    }


@app.post("/api/resume/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Resume file is required.",
        )

    allowed_extensions = {".pdf", ".docx"}

    filename = file.filename.lower()

    if not any(filename.endswith(extension) for extension in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX resume files are supported.",
        )

    temp_file = f"temp_{file.filename}"

    try:
        content = await file.read()

        with open(temp_file, "wb") as output_file:
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
        import os

        if os.path.exists(temp_file):
            os.remove(temp_file)