from __future__ import annotations

import random
from flask import request, jsonify
from ..graph import run_coffee_message_graph


coffees = [
    {"id": 1, "name": "Espresso", "price": 3.0},
    {"id": 2, "name": "Latte", "price": 4.0},
    {"id": 3, "name": "Cappuccino", "price": 4.5},
    {"id": 4, "name": "Americano", "price": 3.5},
]


def set_coffee_price(amount: float = 1.0) -> None:
    coffees[0]["price"] = 3.0 * amount
    coffees[1]["price"] = 4.0 * amount
    coffees[2]["price"] = 4.5 * amount
    coffees[3]["price"] = 3.5 * amount


def get_coffees():
    return jsonify(coffees)


def get_coffee_by_id(item_id: int):
    coffee = next((c for c in coffees if c["id"] == item_id), None)
    if coffee:
        return jsonify(coffee)
    return jsonify({"message": "Coffee not found"}), 404


def process_order():
    order = request.get_json(silent=True) or {}
    output = run_coffee_message_graph(order)
    return jsonify({
        "message": output.get("message"),
        "orderId": random.randint(1, 999_999),
    }), 200

