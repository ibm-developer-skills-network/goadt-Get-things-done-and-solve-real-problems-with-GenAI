from __future__ import annotations

from typing import TypedDict, Any, Dict
from langgraph.graph import StateGraph, START, END
from .llm import generate_message


class CoffeeCustomizations(TypedDict, total=False):
    creams: int
    milk: int
    sugars: int
    sweeteners: int
    whippedCream: bool


class CoffeeState(TypedDict, total=False):
    customerName: str
    coffeeName: str
    customizations: CoffeeCustomizations
    message: str


def _step_generate_message(state: CoffeeState) -> CoffeeState:
    coffee_options = {
        "coffeeName": state.get("coffeeName"),
        "customizations": state.get("customizations", {}),
    }
    msg = generate_message(state.get("customerName", "Friend"), coffee_options)
    state["message"] = msg
    return state


_graph = StateGraph(CoffeeState)
_graph.add_node("generateMessage", _step_generate_message)
_graph.add_edge(START, "generateMessage")
_graph.add_edge("generateMessage", END)
_compiled = _graph.compile()


def run_coffee_message_graph(initial_input: Dict[str, Any]) -> CoffeeState:
    return _compiled.invoke(initial_input)

