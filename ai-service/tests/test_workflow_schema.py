import copy
import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator

SCHEMAS = Path(__file__).resolve().parents[2] / "schemas"
SCHEMA = json.loads((SCHEMAS / "workflow.schema.json").read_text(encoding="utf-8"))
VALIDATOR = Draft202012Validator(SCHEMA)
EXAMPLES = sorted((SCHEMAS / "examples").glob("*.json"))


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_schema_is_valid_json_schema():
    Draft202012Validator.check_schema(SCHEMA)


def test_there_are_three_examples():
    assert len(EXAMPLES) == 3


@pytest.mark.parametrize("path", EXAMPLES, ids=lambda p: p.name)
def test_example_is_valid(path):
    errors = [e.message for e in VALIDATOR.iter_errors(load(path))]
    assert errors == []


def _node(workflow, node_id):
    return next(n for n in workflow["nodes"] if n["id"] == node_id)


def _no_trigger(w):
    w["nodes"] = [n for n in w["nodes"] if n["type"] != "trigger"]


def _two_triggers(w):
    w["nodes"].append({"id": "start_2", "type": "trigger", "params": {"kind": "manual"}})


def _unknown_type(w):
    _node(w, "analyse")["type"] = "python_code"


def _llm_without_model(w):
    del _node(w, "analyse")["params"]["model"]


def _unknown_provider(w):
    _node(w, "analyse")["params"]["provider"] = "mistral"


def _llm_params_on_tool(w):
    _node(w, "list_incidents")["params"] = _node(w, "analyse")["params"]


def _edge_without_target(w):
    del w["edges"][0]["to"]


def _bad_node_id(w):
    _node(w, "analyse")["id"] = "Analyse Step"


def _cron_without_schedule(w):
    _node(w, "start")["params"] = {"kind": "cron"}


def _extra_field(w):
    w["owner"] = "someone"


def _wrong_version(w):
    w["schemaVersion"] = "2"


@pytest.mark.parametrize(
    "break_it",
    [
        _no_trigger,
        _two_triggers,
        _unknown_type,
        _llm_without_model,
        _unknown_provider,
        _llm_params_on_tool,
        _edge_without_target,
        _bad_node_id,
        _cron_without_schedule,
        _extra_field,
        _wrong_version,
    ],
    ids=lambda f: f.__name__.lstrip("_"),
)
def test_broken_workflow_is_rejected(break_it):
    workflow = copy.deepcopy(load(SCHEMAS / "examples" / "weekly-incidents-report.json"))
    break_it(workflow)
    assert not VALIDATOR.is_valid(workflow)


def test_condition_needs_right_operand_unless_emptiness_check():
    workflow = load(SCHEMAS / "examples" / "sensitive-ticket-triage.json")
    condition = _node(workflow, "is_urgent")["params"]
    del condition["right"]
    assert not VALIDATOR.is_valid(workflow)
    condition["operator"] = "is_empty"
    assert VALIDATOR.is_valid(workflow)
