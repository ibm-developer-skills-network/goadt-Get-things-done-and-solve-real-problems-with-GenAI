from __future__ import annotations

import os
import threading
import time
from flask import Flask, jsonify, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix

from routes.coffee_routes import coffee_bp
from routes.admin_routes import admin_bp
from graph import run_scan_image_graph
from controllers.coffee_controller import set_coffee_price


def _static_path(*parts: str) -> str:
    return os.path.join(os.path.dirname(__file__), 'public', *parts)


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None)
    app.wsgi_app = ProxyFix(app.wsgi_app)  # type: ignore

    # Register API routes
    app.register_blueprint(coffee_bp, url_prefix='/api/coffees')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Static: js/css served from pythonversion/src/public
    @app.get('/js/<path:filename>')
    def serve_js(filename: str):
        return send_from_directory(_static_path('js'), filename)

    @app.get('/css/<path:filename>')
    def serve_css(filename: str):
        return send_from_directory(_static_path('css'), filename)

    # Images: try local pythonversion/src/public/images, else fall back to original repo src/public/images
    @app.get('/images/<path:filename>')
    def serve_images(filename: str):
        local_img_dir = _static_path('images')
        original_img_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '..', 'src', 'public', 'images')
        if os.path.exists(os.path.join(local_img_dir, filename)):
            return send_from_directory(local_img_dir, filename)
        return send_from_directory(original_img_dir, filename)

    @app.get('/')
    def index():
        return send_from_directory(_static_path(), 'index.html')
        
    @app.get('/admin')
    def admin():
        return send_from_directory(_static_path(), 'admin.html')

    @app.get('/<path:subpath>')
    def catchall(subpath: str):
        return send_from_directory(_static_path(), 'index.html')

    return app


def start_cron_job():
    """Start a background thread that periodically runs the image scanning"""
    def cron_task():
        while True:
            try:
                print("Running scheduled image scan...")
                result = run_scan_image_graph()
                num_people = result.get('numPeople', 0)
                print(f"Detected {num_people} people in the image")
                
                # Implement dynamic pricing based on crowd size
                if num_people > 40:
                    print("Large crowd detected! Setting 30% discount")
                    set_coffee_price(0.7)  # 30% discount
                elif num_people > 20:
                    print("Medium crowd detected! Setting 15% discount")
                    set_coffee_price(0.85)  # 15% discount
                else:
                    print("Small or no crowd detected. Regular pricing.")
                    set_coffee_price(1.0)  # Regular price
                    
            except Exception as e:
                print(f"Error in cron job: {e}")
                
            # Sleep for 15 seconds (run more frequently)
            time.sleep(15)
    
    # Start the cron job in a background thread
    cron_thread = threading.Thread(target=cron_task, daemon=True)
    cron_thread.start()
    print("Background image scanning job started")


if __name__ == '__main__':
    port = int(os.getenv('PORT', '3000'))
    app = create_app()
    
    # Start the background cron job
    start_cron_job()
    
    app.run(host='0.0.0.0', port=port, debug=True)

# Made with Bob
