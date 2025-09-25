from __future__ import annotations

from flask import Blueprint
from controllers.coffee_controller import get_coffees, get_coffee_by_id, process_order

coffee_bp = Blueprint('coffee_part1', __name__)

coffee_bp.get('/') (get_coffees)
coffee_bp.get('/<int:item_id>') (get_coffee_by_id)
coffee_bp.post('/orders') (process_order)

