# ORCHESTRA AI

AI-native workflow automation platform: workflows built by hand or from a prompt, combining several AI models and MCP tools, executed under the control of a rules engine.

## Structure

| Folder | Content |
| --- | --- |
| `frontend/` | React, TypeScript, Vite (React Flow comes in phase 1) |
| `backend/` | Java 21, Spring Boot: API, execution engine, rules engine, MCP gateway |
| `ai-service/` | Python, FastAPI: request analysis, clarification, workflow generation |
| `schemas/` | `workflow.schema.json`, the contract shared by all services |
| `mcp-servers/` | Demo MCP servers |
| `evaluation/` | Test set, simulated user, comparator, analysis |
| `docs/` | Architecture decisions (`adr/`), project brief (`fiche/`) |

## Run everything

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:8080/health (or the `BACKEND_PORT` set in `.env`)
- The AI service is only reachable from the backend, on the internal Docker network.

## Run a service on its own

```bash
cd backend && ./mvnw spring-boot:run          # needs PostgreSQL on localhost:5432
cd ai-service && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```
