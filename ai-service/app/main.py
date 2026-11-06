import os

import litellm
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="ORCHESTRA AI - AI service")

# Any LiteLLM model name: "openrouter/openai/gpt-5-mini", "ollama/llama3.2"...
LLM_MODEL = os.getenv("LLM_MODEL", "openrouter/anthropic/claude-haiku-5.5")


class CompletionRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=10_000)


class CompletionResponse(BaseModel):
    text: str
    model: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}


@app.post("/llm/complete")
def complete(request: CompletionRequest) -> CompletionResponse:
    try:
        response = litellm.completion(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": request.prompt}],
            # Without it LiteLLM asks for the model's maximum, and OpenRouter checks credits against that.
            max_tokens=1024,
            timeout=60,
        )
    except Exception as exc:  # LiteLLM wraps every provider error in its own exception types
        raise HTTPException(status_code=502, detail=f"LLM call failed: {exc}") from exc
    return CompletionResponse(text=response.choices[0].message.content or "", model=LLM_MODEL)
