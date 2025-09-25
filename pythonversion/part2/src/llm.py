from __future__ import annotations

import os
from typing import Any, Dict
from langchain_core.prompts import ChatPromptTemplate
import requests
from utils import get_token


PROJECT_ID = os.getenv("PROJECT_ID", "skills-network")

_system = (
    "You are a talented and fun barista working at Tech Cafe.\n\n"
    "Your main task is to create 1-3 sentences to write on the coffee.\n\n"
    "This is a fun thing we do to ensure our customers have a great experiance.\n\n"
    "Make sure to reference the coffee they are ordering, their name, and their customizations [indirectly, don't list the customizations].\n\n"
    "Do NOT describe the coffee, instead be creative and poetic.\n\n"
    "ONLY respond with the message to write on the coffee NOTHING else."
)

_user = (
    "A customer just purchased the following coffee:\n"
    "- Customer Name: {name}\n"
    "- Type of Coffee: {coffeeName}\n"
    "- Number of Creams: {creams}\n"
    "- Number of Milks: {milk}\n"
    "- Number of Sugars: {sugars}\n"
    "- Number of Sweeteners: {sweeteners}\n"
    "- Whipped Cream: {whippedCream}"
)

_prompt = ChatPromptTemplate.from_messages([
    ("system", _system),
    ("user", _user),
    ("assistant", ""),
])


def _require_token_or_fallback() -> str | None:
    return get_token()


def _watsonx_chat(messages: list[dict], max_tokens: int = 200) -> str:
    token = _require_token_or_fallback()
    if not token:
        return "Here’s a little lift in a cup — enjoy!"
    url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }
    body = {
        "messages": messages,
        "project_id": PROJECT_ID,
        "model_id": "meta-llama/llama-3-2-90b-vision-instruct",
        "decoding_method": "greedy",
        "min_new_tokens": 0,
        "stop_sequences": [],
        "repetition_penalty": 1,
        "max_tokens": max_tokens,
    }
    resp = requests.post(url, json=body, headers=headers, timeout=60)
    resp.raise_for_status()
    return resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")


def generate_message(name: str, order: Dict[str, Any]) -> str:
    prompt_text = _prompt.format(
        name=name,
        coffeeName=order.get("coffeeName"),
        creams=order.get("customizations", {}).get("creams", 0),
        milk=order.get("customizations", {}).get("milk", 0),
        sugars=order.get("customizations", {}).get("sugars", 0),
        sweeteners=order.get("customizations", {}).get("sweeteners", 0),
        whippedCream=("Yes" if order.get("customizations", {}).get("whippedCream") else "No"),
    )
    return _watsonx_chat([
        {"role": "system", "content": [{"type": "text", "text": _system}]},
        {"role": "user", "content": [{"type": "text", "text": prompt_text}]},
        {"role": "assistant", "content": [{"type": "text", "text": ""}]},
    ]) or "Enjoy this cup crafted just for you."


def scan_image(image_uri: str) -> int:
    token = _require_token_or_fallback()
    if not token:
        # Offline fallback: if no credentials, return a fixed plausible number.
        return 0
    system_prompt = (
        "Return how many people you see in the image. Only return the number with no punctuation or quotes and be as accurate as possible."
    )
    url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }
    body = {
        "messages": [
            {"role": "user", "content": [{"type": "text", "text": system_prompt}]},
            {
                "role": "user",
                "content": [{"type": "image_url", "image_url": {"url": image_uri}}],
            },
        ],
        "project_id": PROJECT_ID,
        "model_id": "meta-llama/llama-3-2-90b-vision-instruct",
        "decoding_method": "greedy",
        "min_new_tokens": 0,
        "max_tokens": 3,
    }
    resp = requests.post(url, json=body, headers=headers, timeout=60)
    resp.raise_for_status()
    text = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "0")
    try:
        return int(text)
    except Exception:
        return 0

