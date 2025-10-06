from __future__ import annotations

import os
from pathlib import Path
from flask import jsonify, send_from_directory, request
from controllers.coffee_controller import set_coffee_price
from graph import run_scan_image_graph

# Store the current sale percentage
current_sale_percentage = 0

def serve_admin_page():
    """Serve the admin page HTML"""
    return send_from_directory(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public'), 'admin.html')

def get_analysis():
    """Get the latest crowd analysis data"""
    try:
        # Run the image scanning graph
        result = run_scan_image_graph()
        
        # Return the analysis data
        return jsonify({
            'numPeople': result.get('numPeople', 0),
            'salePercentage': current_sale_percentage,
            # We don't return the full imageURI to save bandwidth, 
            # since the frontend already has access to the image file
        })
    except Exception as e:
        print(f"Error in get_analysis: {e}")
        return jsonify({'error': str(e)}), 500

def apply_discount():
    """Apply a discount to coffee prices"""
    global current_sale_percentage
    
    try:
        data = request.get_json()
        discount = data.get('discount', 0)
        
        # Validate discount
        if not isinstance(discount, (int, float)) or discount < 0 or discount > 50:
            return jsonify({'error': 'Invalid discount percentage'}), 400
        
        # Store the current sale percentage
        current_sale_percentage = discount
        
        # Calculate the price multiplier (e.g., 20% discount = 0.8 multiplier)
        price_multiplier = (100 - discount) / 100
        
        # Apply the discount
        set_coffee_price(price_multiplier)
        
        return jsonify({'success': True, 'discount': discount})
    except Exception as e:
        print(f"Error in apply_discount: {e}")
        return jsonify({'error': str(e)}), 500

def cancel_discount():
    """Cancel any active discount"""
    global current_sale_percentage
    
    try:
        # Reset the sale percentage
        current_sale_percentage = 0
        
        # Reset prices to normal
        set_coffee_price(1.0)
        
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error in cancel_discount: {e}")
        return jsonify({'error': str(e)}), 500


