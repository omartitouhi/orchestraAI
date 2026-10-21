from fastapi import FastAPI

app = FastAPI(title="ORCHESTRA AI - AI service")


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}
