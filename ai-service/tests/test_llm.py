from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app import main

client = TestClient(main.app)


def fake_response(text):
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=text))])


def test_complete_returns_model_text(monkeypatch):
    calls = []

    def fake_completion(**kwargs):
        calls.append(kwargs)
        return fake_response("Bonjour !")

    monkeypatch.setattr(main.litellm, "completion", fake_completion)

    response = client.post("/llm/complete", json={"prompt": "Say hello"})

    assert response.status_code == 200
    assert response.json() == {"text": "Bonjour !", "model": main.LLM_MODEL}
    assert calls[0]["messages"] == [{"role": "user", "content": "Say hello"}]


def test_complete_reports_provider_errors_as_502(monkeypatch):
    def failing_completion(**kwargs):
        raise RuntimeError("no API key")

    monkeypatch.setattr(main.litellm, "completion", failing_completion)

    response = client.post("/llm/complete", json={"prompt": "Say hello"})

    assert response.status_code == 502
    assert "no API key" in response.json()["detail"]


@pytest.mark.parametrize("body", [{}, {"prompt": ""}])
def test_complete_rejects_empty_prompt(body):
    assert client.post("/llm/complete", json=body).status_code == 422
