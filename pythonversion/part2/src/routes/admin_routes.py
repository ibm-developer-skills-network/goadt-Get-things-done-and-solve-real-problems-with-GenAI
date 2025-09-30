from __future__ import annotations

from flask import Blueprint, request, jsonify, send_from_directory
import os
from controllers.admin_controller import get_analysis, apply_discount, cancel_discount, serve_admin_page

admin_bp = Blueprint('admin', __name__)

admin_bp.get('/') (serve_admin_page)
admin_bp.get('/analysis') (get_analysis)
admin_bp.post('/discount') (apply_discount)
admin_bp.post('/discount/cancel') (cancel_discount)

# Made with Bob
