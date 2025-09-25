from __future__ import annotations

import os
from typing import TypedDict, Any, Dict
from langgraph.graph import StateGraph, START, END
from .llm import generate_message, scan_image
from ...src.utils import image_to_base64


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
    msg = generate_message(
        state.get("customerName", "Friend"),
        {"coffeeName": state.get("coffeeName"), "customizations": state.get("customizations", {})},
    )
    state["message"] = msg
    return state


_coffee_graph = StateGraph(CoffeeState)
_coffee_graph.add_node("generateMessage", _step_generate_message)
_coffee_graph.add_edge(START, "generateMessage")
_coffee_graph.add_edge("generateMessage", END)
_coffee_compiled = _coffee_graph.compile()


def run_coffee_message_graph(initial_input: Dict[str, Any]) -> CoffeeState:
    return _coffee_compiled.invoke(initial_input)


class ImageState(TypedDict, total=False):
    imageURI: str
    numPeople: int


def _step_get_latest_image(state: ImageState) -> ImageState:
    # Prefer local pythonversion image if present, else original repo path
    base_dir = os.path.join(os.path.dirname(__file__), 'images')
    fallback = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'part2', 'src', 'images')
    file_path = os.path.join(base_dir, 'street.png') if os.path.exists(os.path.join(base_dir, 'street.png')) else os.path.join(fallback, 'street.png')
    state['imageURI'] = image_to_base64(file_path)
    return state


def _step_scan_image(state: ImageState) -> ImageState:
    state['numPeople'] = scan_image(state['imageURI'])
    return state


_img_graph = StateGraph(ImageState)
_img_graph.add_node('getLatestImage', _step_get_latest_image)
_img_graph.add_node('scanImage', _step_scan_image)
_img_graph.add_edge(START, 'getLatestImage')
_img_graph.add_edge('getLatestImage', 'scanImage')
_img_graph.add_edge('scanImage', END)
_img_compiled = _img_graph.compile()


def run_scan_image_graph(initial_input: Dict[str, Any] | None = None) -> ImageState:
    return _img_compiled.invoke(initial_input or {})

