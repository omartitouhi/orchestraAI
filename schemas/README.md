# Workflow format (v1)

`workflow.schema.json` (JSON Schema 2020-12) is the single contract between the frontend, the backend and the AI service. `examples/` holds three hand-written workflows that pass it; `ai-service/tests/test_workflow_schema.py` checks them, plus broken workflows that must be refused, on every CI run.

A workflow is `schemaVersion`, `name`, optional `settings.maxCostUsd`, a list of `nodes` and a list of `edges` (`from`, `to`, and `port` on edges leaving a condition).

| Node type | Params | Notes |
| --- | --- | --- |
| `trigger` | `kind` (`manual`, `cron`, `webhook`), `schedule`, `inputSchema` | Exactly one per workflow |
| `llm` | `provider` (`openai`, `anthropic`, `ollama`), `model`, `prompt`, `system`, `outputSchema`, `temperature`, `maxTokens` | |
| `mcp_tool` | `server`, `tool`, `arguments` | Arguments are checked against the tool's own schema by the MCP gateway |
| `skill` | `skill`, `input` | |
| `condition` | `left`, `operator`, `right` | Declarative, no code. Outgoing edges carry `port: "true"` or `"false"` |
| `transform` | `template` | |
| `approval` | `message`, `approvers` | Execution pauses until approved |
| `output` | `value` | |

Every node also takes `id` (lowercase, `a-z0-9_`), `label`, `position` (editor layout) and `sensitive` (the mark follows the edges and forces downstream LLM nodes onto a local model).

Text params are templates: `{{nodes.<id>.output}}`, or a path below it such as `{{nodes.start.output.text}}`.

## Checked by the backend, not by the schema

JSON Schema cannot express these graph rules, so the backend validator enforces them:

- node ids are unique, and every edge points to existing nodes;
- the graph has no cycle and every node is reachable from the trigger;
- edges leaving a condition carry a `port`, other edges do not;
- templates only reference upstream nodes.
